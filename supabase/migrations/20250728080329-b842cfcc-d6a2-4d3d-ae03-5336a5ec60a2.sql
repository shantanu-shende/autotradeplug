-- Update the generate_hash_id function to use the new format: AAA-DDMMYY-RND
CREATE OR REPLACE FUNCTION public.generate_hash_id(first_name text)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  name_prefix TEXT;
  date_suffix TEXT;
  random_suffix TEXT;
  hash_id TEXT;
BEGIN
  -- Extract first 3 characters of first name and uppercase
  name_prefix := UPPER(LEFT(TRIM(first_name), 3));
  
  -- Pad if name is less than 3 characters
  WHILE LENGTH(name_prefix) < 3 LOOP
    name_prefix := name_prefix || 'X';
  END LOOP;
  
  -- Generate DDMMYY format date suffix
  date_suffix := TO_CHAR(NOW(), 'DDMMYY');
  
  -- Generate 4-digit random number
  random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Combine to create hash ID in format AAA-DDMMYY-RND
  hash_id := name_prefix || '-' || date_suffix || '-' || random_suffix;
  
  -- Check if hash_id already exists, if so regenerate random part
  WHILE EXISTS (SELECT 1 FROM public.demo_accounts WHERE demo_accounts.hash_id = hash_id) LOOP
    random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    hash_id := name_prefix || '-' || date_suffix || '-' || random_suffix;
  END LOOP;
  
  RETURN hash_id;
END;
$function$