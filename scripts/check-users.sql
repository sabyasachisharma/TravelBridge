-- Check users in BOTH tables

-- 1. Check auth.users (Authentication table)
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Check public.profiles (Your custom table)
SELECT 
  id,
  name,
  user_verified,
  verification_token,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

-- 3. Find users in auth.users but NOT in profiles (orphaned users)
SELECT 
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

