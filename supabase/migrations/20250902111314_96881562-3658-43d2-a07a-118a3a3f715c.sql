-- Fix critical OTP security vulnerabilities

-- First, drop the existing insecure policies
DROP POLICY IF EXISTS "Users can insert OTP requests" ON public.otp_verifications;
DROP POLICY IF EXISTS "Users can update their OTP verification" ON public.otp_verifications;

-- Add a function to hash OTP codes
CREATE OR REPLACE FUNCTION public.hash_otp_code(otp_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use bcrypt with salt rounds of 10 for OTP hashing
  RETURN crypt(otp_code, gen_salt('bf', 10));
END;
$$;

-- Add a function to verify OTP codes
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

-- Add rate limiting function for OTP requests
CREATE OR REPLACE FUNCTION public.can_request_otp(phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  -- Allow max 3 OTP requests per phone number in last 15 minutes
  SELECT COUNT(*) INTO recent_count
  FROM public.otp_verifications
  WHERE phone_number = phone
    AND created_at > NOW() - INTERVAL '15 minutes';
  
  RETURN recent_count < 3;
END;
$$;

-- Create secure RLS policies for OTP verification
-- Policy 1: Allow inserting OTP requests with rate limiting (no authentication required for initial OTP request)
CREATE POLICY "Allow OTP requests with rate limiting" 
ON public.otp_verifications 
FOR INSERT 
WITH CHECK (
  public.can_request_otp(phone_number) AND
  expires_at > NOW() AND
  attempts = 0 AND
  is_verified = false
);

-- Policy 2: Allow updating OTP verification status only for the same phone number and only to verify
CREATE POLICY "Allow OTP verification updates" 
ON public.otp_verifications 
FOR UPDATE 
USING (
  phone_number IS NOT NULL AND
  NOT is_verified AND
  expires_at > NOW() AND
  attempts < 5
)
WITH CHECK (
  phone_number = OLD.phone_number AND
  (is_verified = true OR attempts = OLD.attempts + 1) AND
  expires_at = OLD.expires_at AND
  otp_code = OLD.otp_code
);

-- Policy 3: Allow reading OTP records only for verification purposes (no direct SELECT access)
-- This policy is intentionally restrictive - OTP verification should happen via functions
CREATE POLICY "Restrict OTP reads" 
ON public.otp_verifications 
FOR SELECT 
USING (false);

-- Add cleanup function for expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.otp_verifications
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$;

-- Create a secure function for OTP verification
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
  -- Find the most recent unverified OTP for this phone
  SELECT * INTO otp_record
  FROM public.otp_verifications
  WHERE phone_number = phone
    AND NOT is_verified
    AND expires_at > NOW()
    AND attempts < 5
  ORDER BY created_at DESC
  LIMIT 1;

  IF otp_record.id IS NOT NULL THEN
    -- Check if OTP matches
    IF public.verify_otp_code(otp, otp_record.otp_code) THEN
      -- Mark as verified
      UPDATE public.otp_verifications
      SET is_verified = true,
          attempts = attempts + 1
      WHERE id = otp_record.id;
      
      verification_success := true;
      verified_phone := phone;
    ELSE
      -- Increment attempts
      UPDATE public.otp_verifications
      SET attempts = attempts + 1
      WHERE id = otp_record.id;
    END IF;
  END IF;

  RETURN QUERY SELECT verification_success, verified_phone;
END;
$$;