-- ⚠️  WARNING: This will delete ALL users from the database!
-- ⚠️  Use this ONLY for development/testing
-- ⚠️  DO NOT run this in production!

-- 1. Delete all profiles first
DELETE FROM public.profiles;

-- 2. Delete all auth users (this will cascade delete profiles if they exist)
-- Note: You need to use Supabase Dashboard or Service Role API for this
-- SQL alone cannot delete from auth.users table

-- Alternative: Use Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Select all users
-- 3. Click "Delete users"

-- Or run this in your Next.js app with service role key:
-- See scripts/delete-auth-users.ts

