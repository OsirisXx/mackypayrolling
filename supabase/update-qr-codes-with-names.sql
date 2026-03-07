-- Update existing workers' QR codes to include their names and employee IDs
-- This will regenerate QR codes in JSON format with worker information
-- Run this in Supabase SQL Editor

UPDATE public.workers
SET qr_code = json_build_object(
  'id', qr_code,
  'name', full_name,
  'employeeId', employee_id
)::text
WHERE qr_code NOT LIKE '{%'  -- Only update if not already in JSON format
  AND qr_code LIKE 'WRK-%';   -- Only update valid worker QR codes

-- Verify the update
SELECT 
  employee_id,
  full_name,
  qr_code,
  CASE 
    WHEN qr_code LIKE '{%' THEN 'JSON Format ✓'
    ELSE 'Old Format'
  END as format_status
FROM public.workers
ORDER BY employee_id;
