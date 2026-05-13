-- Create a unique partial index to ensure a worker can only have ONE 'clocked_in' record at a time.
-- This natively prevents "dual IN" records in case of unstable internet or accidental duplicate requests.

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_attendance 
ON public.attendance(worker_id) 
WHERE status = 'clocked_in';
