-- FINAL FIX: Add one more day to Espina Aida's attendance
-- Current: 7 days (Feb 6-12)
-- Target: 8 days (Feb 6-13)

-- Simply add Feb 13 to Espina Aida's attendance
INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
SELECT 
  w.id,
  '2026-02-13 08:00:00'::timestamp,
  '2026-02-13 17:00:00'::timestamp,
  8,
  0,
  'completed_quota',
  (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)
FROM public.workers w
WHERE w.employee_id = 'EMP027';

-- Verify
SELECT 
  w.employee_id,
  w.full_name,
  COUNT(*) as days,
  COUNT(*) * 350 as base_pay,
  100 as bonus,
  (COUNT(*) * 350) + 100 as total_with_bonus
FROM public.attendance a
JOIN public.workers w ON w.id = a.worker_id
WHERE w.employee_id = 'EMP027'
AND a.clock_in >= '2026-02-06'
AND a.clock_in <= '2026-02-13'
GROUP BY w.employee_id, w.full_name;
