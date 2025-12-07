// Edge Function Melhor Envio (Sandbox)

// Import runtime
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve: (handler: (req: Request) => Promise<Response>) => void;
};

// CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get("MELHOR_ENVIO_TEST_TOKEN");
    const originZip = Deno.env.get("MELHOR_ENVIO_ORIGIN_ZIP");

    if (!token) {
      return new Response(
        JSON.stringify({
          error: "Variável MELHOR_ENVIO_TEST_TOKEN não configurada no Supabase.",
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    const body = await req.json();

    // 🔥 Correção: valores mínimos exigidos pelo Melhor Envio (e necessários pra Jadlog)
    const medidas = {
      width: Math.max(Number(body.largura) || 0, 11),      // mínimo 11 cm
      height: Math.max(Number(body.altura) || 0, 2),       // mínimo 2 cm
      length: Math.max(Number(body.comprimento) || 0, 16), // mínimo 16 cm
      weight: Math.max(Number(body.peso) || 0, 0.3),       // mínimo 300g
    };

    const apiRequestBody = {
      from: {
        postal_code: originZip || "01001-000",
      },
      to: {
        postal_code: body.cep,
      },
      products: [
        {
          id: "1",
          ...medidas,
          insurance_value: 0,
          quantity: 1,
        },
      ],
    };

    // Chamada à API Melhor Envio
    const response = await fetch(
      "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "Rayssa Joias (juninho.caxto@gmail.com)",
        },
        body: JSON.stringify(apiRequestBody),
      }
    );

    const result = await response.json();

    // 🔥 Filtrar apenas fretes com preço válido
    const fretesValidos = result.filter(
      (item: any) => item?.price && item.price > 0
    );

    // 🔥 Converter para formato esperado pelo frontend
    const carriers = fretesValidos.map((item: any) => ({
      id: item.id,
      name: item.name || "Frete",
      code: item.code || 0,
      price: item.price,
      deadline: item.delivery_time || item.deadline || 0,
      logo: item.company?.picture || "",
      includes: [],
    }));

    return new Response(
      JSON.stringify({
        success: true,
        carriers,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Erro ao calcular frete",
        details: String(err),
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
