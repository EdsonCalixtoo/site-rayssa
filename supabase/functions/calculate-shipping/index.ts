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
    let token = Deno.env.get('MELHOR_ENVIO_TOKEN');
    
    // Se o token não estiver no env, usar JWT token (temporário para debug)
    if (!token) {
      console.warn('⚠️ Token MELHOR_ENVIO_TOKEN não encontrado no env, usando JWT fallback');
      token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NTYiLCJqdGkiOiI5ZmMyZDA1ZTA0MWMzOGM1MmM3ODZmYzcwODk1NjVmMDFmMzc3OTE3OTkxN2FmYjM1OTY0NTI1ZjBmMWJhZWRkMTZjYzRhZWNmNjFlMWZhZSIsImlhdCI6MTc2NDcyMDc0OS4wNDcxMTIsIm5iZiI6MTc2NDcyMDc0OS4wNDcxMTUsImV4cCI6MTc5NjI1Njc0OS4wMzk3NzMsInN1YiI6ImEwN2ZlZGZiLWEyN2QtNDI2OC05YmU5LTQ5ZDc2YzA0YzBiMCIsInNjb3BlcyI6WyJjYXJ0LXJlYWQiLCJjYXJ0LXdyaXRlIiwiY29tcGFuaWVzLXJlYWQiLCJjb21wYW5pZXMtd3JpdGUiLCJjb3Vwb25zLXJlYWQiLCJjb3Vwb25zLXdyaXRlIiwibm90aWZpY2F0aW9ucy1yZWFkIiwib3JkZXJzLXJlYWQiLCJwcm9kdWN0cy1yZWFkIiwicHJvZHVjdHMtZGVzdHJveSIsInByb2R1Y3RzLXdyaXRlIiwicHVyY2hhc2VzLXJlYWQiLCJzaGlwcGluZy1jYWxjdWxhdGUiLCJzaGlwcGluZy1jYW5jZWwiLCJzaGlwcGluZy1jaGVja291dCIsInNoaXBwaW5nLWNvbXBhbmllcyIsInNoaXBwaW5nLWdlbmVyYXRlIiwic2hpcHBpbmctcHJldmlldyIsInNoaXBwaW5nLXByaW50Iiwic2hpcHBpbmctc2hhcmUiLCJzaGlwcGluZy10cmFja2luZyIsImVjb21tZXJjZS1zaGlwcGluZyIsInRyYW5zYWN0aW9ucy1yZWFkIiwidXNlcnMtcmVhZCIsInVzZXJzLXdyaXRlIiwid2ViaG9va3MtcmVhZCIsIndlYmhvb2tzLXdyaXRlIiwid2ViaG9va3MtZGVsZXRlIiwidGRlYWxlci13ZWJob29rIl19.KQ_AWsNWbu5l5HWv1Yu50Dvr2w8FGtsXsJZ6TApfRGXuR5shP5G3bVZ3xZq71QKuI0PJ-zpeeRuw-7GT1RQGgW81AKzdsJHX25MeasFylSqGVjsU8DNuatCLNwFpQMxkvlD54Y3u-IU0xcjHQ5OGhSzZs-Rhp6Yz4jrn8QYVTtrBsQkUoBSg4m3yo55bc7jyQB5LjddKm-5SLF-3fL5NWu6KQoOdJk3_XFN4vabkaxT6diaMGIu195p8miW3HQ-odqWn2no165GQUV8xEug_6wHuFSaqw4rDUw7j6kCGp0tGTIUTiZkni2bFY5NW8lLwfBm4AHsEgGYalmoGTRVkCs-cUGBM75MY8i7zhbydTE_NUYFaXq9foj04HWbqcNxujApdUYUoaj2OxHt9PlHVKpZ7kI9Re6aN_-F4J-PcJo4Gjif79Wv_FXZHCLj4yz4GZLNMRyCjvVnUaJG-_XLxdRLM7p8jhxyKoJATtZ5uM46ujkjq3hFkhvXgiv9tFCYQgTXgN7quw3jQzXAq-dXVBZ3WXZhhcaWYzt-O0yZJ9WUNO2u0uZx9Wt-7PtHBBbj1bGSXdX0bJIOg7NaOgfZoYlfULFJ_CV2AA10LnCXLjNoRnlXHquRCpu1cvAh25-ZcW-vLNeWUGEu_PYOpB6EXfpwVbYv71oy-Yr_FXgT4mXk';
    }

    console.log('🔑 Token configurado:', token ? '✓' : '✗');

    // Chamar API do Melhor Envio
    // URL de produção: https://api.melhorenvio.com.br
    // URL de sandbox: https://sandbox.melhorenvio.com.br
    const melhorEnvioUrl = 'https://api.melhorenvio.com.br/shipment/calculate';
    
    console.log('📍 Enviando para:', melhorEnvioUrl);
    console.log('📦 Dados:', JSON.stringify(body, null, 2));

    let response;
    try {
      response = await fetch(melhorEnvioUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'RT-PRATAS (contato@rtratas.com.br)',
        },
        body: JSON.stringify(body),
      });
      console.log('✅ Request enviado com sucesso');
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

    console.log('📡 Response status:', response.status);

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