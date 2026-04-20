-- Check if there are ANY attendance records from April 20, 2026
SELECT 
    a.id,
    w.full_name,
    w.employee_id,
    a.clock_in AT TIME ZONE 'Asia/Manila' as clock_in_local,
    a.clock_out AT TIME ZONE 'Asia/Manila' as clock_out_local,
    a.status,
    a.notes
FROM public.attendance a
JOIN public.workers w ON a.worker_id = w.id
WHERE (a.clock_in AT TIME ZONE 'Asia/Manila')::date = '2026-04-20'
ORDER BY a.clock_in DESC;
