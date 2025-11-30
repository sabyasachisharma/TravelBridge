-- Add email verification columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_token text;

-- Add index for verification token lookup
CREATE INDEX IF NOT EXISTS idx_profiles_verification_token ON public.profiles(verification_token);

-- Comment for documentation
COMMENT ON COLUMN public.profiles.user_verified IS 'Email verification status - true if email is verified, false otherwise';
COMMENT ON COLUMN public.profiles.verification_token IS 'Token used for email verification link';

