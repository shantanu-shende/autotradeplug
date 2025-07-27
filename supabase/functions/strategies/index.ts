import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    switch (req.method) {
      case 'GET': {
        // Get all available strategies (predefined + user's custom)
        const { data: strategies, error } = await supabase
          .from('strategies')
          .select('*')
          .or(`user_id.eq.${user.id},is_predefined.eq.true`)
          .order('is_predefined', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching strategies:', error);
          return new Response(JSON.stringify({ error: 'Failed to fetch strategies' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ strategies }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'POST': {
        const url = new URL(req.url);
        const action = url.searchParams.get('action');

        if (action === 'deploy') {
          // Deploy strategy to demo account
          const { demo_account_id, strategy_id } = await req.json();

          if (!demo_account_id || !strategy_id) {
            return new Response(JSON.stringify({ error: 'Missing demo_account_id or strategy_id' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Verify the demo account belongs to the user
          const { data: account, error: accountError } = await supabase
            .from('demo_accounts')
            .select('id, status')
            .eq('id', demo_account_id)
            .eq('user_id', user.id)
            .single();

          if (accountError || !account) {
            return new Response(JSON.stringify({ error: 'Demo account not found' }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          if (account.status !== 'active') {
            return new Response(JSON.stringify({ error: 'Demo account must be active to deploy strategies' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Deploy the strategy
          const { data: deployment, error } = await supabase
            .from('deployed_strategies')
            .insert({
              demo_account_id,
              strategy_id,
              is_active: true
            })
            .select(`
              *,
              strategy:strategies(*),
              demo_account:demo_accounts(*)
            `)
            .single();

          if (error) {
            console.error('Error deploying strategy:', error);
            return new Response(JSON.stringify({ error: 'Failed to deploy strategy' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify({ deployment }), {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Create custom strategy
          const { name, description, config } = await req.json();

          if (!name || !config) {
            return new Response(JSON.stringify({ error: 'Missing name or config' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const { data: strategy, error } = await supabase
            .from('strategies')
            .insert({
              user_id: user.id,
              name,
              description,
              config,
              is_predefined: false
            })
            .select()
            .single();

          if (error) {
            console.error('Error creating strategy:', error);
            return new Response(JSON.stringify({ error: 'Failed to create strategy' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify({ strategy }), {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      case 'PUT': {
        const { deployment_id, is_active } = await req.json();

        if (!deployment_id || is_active === undefined) {
          return new Response(JSON.stringify({ error: 'Missing deployment_id or is_active' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Update deployment status
        const { data: deployment, error } = await supabase
          .from('deployed_strategies')
          .update({ is_active })
          .eq('id', deployment_id)
          .select(`
            *,
            strategy:strategies(*),
            demo_account:demo_accounts(*)
          `)
          .single();

        if (error) {
          console.error('Error updating deployment:', error);
          return new Response(JSON.stringify({ error: 'Failed to update deployment' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ deployment }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in strategies function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});