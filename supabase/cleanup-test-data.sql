-- ============================================================================
-- CLEANUP TEST DATA
-- ============================================================================
-- Use this to remove test workers (EMP001-EMP067) and their attendance records
-- Run this on the WRONG database where you accidentally inserted the data
-- ============================================================================

BEGIN;

-- Delete attendance records for test workers first (due to foreign key constraints)
DELETE FROM public.attendance 
WHERE worker_id IN (
  SELECT id FROM public.workers WHERE employee_id LIKE 'EMP%'
);

-- Delete test workers
DELETE FROM public.workers WHERE employee_id LIKE 'EMP%';

-- Verify deletion
SELECT 
  (SELECT COUNT(*) FROM public.workers WHERE employee_id LIKE 'EMP%') as remaining_test_workers,
  (SELECT COUNT(*) FROM public.attendance WHERE worker_id IN (SELECT id FROM public.workers WHERE employee_id LIKE 'EMP%')) as remaining_test_attendance;

COMMIT;

-- If you want to see what will be deleted before running, uncomment and run this first:
-- SELECT * FROM public.workers WHERE employee_id LIKE 'EMP%';
-- SELECT * FROM public.attendance WHERE worker_id IN (SELECT id FROM public.workers WHERE employee_id LIKE 'EMP%');
