import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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

    // Token do Melhor Envio - usar token Bearer antigo que funciona
    let token = Deno.env.get('MELHOR_ENVIO_TOKEN');
    
    if (!token) {
      console.warn('⚠️ Token MELHOR_ENVIO_TOKEN não encontrado no env, usando fallback');
      // Usar token Bearer simples (não JWT) que é aceito pela API
      token = 'B425XUxX89AjuHaFDzWUavTQuykpyEsoDHfbhgFz';
      console.log('✅ Usando token Bearer de fallback');
    }

    console.log('🔑 Token configurado:', token ? '✓' : '✗');
    console.log('🔑 Primeiros 30 chars:', token.substring(0, 30) + '...');
    console.log('📊 Tipo de token:', token.startsWith('eyJ') ? 'JWT (não recomendado)' : 'Bearer simples');

    // Chamar API do Melhor Envio
    // URL de produção: https://api.melhorenvio.com.br/api/v2/me/shipment/calculate
    // URL de sandbox: https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate
    const melhorEnvioUrl = 'https://api.melhorenvio.com.br/api/v2/me/shipment/calculate';
    
    // Transformar request body para o formato correto da API Melhor Envio
    // A API espera: from.postal_code, to.postal_code, products[]
    const apiRequestBody = {
      from: {
        postal_code: "96020360" // CEP padrão da origem - pode ser configurado depois
      },
      to: {
        postal_code: body.to.zipcode || body.to.postal_code,
      },
      products: body.products || [],
    };

    console.log('📍 Enviando para:', melhorEnvioUrl);
    console.log('📦 Payload transformado:', JSON.stringify(apiRequestBody, null, 2));

    let response;

    try {
      console.log('🔄 Enviando requisição para Melhor Envio API...');
      response = await fetch(melhorEnvioUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'RT-PRATAS (contato@rtratas.com.br)',
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
      
      // Se for 401, pode ser que o token está expirado ou inválido
      if (response.status === 401) {
        return new Response(
          JSON.stringify({
            error: 'Token inválido ou expirado',
            carriers: [],
            message: 'Autenticação falhou. Verifique o token do Melhor Envio.',
            debug: data,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          error: data,
          carriers: [],
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
      ? data.map((item: any) => {
          // Usar custom_price/custom_delivery_time se disponível, senão usar price/deadline
          const displayPrice = item.custom_price !== undefined ? item.custom_price : item.price;
          const displayDeadline = item.custom_delivery_time !== undefined ? item.custom_delivery_time : item.deadline;
          
          return {
            id: item.id,
            name: item.name,
            code: item.id,
            price: typeof displayPrice === 'string' ? parseFloat(displayPrice) : displayPrice,
            deadline: typeof displayDeadline === 'string' ? parseInt(displayDeadline) : displayDeadline,
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