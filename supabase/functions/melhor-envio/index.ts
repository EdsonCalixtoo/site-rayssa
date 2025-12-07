// Edge Function Melhor Envio - Calcula frete usando token salvo no banco

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve: (handler: (req: Request) => Promise<Response>) => void;
};

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // 1️⃣ Buscar token OAuth salvo no banco via REST
    const settingsResponse = await fetch(
      `${supabaseUrl}/rest/v1/settings?select=melhor_envio_access_token&limit=1`,
      {
        headers: {
          apikey: supabaseKey!,
          Authorization: `Bearer ${supabaseKey!}`,
        },
      }
    );

    const settingsData = await settingsResponse.json() as any[];
    const token = settingsData?.[0]?.melhor_envio_access_token || Deno.env.get("MELHOR_ENVIO_TEST_TOKEN");

    if (!token) {
      return new Response(
        JSON.stringify({
          error: "Nenhum token configurado. Conecte ao Melhor Envio primeiro.",
        }),
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const originZip = Deno.env.get("MELHOR_ENVIO_ORIGIN_ZIP") || "13088-130";

    // 2️⃣ Validar medidas mínimas
    const medidas = {
      width: Math.max(Number(body.largura) || 0, 11),
      height: Math.max(Number(body.altura) || 0, 2),
      length: Math.max(Number(body.comprimento) || 0, 16),
      weight: Math.max(Number(body.peso) || 0, 0.3),
    };

    const apiRequestBody = {
      from: {
        postal_code: originZip,
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

    // 3️⃣ Chamar API Melhor Envio
    const response = await fetch(
      "https://melhorenvio.com.br/api/v2/me/shipment/calculate",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "Rayssa Joias",
        },
        body: JSON.stringify(apiRequestBody),
      }
    );

    const result = await response.json();

    // 4️⃣ Filtrar e formatar resposta
    const carriers = Array.isArray(result)
      ? result
          .filter((item: any) => item?.price?.total && item.price.total > 0)
          .map((item: any) => ({
            id: item.id,
            name: item.name || "Frete",
            code: item.code || 0,
            price: { total: item.price.total },
            deadline: item.delivery_time || 0,
            company: { name: item.company?.name || "Transportadora" },
            logo: item.company?.picture || "",
          }))
      : [];

    return new Response(
      JSON.stringify({
        success: true,
        carriers,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Erro:", err);
    return new Response(
      JSON.stringify({
        error: "Erro ao calcular frete",
        details: String(err),
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
