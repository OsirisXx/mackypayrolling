-- IMPORT FEB 13-19 DATA
-- Period: Feb 13-19, 2026 (Thursday to Wednesday)
-- Total: ₱172,875.00

BEGIN;

-- ============================================================================
-- STEP 1: Insert attendance records for all workers
-- ============================================================================

DO $$
DECLARE
  admin_user_id UUID;
  worker_record RECORD;
  attendance_date DATE;
  day_count INT;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id FROM public.users WHERE role = 'admin' LIMIT 1;
  
  -- Bacol, Vivian: 7 days, 21 OT hours
  SELECT id INTO worker_record FROM public.workers WHERE full_name ILIKE '%Bacol%Vivian%' LIMIT 1;
  IF worker_record.id IS NOT NULL THEN
    DELETE FROM public.attendance WHERE worker_id = worker_record.id AND clock_in >= '2026-02-13' AND clock_in < '2026-02-20';
    FOR day_count IN 0..6 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_record.id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 3, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Ylagan Robert: 7 days, 15 OT hours
  SELECT id INTO worker_record FROM public.workers WHERE full_name ILIKE '%Ylagan%Robert%' LIMIT 1;
  IF worker_record.id IS NOT NULL THEN
    DELETE FROM public.attendance WHERE worker_id = worker_record.id AND clock_in >= '2026-02-13' AND clock_in < '2026-02-20';
    FOR day_count IN 0..6 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_record.id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 2, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Abaday Emelyn: 6 days, 0 OT
  SELECT id INTO worker_record FROM public.workers WHERE full_name ILIKE '%Abaday%Emelyn%' LIMIT 1;
  IF worker_record.id IS NOT NULL THEN
    DELETE FROM public.attendance WHERE worker_id = worker_record.id AND clock_in >= '2026-02-13' AND clock_in < '2026-02-20';
    FOR day_count IN 0..5 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_record.id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  RAISE NOTICE 'Attendance records created for Feb 13-19';
END $$;

-- ============================================================================
-- STEP 2: Insert bonuses and SSS deductions
-- ============================================================================

-- Delete existing adjustments for this period
DELETE FROM public.payroll_adjustments
WHERE period_start = '2026-02-13'::date 
AND period_end = '2026-02-19'::date;

-- Insert bonuses and SSS
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT w.id, '2026-02-13'::date, '2026-02-19'::date, 50, 560 
FROM public.workers w WHERE w.full_name ILIKE '%Bacol%Vivian%'
UNION ALL
SELECT w.id, '2026-02-13'::date, '2026-02-19'::date, 0, 1060 
FROM public.workers w WHERE w.full_name ILIKE '%Ylagan%Robert%';

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 
  'Feb 13-19 Attendance Check' as check_type,
  COUNT(*) as total_attendance_records,
  COUNT(DISTINCT worker_id) as unique_workers
FROM public.attendance
WHERE clock_in >= '2026-02-13'::date 
AND clock_in < '2026-02-20'::date;

SELECT 
  'Feb 13-19 Adjustments Check' as check_type,
  COUNT(*) as adjustment_records,
  SUM(bonus) as total_bonuses,
  SUM(sss_deduction) as total_sss
FROM public.payroll_adjustments
WHERE period_start = '2026-02-13'::date 
AND period_end = '2026-02-19'::date;
