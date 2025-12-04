import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface DenoEnv {
  get(key: string): string | undefined;
}

interface DenoNamespace {
  env: DenoEnv;
  serve: (handler: (req: Request) => Promise<Response>) => void;
}

declare const Deno: DenoNamespace;

const getCorsHeaders = () => {
  // Permitir CORS para qualquer origem (Edge Functions do Supabase)
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET, HEAD",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Accept, Origin",
    "Access-Control-Expose-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
};

interface ShippingRequest {
  to: {
    zipcode: string;
    postal_code?: string;
    state?: string;
    city?: string;
    address?: string;
    number?: string;
    complement?: string;
  };
  from?: {
    postal_code?: string;
  };
  products: Array<{
    id: string;
    width: number;
    height: number;
    length: number;
    weight: number;
    quantity: number;
    insurance_value: number;
    description: string;
  }>;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders();

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const body: ShippingRequest = await req.json();
    
    console.log('📦 Recebido pedido de cálculo:', JSON.stringify(body, null, 2));

    // Validar dados obrigatórios
    if (!body.to?.zipcode && !body.to?.postal_code) {
      console.error('❌ CEP de destino não informado');
      return new Response(
        JSON.stringify({
          error: 'CEP de destino é obrigatório',
          carriers: [],
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!body.products || body.products.length === 0) {
      console.error('❌ Nenhum produto informado');
      return new Response(
        JSON.stringify({
          error: 'Produtos são obrigatórios',
          carriers: [],
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Token do Melhor Envio - ler apenas do Deno.env
    const token = Deno.env.get('MELHOR_ENVIO_TOKEN');
    
    if (!token) {
      console.error('❌ ERRO: Token MELHOR_ENVIO_TOKEN não configurado');
      return new Response(
        JSON.stringify({
          error: 'Token do Melhor Envio não está configurado nas variáveis de ambiente',
          message: 'Configure MELHOR_ENVIO_TOKEN no Supabase Project Settings → Environment Variables',
          carriers: [],
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('🔑 Token MELHOR_ENVIO_TOKEN configurado: ✓');
    console.log('🔑 Primeiros 30 chars:', token.substring(0, 30) + '...');

    // Chamar API do Melhor Envio
    // URL de sandbox (para testes): https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate
    // URL de produção: https://api.melhorenvio.com.br/api/v2/me/shipment/calculate
    const melhorEnvioUrl = 'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate';
    
    // Transformar request body para o formato correto da API Melhor Envio
    // A API espera: from.postal_code, to.postal_code, products[]
    // CEP de origem padrão (RT-PRATAS) - pode ser configurado via env depois
    const originZipCode = Deno.env.get('MELHOR_ENVIO_ORIGIN_ZIP') || "96020360";
    
    const apiRequestBody = {
      from: {
        postal_code: originZipCode
      },
      to: {
        postal_code: body.to.zipcode || body.to.postal_code,
      },
      products: body.products || [],
      options: {
        receipt: false,
        own_hand: false,
      },
      // services: "1,2,18" // Opcional - pode deixar comentado para todas as transportadoras
    };

    console.log('📍 Enviando para:', melhorEnvioUrl);
    console.log('📦 Payload transformado:', JSON.stringify(apiRequestBody, null, 2));

    let response;

    try {
      console.log('🔄 Enviando requisição para Melhor Envio API...');
      console.log('📊 Headers que serão enviados:');
      console.log('   Authorization: Bearer ' + token.substring(0, 50) + '...');
      console.log('   User-Agent: Rayssa Joias (contato@rtratas.com.br)');
      console.log('   Content-Type: application/json');
      console.log('   Accept: application/json');
      
      response = await fetch(melhorEnvioUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'Rayssa Joias (contato@rtratas.com.br)',
        },
        body: JSON.stringify(apiRequestBody),
      });
      console.log('✅ Request enviado com sucesso - Status:', response.status);
    } catch (fetchError) {
      console.error('❌ Erro ao fazer fetch:', fetchError);
      return new Response(
        JSON.stringify({
          error: `Network error: ${fetchError instanceof Error ? fetchError.message : 'Connection failed'}`,
          carriers: [],
          message: 'Falha ao conectar com o servidor de fretes.',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('📡 Response status final:', response.status);

    const data = await response.json();
    
    console.log('✅ Resposta da API:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ Erro HTTP:', response.status, data);
      
      return new Response(
        JSON.stringify({
          error: data.message || data.error || 'Erro ao calcular frete',
          carriers: [],
          status: response.status,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Formatar resposta
    console.log('📊 Tipo de resposta:', typeof data, 'Array?', Array.isArray(data));
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('📦 Primeiro item da resposta:', JSON.stringify(data[0], null, 2));
    }

    const carriers = Array.isArray(data) 
      ? data.map((item: Record<string, unknown>) => {
          // Usar custom_price/custom_delivery_time se disponível, senão usar price/deadline
          const displayPrice = item.custom_price !== undefined ? item.custom_price : item.price;
          const displayDeadline = item.custom_delivery_time !== undefined ? item.custom_delivery_time : item.deadline;
          
          return {
            id: item.id,
            name: item.name,
            code: item.id,
            price: typeof displayPrice === 'string' ? parseFloat(displayPrice as string) : displayPrice,
            deadline: typeof displayDeadline === 'string' ? parseInt(displayDeadline as string) : displayDeadline,
            logo: item.logo || '',
            includes: item.includes || [],
          };
        })
      : [];

    console.log('✅ Carriers formatados:', JSON.stringify(carriers, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        carriers: carriers,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('❌ Erro ao calcular frete:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        carriers: [],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});