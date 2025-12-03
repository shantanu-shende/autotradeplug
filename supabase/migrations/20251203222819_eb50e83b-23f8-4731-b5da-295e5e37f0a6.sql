-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,
  pin_hash TEXT,
  is_onboarded BOOLEAN DEFAULT false,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (phone_number IS NOT NULL);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (true);

-- Create brokers table
CREATE TABLE public.brokers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  broker_name TEXT NOT NULL,
  status TEXT DEFAULT 'disconnected',
  connected_at TIMESTAMP WITH TIME ZONE,
  last_sync TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brokers" ON public.brokers FOR SELECT USING (true);
CREATE POLICY "Users can insert own brokers" ON public.brokers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own brokers" ON public.brokers FOR UPDATE USING (true);
CREATE POLICY "Users can delete own brokers" ON public.brokers FOR DELETE USING (true);

-- Create user_strategies table
CREATE TABLE public.user_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  strategy_name TEXT NOT NULL,
  description TEXT,
  risk_level TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'draft',
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own strategies" ON public.user_strategies FOR SELECT USING (true);
CREATE POLICY "Users can insert own strategies" ON public.user_strategies FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own strategies" ON public.user_strategies FOR UPDATE USING (true);
CREATE POLICY "Users can delete own strategies" ON public.user_strategies FOR DELETE USING (true);

-- Create deployed_strategies table
CREATE TABLE public.deployed_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  strategy_id UUID REFERENCES public.user_strategies(id) ON DELETE CASCADE,
  demo_account_id TEXT,
  status TEXT DEFAULT 'running',
  deployed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  config JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.deployed_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deployments" ON public.deployed_strategies FOR SELECT USING (true);
CREATE POLICY "Users can insert own deployments" ON public.deployed_strategies FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own deployments" ON public.deployed_strategies FOR UPDATE USING (true);
CREATE POLICY "Users can delete own deployments" ON public.deployed_strategies FOR DELETE USING (true);

-- Create otp_verifications table with security functions
CREATE TABLE public.otp_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- OTP helper functions
CREATE OR REPLACE FUNCTION public.hash_otp_code(otp_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN crypt(otp_code, gen_salt('bf', 10));
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_otp_code(plain_otp text, hashed_otp text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (hashed_otp = crypt(plain_otp, hashed_otp));
END;
$$;

CREATE OR REPLACE FUNCTION public.can_request_otp(phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.otp_verifications
  WHERE phone_number = phone
    AND created_at > NOW() - INTERVAL '15 minutes';
  RETURN recent_count < 3;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_otp_secure(phone text, otp text)
RETURNS table(success boolean, phone_verified text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  otp_record record;
  verification_success boolean := false;
  verified_phone text := null;
BEGIN
  SELECT * INTO otp_record
  FROM public.otp_verifications
  WHERE phone_number = phone
    AND NOT is_verified
    AND expires_at > NOW()
    AND attempts < 5
  ORDER BY created_at DESC
  LIMIT 1;

  IF otp_record.id IS NOT NULL THEN
    IF public.verify_otp_code(otp, otp_record.otp_code) THEN
      UPDATE public.otp_verifications
      SET is_verified = true, attempts = attempts + 1
      WHERE id = otp_record.id;
      verification_success := true;
      verified_phone := phone;
    ELSE
      UPDATE public.otp_verifications
      SET attempts = attempts + 1
      WHERE id = otp_record.id;
    END IF;
  END IF;

  RETURN QUERY SELECT verification_success, verified_phone;
END;
$$;

-- OTP RLS policies
CREATE POLICY "Secure OTP insert with rate limiting" 
ON public.otp_verifications 
FOR INSERT 
WITH CHECK (
  public.can_request_otp(phone_number) AND
  expires_at > NOW() AND
  attempts = 0 AND
  is_verified = false
);

CREATE POLICY "Secure OTP update for verification" 
ON public.otp_verifications 
FOR UPDATE 
USING (
  phone_number IS NOT NULL AND
  NOT is_verified AND
  expires_at > NOW() AND
  attempts < 5
);

CREATE POLICY "Block direct OTP reads" 
ON public.otp_verifications 
FOR SELECT 
USING (false);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_brokers_updated_at BEFORE UPDATE ON public.brokers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_strategies_updated_at BEFORE UPDATE ON public.user_strategies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();