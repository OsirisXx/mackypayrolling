-- RESTORE FEB 6-12 DATA
-- Expected Grand Total: 170,186.25

-- First check what's missing
SELECT 
  w.full_name,
  COUNT(a.id) as days,
  SUM(a.overtime_hours) as total_ot
FROM workers w
LEFT JOIN attendance a ON a.worker_id = w.id 
  AND a.clock_in >= '2026-02-06' AND a.clock_in < '2026-02-14'
GROUP BY w.id, w.full_name
ORDER BY w.full_name;

-- Add Espina Aida's 8th day if missing
DO $$
DECLARE
  admin_id UUID;
  espina_id UUID;
  existing_count INT;
BEGIN
  SELECT id INTO admin_id FROM users WHERE role = 'admin' LIMIT 1;
  SELECT id INTO espina_id FROM workers WHERE full_name ILIKE '%Espina%Aida%' LIMIT 1;
  
  IF espina_id IS NOT NULL THEN
    SELECT COUNT(*) INTO existing_count 
    FROM attendance 
    WHERE worker_id = espina_id 
    AND clock_in >= '2026-02-06' AND clock_in < '2026-02-14';
    
    IF existing_count < 8 THEN
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (espina_id, '2026-02-13', '2026-02-13 17:00:00', 8, 0, 'completed_quota', admin_id);
      RAISE NOTICE 'Added 8th day for Espina Aida';
    END IF;
  END IF;
END $$;

-- Verify Espina Aida now has 8 days
SELECT 
  w.full_name,
  COUNT(a.id) as days,
  w.daily_rate,
  COUNT(a.id) * w.daily_rate as base_pay
FROM workers w
JOIN attendance a ON a.worker_id = w.id 
  AND a.clock_in >= '2026-02-06' AND a.clock_in < '2026-02-14'
WHERE w.full_name ILIKE '%Espina%Aida%'
GROUP BY w.id, w.full_name, w.daily_rate;
