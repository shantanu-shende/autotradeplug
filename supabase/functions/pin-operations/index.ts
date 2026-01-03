import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
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

    console.log(`Authenticated user ${user.id} accessing pin-operations`);

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, pin, phone_number } = await req.json();

    if (!action) {
      return new Response(JSON.stringify({ error: "Missing action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate PIN format (4 digits)
    if (pin && !/^\d{4}$/.test(pin)) {
      return new Response(JSON.stringify({ error: "Invalid PIN format. Must be 4 digits." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for database operations to bypass RLS when needed
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (action === 'set') {
      if (!pin) {
        return new Response(JSON.stringify({ error: "PIN is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Hash PIN with bcrypt server-side (using generated salt)
      const salt = await bcrypt.genSalt(12);
      const pinHash = await bcrypt.hash(pin, salt);
      console.log(`Setting PIN hash for user ${user.id}`);

      // Update profile with hashed PIN
      const updateData: Record<string, any> = {
        pin_hash: pinHash,
        is_onboarded: true,
        updated_at: new Date().toISOString(),
      };

      if (phone_number) {
        updateData.phone_number = phone_number;
      }

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) {
        console.error("Failed to update profile:", updateError.message);
        return new Response(JSON.stringify({ error: "Failed to set PIN" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`PIN successfully set for user ${user.id}`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === 'verify') {
      if (!pin) {
        return new Response(JSON.stringify({ error: "PIN is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get the user's PIN hash from database
      const { data: profile, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('pin_hash')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error("Failed to fetch profile:", fetchError.message);
        return new Response(JSON.stringify({ error: "Failed to verify PIN" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!profile?.pin_hash) {
        return new Response(JSON.stringify({ error: "PIN not set", valid: false }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify PIN server-side
      const isValid = await bcrypt.compare(pin, profile.pin_hash);
      console.log(`PIN verification for user ${user.id}: ${isValid ? 'success' : 'failed'}`);

      return new Response(JSON.stringify({ valid: isValid }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error in pin-operations function:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});