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

    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const demo_account_id = url.searchParams.get('demo_account_id');
    const strategy_id = url.searchParams.get('strategy_id');
    const min_pnl = url.searchParams.get('min_pnl');

    let query = supabase
      .from('trades')
      .select(`
        *,
        strategy:strategies(*),
        demo_account:demo_accounts(*)
      `);

    // Add filters based on query parameters
    if (demo_account_id) {
      query = query.eq('demo_account_id', demo_account_id);
    }

    if (strategy_id) {
      query = query.eq('strategy_id', strategy_id);
    }

    if (min_pnl) {
      query = query.gte('pnl', parseFloat(min_pnl));
    }

    // First get user's demo account IDs
    const { data: demoAccounts } = await supabase
      .from('demo_accounts')
      .select('id')
      .eq('user_id', user.id);
    
    const demoAccountIds = demoAccounts?.map(a => a.id) || [];
    
    // Only get trades for user's demo accounts
    if (demoAccountIds.length > 0) {
      query = query.in('demo_account_id', demoAccountIds);
    }

    const { data: trades, error: tradesError } = await query
      .order('created_at', { ascending: false });

    if (tradesError) {
      console.error('Error fetching trades:', tradesError);
      return new Response(JSON.stringify({ error: 'Failed to fetch trades' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate performance metrics
    const totalTrades = trades.length;
    const executedTrades = trades.filter(t => t.status === 'executed');
    const totalPnL = executedTrades.reduce((sum, trade) => sum + (parseFloat(trade.pnl || 0)), 0);
    const winningTrades = executedTrades.filter(t => parseFloat(t.pnl || 0) > 0);
    const losingTrades = executedTrades.filter(t => parseFloat(t.pnl || 0) < 0);
    const winRate = executedTrades.length > 0 ? (winningTrades.length / executedTrades.length) * 100 : 0;
    
    // Group by strategy for strategy-wise performance
    const strategyPerformance = trades.reduce((acc, trade) => {
      const strategyId = trade.strategy_id;
      if (!acc[strategyId]) {
        acc[strategyId] = {
          strategy: trade.strategy,
          total_trades: 0,
          executed_trades: 0,
          total_pnl: 0,
          winning_trades: 0,
          losing_trades: 0,
          win_rate: 0
        };
      }
      
      acc[strategyId].total_trades++;
      if (trade.status === 'executed') {
        acc[strategyId].executed_trades++;
        const pnl = parseFloat(trade.pnl || 0);
        acc[strategyId].total_pnl += pnl;
        if (pnl > 0) acc[strategyId].winning_trades++;
        if (pnl < 0) acc[strategyId].losing_trades++;
      }
      
      acc[strategyId].win_rate = acc[strategyId].executed_trades > 0 
        ? (acc[strategyId].winning_trades / acc[strategyId].executed_trades) * 100 
        : 0;
      
      return acc;
    }, {} as any);

    // Group by demo account for account-wise performance
    const accountPerformance = trades.reduce((acc, trade) => {
      const accountId = trade.demo_account_id;
      if (!acc[accountId]) {
        acc[accountId] = {
          demo_account: trade.demo_account,
          total_trades: 0,
          executed_trades: 0,
          total_pnl: 0,
          winning_trades: 0,
          losing_trades: 0,
          win_rate: 0
        };
      }
      
      acc[accountId].total_trades++;
      if (trade.status === 'executed') {
        acc[accountId].executed_trades++;
        const pnl = parseFloat(trade.pnl || 0);
        acc[accountId].total_pnl += pnl;
        if (pnl > 0) acc[accountId].winning_trades++;
        if (pnl < 0) acc[accountId].losing_trades++;
      }
      
      acc[accountId].win_rate = acc[accountId].executed_trades > 0 
        ? (acc[accountId].winning_trades / acc[accountId].executed_trades) * 100 
        : 0;
      
      return acc;
    }, {} as any);

    const performance = {
      overview: {
        total_trades: totalTrades,
        executed_trades: executedTrades.length,
        pending_trades: trades.filter(t => t.status === 'pending').length,
        cancelled_trades: trades.filter(t => t.status === 'cancelled').length,
        total_pnl: totalPnL,
        winning_trades: winningTrades.length,
        losing_trades: losingTrades.length,
        win_rate: winRate,
        average_win: winningTrades.length > 0 
          ? winningTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0) / winningTrades.length 
          : 0,
        average_loss: losingTrades.length > 0 
          ? losingTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0) / losingTrades.length 
          : 0
      },
      by_strategy: Object.values(strategyPerformance),
      by_account: Object.values(accountPerformance),
      recent_trades: trades.slice(0, 10)
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