import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface DenoEnv {
  get(key: string): string | undefined;
}

interface DenoNamespace {
  env: DenoEnv;
  serve: (handler: (req: Request) => Promise<Response>) => void;
}

declare const Deno: DenoNamespace;

const getCorsHeaders = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
});

interface TokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

interface MelhorEnvioUser {
  id: string;
  email: string;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders();

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Pegar parâmetros da query string
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const error_description = url.searchParams.get("error_description");

    console.log("🔄 Callback recebido do Melhor Envio");
    console.log("   Code:", code ? "✓" : "✗");
    console.log("   State:", state);
    console.log("   Error:", error || "none");

    // Se houver erro na autorização
    if (error) {
      console.error("❌ Erro de autorização:", error, error_description);
      return new Response(
        JSON.stringify({
          error: error,
          message: error_description || "Autorização negada",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validar se temos o code
    if (!code) {
      console.error("❌ Code não recebido");
      return new Response(
        JSON.stringify({ error: "Code não fornecido" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Obter credenciais do app
    const clientId = Deno.env.get("MELHOR_ENVIO_CLIENT_ID");
    const clientSecret = Deno.env.get("MELHOR_ENVIO_CLIENT_SECRET");
    const redirectUri = Deno.env.get("MELHOR_ENVIO_REDIRECT_URI");

    if (!clientId || !clientSecret || !redirectUri) {
      console.error("❌ Variáveis de ambiente não configuradas");
      return new Response(
        JSON.stringify({
          error: "Erro de configuração do servidor",
          message: "Contacte o suporte",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Trocar code por token
    console.log("🔄 Solicitando access_token...");

    const tokenUrl = "https://sandbox.melhorenvio.com.br/oauth/token";
    
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    console.log("📡 Resposta do token:", tokenResponse.status);

    const tokenData: TokenResponse = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("❌ Erro ao obter token:", tokenData);
      return new Response(
        JSON.stringify({
          error: "Falha ao obter token",
          details: tokenData,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Token obtido com sucesso");
    console.log("   Expires in:", tokenData.expires_in, "segundos");

    // Obter informações do usuário usando o token
    console.log("🔄 Buscando informações do usuário...");

    const userResponse = await fetch("https://sandbox.melhorenvio.com.br/api/v2/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Accept": "application/json",
        "User-Agent": "Rayssa Joias (contato@rtratas.com.br)",
      },
    });

    console.log("📡 Resposta do usuário:", userResponse.status);

    const userData: MelhorEnvioUser = await userResponse.json();

    if (!userResponse.ok) {
      console.error("❌ Erro ao obter dados do usuário:", userData);
      return new Response(
        JSON.stringify({
          error: "Falha ao obter dados do usuário",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Dados do usuário obtidos");
    console.log("   ID:", userData.id);
    console.log("   Email:", userData.email);

    // Salvar tokens no banco de dados
    console.log("💾 Salvando tokens no banco...");

    // Aqui você precisará chamar uma rota que acesse o Supabase Admin
    // ou usar a Supabase URL com a anon key (menos seguro)
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Retornar sucesso com informações
    return new Response(
      JSON.stringify({
        success: true,
        message: "Autorização realizada com sucesso",
        user: {
          id: userData.id,
          email: userData.email,
        },
        token_expires_at: expiresAt,
        // O access_token NÃO deve ser retornado ao frontend
        // Ele será armazenado de forma segura no servidor
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Erro:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
