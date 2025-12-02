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
    state: string;
    city: string;
    address: string;
    number: string;
    complement?: string;
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

    // Token do Melhor Envio (pegue as variáveis de ambiente)
    const token = Deno.env.get('MELHOR_ENVIO_TOKEN');
    
    if (!token) {
      console.log('❌ Token MELHOR_ENVIO_TOKEN não configurado');
      return new Response(
        JSON.stringify({
          error: 'Token não configurado no servidor',
          carriers: [],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('🔑 Token configurado:', token ? '✓' : '✗');

    // Chamar API do Melhor Envio (v3)
    const melhorEnvioUrl = 'https://api.melhorenvio.com.br/shipment/calculate';
    
    console.log('📍 Enviando para:', melhorEnvioUrl);
    console.log('📦 Dados:', JSON.stringify(body, null, 2));

    const response = await fetch(melhorEnvioUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'RT-PRATAS/1.0',
      },
      body: JSON.stringify(body),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', JSON.stringify(Object.fromEntries(response.headers), null, 2));

    const data = await response.json();
    
    console.log('✅ Resposta da API:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ Erro da API:', data);
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
    const carriers = Array.isArray(data) 
      ? data.map((item: any) => ({
          id: item.id,
          name: item.name,
          code: item.id,
          price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
          deadline: typeof item.deadline === 'string' ? parseInt(item.deadline) : item.deadline,
          logo: item.logo || '',
          includes: item.includes || [],
        }))
      : [];

    console.log('✅ Carriers formatados:', carriers);

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