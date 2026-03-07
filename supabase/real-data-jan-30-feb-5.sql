-- Real Commission Schedule Data: Jan 30 - Feb 5, 2026
-- This is the actual data from the Excel commission schedule
-- Run this after FINAL-SETUP.sql and add-standard-hours.sql

BEGIN;

-- Delete existing attendance (keep workers)
DELETE FROM public.attendance;

DO $$
DECLARE
  admin_user_id UUID;
  base_date DATE := '2026-01-30'::DATE;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id FROM public.users WHERE role = 'admin' LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'No admin user found. Run create-users-manually.sql first';
  END IF;

  -- Bacol, Vivian: 7 days, 21 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 3, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 6) i
  WHERE w.employee_id = 'EMP001';

  -- Ylagan Robert: 6 days, 25 OT (1562.5 total OT)
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 
    CASE WHEN i < 6 THEN 4.17 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP002';

  -- Abaday Emelyn: 6 days, 0 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 0, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP003';

  -- Abaday Ike Jun: 4 days, 19 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 4.75, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP004';

  -- Absin Jimmy: 2 days, 7 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 3.5, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 1) i
  WHERE w.employee_id = 'EMP005';

  -- Abunda, Renjay: 4 days, 29 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 7.25, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP006';

  -- Alimbog, Gabby: 4 days, 22 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 5.5, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP007';

  -- Alimbog, Livy: 6 days, 0 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 0, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP008';

  -- Alimbog,marque: 4 days, 15 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 3.75, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP009';

  -- Amoncio,Jendel: 6 days, 0 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 0, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP010';

  -- Angan, e: 6 days, 0 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 0, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP011';

  -- Arnesx Sarinao: 6 days, 34 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 
    CASE WHEN i < 6 THEN 5.67 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP012';

  -- Atlawan, jimboy: 4 days, 13 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 3.25, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP013';

  -- Baculio Daren: 6 days, 16 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 
    CASE WHEN i < 6 THEN 2.67 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP014';

  -- Baculio Rosito: 6 days, 0 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 0, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP015';

  -- Balbuena Randy: 4 days, 9 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 2.25, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP016';

  -- Bulak, Alvin: 6 days, 7 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 
    CASE WHEN i < 6 THEN 1.17 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP017';

  -- Bulak Marvin: 7 days, 36 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 
    CASE WHEN i < 7 THEN 5.14 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 6) i
  WHERE w.employee_id = 'EMP018';

  -- Bulak Melvin: 6 days, 0 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 0, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP019';

  -- Bulak Norvin: 7 days, 24 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 
    CASE WHEN i < 7 THEN 3.43 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 6) i
  WHERE w.employee_id = 'EMP020';

  -- Cabornay, Celio: 6 days, 7 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 
    CASE WHEN i < 6 THEN 1.17 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP021';

  -- Cartahan, bobey: 0 days, 0 OT (skip)

  -- Conahan,Aaron: 3 days, 16 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 5.33, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 2) i
  WHERE w.employee_id = 'EMP023';

  -- Curbo Regie: 5 days, 34 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 6.8, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP024';

  -- Dagalia Cruz Popoy: 3 days, 18 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 6, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 2) i
  WHERE w.employee_id = 'EMP025';

  -- Decaso Jclaid: 5 days, 26 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 5.2, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP026';

  -- Espina Aida: 7 days, 0 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 0, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 6) i
  WHERE w.employee_id = 'EMP027';

  -- Felizarda,Lintacan: 4 days, 7 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 1.75, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP028';

  -- Funa, Muela: 7 days, 26 OT (350 rate)
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 
    CASE WHEN i < 7 THEN 3.71 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 6) i
  WHERE w.employee_id = 'EMP029';

  -- Gullan MEnard: 6 days, 0 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 0, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP030';

  -- Mahunyag, christ: 6 days, 0 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 0, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP031';

  -- Marjunel Angan: 5 days, 20 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 4, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP032';

  -- Pagayon Joanrd: 5 days, 16 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 3.2, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP033';

  -- Pagayon jason: 4 days, 16 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 4, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP034';

  -- Renel Angan: 7 days, 21 OT (550 rate)
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 3, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 6) i
  WHERE w.employee_id = 'EMP035';

  -- Lastimosa Ricky: 6 days, 32 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 
    CASE WHEN i < 6 THEN 5.33 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP036';

  -- Sagansan, Dexter: 5 days, 0 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 0, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP037';

  -- Sagansan Jerry: 5 days, 28 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 5.6, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP038';

  -- Salait Ariel: 6 days, 0 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 0, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP039';

  -- Sumayan Roland: 1 day, 8 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date, base_date + interval '17 hours', 8, 8, 'completed_quota', admin_user_id
  FROM public.workers w
  WHERE w.employee_id = 'EMP040';

  -- Yake jordan: 4 days, 6 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 1.5, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP041';

  -- Yake rodonio: 5 days, 0 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 0, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP042';

  -- Yanuhon JOvil: 4 days, 12 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 3, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP043';

  -- Yunson Alfred: 6 days, 38 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 
    CASE WHEN i < 6 THEN 6.33 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP044';

  -- Alimbog, jhon: 5 days, 24 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 4.8, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP045';

  -- Alimbog Hilbert: 4 days, 0 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 0, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP046';

  -- Andaol Zerbi: 5 days, 15 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 3, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP047';

  -- Dagpong crist: 5 days, 16 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 3.2, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP048';

  -- Datuin James: 5 days, 15 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 3, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP049';

  -- sagansan renie: 7 days, 28 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 4, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 6) i
  WHERE w.employee_id = 'EMP050';

  -- Pagayod Beebth: 5 days, 15 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 3, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP051';

  -- ubanan Enel: 4 days, 12 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 3, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP052';

  -- Yake rex: 2 days, 0 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 0, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 1) i
  WHERE w.employee_id = 'EMP053';

  -- yUnson niper: 7 days, 34 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 
    CASE WHEN i < 7 THEN 4.86 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 6) i
  WHERE w.employee_id = 'EMP054';

  -- Abunda Bobby: 5 days, 32 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 6.4, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP055';

  -- Lan ayan Raul: 4 days, 31 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 7.75, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP056';

  -- bayantong Edgar: 3 days, 18 OT (500 rate)
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 6, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 2) i
  WHERE w.employee_id = 'EMP057';

  -- Camahay Diego: 7 days, 40 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 
    CASE WHEN i < 7 THEN 5.71 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 6) i
  WHERE w.employee_id = 'EMP058';

  -- Cartahan, Kevin: 3 days, 12 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 4, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 2) i
  WHERE w.employee_id = 'EMP059';

  -- Sandalan jevin: 3 days, 12 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 4, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 2) i
  WHERE w.employee_id = 'EMP060';

  -- Lan-ayan Renemee: 4 days, 16 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 4, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP061';

  -- Gonhay Jemmuel: 4 days, 16 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 4, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP062';

END $$;

COMMIT;

-- Verification query
SELECT 
  w.employee_id,
  w.full_name,
  w.daily_rate,
  COUNT(DISTINCT DATE(a.clock_in)) as days_worked,
  SUM(COALESCE(a.overtime_hours, 0)) as total_ot,
  (COUNT(DISTINCT DATE(a.clock_in)) * w.daily_rate) as base_pay,
  (SUM(COALESCE(a.overtime_hours, 0)) * w.hourly_rate) as ot_pay,
  (COUNT(DISTINCT DATE(a.clock_in)) * w.daily_rate) + (SUM(COALESCE(a.overtime_hours, 0)) * w.hourly_rate) as total
FROM public.workers w
LEFT JOIN public.attendance a ON w.id = a.worker_id
  AND a.clock_in >= '2026-01-30' AND a.clock_in < '2026-02-06'
WHERE w.employee_id IN ('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP035', 'EMP057')
GROUP BY w.id, w.employee_id, w.full_name, w.daily_rate, w.hourly_rate
ORDER BY w.employee_id;
