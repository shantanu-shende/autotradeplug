-- Fix critical OTP security vulnerabilities (final version)

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Allow OTP requests with rate limiting" ON public.otp_verifications;
DROP POLICY IF EXISTS "Users can insert OTP requests" ON public.otp_verifications;
DROP POLICY IF EXISTS "Users can update their OTP verification" ON public.otp_verifications;
DROP POLICY IF EXISTS "Allow OTP verification updates" ON public.otp_verifications;
DROP POLICY IF EXISTS "Restrict OTP reads" ON public.otp_verifications;

-- Add helper functions for OTP security
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

-- Secure OTP verification function
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
      SET is_verified = true,
          attempts = attempts + 1
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

-- Create new secure RLS policies
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