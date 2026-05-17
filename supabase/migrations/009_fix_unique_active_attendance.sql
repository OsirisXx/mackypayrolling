-- Drop the old flawed index that included soft-deleted records
DROP INDEX IF EXISTS idx_unique_active_attendance;

-- Create the new partial index that ignores soft-deleted records
CREATE UNIQUE INDEX idx_unique_active_attendance 
ON public.attendance(worker_id) 
WHERE status = 'clocked_in' AND deleted_at IS NULL;
