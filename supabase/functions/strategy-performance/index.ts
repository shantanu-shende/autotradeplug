import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation helpers
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

function isValidNumber(value: string | null): boolean {
  if (value === null) return true;
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num);
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

    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const demo_account_id = url.searchParams.get('demo_account_id');
    const strategy_id = url.searchParams.get('strategy_id');

    // Validate query parameters
    if (demo_account_id && !isValidUUID(demo_account_id)) {
      return new Response(JSON.stringify({ error: 'Invalid demo_account_id format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (strategy_id && !isValidUUID(strategy_id)) {
      return new Response(JSON.stringify({ error: 'Invalid strategy_id format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's deployed strategies with related data
    let query = supabase
      .from('deployed_strategies')
      .select(`
        *,
        strategy:user_strategies(*)
      `)
      .eq('user_id', user.id);

    if (demo_account_id) {
      query = query.eq('demo_account_id', demo_account_id);
    }

    if (strategy_id) {
      query = query.eq('strategy_id', strategy_id);
    }

    const { data: deployments, error: deploymentsError } = await query
      .order('deployed_at', { ascending: false });

    if (deploymentsError) {
      console.error('Error fetching deployments:', deploymentsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch deployments' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's brokers (demo accounts) for account info
    const { data: brokers, error: brokersError } = await supabase
      .from('brokers')
      .select('*')
      .eq('user_id', user.id);

    if (brokersError) {
      console.error('Error fetching brokers:', brokersError);
    }

    // Calculate performance metrics based on deployments
    const totalDeployments = deployments?.length || 0;
    const activeDeployments = deployments?.filter(d => d.status === 'running').length || 0;
    const pausedDeployments = deployments?.filter(d => d.status === 'paused').length || 0;

    // Group by strategy for strategy-wise performance
    const strategyPerformance = (deployments || []).reduce((acc, deployment) => {
      const strategyId = deployment.strategy_id;
      if (!strategyId) return acc;
      
      if (!acc[strategyId]) {
        acc[strategyId] = {
          strategy: deployment.strategy,
          total_deployments: 0,
          active_deployments: 0,
          paused_deployments: 0
        };
      }
      
      acc[strategyId].total_deployments++;
      if (deployment.status === 'running') acc[strategyId].active_deployments++;
      if (deployment.status === 'paused') acc[strategyId].paused_deployments++;
      
      return acc;
    }, {} as Record<string, unknown>);

    // Group by demo account for account-wise performance
    const accountPerformance = (deployments || []).reduce((acc, deployment) => {
      const accountId = deployment.demo_account_id;
      if (!accountId) return acc;
      
      const broker = brokers?.find(b => b.id === accountId);
      
      if (!acc[accountId]) {
        acc[accountId] = {
          demo_account: broker || { id: accountId },
          total_deployments: 0,
          active_deployments: 0,
          paused_deployments: 0
        };
      }
      
      acc[accountId].total_deployments++;
      if (deployment.status === 'running') acc[accountId].active_deployments++;
      if (deployment.status === 'paused') acc[accountId].paused_deployments++;
      
      return acc;
    }, {} as Record<string, unknown>);

    const performance = {
      overview: {
        total_deployments: totalDeployments,
        active_deployments: activeDeployments,
        paused_deployments: pausedDeployments,
        stopped_deployments: deployments?.filter(d => d.status === 'stopped').length || 0
      },
      by_strategy: Object.values(strategyPerformance),
      by_account: Object.values(accountPerformance),
      recent_deployments: (deployments || []).slice(0, 10)
    };

    return new Response(JSON.stringify({ performance }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in strategy-performance function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
