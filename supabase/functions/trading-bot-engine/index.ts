import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BotRequest {
  action: 'create' | 'list' | 'get' | 'update' | 'delete' | 'start' | 'stop' | 'pause' | 'execute_order' | 'get_logs';
  bot_id?: string;
  data?: {
    bot_name?: string;
    strategy_type?: 'arbitrage' | 'scalping' | 'grid' | 'trend_following';
    config?: Record<string, unknown>;
    // Order execution data
    portfolio_id?: string;
    symbol?: string;
    side?: 'buy' | 'sell';
    volume?: number;
    order_type?: 'market' | 'limit' | 'stop' | 'stop_limit';
    price?: number;
    stop_loss?: number;
    take_profit?: number;
  };
}

interface BotConfig {
  max_positions?: number;
  max_drawdown_percent?: number;
  daily_loss_limit?: number;
  position_size_percent?: number;
  instruments?: string[];
  take_profit_pips?: number;
  stop_loss_pips?: number;
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

    const body: BotRequest = await req.json();
    const { action, bot_id, data } = body;

    let result;

    switch (action) {
      case 'create': {
        if (!data?.bot_name) {
          throw new Error('bot_name is required');
        }

        const defaultConfig: BotConfig = {
          max_positions: 5,
          max_drawdown_percent: 10,
          daily_loss_limit: 500,
          position_size_percent: 2,
          instruments: ['EURUSD', 'GBPUSD', 'USDJPY'],
          take_profit_pips: 20,
          stop_loss_pips: 10,
        };

        const { data: bot, error } = await supabase
          .from('trading_bots')
          .insert({
            user_id: user.id,
            bot_name: data.bot_name,
            strategy_type: data.strategy_type || 'trend_following',
            status: 'stopped',
            config: { ...defaultConfig, ...data.config },
          })
          .select()
          .single();

        if (error) throw error;

        // Log bot creation
        await supabase.from('bot_execution_logs').insert({
          bot_id: bot.id,
          user_id: user.id,
          action: 'created',
          details: { bot_name: data.bot_name, strategy_type: data.strategy_type },
        });

        result = { bot };
        break;
      }

      case 'list': {
        const { data: bots, error } = await supabase
          .from('trading_bots')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        result = { bots };
        break;
      }

      case 'get': {
        if (!bot_id) throw new Error('bot_id is required');
        
        const { data: bot, error } = await supabase
          .from('trading_bots')
          .select('*')
          .eq('id', bot_id)
          .single();

        if (error) throw error;

        // Get recent logs
        const { data: logs, error: logError } = await supabase
          .from('bot_execution_logs')
          .select('*')
          .eq('bot_id', bot_id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (logError) throw logError;

        result = { bot, logs };
        break;
      }

      case 'update': {
        if (!bot_id) throw new Error('bot_id is required');
        
        const updateData: Record<string, unknown> = {};
        if (data?.bot_name) updateData.bot_name = data.bot_name;
        if (data?.strategy_type) updateData.strategy_type = data.strategy_type;
        if (data?.config) updateData.config = data.config;

        const { data: bot, error } = await supabase
          .from('trading_bots')
          .update(updateData)
          .eq('id', bot_id)
          .select()
          .single();

        if (error) throw error;

        await supabase.from('bot_execution_logs').insert({
          bot_id: bot_id,
          user_id: user.id,
          action: 'updated',
          details: updateData,
        });

        result = { bot };
        break;
      }

      case 'delete': {
        if (!bot_id) throw new Error('bot_id is required');
        
        const { error } = await supabase
          .from('trading_bots')
          .delete()
          .eq('id', bot_id);

        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'start': {
        if (!bot_id) throw new Error('bot_id is required');
        
        const { data: bot, error } = await supabase
          .from('trading_bots')
          .update({ status: 'running' })
          .eq('id', bot_id)
          .select()
          .single();

        if (error) throw error;

        await supabase.from('bot_execution_logs').insert({
          bot_id: bot_id,
          user_id: user.id,
          action: 'started',
          details: { started_at: new Date().toISOString() },
        });

        result = { bot, message: 'Bot started successfully' };
        break;
      }

      case 'stop': {
        if (!bot_id) throw new Error('bot_id is required');
        
        const { data: bot, error } = await supabase
          .from('trading_bots')
          .update({ status: 'stopped' })
          .eq('id', bot_id)
          .select()
          .single();

        if (error) throw error;

        await supabase.from('bot_execution_logs').insert({
          bot_id: bot_id,
          user_id: user.id,
          action: 'stopped',
          details: { stopped_at: new Date().toISOString() },
        });

        result = { bot, message: 'Bot stopped successfully' };
        break;
      }

      case 'pause': {
        if (!bot_id) throw new Error('bot_id is required');
        
        const { data: bot, error } = await supabase
          .from('trading_bots')
          .update({ status: 'paused' })
          .eq('id', bot_id)
          .select()
          .single();

        if (error) throw error;

        await supabase.from('bot_execution_logs').insert({
          bot_id: bot_id,
          user_id: user.id,
          action: 'paused',
          details: { paused_at: new Date().toISOString() },
        });

        result = { bot, message: 'Bot paused successfully' };
        break;
      }

      case 'execute_order': {
        if (!data?.portfolio_id || !data?.symbol || !data?.side || !data?.volume) {
          throw new Error('portfolio_id, symbol, side, and volume are required');
        }

        // OPTIMIZATION: Parallelize fetching non-dependent data
        // Fetch portfolio and check existing positions in parallel
        const [portfolioResponse, existingPositionsResponse] = await Promise.all([
          supabase
            .from('portfolios')
            .select('*')
            .eq('id', data.portfolio_id)
            .single(),
          supabase
            .from('positions')
            .select('*')
            .eq('portfolio_id', data.portfolio_id)
            .eq('symbol', data.symbol)
            .limit(1)
        ]);

        const { data: portfolio, error: portError } = portfolioResponse;
        if (portError) throw portError;

        // For demo portfolios, simulate order execution
        const executedPrice = data.price || Math.random() * 100 + 1; // Simulated price

        // OPTIMIZATION: Create order and position in parallel (independent writes)
        const [orderResponse, positionResponse] = await Promise.all([
          supabase
            .from('orders')
            .insert({
              portfolio_id: data.portfolio_id,
              user_id: user.id,
              bot_id: bot_id || null,
              symbol: data.symbol,
              order_type: data.order_type || 'market',
              side: data.side,
              volume: data.volume,
              price: data.price,
              status: 'filled',
              filled_price: executedPrice,
              filled_at: new Date().toISOString(),
            })
            .select()
            .single(),
          supabase
            .from('positions')
            .insert({
              portfolio_id: data.portfolio_id,
              user_id: user.id,
              symbol: data.symbol,
              side: data.side,
              volume: data.volume,
              entry_price: executedPrice,
              current_price: executedPrice,
              stop_loss: data.stop_loss,
              take_profit: data.take_profit,
              profit_loss: 0,
            })
            .select()
            .single()
        ]);

        const { data: order, error: orderError } = orderResponse;
        const { data: position, error: posError } = positionResponse;

        if (orderError) throw orderError;
        if (posError) throw posError;

        // Calculate margin and update portfolio
        const marginRequired = executedPrice * data.volume * 0.01; // 1% margin
        const { error: updateError } = await supabase
          .from('portfolios')
          .update({
            margin_used: Number(portfolio.margin_used || 0) + marginRequired,
            margin_available: Number(portfolio.margin_available) - marginRequired,
          })
          .eq('id', data.portfolio_id);

        if (updateError) throw updateError;

        // OPTIMIZATION: Log execution without blocking response (fire and forget with error handling)
        if (bot_id) {
          supabase.from('bot_execution_logs').insert({
            bot_id: bot_id,
            user_id: user.id,
            action: 'order_executed',
            details: { 
              order_id: order.id, 
              position_id: position.id, 
              symbol: data.symbol, 
              side: data.side, 
              volume: data.volume, 
              price: executedPrice 
            },
          }).then(({ error }) => {
            if (error) console.error('Failed to log execution:', error);
          });
        }

        result = { order, position, message: 'Order executed successfully' };
        break;
      }

      case 'get_logs': {
        if (!bot_id) throw new Error('bot_id is required');
        
        const { data: logs, error } = await supabase
          .from('bot_execution_logs')
          .select('*')
          .eq('bot_id', bot_id)
          .order('created_at', { ascending: false })
          .limit(200);

        if (error) throw error;
        result = { logs };
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
    console.error('Trading bot engine error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
