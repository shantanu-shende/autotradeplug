import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PortfolioRequest {
  action: 'create' | 'list' | 'get' | 'update' | 'delete' | 'add_funds' | 'withdraw';
  portfolio_id?: string;
  data?: {
    portfolio_name?: string;
    portfolio_type?: 'real' | 'demo';
    balance?: number;
    currency?: string;
    amount?: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: PortfolioRequest = await req.json();
    const { action, portfolio_id, data } = body;

    let result;

    switch (action) {
      case 'create': {
        if (!data?.portfolio_name) {
          throw new Error('portfolio_name is required');
        }
        
        const initialBalance = data.portfolio_type === 'demo' ? (data.balance || 10000) : 0;
        
        const { data: portfolio, error } = await supabase
          .from('portfolios')
          .insert({
            user_id: user.id,
            portfolio_name: data.portfolio_name,
            portfolio_type: data.portfolio_type || 'demo',
            balance: initialBalance,
            equity: initialBalance,
            margin_available: initialBalance,
            currency: data.currency || 'USD',
          })
          .select()
          .single();

        if (error) throw error;
        result = { portfolio };
        break;
      }

      case 'list': {
        const { data: portfolios, error } = await supabase
          .from('portfolios')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        result = { portfolios };
        break;
      }

      case 'get': {
        if (!portfolio_id) throw new Error('portfolio_id is required');
        
        const { data: portfolio, error } = await supabase
          .from('portfolios')
          .select('*')
          .eq('id', portfolio_id)
          .single();

        if (error) throw error;

        // Get positions for this portfolio
        const { data: positions, error: posError } = await supabase
          .from('positions')
          .select('*')
          .eq('portfolio_id', portfolio_id);

        if (posError) throw posError;

        // Get recent orders
        const { data: orders, error: ordError } = await supabase
          .from('orders')
          .select('*')
          .eq('portfolio_id', portfolio_id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (ordError) throw ordError;

        result = { portfolio, positions, orders };
        break;
      }

      case 'update': {
        if (!portfolio_id) throw new Error('portfolio_id is required');
        
        const updateData: Record<string, unknown> = {};
        if (data?.portfolio_name) updateData.portfolio_name = data.portfolio_name;
        if (data?.currency) updateData.currency = data.currency;

        const { data: portfolio, error } = await supabase
          .from('portfolios')
          .update(updateData)
          .eq('id', portfolio_id)
          .select()
          .single();

        if (error) throw error;
        result = { portfolio };
        break;
      }

      case 'delete': {
        if (!portfolio_id) throw new Error('portfolio_id is required');
        
        const { error } = await supabase
          .from('portfolios')
          .delete()
          .eq('id', portfolio_id);

        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'add_funds': {
        if (!portfolio_id || !data?.amount) {
          throw new Error('portfolio_id and amount are required');
        }

        // Get current portfolio
        const { data: current, error: getError } = await supabase
          .from('portfolios')
          .select('balance, equity, margin_available, portfolio_type')
          .eq('id', portfolio_id)
          .single();

        if (getError) throw getError;
        
        // Only allow adding funds to demo portfolios for now
        if (current.portfolio_type !== 'demo') {
          throw new Error('Cannot add funds to real portfolios through this API');
        }

        const newBalance = Number(current.balance) + data.amount;
        const newEquity = Number(current.equity) + data.amount;
        const newMargin = Number(current.margin_available) + data.amount;

        const { data: portfolio, error } = await supabase
          .from('portfolios')
          .update({
            balance: newBalance,
            equity: newEquity,
            margin_available: newMargin,
          })
          .eq('id', portfolio_id)
          .select()
          .single();

        if (error) throw error;
        result = { portfolio };
        break;
      }

      case 'withdraw': {
        if (!portfolio_id || !data?.amount) {
          throw new Error('portfolio_id and amount are required');
        }

        const { data: current, error: getError } = await supabase
          .from('portfolios')
          .select('balance, equity, margin_available, margin_used, portfolio_type')
          .eq('id', portfolio_id)
          .single();

        if (getError) throw getError;
        
        if (current.portfolio_type !== 'demo') {
          throw new Error('Cannot withdraw from real portfolios through this API');
        }

        if (data.amount > Number(current.margin_available)) {
          throw new Error('Insufficient available margin for withdrawal');
        }

        const newBalance = Number(current.balance) - data.amount;
        const newEquity = Number(current.equity) - data.amount;
        const newMargin = Number(current.margin_available) - data.amount;

        const { data: portfolio, error } = await supabase
          .from('portfolios')
          .update({
            balance: newBalance,
            equity: newEquity,
            margin_available: newMargin,
          })
          .eq('id', portfolio_id)
          .select()
          .single();

        if (error) throw error;
        result = { portfolio };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Portfolio manager error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
