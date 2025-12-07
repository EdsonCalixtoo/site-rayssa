import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      return new Response(`Erro: ${error}`, { status: 400, headers: corsHeaders });
    }

    if (!code) {
      return new Response("Missing code", { status: 400, headers: corsHeaders });
    }

    const clientId = Deno.env.get("MELHOR_ENVIO_CLIENT_ID");
    const clientSecret = Deno.env.get("MELHOR_ENVIO_CLIENT_SECRET");
    const redirectUri = Deno.env.get("MELHOR_ENVIO_REDIRECT_URI");

    // Trocar CODE por access_token
    const tokenResponse = await fetch("https://melhorenvio.com.br/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return new Response(`Token error: ${JSON.stringify(tokenData)}`, { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Salvar token no Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from("settings")
      .update({
        melhor_envio_access_token: tokenData.access_token,
        melhor_envio_refresh_token: tokenData.refresh_token,
        melhor_envio_expires_in: tokenData.expires_in,
        updated_at: new Date().toISOString(),
      })
      .eq("id", (await supabase.from("settings").select("id").limit(1).single()).data.id);

    if (updateError) {
      return new Response(`Update error: ${updateError.message}`, { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Conectado!</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; }
            h1 { color: #00d084; }
          </style>
        </head>
        <body>
          <h1>✅ Conectado ao Melhor Envio!</h1>
          <p>Token salvo com sucesso.</p>
          <p>Você pode fechar esta página.</p>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 
        "Content-Type": "text/html",
        ...corsHeaders 
      },
    });
  } catch (err) {
    return new Response(`Error: ${err.message}`, { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
