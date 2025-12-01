import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ShippingRequest {
  zipCode: string;
  weight: number;
  height: number;
  width: number;
  length: number;
}

interface CarrierOption {
  id: number;
  name: string;
  code: string;
  price: number;
  deadline: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: ShippingRequest = await req.json();
    const { zipCode, weight, height, width, length } = body;

    if (!zipCode || !weight || !height || !width || !length) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: config, error: configError } = await supabase
      .from("shipping_config")
      .select("*")
      .single();

    if (configError || !config) {
      throw new Error("Shipping configuration not found");
    }

    if (!config.token || !config.client_id) {
      return new Response(
        JSON.stringify({
          error: "Shipping service not configured",
          carriers: [],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const baseUrl = config.is_production
      ? "https://api.melhorenvio.com.br"
      : "https://sandbox.melhorenvio.com.br";

    const shippingData = {
      from: {
        postal_code: "01310-100",
      },
      to: {
        postal_code: zipCode,
      },
      products: [
        {
          id: 1,
          width: width,
          height: height,
          length: length,
          weight: weight,
          quantity: 1,
        },
      ],
    };

    const response = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.token}`,
        "User-Agent": "LuxJewels-Ecommerce/1.0",
      },
      body: JSON.stringify(shippingData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Melhor Envio API error:", errorData);
      throw new Error(`Melhor Envio API error: ${response.status}`);
    }

    const data = await response.json();

    const enabledCarriers = config.enabled_carriers || [
      "jadlog",
      "correios",
      "azul_cargo",
    ];
    const filteredCarriers = (data || [])
      .filter((carrier: CarrierOption) =>
        enabledCarriers.includes(carrier.code?.toLowerCase() || "")
      )
      .map((carrier: CarrierOption) => ({
        id: carrier.id,
        name: carrier.name,
        code: carrier.code,
        price: Math.round(carrier.price * 100) / 100,
        deadline: carrier.deadline,
      }))
      .sort((a: CarrierOption, b: CarrierOption) => a.price - b.price);

    return new Response(
      JSON.stringify({
        success: true,
        carriers: filteredCarriers,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error calculating shipping:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        carriers: [],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});