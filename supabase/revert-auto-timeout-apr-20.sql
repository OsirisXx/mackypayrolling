-- ============================================================================
-- REVERT AUTO-TIMEOUT FOR APRIL 20, 2026
-- ============================================================================
-- This script reverts all attendance records that were incorrectly auto-timed
-- out on April 20, 2026. It restores them to 'clocked_in' status so workers
-- appear as currently working again.
-- ============================================================================

-- First, let's see what we're about to fix
SELECT 
    a.id,
    w.full_name,
    w.employee_id,
    a.clock_in,
    a.clock_out,
    a.hours_worked,
    a.overtime_hours,
    a.ot_clock_in,
    a.ot_clock_out,
    a.status,
    a.notes
FROM public.attendance a
JOIN public.workers w ON a.worker_id = w.id
WHERE a.clock_in >= '2026-04-20 00:00:00+00'
  AND a.clock_in < '2026-04-21 00:00:00+00'
  AND a.notes LIKE '%Auto-timed out%'
ORDER BY w.full_name;

-- Revert: set them back to clocked_in, clear auto-generated fields
UPDATE public.attendance
SET 
    status = 'clocked_in',
    clock_out = NULL,
    hours_worked = NULL,
    ot_clock_out = NULL,
    notes = NULL
WHERE clock_in >= '2026-04-20 00:00:00+00'
  AND clock_in < '2026-04-21 00:00:00+00'
  AND notes LIKE '%Auto-timed out%';

-- Verify the fix
SELECT 
    a.id,
    w.full_name,
    w.employee_id,
    a.clock_in,
    a.clock_out,
    a.status,
    a.notes
FROM public.attendance a
JOIN public.workers w ON a.worker_id = w.id
WHERE a.clock_in >= '2026-04-20 00:00:00+00'
  AND a.clock_in < '2026-04-21 00:00:00+00'
  AND a.status = 'clocked_in'
ORDER BY w.full_name;
