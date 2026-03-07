-- Real Commission Schedule Data: Feb 6-12, 2026 (FIXED - All OT on first day)
-- This matches the Excel commission schedule exactly

BEGIN;

-- Delete existing data
DELETE FROM public.attendance;
DELETE FROM public.workers WHERE employee_id LIKE 'EMP%';

-- Insert workers with their actual daily rates from the commission schedule
INSERT INTO public.workers (employee_id, full_name, daily_rate, hourly_rate, standard_hours, qr_code, is_active) VALUES
-- Top 2 special workers
('EMP001', 'Bacol, Vivian', 350, 43.75, 8, '{"id":"WRK-EMP001","name":"Bacol, Vivian","employeeId":"EMP001"}', true),
('EMP002', 'Ylagan Robert', 500, 62.50, 8, '{"id":"WRK-EMP002","name":"Ylagan Robert","employeeId":"EMP002"}', true),

-- Commission schedule workers (350 PHP rate)
('EMP003', 'Abaday Emelyn', 350, 43.75, 8, '{"id":"WRK-EMP003","name":"Abaday Emelyn","employeeId":"EMP003"}', true),
('EMP027', 'Espina Aida', 350, 43.75, 8, '{"id":"WRK-EMP027","name":"Espina Aida","employeeId":"EMP027"}', true),
('EMP029', 'Funa, Muela', 350, 43.75, 8, '{"id":"WRK-EMP029","name":"Funa, Muela","employeeId":"EMP029"}', true),

-- Commission schedule workers (400 PHP rate)
('EMP004', 'Abaday Ike Jun', 400, 50.00, 8, '{"id":"WRK-EMP004","name":"Abaday Ike Jun","employeeId":"EMP004"}', true),
('EMP005', 'Absin Jimmy', 400, 50.00, 8, '{"id":"WRK-EMP005","name":"Absin Jimmy","employeeId":"EMP005"}', true),
('EMP006', 'Abunda, Renjay', 400, 50.00, 8, '{"id":"WRK-EMP006","name":"Abunda, Renjay","employeeId":"EMP006"}', true),
('EMP007', 'Alimbog, Gabby', 400, 50.00, 8, '{"id":"WRK-EMP007","name":"Alimbog, Gabby","employeeId":"EMP007"}', true),
('EMP008', 'Alimbog, Livy', 400, 50.00, 8, '{"id":"WRK-EMP008","name":"Alimbog, Livy","employeeId":"EMP008"}', true),
('EMP009', 'Alimbog,marque', 400, 50.00, 8, '{"id":"WRK-EMP009","name":"Alimbog,marque","employeeId":"EMP009"}', true),
('EMP010', 'Amoncio,Jendel', 400, 50.00, 8, '{"id":"WRK-EMP010","name":"Amoncio,Jendel","employeeId":"EMP010"}', true),
('EMP011', 'Angan, e', 400, 50.00, 8, '{"id":"WRK-EMP011","name":"Angan, e","employeeId":"EMP011"}', true),
('EMP012', 'Arnesx Sarinao', 400, 50.00, 8, '{"id":"WRK-EMP012","name":"Arnesx Sarinao","employeeId":"EMP012"}', true),
('EMP013', 'Atlawan, jimboy', 400, 50.00, 8, '{"id":"WRK-EMP013","name":"Atlawan, jimboy","employeeId":"EMP013"}', true),
('EMP014', 'Baculio Daren', 400, 50.00, 8, '{"id":"WRK-EMP014","name":"Baculio Daren","employeeId":"EMP014"}', true),
('EMP015', 'Baculio Rosito', 400, 50.00, 8, '{"id":"WRK-EMP015","name":"Baculio Rosito","employeeId":"EMP015"}', true),
('EMP016', 'Balbuena Randy', 400, 50.00, 8, '{"id":"WRK-EMP016","name":"Balbuena Randy","employeeId":"EMP016"}', true),
('EMP017', 'Bulak, Alvin', 400, 50.00, 8, '{"id":"WRK-EMP017","name":"Bulak, Alvin","employeeId":"EMP017"}', true),
('EMP018', 'Bulak Marvin', 400, 50.00, 8, '{"id":"WRK-EMP018","name":"Bulak Marvin","employeeId":"EMP018"}', true),
('EMP019', 'Bulak Melvin', 400, 50.00, 8, '{"id":"WRK-EMP019","name":"Bulak Melvin","employeeId":"EMP019"}', true),
('EMP020', 'Bulak Norvin', 400, 50.00, 8, '{"id":"WRK-EMP020","name":"Bulak Norvin","employeeId":"EMP020"}', true),
('EMP021', 'Cabornay, Celio', 400, 50.00, 8, '{"id":"WRK-EMP021","name":"Cabornay, Celio","employeeId":"EMP021"}', true),
('EMP022', 'Cartahan, boboy', 400, 50.00, 8, '{"id":"WRK-EMP022","name":"Cartahan, boboy","employeeId":"EMP022"}', true),
('EMP023', 'Conahan,Aaron', 400, 50.00, 8, '{"id":"WRK-EMP023","name":"Conahan,Aaron","employeeId":"EMP023"}', true),
('EMP024', 'Curbo Regie', 400, 50.00, 8, '{"id":"WRK-EMP024","name":"Curbo Regie","employeeId":"EMP024"}', true),
('EMP025', 'Dagalia Cruz Popoy', 400, 50.00, 8, '{"id":"WRK-EMP025","name":"Dagalia Cruz Popoy","employeeId":"EMP025"}', true),
('EMP026', 'Decaso Jclaid', 400, 50.00, 8, '{"id":"WRK-EMP026","name":"Decaso Jclaid","employeeId":"EMP026"}', true),
('EMP028', 'Felizarda,Lintacan', 400, 50.00, 8, '{"id":"WRK-EMP028","name":"Felizarda,Lintacan","employeeId":"EMP028"}', true),
('EMP030', 'Gullan MEnard', 400, 50.00, 8, '{"id":"WRK-EMP030","name":"Gullan MEnard","employeeId":"EMP030"}', true),
('EMP031', 'Mahunyag, christ', 400, 50.00, 8, '{"id":"WRK-EMP031","name":"Mahunyag, christ","employeeId":"EMP031"}', true),
('EMP032', 'Marjunel Angan', 400, 50.00, 8, '{"id":"WRK-EMP032","name":"Marjunel Angan","employeeId":"EMP032"}', true),
('EMP033', 'Pagayon Joanrd', 400, 50.00, 8, '{"id":"WRK-EMP033","name":"Pagayon Joanrd","employeeId":"EMP033"}', true),
('EMP034', 'Pagayon jason', 400, 50.00, 8, '{"id":"WRK-EMP034","name":"Pagayon jason","employeeId":"EMP034"}', true),
('EMP036', 'Lastimosa Ricky', 400, 50.00, 8, '{"id":"WRK-EMP036","name":"Lastimosa Ricky","employeeId":"EMP036"}', true),
('EMP037', 'Sagansan, Dexter', 400, 50.00, 8, '{"id":"WRK-EMP037","name":"Sagansan, Dexter","employeeId":"EMP037"}', true),
('EMP038', 'Sagansan Jerry', 400, 50.00, 8, '{"id":"WRK-EMP038","name":"Sagansan Jerry","employeeId":"EMP038"}', true),
('EMP039', 'Salait Ariel', 400, 50.00, 8, '{"id":"WRK-EMP039","name":"Salait Ariel","employeeId":"EMP039"}', true),
('EMP040', 'Sumayan Roland', 400, 50.00, 8, '{"id":"WRK-EMP040","name":"Sumayan Roland","employeeId":"EMP040"}', true),
('EMP041', 'Yake jordan', 400, 50.00, 8, '{"id":"WRK-EMP041","name":"Yake jordan","employeeId":"EMP041"}', true),
('EMP042', 'Yake rodonio', 400, 50.00, 8, '{"id":"WRK-EMP042","name":"Yake rodonio","employeeId":"EMP042"}', true),
('EMP043', 'Yanuhon JOvil', 400, 50.00, 8, '{"id":"WRK-EMP043","name":"Yanuhon JOvil","employeeId":"EMP043"}', true),
('EMP044', 'Yunson Alfred', 400, 50.00, 8, '{"id":"WRK-EMP044","name":"Yunson Alfred","employeeId":"EMP044"}', true),
('EMP045', 'Alimbog, jhon', 400, 50.00, 8, '{"id":"WRK-EMP045","name":"Alimbog, jhon","employeeId":"EMP045"}', true),
('EMP046', 'Alimbog Hilbert', 400, 50.00, 8, '{"id":"WRK-EMP046","name":"Alimbog Hilbert","employeeId":"EMP046"}', true),
('EMP047', 'Andaol Zerbi', 400, 50.00, 8, '{"id":"WRK-EMP047","name":"Andaol Zerbi","employeeId":"EMP047"}', true),
('EMP048', 'Dagpong crist', 400, 50.00, 8, '{"id":"WRK-EMP048","name":"Dagpong crist","employeeId":"EMP048"}', true),
('EMP049', 'Datuin James', 400, 50.00, 8, '{"id":"WRK-EMP049","name":"Datuin James","employeeId":"EMP049"}', true),
('EMP050', 'sagansan renie', 400, 50.00, 8, '{"id":"WRK-EMP050","name":"sagansan renie","employeeId":"EMP050"}', true),
('EMP051', 'Pagayod Beebth', 400, 50.00, 8, '{"id":"WRK-EMP051","name":"Pagayod Beebth","employeeId":"EMP051"}', true),
('EMP052', 'ubanan Enel', 400, 50.00, 8, '{"id":"WRK-EMP052","name":"ubanan Enel","employeeId":"EMP052"}', true),
('EMP053', 'Yake rex', 400, 50.00, 8, '{"id":"WRK-EMP053","name":"Yake rex","employeeId":"EMP053"}', true),
('EMP054', 'yUnson niper', 400, 50.00, 8, '{"id":"WRK-EMP054","name":"yUnson niper","employeeId":"EMP054"}', true),
('EMP055', 'Abunda Bobby', 400, 50.00, 8, '{"id":"WRK-EMP055","name":"Abunda Bobby","employeeId":"EMP055"}', true),
('EMP056', 'Lan ayan Raul', 400, 50.00, 8, '{"id":"WRK-EMP056","name":"Lan ayan Raul","employeeId":"EMP056"}', true),
('EMP058', 'Camahay Diego', 400, 50.00, 8, '{"id":"WRK-EMP058","name":"Camahay Diego","employeeId":"EMP058"}', true),
('EMP059', 'Cartahan, Kevin', 400, 50.00, 8, '{"id":"WRK-EMP059","name":"Cartahan, Kevin","employeeId":"EMP059"}', true),
('EMP060', 'Sandalan jevin', 400, 50.00, 8, '{"id":"WRK-EMP060","name":"Sandalan jevin","employeeId":"EMP060"}', true),
('EMP061', 'Lan-ayan Renemee', 400, 50.00, 8, '{"id":"WRK-EMP061","name":"Lan-ayan Renemee","employeeId":"EMP061"}', true),
('EMP062', 'Gonhay Jemmuel', 400, 50.00, 8, '{"id":"WRK-EMP062","name":"Gonhay Jemmuel","employeeId":"EMP062"}', true),

-- Special rate workers
('EMP035', 'Renel Angan', 550, 68.75, 8, '{"id":"WRK-EMP035","name":"Renel Angan","employeeId":"EMP035"}', true),
('EMP057', 'bayantong Edgar', 500, 62.50, 8, '{"id":"WRK-EMP057","name":"bayantong Edgar","employeeId":"EMP057"}', true);

DO $$
DECLARE
  admin_user_id UUID;
  base_date DATE := '2026-02-06'::DATE;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id FROM public.users WHERE role = 'admin' LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'No admin user found. Run create-users-manually.sql first';
  END IF;

  -- Helper function to insert attendance: first day gets all OT, rest get 0 OT
  -- Bacol, Vivian: 7 days, 18 OT total (Bonus: +50, SSS: -560)
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 
    CASE WHEN i = 0 THEN 18 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 6) i
  WHERE w.employee_id = 'EMP001';

  -- Ylagan Robert: 6 days, 25 OT total
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 25 ELSE 0 END,
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
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 19 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP004';

  -- Absin Jimmy: 2 days, 7 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 7 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 1) i
  WHERE w.employee_id = 'EMP005';

  -- Abunda, Renjay: 4 days, 29 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 29 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP006';

  -- Alimbog, Gabby: 4 days, 22 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 22 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP007';

  -- Alimbog, Livy: 6 days, 0 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 0, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP008';

  -- Alimbog,marque: 4 days, 15 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 15 ELSE 0 END,
    'completed_quota', admin_user_id
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
    CASE WHEN i = 0 THEN 34 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP012';

  -- Atlawan, jimboy: 4 days, 13 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 13 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP013';

  -- Baculio Daren: 6 days, 16 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 16 ELSE 0 END,
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
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 9 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP016';

  -- Bulak, Alvin: 6 days, 7 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 7 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP017';

  -- Bulak Marvin: 7 days, 36 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 36 ELSE 0 END,
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
    CASE WHEN i = 0 THEN 24 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 6) i
  WHERE w.employee_id = 'EMP020';

  -- Cabornay, Celio: 6 days, 7 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 7 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP021';

  -- Conahan,Aaron: 3 days, 16 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 16 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 2) i
  WHERE w.employee_id = 'EMP023';

  -- Curbo Regie: 5 days, 34 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 34 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP024';

  -- Dagalia Cruz Popoy: 3 days, 18 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 18 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 2) i
  WHERE w.employee_id = 'EMP025';

  -- Decaso Jclaid: 5 days, 26 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 26 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP026';

  -- Espina Aida: 8 days, 0 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 0, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 7) i
  WHERE w.employee_id = 'EMP027';

  -- Felizarda,Lintacan: 4 days, 7 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 7 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP028';

  -- Funa, Muela: 7 days, 26 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 26 ELSE 0 END,
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
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 20 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP032';

  -- Pagayon Joanrd: 5 days, 16 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 16 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP033';

  -- Pagayon jason: 4 days, 16 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 16 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP034';

  -- Renel Angan: 7 days, 21 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 21 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 6) i
  WHERE w.employee_id = 'EMP035';

  -- Lastimosa Ricky: 6 days, 32 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 32 ELSE 0 END,
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
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 28 ELSE 0 END,
    'completed_quota', admin_user_id
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
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 6 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP041';

  -- Yake rodonio: 5 days, 0 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 0, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP042';

  -- Yanuhon JOvil: 4 days, 12 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 12 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP043';

  -- Yunson Alfred: 6 days, 38 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 38 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 5) i
  WHERE w.employee_id = 'EMP044';

  -- Alimbog, jhon: 5 days, 24 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 24 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP045';

  -- Alimbog Hilbert: 4 days, 0 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8, 0, 'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP046';

  -- Andaol Zerbi: 5 days, 15 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 15 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP047';

  -- Dagpong crist: 5 days, 16 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 16 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP048';

  -- Datuin James: 5 days, 15 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 15 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP049';

  -- sagansan renie: 7 days, 28 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 28 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 6) i
  WHERE w.employee_id = 'EMP050';

  -- Pagayod Beebth: 5 days, 15 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 15 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP051';

  -- ubanan Enel: 4 days, 12 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 12 ELSE 0 END,
    'completed_quota', admin_user_id
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
    CASE WHEN i = 0 THEN 34 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 6) i
  WHERE w.employee_id = 'EMP054';

  -- Abunda Bobby: 5 days, 32 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 32 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 4) i
  WHERE w.employee_id = 'EMP055';

  -- Lan ayan Raul: 4 days, 31 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 31 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP056';

  -- bayantong Edgar: 3 days, 18 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 18 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 2) i
  WHERE w.employee_id = 'EMP057';

  -- Camahay Diego: 7 days, 40 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 40 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 6) i
  WHERE w.employee_id = 'EMP058';

  -- Cartahan, Kevin: 3 days, 12 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 12 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 2) i
  WHERE w.employee_id = 'EMP059';

  -- Sandalan jevin: 3 days, 12 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 12 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 2) i
  WHERE w.employee_id = 'EMP060';

  -- Lan-ayan Renemee: 4 days, 16 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 16 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP061';

  -- Gonhay Jemmuel: 4 days, 16 OT
  INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
  SELECT w.id, base_date + i, base_date + i + interval '17 hours', 8,
    CASE WHEN i = 0 THEN 16 ELSE 0 END,
    'completed_quota', admin_user_id
  FROM public.workers w, generate_series(0, 3) i
  WHERE w.employee_id = 'EMP062';

END $$;

COMMIT;

-- Verification query
SELECT 
  COUNT(*) as total_workers,
  SUM(days_worked) as total_days,
  SUM(total_ot) as total_ot_hours,
  SUM(worker_total) as grand_total
FROM (
  SELECT 
    w.employee_id,
    w.full_name,
    COUNT(DISTINCT DATE(a.clock_in)) as days_worked,
    SUM(COALESCE(a.overtime_hours, 0)) as total_ot,
    (COUNT(DISTINCT DATE(a.clock_in)) * w.daily_rate) + 
    (SUM(COALESCE(a.overtime_hours, 0)) * w.hourly_rate) +
    CASE WHEN w.employee_id = 'EMP001' THEN 50 WHEN w.employee_id = 'EMP002' THEN 100 ELSE 0 END -
    CASE WHEN w.employee_id = 'EMP001' THEN 560 WHEN w.employee_id = 'EMP002' THEN 1060 ELSE 0 END as worker_total
  FROM public.workers w
  LEFT JOIN public.attendance a ON w.id = a.worker_id
    AND a.clock_in >= '2026-02-06' AND a.clock_in < '2026-02-13'
  WHERE w.employee_id LIKE 'EMP%'
  GROUP BY w.id, w.employee_id, w.full_name, w.daily_rate, w.hourly_rate
) subquery;
