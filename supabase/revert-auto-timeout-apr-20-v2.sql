-- ============================================================================
-- REVERT AUTO-TIMEOUT FOR APRIL 20, 2026 (v2 - broader match)
-- ============================================================================

-- First, see ALL records that were auto-timed out (any date)
SELECT 
    a.id,
    w.full_name,
    w.employee_id,
    a.clock_in AT TIME ZONE 'Asia/Manila' as clock_in_local,
    a.clock_out AT TIME ZONE 'Asia/Manila' as clock_out_local,
    a.hours_worked,
    a.status,
    a.notes
FROM public.attendance a
JOIN public.workers w ON a.worker_id = w.id
WHERE a.notes LIKE '%Auto-timed out%'
ORDER BY a.clock_in DESC;

-- Revert ALL auto-timed out records from today (April 20 Philippine time)
UPDATE public.attendance
SET 
    status = 'clocked_in',
    clock_out = NULL,
    hours_worked = NULL,
    overtime_hours = NULL,
    ot_clock_out = NULL,
    notes = NULL
WHERE notes LIKE '%Auto-timed out%'
  AND (clock_in AT TIME ZONE 'Asia/Manila')::date = '2026-04-20';

-- If the above didn't catch them, this broader version reverts ALL auto-timed out records
-- Uncomment the lines below if the first UPDATE didn't work:
-- UPDATE public.attendance
-- SET 
--     status = 'clocked_in',
--     clock_out = NULL,
--     hours_worked = NULL,
--     overtime_hours = NULL,
--     ot_clock_out = NULL,
--     notes = NULL
-- WHERE notes LIKE '%Auto-timed out%';

-- Verify: show all currently clocked_in workers
SELECT 
    a.id,
    w.full_name,
    w.employee_id,
    a.clock_in AT TIME ZONE 'Asia/Manila' as clock_in_local,
    a.status
FROM public.attendance a
JOIN public.workers w ON a.worker_id = w.id
WHERE a.status = 'clocked_in'
ORDER BY a.clock_in DESC;
