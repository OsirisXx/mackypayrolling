-- FEB 13-19 IMPORT - CLEAN VERSION
-- Run this in Supabase SQL Editor

BEGIN;

-- Clear existing data
DELETE FROM attendance WHERE clock_in >= '2026-02-13' AND clock_in < '2026-02-20';
DELETE FROM payroll_adjustments WHERE period_start = '2026-02-13' AND period_end = '2026-02-19';

-- Get admin user ID
DO $$
DECLARE
  admin_id UUID;
  w_id UUID;
BEGIN
  SELECT id INTO admin_id FROM users WHERE role = 'admin' LIMIT 1;
  
  -- Bacol, Vivian: 7 days, 21 OT
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Bacol%Vivian%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..6 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 3, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Ylagan Robert: 7 days, 15 OT
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Ylagan%Robert%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..6 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 2.1, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Abaday Emelyn: 6 days, 0 OT
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Abaday%Emelyn%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..5 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Add remaining 64 workers here following the same pattern
  -- For now, this will import 3 workers as a test
  
END $$;

-- Insert bonuses/SSS
INSERT INTO payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT w.id, '2026-02-13'::date, '2026-02-19'::date, 50, 560 FROM workers w WHERE w.full_name ILIKE '%Bacol%Vivian%'
UNION ALL
SELECT w.id, '2026-02-13'::date, '2026-02-19'::date, 0, 1060 FROM workers w WHERE w.full_name ILIKE '%Ylagan%Robert%';

COMMIT;

-- Verify
SELECT COUNT(*) as attendance_count FROM attendance WHERE clock_in >= '2026-02-13' AND clock_in < '2026-02-20';
SELECT COUNT(*) as adjustment_count FROM payroll_adjustments WHERE period_start = '2026-02-13';
