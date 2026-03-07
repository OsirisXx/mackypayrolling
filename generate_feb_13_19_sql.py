import re

# Read the extracted data
with open('feb_13_19_data.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()[1:]  # Skip header

workers = []
for line in lines:
    parts = line.strip().split('|')
    if len(parts) == 7:
        workers.append({
            'name': parts[0],
            'days': int(parts[1]),
            'ot_hours': int(parts[2]),
            'daily_rate': int(parts[3]),
            'bonus': int(parts[4]),
            'sss': int(parts[5]),
            'total': float(parts[6])
        })

print(f"Generating SQL for {len(workers)} workers...")

# Generate SQL
sql = """-- COMPLETE IMPORT FOR FEB 13-19, 2026
-- Period: Feb 13-19, 2026 (Thursday to Wednesday)
-- Total Workers: {total_workers}
-- Grand Total: ₱{grand_total:,.2f}

BEGIN;

-- ============================================================================
-- STEP 1: Clear existing data for this period
-- ============================================================================

DELETE FROM public.attendance 
WHERE clock_in >= '2026-02-13'::date 
AND clock_in < '2026-02-20'::date;

DELETE FROM public.payroll_adjustments
WHERE period_start = '2026-02-13'::date 
AND period_end = '2026-02-19'::date;

-- ============================================================================
-- STEP 2: Insert attendance records for all workers
-- ============================================================================

DO $$
DECLARE
  admin_user_id UUID;
  worker_id UUID;
  day_count INT;
  ot_per_day NUMERIC;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id FROM public.users WHERE role = 'admin' LIMIT 1;
  
""".format(
    total_workers=len(workers),
    grand_total=sum(w['total'] for w in workers)
)

# Generate attendance inserts for each worker
for w in workers:
    # Clean name for SQL ILIKE search
    name_parts = w['name'].replace(',', '').split()
    search_pattern = '%' + '%'.join(name_parts[:2]) + '%'
    
    ot_per_day = round(w['ot_hours'] / w['days'], 1) if w['days'] > 0 else 0
    
    sql += f"""  -- {w['name']}: {w['days']} days, {w['ot_hours']} OT hours
  SELECT id INTO worker_id FROM public.workers WHERE full_name ILIKE '{search_pattern}' LIMIT 1;
  IF worker_id IS NOT NULL THEN
    FOR day_count IN 0..{w['days']-1} LOOP
      INSERT INTO public.attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (worker_id, '2026-02-13'::date + day_count, '2026-02-13'::date + day_count + interval '17 hours', 8, {ot_per_day}, 'completed_quota', admin_user_id);
    END LOOP;
  END IF;
  
"""

sql += """END $$;

-- ============================================================================
-- STEP 3: Insert bonuses and SSS deductions
-- ============================================================================

"""

# Generate bonus/SSS inserts
workers_with_adjustments = [w for w in workers if w['bonus'] > 0 or w['sss'] > 0]
if workers_with_adjustments:
    sql += "INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)\n"
    
    insert_parts = []
    for w in workers_with_adjustments:
        name_parts = w['name'].replace(',', '').split()
        search_pattern = '%' + '%'.join(name_parts[:2]) + '%'
        insert_parts.append(f"SELECT w.id, '2026-02-13'::date, '2026-02-19'::date, {w['bonus']}, {w['sss']} FROM public.workers w WHERE w.full_name ILIKE '{search_pattern}' LIMIT 1")
    
    sql += "\nUNION ALL\n".join(insert_parts)
    sql += ";\n"

sql += """
COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 
  'Feb 13-19 Attendance Check' as check_type,
  COUNT(*) as total_attendance_records,
  COUNT(DISTINCT worker_id) as unique_workers
FROM public.attendance
WHERE clock_in >= '2026-02-13'::date 
AND clock_in < '2026-02-20'::date;

SELECT 
  'Feb 13-19 Adjustments Check' as check_type,
  COUNT(*) as adjustment_records,
  SUM(bonus) as total_bonuses,
  SUM(sss_deduction) as total_sss
FROM public.payroll_adjustments
WHERE period_start = '2026-02-13'::date 
AND period_end = '2026-02-19'::date;

-- Sample workers verification
SELECT 
  w.full_name,
  COUNT(a.id) as days,
  SUM(a.overtime_hours) as total_ot,
  w.daily_rate,
  COALESCE(pa.bonus, 0) as bonus,
  COALESCE(pa.sss_deduction, 0) as sss
FROM public.workers w
LEFT JOIN public.attendance a ON a.worker_id = w.id 
  AND a.clock_in >= '2026-02-13'::date 
  AND a.clock_in < '2026-02-20'::date
LEFT JOIN public.payroll_adjustments pa ON pa.worker_id = w.id 
  AND pa.period_start = '2026-02-13'::date
WHERE w.full_name ILIKE '%Bacol%' OR w.full_name ILIKE '%Ylagan%' OR w.full_name ILIKE '%Abaday%'
GROUP BY w.id, w.full_name, w.daily_rate, pa.bonus, pa.sss_deduction
ORDER BY w.full_name
LIMIT 5;
"""

# Write to file
with open('supabase/COMPLETE-FEB-13-19.sql', 'w', encoding='utf-8') as f:
    f.write(sql)

print(f"✓ SQL generated: supabase/COMPLETE-FEB-13-19.sql")
print(f"  - {len(workers)} workers")
print(f"  - {len(workers_with_adjustments)} workers with bonuses/SSS")
print(f"  - Grand Total: ₱{sum(w['total'] for w in workers):,.2f}")
