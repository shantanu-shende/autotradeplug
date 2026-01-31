import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArbitrageRequest {
  action: 'scan' | 'list_signals' | 'execute' | 'get_spreads';
  signal_id?: string;
  data?: {
    symbols?: string[];
    min_spread_pips?: number;
    portfolio_id?: string;
    volume?: number;
  };
}

interface PriceSource {
  name: string;
  price: number;
  timestamp: number;
}

// Simulated multi-source price feeds for arbitrage detection
function getSimulatedPrices(symbol: string): PriceSource[] {
  const basePrice = {
    'EURUSD': 1.0850,
    'GBPUSD': 1.2650,
    'USDJPY': 149.50,
    'XAUUSD': 2035.50,
  }[symbol] || 1.0000;

  // Simulate slight price differences across sources
  return [
    { name: 'Source_A', price: basePrice + (Math.random() - 0.5) * 0.001, timestamp: Date.now() },
    { name: 'Source_B', price: basePrice + (Math.random() - 0.5) * 0.001, timestamp: Date.now() },
    { name: 'Source_C', price: basePrice + (Math.random() - 0.5) * 0.001, timestamp: Date.now() },
  ];
}

function calculateSpreadPips(price1: number, price2: number, symbol: string): number {
  const pipMultiplier = symbol.includes('JPY') ? 100 : 10000;
  return Math.abs(price1 - price2) * pipMultiplier;
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

    const body: ArbitrageRequest = await req.json();
    const { action, signal_id, data } = body;

    let result;

    switch (action) {
      case 'scan': {
        const symbols = data?.symbols || ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD'];
        const minSpread = data?.min_spread_pips || 0.5;

        // OPTIMIZATION: Fetch all symbol prices in parallel
        const allPricesBySymbol = await Promise.all(
          symbols.map(async (symbol) => ({
            symbol,
            prices: getSimulatedPrices(symbol),
          }))
        );

        // OPTIMIZATION: Process all symbol opportunities in parallel
        const opportunitiesPerSymbol = await Promise.all(
          allPricesBySymbol.map(async ({ symbol, prices }) => {
            const symbolOpportunities: unknown[] = [];

            // Compare all price source combinations for this symbol
            for (let i = 0; i < prices.length; i++) {
              for (let j = i + 1; j < prices.length; j++) {
                const spread = calculateSpreadPips(prices[i].price, prices[j].price, symbol);

                if (spread >= minSpread) {
                  const buySource = prices[i].price < prices[j].price ? prices[i] : prices[j];
                  const sellSource = prices[i].price < prices[j].price ? prices[j] : prices[i];

                  const potentialProfit = (sellSource.price - buySource.price) * 100000; // Per standard lot

                  // Store signal
                  const { data: signal, error } = await supabase
                    .from('arbitrage_signals')
                    .insert({
                      user_id: user.id,
                      symbol_pair: symbol,
                      source_a: buySource.name,
                      source_b: sellSource.name,
                      price_a: buySource.price,
                      price_b: sellSource.price,
                      spread_pips: spread,
                      potential_profit: potentialProfit,
                      executed: false,
                    })
                    .select()
                    .single();

                  if (!error) {
                    symbolOpportunities.push({
                      ...signal,
                      action_recommendation: `Buy at ${buySource.name} (${buySource.price.toFixed(5)}), Sell at ${sellSource.name} (${sellSource.price.toFixed(5)})`,
                    });
                  }
                }
              }
            }

            return symbolOpportunities;
          })
        );

        // Flatten all opportunities
        const opportunities = opportunitiesPerSymbol.flat();

        result = {
          opportunities,
          scanned_symbols: symbols.length,
          signals_found: opportunities.length,
          scan_timestamp: new Date().toISOString(),
        };
        break;
      }

      case 'list_signals': {
        const { data: signals, error } = await supabase
          .from('arbitrage_signals')
          .select('*')
          .order('detected_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        result = { signals };
        break;
      }

      case 'get_spreads': {
        const symbols = data?.symbols || ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD'];

        // OPTIMIZATION: Fetch all spreads in parallel
        const spreadEntries = await Promise.all(
          symbols.map(async (symbol) => {
            const prices = getSimulatedPrices(symbol);
            const allPrices = prices.map(p => p.price);

            return [
              symbol,
              {
                sources: prices,
                max_spread: calculateSpreadPips(Math.max(...allPrices), Math.min(...allPrices), symbol),
                min_spread: 0,
              },
            ] as const;
          })
        );

        const spreads = Object.fromEntries(spreadEntries);
        result = { spreads, timestamp: new Date().toISOString() };
        break;
      }

      case 'execute': {
        if (!signal_id || !data?.portfolio_id || !data?.volume) {
          throw new Error('signal_id, portfolio_id, and volume are required');
        }

        // Get the signal
        const { data: signal, error: sigError } = await supabase
          .from('arbitrage_signals')
          .select('*')
          .eq('id', signal_id)
          .single();

        if (sigError) throw sigError;
        if (signal.executed) throw new Error('Signal already executed');

        // Execute arbitrage (simulated)
        const executionResult = {
          buy_order: {
            source: signal.source_a,
            price: signal.price_a,
            volume: data.volume,
            executed_at: new Date().toISOString(),
          },
          sell_order: {
            source: signal.source_b,
            price: signal.price_b,
            volume: data.volume,
            executed_at: new Date().toISOString(),
          },
          profit: (signal.price_b - signal.price_a) * data.volume * 100000,
          latency_ms: Math.random() * 50 + 10,
        };

        // Update signal as executed
        const { error: updateError } = await supabase
          .from('arbitrage_signals')
          .update({
            executed: true,
            execution_result: executionResult,
          })
          .eq('id', signal_id);

        if (updateError) throw updateError;

        result = { 
          success: true, 
          execution: executionResult,
          message: `Arbitrage executed: Profit ${executionResult.profit.toFixed(2)} USD`,
        };
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
    console.error('Arbitrage detector error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
