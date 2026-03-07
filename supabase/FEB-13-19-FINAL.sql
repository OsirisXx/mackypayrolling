-- FEB 13-19 COMPLETE IMPORT
-- 67 workers, Grand Total: 172,875.00

BEGIN;

DELETE FROM attendance WHERE clock_in >= '2026-02-13' AND clock_in < '2026-02-20';
DELETE FROM payroll_adjustments WHERE period_start = '2026-02-13' AND period_end = '2026-02-19';

DO $$
DECLARE
  admin_id UUID;
  w_id UUID;
BEGIN
  SELECT id INTO admin_id FROM users WHERE role = 'admin' LIMIT 1;
  
  -- Bacol, Vivian: 7 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Bacol%Vivian%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..6 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 3.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Ylagan Robert: 7 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Ylagan%Robert%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..6 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 2.1, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Abaday Emelyn: 6 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Abaday%Emelyn%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..5 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Abaday Ike Jun: 6 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Abaday%Ike%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..5 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 2.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Absin Jimmy: 4 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Absin%Jimmy%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..3 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 2.5, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Abunda Bobby: 6 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Abunda%Bobby%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..5 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 4.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Abunda, Renjay: 4 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Abunda%Renjay%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..3 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 4.8, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Alimbog , Gabby: 4 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Alimbog%Gabby%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..3 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 2.8, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Alimbog , jhon: 6 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Alimbog%jhon%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..5 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 1.3, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Alimbog Hilbert: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Alimbog%Hilbert%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Alimbog, Livy: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Alimbog%Livy%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 1.4, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Alimbog,marque: 6 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Alimbogmarque%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..5 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.7, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Amoncio,Jendel: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%AmoncioJendel%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 1.6, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Andaol Zerbi: 7 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Andaol%Zerbi%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..6 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 2.9, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Angan, e: 7 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Angan%e%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..6 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Arnesx Sarinao: 6 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Arnesx%Sarinao%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..5 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 1.3, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Atlawan, jimboy: 7 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Atlawan%jimboy%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..6 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 2.1, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Baculio Daren: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Baculio%Daren%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Baculio Rosito: 7 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Baculio%Rosito%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..6 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Balbuena Randy: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Balbuena%Randy%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 2.4, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- bayantong Edgar: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%bayantong%Edgar%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 5.2, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Bulak Marvin: 7 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Bulak%Marvin%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..6 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 4.6, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Bulak Melvin: 6 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Bulak%Melvin%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..5 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Bulak Norvin: 4 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Bulak%Norvin%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..3 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Bulak, Alvin: 7 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Bulak%Alvin%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..6 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Cabornay, Celio: 7 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Cabornay%Celio%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..6 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Camahay Diego: 6 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Camahay%Diego%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..5 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 2.3, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Cartahan , Kevin: 6 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Cartahan%Kevin%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..5 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 1.3, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Conahan,Aaron: 4 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%ConahanAaron%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..3 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 2.8, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Curbo Regie: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Curbo%Regie%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 2.2, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Dagalia Cruz Popoy: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Dagalia%Cruz%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.8, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Dagpong crist: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Dagpong%crist%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.8, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Datuin James: 6 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Datuin%James%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..5 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 3.3, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Decaso Jclaid: 6 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Decaso%Jclaid%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..5 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 4.7, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Espina Aida: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Espina%Aida%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 1.6, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Felizarda,Lintacan: 6 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%FelizardaLintacan%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..5 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Funa, Muela: 7 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Funa%Muela%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..6 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 3.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Gonhay Jemmuel: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Gonhay%Jemmuel%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 1.2, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Guilan MEnard: 4 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Guilan%MEnard%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..3 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Lan ayan Raul: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Lan%ayan%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 5.2, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Lan-ayan Renemee: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Lan-ayan%Renemee%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 1.6, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Lastimosa Ricky: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Lastimosa%Ricky%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 3.2, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Mahunyag, christ: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Mahunyag%christ%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 1.4, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Marjunel Angan: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Marjunel%Angan%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 1.6, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Pagayod Beebth: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Pagayod%Beebth%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.4, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Pagayon jason: 4 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Pagayon%jason%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..3 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Pagayon Joanrd: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Pagayon%Joanrd%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 1.2, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Renel Angan: 7 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Renel%Angan%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..6 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 1.7, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Sagansan Jerry: 7 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Sagansan%Jerry%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..6 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 2.9, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- sagansan renie: 6 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%sagansan%renie%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..5 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 3.2, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Sagansan, Dexter: 4 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Sagansan%Dexter%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..3 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.5, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Salait Ariel: 7 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Salait%Ariel%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..6 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Sandalan jevin: 6 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Sandalan%jevin%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..5 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 4.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Sumayan Roland: 3 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Sumayan%Roland%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..2 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 3.7, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- ubanan Enel: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%ubanan%Enel%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 1.2, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Yake jordan: 2 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Yake%jordan%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..1 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Yake rodonio: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Yake%rodonio%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Yanuhon JOvil: 4 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Yanuhon%JOvil%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..3 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Yunson Alfred: 5 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Yunson%Alfred%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..4 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 2.8, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Yunson niper: 6 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Yunson%niper%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..5 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 4.7, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Alimbog,Rolly: 4 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%AlimbogRolly%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..3 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Francisco, Mark: 4 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Francisco%Mark%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..3 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Alimbog, Alquin: 4 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Alimbog%Alquin%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..3 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Igot, Marani: 3 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Igot%Marani%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..2 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Lagnas, Jovan: 3 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Lagnas%Jovan%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..2 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Catuan, Ryan: 4 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Catuan%Ryan%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..3 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 2.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
  -- Tumantan, Roalndo: 4 days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '%Tumantan%Roalndo%' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..3 LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, 0.0, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
END $$;

-- Insert bonuses and SSS deductions
INSERT INTO payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT w.id, '2026-02-13'::date, '2026-02-19'::date, 50, 560 FROM workers w WHERE w.full_name ILIKE '%Bacol%Vivian%' LIMIT 1
UNION ALL
SELECT w.id, '2026-02-13'::date, '2026-02-19'::date, 0, 1060 FROM workers w WHERE w.full_name ILIKE '%Ylagan%Robert%' LIMIT 1;


COMMIT;

SELECT COUNT(*) as records FROM attendance WHERE clock_in >= '2026-02-13' AND clock_in < '2026-02-20';
SELECT COUNT(*) as adjustments FROM payroll_adjustments WHERE period_start = '2026-02-13';
