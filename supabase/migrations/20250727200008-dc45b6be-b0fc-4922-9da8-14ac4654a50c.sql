-- Create enum for account status
CREATE TYPE account_status AS ENUM ('active', 'inactive', 'dumped');

-- Create enum for trade types
CREATE TYPE trade_type AS ENUM ('buy', 'sell');

-- Create enum for trade status
CREATE TYPE trade_status AS ENUM ('pending', 'executed', 'cancelled');

-- Create demo_accounts table
CREATE TABLE public.demo_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  hash_id TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  initial_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  status account_status NOT NULL DEFAULT 'inactive',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create strategies table
CREATE TABLE public.strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  is_predefined BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deployed_strategies table
CREATE TABLE public.deployed_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  demo_account_id UUID NOT NULL REFERENCES public.demo_accounts(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES public.strategies(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  deployed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(demo_account_id, strategy_id)
);

-- Create trades table
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  demo_account_id UUID NOT NULL REFERENCES public.demo_accounts(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES public.strategies(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  trade_type trade_type NOT NULL,
  quantity DECIMAL(15,4) NOT NULL,
  entry_price DECIMAL(15,4),
  exit_price DECIMAL(15,4),
  pnl DECIMAL(15,2),
  status trade_status NOT NULL DEFAULT 'pending',
  entry_time TIMESTAMP WITH TIME ZONE,
  exit_time TIMESTAMP WITH TIME ZONE,
  signal_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create market_data table for storing live/mock market data
CREATE TABLE public.market_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  price DECIMAL(15,4) NOT NULL,
  volume BIGINT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_source TEXT DEFAULT 'mock'
);

-- Enable RLS on all tables
ALTER TABLE public.demo_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployed_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for demo_accounts
CREATE POLICY "Users can view their own demo accounts" 
ON public.demo_accounts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own demo accounts" 
ON public.demo_accounts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own demo accounts" 
ON public.demo_accounts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own demo accounts" 
ON public.demo_accounts FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for strategies
CREATE POLICY "Users can view strategies" 
ON public.strategies FOR SELECT 
USING (auth.uid() = user_id OR is_predefined = true);

CREATE POLICY "Users can create their own strategies" 
ON public.strategies FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategies" 
ON public.strategies FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for deployed_strategies
CREATE POLICY "Users can view their deployed strategies" 
ON public.deployed_strategies FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.demo_accounts da 
  WHERE da.id = demo_account_id AND da.user_id = auth.uid()
));

CREATE POLICY "Users can deploy strategies to their accounts" 
ON public.deployed_strategies FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.demo_accounts da 
  WHERE da.id = demo_account_id AND da.user_id = auth.uid()
));

CREATE POLICY "Users can update their deployed strategies" 
ON public.deployed_strategies FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.demo_accounts da 
  WHERE da.id = demo_account_id AND da.user_id = auth.uid()
));

-- RLS policies for trades
CREATE POLICY "Users can view their trades" 
ON public.trades FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.demo_accounts da 
  WHERE da.id = demo_account_id AND da.user_id = auth.uid()
));

CREATE POLICY "System can insert trades" 
ON public.trades FOR INSERT 
WITH CHECK (true);

-- RLS policies for market_data (read-only for all authenticated users)
CREATE POLICY "All users can view market data" 
ON public.market_data FOR SELECT 
TO authenticated 
USING (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_demo_accounts_updated_at
BEFORE UPDATE ON public.demo_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategies_updated_at
BEFORE UPDATE ON public.strategies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate hash ID
CREATE OR REPLACE FUNCTION public.generate_hash_id(first_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  name_prefix TEXT;
  date_suffix TEXT;
  hash_id TEXT;
BEGIN
  -- Extract first 3 characters of first name
  name_prefix := UPPER(LEFT(first_name, 3));
  
  -- Generate 6-digit date suffix (DDMMYY format)
  date_suffix := TO_CHAR(NOW(), 'DDMMYY');
  
  -- Combine to create hash ID
  hash_id := name_prefix || date_suffix;
  
  -- Check if hash_id already exists, if so add random number
  WHILE EXISTS (SELECT 1 FROM public.demo_accounts WHERE hash_id = hash_id) LOOP
    hash_id := name_prefix || date_suffix || LPAD(FLOOR(RANDOM() * 100)::TEXT, 2, '0');
  END LOOP;
  
  RETURN hash_id;
END;
$$;

-- Insert some predefined strategies
INSERT INTO public.strategies (name, description, config, is_predefined) VALUES
('Moving Average Crossover', 'Simple moving average crossover strategy', '{"short_ma": 10, "long_ma": 20, "symbol": "NIFTY"}', true),
('RSI Mean Reversion', 'RSI-based mean reversion strategy', '{"rsi_period": 14, "oversold": 30, "overbought": 70}', true),
('Breakout Strategy', 'Price breakout strategy with volume confirmation', '{"lookback_period": 20, "volume_multiplier": 1.5}', true),
('Bollinger Band Squeeze', 'Trading Bollinger Band squeeze setups', '{"period": 20, "std_dev": 2, "squeeze_threshold": 0.1}', true);

-- Insert sample market data
INSERT INTO public.market_data (symbol, price, volume) VALUES
('NIFTY', 19500.50, 1000000),
('BANKNIFTY', 45200.25, 800000),
('RELIANCE', 2450.75, 500000),
('TCS', 3680.50, 300000),
('HDFC', 1680.25, 400000);