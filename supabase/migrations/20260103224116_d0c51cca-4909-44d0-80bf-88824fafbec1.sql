-- Fix RLS policies on user_strategies, brokers, deployed_strategies, and profiles
-- These tables use user_id as TEXT (matching auth.uid()::text)

-- Fix user_strategies RLS policies
DROP POLICY IF EXISTS "Users can view own strategies" ON public.user_strategies;
DROP POLICY IF EXISTS "Users can insert own strategies" ON public.user_strategies;
DROP POLICY IF EXISTS "Users can update own strategies" ON public.user_strategies;
DROP POLICY IF EXISTS "Users can delete own strategies" ON public.user_strategies;

CREATE POLICY "Users can view own strategies" ON public.user_strategies 
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own strategies" ON public.user_strategies 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own strategies" ON public.user_strategies 
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own strategies" ON public.user_strategies 
  FOR DELETE USING (auth.uid()::text = user_id);

-- Fix brokers RLS policies
DROP POLICY IF EXISTS "Users can view own brokers" ON public.brokers;
DROP POLICY IF EXISTS "Users can insert own brokers" ON public.brokers;
DROP POLICY IF EXISTS "Users can update own brokers" ON public.brokers;
DROP POLICY IF EXISTS "Users can delete own brokers" ON public.brokers;

CREATE POLICY "Users can view own brokers" ON public.brokers 
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own brokers" ON public.brokers 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own brokers" ON public.brokers 
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own brokers" ON public.brokers 
  FOR DELETE USING (auth.uid()::text = user_id);

-- Fix deployed_strategies RLS policies
DROP POLICY IF EXISTS "Users can view own deployments" ON public.deployed_strategies;
DROP POLICY IF EXISTS "Users can insert own deployments" ON public.deployed_strategies;
DROP POLICY IF EXISTS "Users can update own deployments" ON public.deployed_strategies;
DROP POLICY IF EXISTS "Users can delete own deployments" ON public.deployed_strategies;

CREATE POLICY "Users can view own deployments" ON public.deployed_strategies 
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own deployments" ON public.deployed_strategies 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own deployments" ON public.deployed_strategies 
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own deployments" ON public.deployed_strategies 
  FOR DELETE USING (auth.uid()::text = user_id);

-- Fix profiles RLS policies (id is UUID matching auth.uid())
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);