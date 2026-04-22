-- Diagnose: records where clock_in and clock_out are the same (or within 1 minute)
-- Looking at April 22, 2026

SELECT 
    a.id,
    w.full_name,
    w.employee_id,
    a.clock_in AT TIME ZONE 'Asia/Manila' as clock_in_local,
    a.clock_out AT TIME ZONE 'Asia/Manila' as clock_out_local,
    EXTRACT(EPOCH FROM (a.clock_out - a.clock_in)) / 60 as minutes_between,
    a.hours_worked,
    a.overtime_hours,
    a.status,
    a.notes
FROM public.attendance a
JOIN public.workers w ON a.worker_id = w.id
WHERE (a.clock_in AT TIME ZONE 'Asia/Manila')::date = '2026-04-22'
ORDER BY a.clock_in DESC;
