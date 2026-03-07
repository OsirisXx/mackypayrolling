-- COMPLETE FIX FOR FEB 6-12, 2026 PAYROLL
-- This script fixes Espina Aida's attendance and ensures bonuses are properly inserted

BEGIN;

-- ============================================================================
-- STEP 1: Fix Espina Aida - Change from 7 to 8 days
-- ============================================================================

DO $$
DECLARE
  admin_user_id UUID;
  espina_worker_id UUID;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id FROM public.users WHERE role = 'admin' LIMIT 1;
  
  -- Get Espina Aida's worker ID
  SELECT id INTO espina_worker_id FROM public.workers WHERE employee_id = 'EMP027';
  
  -- Delete existing attendance
  DELETE FROM public.attendance 
  WHERE worker_id = espina_worker_id
  AND clock_in >= '2026-02-06'::date 
  AND clock_in < '2026-02-13'::date;
  
  -- Insert 8 days (Feb 6-13)
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT 
    espina_worker_id,
    '2026-02-06'::date + i * interval '1 day',
    '2026-02-06'::date + i * interval '1 day' + interval '17 hours',
    8,
    0,
    'completed_quota',
    admin_user_id
  FROM generate_series(0, 7) i;
  
  RAISE NOTICE 'Fixed Espina Aida attendance to 8 days';
END $$;

-- ============================================================================
-- STEP 2: Clear and re-insert bonuses with correct date format
-- ============================================================================

-- Delete existing bonuses for Feb 6-12
DELETE FROM public.payroll_adjustments
WHERE period_start = '2026-02-06'::date 
AND period_end = '2026-02-12'::date;

-- Insert all bonuses and SSS deductions
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 560 FROM public.workers w WHERE w.employee_id = 'EMP001'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 100, 1060 FROM public.workers w WHERE w.employee_id = 'EMP002'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP011'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP012'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP014'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP015'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP016'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP017'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP018'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP019'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP020'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP021'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 100, 0 FROM public.workers w WHERE w.employee_id = 'EMP024'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP026'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 100, 0 FROM public.workers w WHERE w.employee_id = 'EMP027'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP029'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP034'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP035'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 100, 0 FROM public.workers w WHERE w.employee_id = 'EMP036'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP039'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP048'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP050'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 100, 0 FROM public.workers w WHERE w.employee_id = 'EMP054'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP058'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP061'
UNION ALL
SELECT w.id, '2026-02-06'::date, '2026-02-12'::date, 50, 0 FROM public.workers w WHERE w.employee_id = 'EMP062';

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check Espina Aida's attendance count
SELECT 
  'Espina Aida Attendance Check' as check_type,
  w.employee_id,
  w.full_name,
  COUNT(*) as days_count,
  CASE 
    WHEN COUNT(*) = 8 THEN '✓ CORRECT'
    ELSE '✗ WRONG - Should be 8'
  END as status
FROM public.attendance a
JOIN public.workers w ON w.id = a.worker_id
WHERE w.employee_id = 'EMP027'
AND a.clock_in >= '2026-02-06'::date 
AND a.clock_in < '2026-02-14'::date
GROUP BY w.employee_id, w.full_name;

-- Check bonus count
SELECT 
  'Bonus Count Check' as check_type,
  COUNT(*) as bonus_records,
  CASE 
    WHEN COUNT(*) = 26 THEN '✓ CORRECT - All 26 bonuses inserted'
    ELSE '✗ WRONG - Should be 26'
  END as status
FROM public.payroll_adjustments
WHERE period_start = '2026-02-06'::date 
AND period_end = '2026-02-12'::date;

-- Show sample bonuses
SELECT 
  'Sample Bonuses' as check_type,
  w.employee_id,
  w.full_name,
  pa.bonus,
  pa.sss_deduction
FROM public.payroll_adjustments pa
JOIN public.workers w ON w.id = pa.worker_id
WHERE pa.period_start = '2026-02-06'::date 
AND pa.period_end = '2026-02-12'::date
ORDER BY w.employee_id
LIMIT 5;
