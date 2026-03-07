-- Fix Espina Aida to have 8 days instead of 7

DO $$
DECLARE
  admin_user_id UUID;
  espina_worker_id UUID;
  base_date DATE := '2026-02-06'::DATE;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id FROM public.users WHERE role = 'admin' LIMIT 1;
  
  -- Get Espina Aida's worker ID
  SELECT id INTO espina_worker_id FROM public.workers WHERE employee_id = 'EMP027';
  
  -- Delete existing attendance for Espina Aida in Feb 6-12
  DELETE FROM public.attendance 
  WHERE worker_id = espina_worker_id
  AND clock_in >= '2026-02-06' 
  AND clock_in < '2026-02-13';
  
  -- Insert 8 days of attendance
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  VALUES
    (espina_worker_id, base_date + 0, base_date + 0 + interval '17 hours', 8, 0, 'completed_quota', admin_user_id),
    (espina_worker_id, base_date + 1, base_date + 1 + interval '17 hours', 8, 0, 'completed_quota', admin_user_id),
    (espina_worker_id, base_date + 2, base_date + 2 + interval '17 hours', 8, 0, 'completed_quota', admin_user_id),
    (espina_worker_id, base_date + 3, base_date + 3 + interval '17 hours', 8, 0, 'completed_quota', admin_user_id),
    (espina_worker_id, base_date + 4, base_date + 4 + interval '17 hours', 8, 0, 'completed_quota', admin_user_id),
    (espina_worker_id, base_date + 5, base_date + 5 + interval '17 hours', 8, 0, 'completed_quota', admin_user_id),
    (espina_worker_id, base_date + 6, base_date + 6 + interval '17 hours', 8, 0, 'completed_quota', admin_user_id),
    (espina_worker_id, base_date + 7, base_date + 7 + interval '17 hours', 8, 0, 'completed_quota', admin_user_id);
  
END $$;

-- Verify the fix
SELECT 
  w.employee_id,
  w.full_name,
  COUNT(*) as days_count,
  MIN(a.clock_in) as first_day,
  MAX(a.clock_in) as last_day
FROM public.attendance a
JOIN public.workers w ON w.id = a.worker_id
WHERE w.employee_id = 'EMP027'
AND a.clock_in >= '2026-02-06' 
AND a.clock_in < '2026-02-14'
GROUP BY w.employee_id, w.full_name;
