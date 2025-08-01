-- Create brokers table for tracking connected trading platforms
CREATE TABLE public.brokers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  broker_name TEXT NOT NULL CHECK (broker_name IN ('groww', 'zerodha', 'angelone', '5paisa', 'mstocks', 'dhan', 'upstox')),
  token TEXT,
  refresh_token TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'expired')),
  connected_at TIMESTAMP WITH TIME ZONE,
  last_sync TIMESTAMP WITH TIME ZONE,
  broker_user_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;

-- Create policies for brokers
CREATE POLICY "Users can view their own brokers" 
ON public.brokers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own brokers" 
ON public.brokers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brokers" 
ON public.brokers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brokers" 
ON public.brokers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create strategies table for user trading strategies  
CREATE TABLE public.user_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  strategy_name TEXT NOT NULL,
  description TEXT,
  strategy_type TEXT NOT NULL DEFAULT 'custom' CHECK (strategy_type IN ('custom', 'template', 'imported')),
  config JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'stopped')),
  risk_level TEXT NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for user_strategies
ALTER TABLE public.user_strategies ENABLE ROW LEVEL SECURITY;

-- Create policies for user_strategies
CREATE POLICY "Users can view their own strategies" 
ON public.user_strategies 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own strategies" 
ON public.user_strategies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategies" 
ON public.user_strategies 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strategies" 
ON public.user_strategies 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create strategy_runs table for tracking strategy executions
CREATE TABLE public.strategy_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id UUID NOT NULL REFERENCES public.user_strategies(id) ON DELETE CASCADE,
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  run_type TEXT NOT NULL DEFAULT 'live' CHECK (run_type IN ('live', 'backtest', 'paper')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'stopped')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  stopped_at TIMESTAMP WITH TIME ZONE,
  total_pnl NUMERIC DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for strategy_runs
ALTER TABLE public.strategy_runs ENABLE ROW LEVEL SECURITY;

-- Create policies for strategy_runs
CREATE POLICY "Users can view their strategy runs" 
ON public.strategy_runs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_strategies us 
  WHERE us.id = strategy_runs.strategy_id AND us.user_id = auth.uid()
));

CREATE POLICY "Users can create strategy runs for their strategies" 
ON public.strategy_runs 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_strategies us 
  WHERE us.id = strategy_runs.strategy_id AND us.user_id = auth.uid()
));

CREATE POLICY "Users can update their strategy runs" 
ON public.strategy_runs 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.user_strategies us 
  WHERE us.id = strategy_runs.strategy_id AND us.user_id = auth.uid()
));

-- Create orders table for tracking individual trades
CREATE TABLE public.strategy_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_run_id UUID NOT NULL REFERENCES public.strategy_runs(id) ON DELETE CASCADE,
  broker_order_id TEXT,
  order_type TEXT NOT NULL CHECK (order_type IN ('buy', 'sell')),
  symbol TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC,
  executed_price NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'cancelled', 'failed', 'partial')),
  order_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  executed_at TIMESTAMP WITH TIME ZONE,
  pnl NUMERIC DEFAULT 0,
  fees NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for strategy_orders
ALTER TABLE public.strategy_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for strategy_orders
CREATE POLICY "Users can view their strategy orders" 
ON public.strategy_orders 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.strategy_runs sr
  JOIN public.user_strategies us ON sr.strategy_id = us.id
  WHERE sr.id = strategy_orders.strategy_run_id AND us.user_id = auth.uid()
));

CREATE POLICY "System can insert strategy orders" 
ON public.strategy_orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update strategy orders" 
ON public.strategy_orders 
FOR UPDATE 
USING (true);

-- Create trade_logs table for detailed execution logs
CREATE TABLE public.trade_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_run_id UUID NOT NULL REFERENCES public.strategy_runs(id) ON DELETE CASCADE,
  log_level TEXT NOT NULL DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warning', 'error')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for trade_logs
ALTER TABLE public.trade_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for trade_logs
CREATE POLICY "Users can view their trade logs" 
ON public.trade_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.strategy_runs sr
  JOIN public.user_strategies us ON sr.strategy_id = us.id
  WHERE sr.id = trade_logs.strategy_run_id AND us.user_id = auth.uid()
));

CREATE POLICY "System can insert trade logs" 
ON public.trade_logs 
FOR INSERT 
WITH CHECK (true);

-- Add triggers for updated_at columns
CREATE TRIGGER update_brokers_updated_at
BEFORE UPDATE ON public.brokers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_strategies_updated_at
BEFORE UPDATE ON public.user_strategies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_brokers_user_id ON public.brokers(user_id);
CREATE INDEX idx_brokers_status ON public.brokers(status);
CREATE INDEX idx_user_strategies_user_id ON public.user_strategies(user_id);
CREATE INDEX idx_user_strategies_status ON public.user_strategies(status);
CREATE INDEX idx_strategy_runs_strategy_id ON public.strategy_runs(strategy_id);
CREATE INDEX idx_strategy_runs_status ON public.strategy_runs(status);
CREATE INDEX idx_strategy_orders_strategy_run_id ON public.strategy_orders(strategy_run_id);
CREATE INDEX idx_strategy_orders_status ON public.strategy_orders(status);
CREATE INDEX idx_trade_logs_strategy_run_id ON public.trade_logs(strategy_run_id);
CREATE INDEX idx_trade_logs_timestamp ON public.trade_logs(timestamp);