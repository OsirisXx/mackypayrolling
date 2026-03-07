-- ============================================================================
-- COMPLETE CLEANUP - Remove ALL Macky Attendance System Tables
-- ============================================================================
-- WARNING: This will DROP ALL tables, functions, and triggers for the attendance system
-- Run this ONLY on the WRONG database where you accidentally ran the setup
-- ============================================================================

BEGIN;

-- Drop all tables with CASCADE (this removes all data, triggers, and constraints)
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.payroll CASCADE;
DROP TABLE IF EXISTS public.workers CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop the auth trigger if it exists
DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Verify cleanup - should return 0 for all
SELECT 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') as users_table,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workers') as workers_table,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attendance') as attendance_table,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payroll') as payroll_table,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'settings') as settings_table;

COMMIT;

-- ============================================================================
-- After running this cleanup on the WRONG database:
-- 1. Switch to the CORRECT Macky Attendance Supabase project
-- 2. Run FINAL-SETUP.sql
-- 3. Run add-standard-hours.sql
-- 4. Create admin/manager users in Supabase Auth
-- 5. Run test-data-commission-schedule.sql
-- ============================================================================
