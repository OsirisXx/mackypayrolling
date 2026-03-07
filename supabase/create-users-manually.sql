-- ============================================================================
-- Manually Create Users in public.users Table
-- ============================================================================
-- Run this if the auth trigger didn't automatically create users
-- First, get the user IDs from Supabase Auth Dashboard
-- ============================================================================

-- Check current users
SELECT id, email FROM auth.users WHERE email IN ('mackypayroll@admin.com', 'macky@manager.com');

-- If the above query shows users but public.users is empty, manually insert them:
-- Replace the UUIDs below with the actual IDs from the query above

INSERT INTO public.users (id, email, role, full_name)
SELECT 
  id,
  email,
  CASE 
    WHEN email = 'mackypayroll@admin.com' THEN 'admin'
    WHEN email = 'macky@manager.com' THEN 'manager'
  END as role,
  CASE 
    WHEN email = 'mackypayroll@admin.com' THEN 'Admin User'
    WHEN email = 'macky@manager.com' THEN 'Manager User'
  END as full_name
FROM auth.users 
WHERE email IN ('mackypayroll@admin.com', 'macky@manager.com')
ON CONFLICT (id) DO UPDATE 
SET 
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;

-- Verify users were created
SELECT id, email, role, full_name FROM public.users;
