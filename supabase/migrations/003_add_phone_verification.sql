-- Add phone number and phone verification columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verification_code text,
ADD COLUMN IF NOT EXISTS phone_verification_expires_at timestamptz;

-- Add indexes for phone lookup and verification
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_verification_code ON public.profiles(phone_verification_code);

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.phone IS 'User phone number with country code (e.g., +1234567890)';
COMMENT ON COLUMN public.profiles.phone_verified IS 'Phone verification status - true if phone is verified';
COMMENT ON COLUMN public.profiles.phone_verification_code IS 'Verification code sent to phone (6 digits)';
COMMENT ON COLUMN public.profiles.phone_verification_expires_at IS 'Expiration timestamp for phone verification code';

