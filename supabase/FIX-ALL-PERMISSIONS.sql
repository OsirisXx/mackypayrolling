-- FIX ALL PERMISSIONS AND RESTORE DATA
-- Run this FIRST before any JavaScript imports

-- 1. Grant full permissions on all tables
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.workers TO anon;
GRANT SELECT ON public.workers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_adjustments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_adjustments TO authenticated;

-- 2. Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Allow all operations on workers" ON public.workers;
DROP POLICY IF EXISTS "Allow all operations on attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow all operations on payroll_adjustments" ON public.payroll_adjustments;
DROP POLICY IF EXISTS "Allow select on users" ON public.users;

-- 3. Create permissive policies
CREATE POLICY "Allow all operations on workers" ON public.workers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on payroll_adjustments" ON public.payroll_adjustments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow select on users" ON public.users FOR SELECT USING (true);

-- 4. Restore Feb 6-12 Espina Aida 8th day
DO $$
DECLARE
  admin_id UUID;
  espina_id UUID;
  existing_count INT;
BEGIN
  SELECT id INTO admin_id FROM users WHERE role = 'admin' LIMIT 1;
  SELECT id INTO espina_id FROM workers WHERE full_name ILIKE '%Espina%Aida%' LIMIT 1;
  
  IF espina_id IS NOT NULL AND admin_id IS NOT NULL THEN
    SELECT COUNT(*) INTO existing_count 
    FROM attendance 
    WHERE worker_id = espina_id 
    AND clock_in >= '2026-02-06' AND clock_in < '2026-02-14';
    
    IF existing_count < 8 THEN
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (espina_id, '2026-02-13', '2026-02-13 17:00:00', 8, 0, 'completed_quota', admin_id);
      RAISE NOTICE 'Added 8th day for Espina Aida';
    ELSE
      RAISE NOTICE 'Espina Aida already has % days', existing_count;
    END IF;
  END IF;
END $$;

-- 5. Verify Feb 6-12 totals
SELECT 
  'Feb 6-12 Summary' as period,
  COUNT(DISTINCT a.worker_id) as workers,
  COUNT(a.id) as attendance_records
FROM attendance a
JOIN workers w ON w.id = a.worker_id
WHERE a.clock_in >= '2026-02-06' AND a.clock_in < '2026-02-14';

-- 6. Show admin user ID for reference
SELECT id, email, role FROM users WHERE role = 'admin' LIMIT 1;
