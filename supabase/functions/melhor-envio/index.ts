// Edge Function Melhor Envio (Sandbox)

// Import do runtime do Supabase para Deno
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
          error:
            "Variável MELHOR_ENVIO_TEST_TOKEN não configurada no Supabase.",
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    const body = await req.json();

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
          width: body.largura,
          height: body.altura,
          length: body.comprimento,
          weight: body.peso,
          insurance_value: 0,
          quantity: 1,
        },
      ],
    };

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

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
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
