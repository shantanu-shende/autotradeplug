-- Create strategy_type enum
CREATE TYPE public.strategy_type AS ENUM ('arbitrage', 'scalping', 'grid', 'trend_following');

-- Create bot_status enum
CREATE TYPE public.bot_status AS ENUM ('running', 'paused', 'stopped', 'error');

-- Create portfolio_type enum
CREATE TYPE public.portfolio_type AS ENUM ('real', 'demo');

-- Create position_side enum
CREATE TYPE public.position_side AS ENUM ('buy', 'sell');

-- Create order_type enum
CREATE TYPE public.order_type AS ENUM ('market', 'limit', 'stop', 'stop_limit');

-- Create order_status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'filled', 'partially_filled', 'cancelled', 'rejected');

-- Trading Bots table
CREATE TABLE public.trading_bots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  bot_name TEXT NOT NULL,
  strategy_type public.strategy_type NOT NULL DEFAULT 'trend_following',
  status public.bot_status NOT NULL DEFAULT 'stopped',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Portfolios table
CREATE TABLE public.portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  portfolio_name TEXT NOT NULL,
  portfolio_type public.portfolio_type NOT NULL DEFAULT 'demo',
  broker_connection_id UUID REFERENCES public.brokers(id) ON DELETE SET NULL,
  balance NUMERIC NOT NULL DEFAULT 10000,
  equity NUMERIC NOT NULL DEFAULT 10000,
  margin_used NUMERIC NOT NULL DEFAULT 0,
  margin_available NUMERIC NOT NULL DEFAULT 10000,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Positions table
CREATE TABLE public.positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  side public.position_side NOT NULL,
  volume NUMERIC NOT NULL,
  entry_price NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  stop_loss NUMERIC,
  take_profit NUMERIC,
  profit_loss NUMERIC NOT NULL DEFAULT 0,
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  bot_id UUID REFERENCES public.trading_bots(id) ON DELETE SET NULL,
  symbol TEXT NOT NULL,
  order_type public.order_type NOT NULL DEFAULT 'market',
  side public.position_side NOT NULL,
  volume NUMERIC NOT NULL,
  price NUMERIC,
  status public.order_status NOT NULL DEFAULT 'pending',
  filled_price NUMERIC,
  filled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Arbitrage Signals table
CREATE TABLE public.arbitrage_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  symbol_pair TEXT NOT NULL,
  source_a TEXT NOT NULL,
  source_b TEXT NOT NULL,
  price_a NUMERIC NOT NULL,
  price_b NUMERIC NOT NULL,
  spread_pips NUMERIC NOT NULL,
  potential_profit NUMERIC NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  executed BOOLEAN NOT NULL DEFAULT false,
  execution_result JSONB
);

-- Bot Execution Logs table
CREATE TABLE public.bot_execution_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES public.trading_bots(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.trading_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arbitrage_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_execution_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trading_bots
CREATE POLICY "Users can view own bots" ON public.trading_bots FOR SELECT USING ((auth.uid())::text = user_id);
CREATE POLICY "Users can insert own bots" ON public.trading_bots FOR INSERT WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY "Users can update own bots" ON public.trading_bots FOR UPDATE USING ((auth.uid())::text = user_id);
CREATE POLICY "Users can delete own bots" ON public.trading_bots FOR DELETE USING ((auth.uid())::text = user_id);

-- RLS Policies for portfolios
CREATE POLICY "Users can view own portfolios" ON public.portfolios FOR SELECT USING ((auth.uid())::text = user_id);
CREATE POLICY "Users can insert own portfolios" ON public.portfolios FOR INSERT WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY "Users can update own portfolios" ON public.portfolios FOR UPDATE USING ((auth.uid())::text = user_id);
CREATE POLICY "Users can delete own portfolios" ON public.portfolios FOR DELETE USING ((auth.uid())::text = user_id);

-- RLS Policies for positions
CREATE POLICY "Users can view own positions" ON public.positions FOR SELECT USING ((auth.uid())::text = user_id);
CREATE POLICY "Users can insert own positions" ON public.positions FOR INSERT WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY "Users can update own positions" ON public.positions FOR UPDATE USING ((auth.uid())::text = user_id);
CREATE POLICY "Users can delete own positions" ON public.positions FOR DELETE USING ((auth.uid())::text = user_id);

-- RLS Policies for orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING ((auth.uid())::text = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE USING ((auth.uid())::text = user_id);
CREATE POLICY "Users can delete own orders" ON public.orders FOR DELETE USING ((auth.uid())::text = user_id);

-- RLS Policies for arbitrage_signals
CREATE POLICY "Users can view own signals" ON public.arbitrage_signals FOR SELECT USING ((auth.uid())::text = user_id);
CREATE POLICY "Users can insert own signals" ON public.arbitrage_signals FOR INSERT WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY "Users can update own signals" ON public.arbitrage_signals FOR UPDATE USING ((auth.uid())::text = user_id);
CREATE POLICY "Users can delete own signals" ON public.arbitrage_signals FOR DELETE USING ((auth.uid())::text = user_id);

-- RLS Policies for bot_execution_logs
CREATE POLICY "Users can view own logs" ON public.bot_execution_logs FOR SELECT USING ((auth.uid())::text = user_id);
CREATE POLICY "Users can insert own logs" ON public.bot_execution_logs FOR INSERT WITH CHECK ((auth.uid())::text = user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_trading_bots_updated_at BEFORE UPDATE ON public.trading_bots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON public.portfolios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.trading_bots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolios;
ALTER PUBLICATION supabase_realtime ADD TABLE public.positions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;