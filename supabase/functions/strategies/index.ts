import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation helpers
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STRATEGY_NAME_REGEX = /^[a-zA-Z0-9\s\-_]+$/;

function isValidUUID(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

function isValidStrategyName(value: unknown): value is string {
  return typeof value === 'string' && 
         value.length >= 1 && 
         value.length <= 100 && 
         STRATEGY_NAME_REGEX.test(value);
}

function isValidDescription(value: unknown): value is string | undefined {
  if (value === undefined || value === null) return true;
  return typeof value === 'string' && value.length <= 500;
}

function isValidConfig(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidRiskLevel(value: unknown): value is string {
  return typeof value === 'string' && ['low', 'medium', 'high'].includes(value);
}

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
        // Get all user strategies
        const { data: strategies, error } = await supabase
          .from('user_strategies')
          .select('*')
          .eq('user_id', user.id)
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

        let body;
        try {
          body = await req.json();
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (action === 'deploy') {
          // Deploy strategy to demo account (broker)
          const { demo_account_id, strategy_id } = body;

          if (!isValidUUID(strategy_id)) {
            return new Response(JSON.stringify({ error: 'Invalid strategy_id format' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          if (!demo_account_id || typeof demo_account_id !== 'string') {
            return new Response(JSON.stringify({ error: 'Invalid demo_account_id' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Verify the broker/demo account belongs to the user
          const { data: account, error: accountError } = await supabase
            .from('brokers')
            .select('id, status')
            .eq('id', demo_account_id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (accountError || !account) {
            return new Response(JSON.stringify({ error: 'Demo account not found' }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          if (account.status !== 'connected') {
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
              user_id: user.id,
              status: 'running'
            })
            .select(`
              *,
              strategy:user_strategies(*)
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
          const { strategy_name, description, config, risk_level } = body;

          if (!isValidStrategyName(strategy_name)) {
            return new Response(JSON.stringify({ 
              error: 'Invalid strategy name. Must be 1-100 characters, alphanumeric with spaces, hyphens, or underscores.' 
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          if (!isValidDescription(description)) {
            return new Response(JSON.stringify({ 
              error: 'Invalid description. Must be less than 500 characters.' 
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          if (config !== undefined && !isValidConfig(config)) {
            return new Response(JSON.stringify({ error: 'Invalid config format' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          if (risk_level !== undefined && !isValidRiskLevel(risk_level)) {
            return new Response(JSON.stringify({ 
              error: 'Invalid risk level. Must be one of: low, medium, high' 
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const { data: strategy, error } = await supabase
            .from('user_strategies')
            .insert({
              user_id: user.id,
              strategy_name,
              description: description || null,
              config: config || {},
              risk_level: risk_level || 'medium',
              status: 'draft'
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
        let body;
        try {
          body = await req.json();
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { deployment_id, status } = body;

        if (!isValidUUID(deployment_id)) {
          return new Response(JSON.stringify({ error: 'Invalid deployment_id format' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const validStatuses = ['running', 'paused', 'stopped'];
        if (typeof status !== 'string' || !validStatuses.includes(status)) {
          return new Response(JSON.stringify({ 
            error: 'Invalid status. Must be one of: running, paused, stopped' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Update deployment status
        const { data: deployment, error } = await supabase
          .from('deployed_strategies')
          .update({ status })
          .eq('id', deployment_id)
          .eq('user_id', user.id)
          .select(`
            *,
            strategy:user_strategies(*)
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
