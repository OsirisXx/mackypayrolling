#!/usr/bin/env python3
# Generate clean SQL for Feb 13-19 import

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
            'sss': int(parts[5])
        })

print(f"Generating SQL for {len(workers)} workers...")

# Start SQL
sql = """-- FEB 13-19 COMPLETE IMPORT
-- 67 workers, Grand Total: 172,875.00

BEGIN;

DELETE FROM attendance WHERE clock_in >= '2026-02-13' AND clock_in < '2026-02-20';
DELETE FROM payroll_adjustments WHERE period_start = '2026-02-13' AND period_end = '2026-02-19';

DO $$
DECLARE
  admin_id UUID;
  w_id UUID;
BEGIN
  SELECT id INTO admin_id FROM users WHERE role = 'admin' LIMIT 1;
  
"""

# Generate attendance for each worker
for w in workers:
    name_search = w['name'].replace(',', '').replace("'", "''")
    parts = name_search.split()
    search = f"%{parts[0]}%" if len(parts) > 0 else "%"
    if len(parts) > 1:
        search = f"%{parts[0]}%{parts[1]}%"
    
    ot_per_day = round(w['ot_hours'] / w['days'], 1) if w['days'] > 0 else 0
    
    sql += f"""  -- {w['name']}: {w['days']} days
  SELECT id INTO w_id FROM workers WHERE full_name ILIKE '{search}' LIMIT 1;
  IF w_id IS NOT NULL THEN
    FOR i IN 0..{w['days']-1} LOOP
      INSERT INTO attendance (worker_id, clock_in, clock_out, hours_worked, overtime_hours, status, scanned_by)
      VALUES (w_id, '2026-02-13'::date + i, '2026-02-13'::date + i + interval '17 hours', 8, {ot_per_day}, 'completed_quota', admin_id);
    END LOOP;
  END IF;
  
"""

sql += "END $$;\n\n"

# Generate bonuses/SSS
bonus_workers = [w for w in workers if w['bonus'] > 0 or w['sss'] > 0]
if bonus_workers:
    sql += "-- Insert bonuses and SSS deductions\n"
    sql += "INSERT INTO payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)\n"
    
    selects = []
    for w in bonus_workers:
        name_search = w['name'].replace(',', '').replace("'", "''")
        parts = name_search.split()
        search = f"%{parts[0]}%" if len(parts) > 0 else "%"
        if len(parts) > 1:
            search = f"%{parts[0]}%{parts[1]}%"
        
        selects.append(f"SELECT w.id, '2026-02-13'::date, '2026-02-19'::date, {w['bonus']}, {w['sss']} FROM workers w WHERE w.full_name ILIKE '{search}' LIMIT 1")
    
    sql += "\n".join(selects[0:1])  # First select without UNION
    for select in selects[1:]:
        sql += "\nUNION ALL\n" + select
    sql += ";\n\n"

sql += """
COMMIT;

SELECT COUNT(*) as records FROM attendance WHERE clock_in >= '2026-02-13' AND clock_in < '2026-02-20';
SELECT COUNT(*) as adjustments FROM payroll_adjustments WHERE period_start = '2026-02-13';
"""

# Write to file
with open('supabase/FEB-13-19-FINAL.sql', 'w', encoding='utf-8') as f:
    f.write(sql)

print(f"Generated: supabase/FEB-13-19-FINAL.sql")
print(f"  - {len(workers)} workers")
print(f"  - {len(bonus_workers)} with bonuses/SSS")
