import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function decodeJwtClientId(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    // Common claim name observed in Dhan tokens
    return payload?.dhanClientId || payload?.clientId || null;
  } catch (_) {
    return null;
  }
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user authentication
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Authenticated user ${user.id} accessing dhan-optionchain`);
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, payload } = await req.json();

    if (!action) {
      return new Response(JSON.stringify({ error: "Missing action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("DHAN_API_KEY");
    let clientId = Deno.env.get("DHAN_CLIENT_ID");
    if (!clientId && apiKey) {
      clientId = decodeJwtClientId(apiKey) ?? undefined;
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "DHAN_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!clientId) {
      return new Response(JSON.stringify({ error: "DHAN_CLIENT_ID not configured and could not derive from token" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const baseUrl = "https://api.dhan.co/v2";
    let url = "";
    let body: any = {};

    switch (action) {
      case "optionchain": {
        url = `${baseUrl}/optionchain`;
        if (!payload?.UnderlyingScrip || !payload?.UnderlyingSeg || !payload?.Expiry) {
          return new Response(JSON.stringify({ error: "Missing UnderlyingScrip, UnderlyingSeg or Expiry" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        body = {
          UnderlyingScrip: payload.UnderlyingScrip,
          UnderlyingSeg: payload.UnderlyingSeg,
          Expiry: payload.Expiry,
        };
        break;
      }
      case "expirylist": {
        url = `${baseUrl}/optionchain/expirylist`;
        if (!payload?.UnderlyingScrip || !payload?.UnderlyingSeg) {
          return new Response(JSON.stringify({ error: "Missing UnderlyingScrip or UnderlyingSeg" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        body = {
          UnderlyingScrip: payload.UnderlyingScrip,
          UnderlyingSeg: payload.UnderlyingSeg,
        };
        break;
      }
      case "quote": {
        // Placeholder for future quote/LTP endpoint if needed
        return new Response(JSON.stringify({ error: "quote action not implemented yet" }), {
          status: 501,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const dhanRes = await fetch(url, {
      method: "POST",
      headers: {
        "access-token": apiKey,
        "client-id": clientId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await dhanRes.text();

    // Forward response as-is
    return new Response(text, {
      status: dhanRes.status,
      headers: { ...corsHeaders, "Content-Type": dhanRes.headers.get("content-type") ?? "application/json" },
    });
  } catch (err) {
    console.error("Error in dhan-optionchain function:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
