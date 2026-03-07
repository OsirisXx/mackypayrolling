-- Clear existing Feb 6-12 bonuses and re-insert
-- Use this if you need to update the bonuses

BEGIN;

-- Delete existing Feb 6-12 adjustments
DELETE FROM public.payroll_adjustments
WHERE period_start = '2026-02-06' AND period_end = '2026-02-12';

-- Bacol, Vivian (EMP001)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 560
FROM public.workers WHERE employee_id = 'EMP001';

-- Ylagan Robert (EMP002)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 100, 1060
FROM public.workers WHERE employee_id = 'EMP002';

-- Angan, e (EMP011)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP011';

-- Arnesx Sarinao (EMP012)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP012';

-- Baculio Daren (EMP014)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP014';

-- Baculio Rosito (EMP015)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP015';

-- Balbuena Randy (EMP016)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP016';

-- Bulak, Alvin (EMP017)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP017';

-- Bulak Marvin (EMP018)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP018';

-- Bulak Melvin (EMP019)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP019';

-- Bulak Norvin (EMP020)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP020';

-- Cabornay, Celio (EMP021)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP021';

-- Curbo Regie (EMP024)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 100, 0
FROM public.workers WHERE employee_id = 'EMP024';

-- Decaso Jclaid (EMP026)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP026';

-- Espina Aida (EMP027)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 100, 0
FROM public.workers WHERE employee_id = 'EMP027';

-- Funa, Muela (EMP029)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP029';

-- Pagayon jason (EMP034)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP034';

-- Renel Angan (EMP035)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP035';

-- Lastimosa Ricky (EMP036)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 100, 0
FROM public.workers WHERE employee_id = 'EMP036';

-- Salait Ariel (EMP039)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP039';

-- Dagpong crist (EMP048)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP048';

-- sagansan renie (EMP050)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP050';

-- yUnson niper (EMP054)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 100, 0
FROM public.workers WHERE employee_id = 'EMP054';

-- Camahay Diego (EMP058)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP058';

-- Lan-ayan Renemee (EMP061)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP061';

-- Gonhay Jemmuel (EMP062)
INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)
SELECT id, '2026-02-06', '2026-02-12', 50, 0
FROM public.workers WHERE employee_id = 'EMP062';

COMMIT;

-- Verify the inserts
SELECT 
  w.employee_id,
  w.full_name,
  pa.bonus,
  pa.sss_deduction,
  pa.period_start,
  pa.period_end
FROM public.payroll_adjustments pa
JOIN public.workers w ON w.id = pa.worker_id
WHERE pa.period_start = '2026-02-06'
ORDER BY w.employee_id;

SELECT 'Inserted ' || COUNT(*) || ' payroll adjustments for Feb 6-12, 2026' as status
FROM public.payroll_adjustments
WHERE period_start = '2026-02-06' AND period_end = '2026-02-12';
