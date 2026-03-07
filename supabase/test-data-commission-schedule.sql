-- Test data based on Commission Schedule
-- This will insert workers and attendance records to match the commission schedule image
-- Run this after the main schema setup

-- First, let's insert the workers with their daily rates
-- Note: The schedule shows daily rates of 350, 400, 500, and 550

BEGIN;

-- Delete existing test workers if they exist (EMP001-EMP067)
DELETE FROM public.workers WHERE employee_id LIKE 'EMP%';

-- Insert workers from the commission schedule with QR codes
INSERT INTO public.workers (employee_id, full_name, daily_rate, hourly_rate, standard_hours, qr_code, is_active) VALUES
-- 350 PHP daily rate workers
('EMP001', 'Aberaley Emalyn', 350, 43.75, 8, '{"id":"WRK-EMP001","name":"Aberaley Emalyn","employeeId":"EMP001"}', true),
('EMP002', 'Abaraley the Jon', 350, 43.75, 8, '{"id":"WRK-EMP002","name":"Abaraley the Jon","employeeId":"EMP002"}', true),
('EMP003', 'Abion Jimmy', 350, 43.75, 8, '{"id":"WRK-EMP003","name":"Abion Jimmy","employeeId":"EMP003"}', true),
('EMP004', 'Abunda Bobby', 350, 43.75, 8, '{"id":"WRK-EMP004","name":"Abunda Bobby","employeeId":"EMP004"}', true),
('EMP005', 'Abunda, Ronnie', 350, 43.75, 8, '{"id":"WRK-EMP005","name":"Abunda, Ronnie","employeeId":"EMP005"}', true),
('EMP006', 'Alimbog, Gabby', 350, 43.75, 8, '{"id":"WRK-EMP006","name":"Alimbog, Gabby","employeeId":"EMP006"}', true),
('EMP007', 'Alimbog, Jeric', 350, 43.75, 8, '{"id":"WRK-EMP007","name":"Alimbog, Jeric","employeeId":"EMP007"}', true),
('EMP008', 'Alimbog Hilbert', 350, 43.75, 8, '{"id":"WRK-EMP008","name":"Alimbog Hilbert","employeeId":"EMP008"}', true),
('EMP009', 'Alimbog, Lily', 350, 43.75, 8, '{"id":"WRK-EMP009","name":"Alimbog, Lily","employeeId":"EMP009"}', true),
('EMP010', 'Alimbog marque', 350, 43.75, 8, '{"id":"WRK-EMP010","name":"Alimbog marque","employeeId":"EMP010"}', true),
('EMP011', 'Almendro Jandel', 350, 43.75, 8, '{"id":"WRK-EMP011","name":"Almendro Jandel","employeeId":"EMP011"}', true),
('EMP012', 'Andreal Zario', 350, 43.75, 8, '{"id":"WRK-EMP012","name":"Andreal Zario","employeeId":"EMP012"}', true),
('EMP013', 'Ariban, e', 350, 43.75, 8, '{"id":"WRK-EMP013","name":"Ariban, e","employeeId":"EMP013"}', true),
('EMP014', 'Armesa Satimas', 350, 43.75, 8, '{"id":"WRK-EMP014","name":"Armesa Satimas","employeeId":"EMP014"}', true),
('EMP015', 'Asbuque, jimbrey', 350, 43.75, 8, '{"id":"WRK-EMP015","name":"Asbuque, jimbrey","employeeId":"EMP015"}', true),
('EMP016', 'Bacallo Dhen', 350, 43.75, 8, '{"id":"WRK-EMP016","name":"Bacallo Dhen","employeeId":"EMP016"}', true),
('EMP017', 'Bacuño Ronilo', 350, 43.75, 8, '{"id":"WRK-EMP017","name":"Bacuño Ronilo","employeeId":"EMP017"}', true),
('EMP018', 'Balbuena Jhonny', 350, 43.75, 8, '{"id":"WRK-EMP018","name":"Balbuena Jhonny","employeeId":"EMP018"}', true),
('EMP019', 'Bayanting Edgar', 350, 43.75, 8, '{"id":"WRK-EMP019","name":"Bayanting Edgar","employeeId":"EMP019"}', true),

-- 400 PHP daily rate workers
('EMP020', 'Bulak Marvin', 400, 50.00, 8, '{"id":"WRK-EMP020","name":"Bulak Marvin","employeeId":"EMP020"}', true),
('EMP021', 'Bulak Melvin', 400, 50.00, 8, '{"id":"WRK-EMP021","name":"Bulak Melvin","employeeId":"EMP021"}', true),
('EMP022', 'Bulak Norwin', 400, 50.00, 8, '{"id":"WRK-EMP022","name":"Bulak Norwin","employeeId":"EMP022"}', true),
('EMP023', 'Bulak, Alvin', 400, 50.00, 8, '{"id":"WRK-EMP023","name":"Bulak, Alvin","employeeId":"EMP023"}', true),
('EMP024', 'Cabarrubey, Callo', 400, 50.00, 8, '{"id":"WRK-EMP024","name":"Cabarrubey, Callo","employeeId":"EMP024"}', true),
('EMP025', 'Camathay Diego', 400, 50.00, 8, '{"id":"WRK-EMP025","name":"Camathay Diego","employeeId":"EMP025"}', true),
('EMP026', 'Camathan, Elmer', 400, 50.00, 8, '{"id":"WRK-EMP026","name":"Camathan, Elmer","employeeId":"EMP026"}', true),
('EMP027', 'Camathan, bobboy', 400, 50.00, 8, '{"id":"WRK-EMP027","name":"Camathan, bobboy","employeeId":"EMP027"}', true),
('EMP028', 'Camathan, Ronnie', 400, 50.00, 8, '{"id":"WRK-EMP028","name":"Camathan, Ronnie","employeeId":"EMP028"}', true),
('EMP029', 'Cudia Regie', 400, 50.00, 8, '{"id":"WRK-EMP029","name":"Cudia Regie","employeeId":"EMP029"}', true),
('EMP030', 'Dagdug Cris Pepay', 400, 50.00, 8, '{"id":"WRK-EMP030","name":"Dagdug Cris Pepay","employeeId":"EMP030"}', true),
('EMP031', 'Dagupong emil', 400, 50.00, 8, '{"id":"WRK-EMP031","name":"Dagupong emil","employeeId":"EMP031"}', true),
('EMP032', 'Dalatin jahrim', 400, 50.00, 8, '{"id":"WRK-EMP032","name":"Dalatin jahrim","employeeId":"EMP032"}', true),
('EMP033', 'Dexaso Jibad', 400, 50.00, 8, '{"id":"WRK-EMP033","name":"Dexaso Jibad","employeeId":"EMP033"}', true),
('EMP034', 'Digma elisa', 400, 50.00, 8, '{"id":"WRK-EMP034","name":"Digma elisa","employeeId":"EMP034"}', true),
('EMP035', 'Paferente Loresson', 400, 50.00, 8, '{"id":"WRK-EMP035","name":"Paferente Loresson","employeeId":"EMP035"}', true),
('EMP036', 'Gallo, Macale', 400, 50.00, 8, '{"id":"WRK-EMP036","name":"Gallo, Macale","employeeId":"EMP036"}', true),
('EMP037', 'Gombay Jannueal', 400, 50.00, 8, '{"id":"WRK-EMP037","name":"Gombay Jannueal","employeeId":"EMP037"}', true),
('EMP038', 'Judas Velasco', 400, 50.00, 8, '{"id":"WRK-EMP038","name":"Judas Velasco","employeeId":"EMP038"}', true),
('EMP039', 'Lan syan Raul', 400, 50.00, 8, '{"id":"WRK-EMP039","name":"Lan syan Raul","employeeId":"EMP039"}', true),
('EMP040', 'Lan-syan Jeric', 400, 50.00, 8, '{"id":"WRK-EMP040","name":"Lan-syan Jeric","employeeId":"EMP040"}', true),
('EMP041', 'Lastimosa Ricky', 400, 50.00, 8, '{"id":"WRK-EMP041","name":"Lastimosa Ricky","employeeId":"EMP041"}', true),
('EMP042', 'Mahunyang, Alvin', 400, 50.00, 8, '{"id":"WRK-EMP042","name":"Mahunyang, Alvin","employeeId":"EMP042"}', true),
('EMP043', 'Marjuned Angelo', 400, 50.00, 8, '{"id":"WRK-EMP043","name":"Marjuned Angelo","employeeId":"EMP043"}', true),
('EMP044', 'Pagayad Ronnie', 400, 50.00, 8, '{"id":"WRK-EMP044","name":"Pagayad Ronnie","employeeId":"EMP044"}', true),
('EMP045', 'Pagayao jason', 400, 50.00, 8, '{"id":"WRK-EMP045","name":"Pagayao jason","employeeId":"EMP045"}', true),
('EMP046', 'Pagayao, Junjun', 400, 50.00, 8, '{"id":"WRK-EMP046","name":"Pagayao, Junjun","employeeId":"EMP046"}', true),

-- 550 PHP daily rate workers (from image - Benel Angan)
('EMP047', 'Benel Angan', 550, 68.75, 8, '{"id":"WRK-EMP047","name":"Benel Angan","employeeId":"EMP047"}', true),

-- 350 PHP daily rate workers (continued)
('EMP048', 'Pagdanan Larry', 350, 43.75, 8, '{"id":"WRK-EMP048","name":"Pagdanan Larry","employeeId":"EMP048"}', true),
('EMP049', 'sagansam nenie', 350, 43.75, 8, '{"id":"WRK-EMP049","name":"sagansam nenie","employeeId":"EMP049"}', true),
('EMP050', 'Sagansam, Ronnie', 350, 43.75, 8, '{"id":"WRK-EMP050","name":"Sagansam, Ronnie","employeeId":"EMP050"}', true),
('EMP051', 'Saladi Ariel', 350, 43.75, 8, '{"id":"WRK-EMP051","name":"Saladi Ariel","employeeId":"EMP051"}', true),
('EMP052', 'Sambalon javen', 350, 43.75, 8, '{"id":"WRK-EMP052","name":"Sambalon javen","employeeId":"EMP052"}', true),
('EMP053', 'Sumayao Roland', 350, 43.75, 8, '{"id":"WRK-EMP053","name":"Sumayao Roland","employeeId":"EMP053"}', true),
('EMP054', 'Tabasan Emil', 350, 43.75, 8, '{"id":"WRK-EMP054","name":"Tabasan Emil","employeeId":"EMP054"}', true),
('EMP055', 'Yake jordan', 350, 43.75, 8, '{"id":"WRK-EMP055","name":"Yake jordan","employeeId":"EMP055"}', true),
('EMP056', 'Yake rex', 350, 43.75, 8, '{"id":"WRK-EMP056","name":"Yake rex","employeeId":"EMP056"}', true),
('EMP057', 'Yake rodiono', 350, 43.75, 8, '{"id":"WRK-EMP057","name":"Yake rodiono","employeeId":"EMP057"}', true),
('EMP058', 'Yanubao Boyet', 350, 43.75, 8, '{"id":"WRK-EMP058","name":"Yanubao Boyet","employeeId":"EMP058"}', true),
('EMP059', 'Yanson Alfred', 350, 43.75, 8, '{"id":"WRK-EMP059","name":"Yanson Alfred","employeeId":"EMP059"}', true),
('EMP060', 'Yanson janjan', 350, 43.75, 8, '{"id":"WRK-EMP060","name":"Yanson janjan","employeeId":"EMP060"}', true),

-- 400 PHP daily rate workers (continued)
('EMP061', 'Alimbog Rully', 400, 50.00, 8, '{"id":"WRK-EMP061","name":"Alimbog Rully","employeeId":"EMP061"}', true),
('EMP062', 'Alimbubao, Roel', 400, 50.00, 8, '{"id":"WRK-EMP062","name":"Alimbubao, Roel","employeeId":"EMP062"}', true),
('EMP063', 'Alimbog, Alquin', 400, 50.00, 8, '{"id":"WRK-EMP063","name":"Alimbog, Alquin","employeeId":"EMP063"}', true),
('EMP064', 'Bual, Dangel', 400, 50.00, 8, '{"id":"WRK-EMP064","name":"Bual, Dangel","employeeId":"EMP064"}', true),
('EMP065', 'Laguna, Jowan', 400, 50.00, 8, '{"id":"WRK-EMP065","name":"Laguna, Jowan","employeeId":"EMP065"}', true),
('EMP066', 'Laguna, Ronie', 400, 50.00, 8, '{"id":"WRK-EMP066","name":"Laguna, Ronie","employeeId":"EMP066"}', true),
('EMP067', 'Tumantan, Realside', 400, 50.00, 8, '{"id":"WRK-EMP067","name":"Tumantan, Realside","employeeId":"EMP067"}', true);

-- Now insert attendance records based on the DAYS column from the schedule
-- The schedule shows different number of days worked per person
-- We'll create attendance records for a sample period (e.g., Nov 1-30, 2024)

-- First, ensure we have a user to use as scanned_by
-- Create a temporary admin user if none exists
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if admin user exists
  SELECT id INTO admin_user_id FROM public.users WHERE role = 'admin' LIMIT 1;
  
  -- If no admin user, we'll use a placeholder UUID (you should create actual users first)
  IF admin_user_id IS NULL THEN
    RAISE NOTICE 'No admin user found. Please create admin/manager users first using Supabase Auth.';
    RAISE EXCEPTION 'Cannot insert attendance records without a valid user for scanned_by field';
  END IF;
END $$;

-- Delete existing attendance records for test workers
DELETE FROM public.attendance WHERE worker_id IN (SELECT id FROM public.workers WHERE employee_id LIKE 'EMP%');

-- For Aberaley Emalyn (6 days, 350 rate) - 2,100.00 total
-- Using recent dates so they show up in the dashboard
INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, status, scanned_by)
SELECT 
  w.id,
  CURRENT_DATE - (5 - generate_series) + interval '8 hours',
  CURRENT_DATE - (5 - generate_series) + interval '17 hours',
  8,
  'completed_quota',
  (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)
FROM public.workers w, generate_series(0, 5) 
WHERE w.employee_id = 'EMP001';

-- For Abaraley the Jon (6 days, 350 rate) - 2,100.00 total
INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, status, scanned_by)
SELECT 
  w.id,
  CURRENT_DATE - (5 - generate_series) + interval '8 hours',
  CURRENT_DATE - (5 - generate_series) + interval '17 hours',
  8,
  'completed_quota',
  (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)
FROM public.workers w, generate_series(0, 5) 
WHERE w.employee_id = 'EMP002';

-- For Abion Jimmy (6 days, 400 rate) - 2,400.00 total
INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, status, scanned_by)
SELECT 
  w.id,
  CURRENT_DATE - (5 - generate_series) + interval '8 hours',
  CURRENT_DATE - (5 - generate_series) + interval '17 hours',
  8,
  'completed_quota',
  (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)
FROM public.workers w, generate_series(0, 5) 
WHERE w.employee_id = 'EMP003';

-- For Abunda Bobby (6 days, 400 rate) - 2,400.00 total
INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, status, scanned_by)
SELECT 
  w.id,
  CURRENT_DATE - (5 - generate_series) + interval '8 hours',
  CURRENT_DATE - (5 - generate_series) + interval '17 hours',
  8,
  'completed_quota',
  (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)
FROM public.workers w, generate_series(0, 5) 
WHERE w.employee_id = 'EMP004';

-- For Abunda, Ronnie (6 days, 400 rate) - 2,400.00 total
INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, status, scanned_by)
SELECT 
  w.id,
  CURRENT_DATE - (5 - generate_series) + interval '8 hours',
  CURRENT_DATE - (5 - generate_series) + interval '17 hours',
  8,
  'completed_quota',
  (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)
FROM public.workers w, generate_series(0, 5) 
WHERE w.employee_id = 'EMP005';

-- For Alimbog, Gabby (4 days, 400 rate) - 2,150.00 total (includes overtime)
INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
SELECT 
  w.id,
  CURRENT_DATE - (3 - generate_series) + interval '8 hours',
  CURRENT_DATE - (3 - generate_series) + interval '19 hours',
  8,
  3,
  'completed_quota',
  (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)
FROM public.workers w, generate_series(0, 3) 
WHERE w.employee_id = 'EMP006';

-- For Alimbog, Jeric (6 days, 400 rate) - 2,400.00 total
INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, status, scanned_by)
SELECT 
  w.id,
  CURRENT_DATE - (5 - generate_series) + interval '8 hours',
  CURRENT_DATE - (5 - generate_series) + interval '17 hours',
  8,
  'completed_quota',
  (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)
FROM public.workers w, generate_series(0, 5) 
WHERE w.employee_id = 'EMP007';

-- For Benel Angan (7 days, 550 rate) - 4,725.00 total (includes overtime)
INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
SELECT 
  w.id,
  CURRENT_DATE - (6 - generate_series) + interval '8 hours',
  CURRENT_DATE - (6 - generate_series) + interval '19 hours',
  8,
  3,
  'completed_quota',
  (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)
FROM public.workers w, generate_series(0, 6) 
WHERE w.employee_id = 'EMP047';

-- For Yake jordan (2 days, 350 rate) - 800.00 total
INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, status, scanned_by)
SELECT 
  w.id,
  CURRENT_DATE - (1 - generate_series) + interval '8 hours',
  CURRENT_DATE - (1 - generate_series) + interval '17 hours',
  8,
  'completed_quota',
  (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)
FROM public.workers w, generate_series(0, 1) 
WHERE w.employee_id = 'EMP055';

COMMIT;

-- Verification query to check the data
SELECT 
  w.employee_id,
  w.full_name,
  w.daily_rate,
  w.standard_hours,
  COUNT(a.id) as days_worked,
  SUM(a.hours_worked) as total_hours,
  SUM(COALESCE(a.overtime_hours, 0)) as total_overtime,
  (COUNT(a.id) * w.daily_rate) as base_pay,
  (SUM(COALESCE(a.overtime_hours, 0)) * w.hourly_rate * 1.25) as overtime_pay,
  (COUNT(a.id) * w.daily_rate) + (SUM(COALESCE(a.overtime_hours, 0)) * w.hourly_rate * 1.25) as total_gross
FROM public.workers w
LEFT JOIN public.attendance a ON w.id = a.worker_id
WHERE w.employee_id IN ('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP047', 'EMP055')
GROUP BY w.id, w.employee_id, w.full_name, w.daily_rate, w.standard_hours, w.hourly_rate
ORDER BY w.employee_id;
