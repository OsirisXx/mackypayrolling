-- COMPLETE IMPORT FOR FEB 13-19, 2026
-- Period: Feb 13-19, 2026 (Thursday to Wednesday)
-- Total Workers: 67
-- Grand Total: ₱172,875.00

BEGIN;

-- ============================================================================
-- STEP 1: Clear existing data for this period
-- ============================================================================

DELETE FROM public.attendance 
WHERE clock_in >= '2026-02-13'::date 
AND clock_in < '2026-02-20'::date;

DELETE FROM public.payroll_adjustments
WHERE period_start = '2026-02-13'::date 
AND period_end = '2026-02-19'::date;

-- ============================================================================
-- STEP 2: Insert attendance records for all workers
-- ============================================================================

DO $$
DECLARE
  admin_user_id UUID;
  worker_id UUID;
  day_count INT;
  ot_per_day NUMERIC;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id FROM public.users WHERE role = 'admin' LIMIT 1;
  
  -- Bacol, Vivian: 7 days, 21 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Bacol%Vivian%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..6 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 3.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Ylagan Robert: 7 days, 15 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Ylagan%Robert%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..6 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 2.1, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Abaday Emelyn: 6 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Abaday%Emelyn%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..5 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Abaday Ike Jun: 6 days, 12 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Abaday%Ike%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..5 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 2.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Absin Jimmy: 4 days, 10 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Absin%Jimmy%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..3 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 2.5, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Abunda Bobby: 6 days, 24 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Abunda%Bobby%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..5 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 4.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Abunda, Renjay: 4 days, 19 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Abunda%Renjay%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..3 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 4.8, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Alimbog , Gabby: 4 days, 11 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Alimbog%Gabby%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..3 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 2.8, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Alimbog , jhon: 6 days, 8 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Alimbog%jhon%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..5 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 1.3, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Alimbog Hilbert: 5 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Alimbog%Hilbert%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Alimbog, Livy: 5 days, 7 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Alimbog%Livy%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 1.4, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Alimbog,marque: 6 days, 4 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Alimbogmarque%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..5 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.7, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Amoncio,Jendel: 5 days, 8 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%AmoncioJendel%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 1.6, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Andaol Zerbi: 7 days, 20 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Andaol%Zerbi%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..6 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 2.9, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Angan, e: 7 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Angan%e%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..6 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Arnesx Sarinao: 6 days, 8 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Arnesx%Sarinao%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..5 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 1.3, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Atlawan, jimboy: 7 days, 15 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Atlawan%jimboy%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..6 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 2.1, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Baculio Daren: 5 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Baculio%Daren%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Baculio Rosito: 7 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Baculio%Rosito%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..6 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Balbuena Randy: 5 days, 12 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Balbuena%Randy%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 2.4, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- bayantong Edgar: 5 days, 26 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%bayantong%Edgar%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 5.2, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Bulak Marvin: 7 days, 32 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Bulak%Marvin%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..6 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 4.6, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Bulak Melvin: 6 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Bulak%Melvin%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..5 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Bulak Norvin: 4 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Bulak%Norvin%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..3 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Bulak, Alvin: 7 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Bulak%Alvin%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..6 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Cabornay, Celio: 7 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Cabornay%Celio%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..6 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Camahay Diego: 6 days, 14 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Camahay%Diego%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..5 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 2.3, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Cartahan , Kevin: 6 days, 8 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Cartahan%Kevin%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..5 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 1.3, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Conahan,Aaron: 4 days, 11 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%ConahanAaron%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..3 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 2.8, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Curbo Regie: 5 days, 11 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Curbo%Regie%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 2.2, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Dagalia Cruz Popoy: 5 days, 4 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Dagalia%Cruz%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.8, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Dagpong crist: 5 days, 4 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Dagpong%crist%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.8, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Datuin James: 6 days, 20 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Datuin%James%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..5 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 3.3, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Decaso Jclaid: 6 days, 28 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Decaso%Jclaid%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..5 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 4.7, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Espina Aida: 5 days, 8 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Espina%Aida%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 1.6, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Felizarda,Lintacan: 6 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%FelizardaLintacan%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..5 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Funa, Muela: 7 days, 21 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Funa%Muela%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..6 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 3.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Gonhay Jemmuel: 5 days, 6 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Gonhay%Jemmuel%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 1.2, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Guilan MEnard: 4 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Guilan%MEnard%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..3 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Lan ayan Raul: 5 days, 26 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Lan%ayan%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 5.2, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Lan-ayan Renemee: 5 days, 8 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Lan-ayan%Renemee%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 1.6, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Lastimosa Ricky: 5 days, 16 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Lastimosa%Ricky%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 3.2, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Mahunyag, christ: 5 days, 7 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Mahunyag%christ%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 1.4, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Marjunel Angan: 5 days, 8 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Marjunel%Angan%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 1.6, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Pagayod Beebth: 5 days, 2 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Pagayod%Beebth%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.4, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Pagayon jason: 4 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Pagayon%jason%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..3 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Pagayon Joanrd: 5 days, 6 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Pagayon%Joanrd%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 1.2, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Renel Angan: 7 days, 12 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Renel%Angan%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..6 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 1.7, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Sagansan Jerry: 7 days, 20 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Sagansan%Jerry%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..6 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 2.9, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- sagansan renie: 6 days, 19 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%sagansan%renie%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..5 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 3.2, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Sagansan, Dexter: 4 days, 2 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Sagansan%Dexter%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..3 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.5, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Salait Ariel: 7 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Salait%Ariel%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..6 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Sandalan jevin: 6 days, 24 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Sandalan%jevin%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..5 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 4.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Sumayan Roland: 3 days, 11 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Sumayan%Roland%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..2 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 3.7, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- ubanan Enel: 5 days, 6 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%ubanan%Enel%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 1.2, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Yake jordan: 2 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Yake%jordan%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..1 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Yake rodonio: 5 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Yake%rodonio%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Yanuhon JOvil: 4 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Yanuhon%JOvil%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..3 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Yunson Alfred: 5 days, 14 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Yunson%Alfred%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..4 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 2.8, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Yunson niper: 6 days, 28 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Yunson%niper%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..5 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 4.7, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Alimbog,Rolly: 4 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%AlimbogRolly%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..3 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Francisco, Mark: 4 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Francisco%Mark%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..3 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Alimbog, Alquin: 4 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Alimbog%Alquin%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..3 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Igot, Marani: 3 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Igot%Marani%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..2 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Lagnas, Jovan: 3 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Lagnas%Jovan%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..2 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Catuan, Ryan: 4 days, 8 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Catuan%Ryan%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..3 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 2.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
  -- Tumantan, Roalndo: 4 days, 0 OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '%Tumantan%Roalndo%' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..3 LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, 0.0, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
END $$;

-- ============================================================================
-- STEP 3: Insert bonuses and SSS deductions
-- ============================================================================

INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT w.id, '2026-02-13'::date, '2026-02-19'::date, 50, 560 FROM public.workers w WHERE w.full_name ILIKE '%Bacol%Vivian%' LIMIT 1
UNION ALL
SELECT w.id, '2026-02-13'::date, '2026-02-19'::date, 0, 1060 FROM public.workers w WHERE w.full_name ILIKE '%Ylagan%Robert%' LIMIT 1;

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

-- Sample workers verification
SELECT 
  w.full_name,
  COUNT(a.id) as days,
  SUM(a.overtime_hours) as total_ot,
  w.daily_rate,
  COALESCE(pa.bonus, 0) as bonus,
  COALESCE(pa.sss_deduction, 0) as sss
FROM public.workers w
LEFT JOIN public.attendance a ON a.worker_id = w.id 
  AND a.clock_in >= '2026-02-13'::date 
  AND a.clock_in < '2026-02-20'::date
LEFT JOIN public.payroll_adjustments pa ON pa.worker_id = w.id 
  AND pa.period_start = '2026-02-13'::date
WHERE w.full_name ILIKE '%Bacol%' OR w.full_name ILIKE '%Ylagan%' OR w.full_name ILIKE '%Abaday%'
GROUP BY w.id, w.full_name, w.daily_rate, pa.bonus, pa.sss_deduction
ORDER BY w.full_name
LIMIT 5;
