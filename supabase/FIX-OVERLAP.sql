-- FIX OVERLAPPING ATTENDANCE DATA
-- The Feb 13-19 import created records that overlap with Feb 6-12

-- Check current state
SELECT 
  'Feb 6-12' as period,
  COUNT(*) as records
FROM attendance 
WHERE clock_in >= '2026-02-06' AND clock_in < '2026-02-13'
UNION ALL
SELECT 
  'Feb 13-19' as period,
  COUNT(*) as records
FROM attendance 
WHERE clock_in >= '2026-02-13' AND clock_in < '2026-02-20';

-- The issue: Feb 6-12 period should only include dates Feb 6-12
-- Feb 13-19 period should only include dates Feb 13-19
-- But the 14-day query window was pulling both together

-- No data fix needed - the PayrollPage.tsx code has been fixed
-- to use exact period dates instead of 14-day window

-- Verify the fix by checking attendance counts per date
SELECT 
  DATE(clock_in) as date,
  COUNT(*) as records
FROM attendance
WHERE clock_in >= '2026-02-06' AND clock_in < '2026-02-20'
GROUP BY DATE(clock_in)
ORDER BY date;
