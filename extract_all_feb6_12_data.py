import openpyxl

wb_values = openpyxl.load_workbook('PLANTA-DON2-2026 (2).xlsx', data_only=True)
wb_formulas = openpyxl.load_workbook('PLANTA-DON2-2026 (2).xlsx', data_only=False)

ws_v = wb_values['feb 6-12']
ws_f = wb_formulas['feb 6-12']

print("=" * 80)
print("EXTRACTING ALL FEB 6-12 DATA WITH BONUSES AND SSS")
print("=" * 80)

workers_data = []

for row in range(4, 69):
    employee_id = ws_v[f'A{row}'].value
    name = ws_v[f'B{row}'].value
    
    if not name or name == 'COMMISION SCHEDULE':
        continue
    
    days = ws_v[f'K{row}'].value
    ot_hours = ws_v[f'L{row}'].value or 0
    ot_pay = ws_v[f'M{row}'].value or 0
    daily_rate = ws_v[f'N{row}'].value
    sss = ws_v[f'O{row}'].value or 0
    total = ws_v[f'Q{row}'].value
    
    # Check formula for bonus
    formula_P = ws_f[f'P{row}'].value
    bonus = 0
    if formula_P and isinstance(formula_P, str):
        # Extract bonus from formula like "=K4*N4+M4+50"
        import re
        bonus_match = re.search(r'\+(\d+)$', formula_P)
        if bonus_match:
            bonus = int(bonus_match.group(1))
    
    workers_data.append({
        'row': row,
        'employee_id': employee_id,
        'name': name,
        'days': days,
        'ot_hours': ot_hours,
        'ot_pay': ot_pay,
        'daily_rate': daily_rate,
        'bonus': bonus,
        'sss': sss,
        'total': total
    })

print(f"\nTotal workers: {len(workers_data)}")

# Show workers with bonuses or SSS
print("\n" + "=" * 80)
print("WORKERS WITH BONUSES OR SSS DEDUCTIONS:")
print("=" * 80)

for w in workers_data:
    if w['bonus'] > 0 or w['sss'] > 0:
        print(f"{w['name']}: Bonus=+{w['bonus']}, SSS=-{w['sss']}, Total={w['total']}")

# Calculate totals
total_bonuses = sum(w['bonus'] for w in workers_data)
total_sss = sum(w['sss'] for w in workers_data)
total_pay = sum(w['total'] for w in workers_data if w['total'])

print(f"\n" + "=" * 80)
print(f"Total Bonuses: ₱{total_bonuses}")
print(f"Total SSS: ₱{total_sss}")
print(f"Grand Total: ₱{total_pay}")
print("=" * 80)

# Generate SQL INSERT statements for payroll_adjustments
print("\n" + "=" * 80)
print("SQL INSERT STATEMENTS FOR BONUSES/SSS:")
print("=" * 80)
print("\n-- Insert payroll adjustments for Feb 6-12, 2026")

for w in workers_data:
    if w['bonus'] > 0 or w['sss'] > 0:
        # Map employee_id to EMP code
        emp_code = f"EMP{str(w['employee_id']).zfill(3)}" if w['employee_id'] else None
        if emp_code:
            print(f"-- {w['name']}")
            print(f"INSERT INTO public.payroll_adjustments (worker_id, period_start, period_end, bonus, sss_deduction)")
            print(f"SELECT id, '2026-02-06', '2026-02-12', {w['bonus']}, {w['sss']}")
            print(f"FROM public.workers WHERE employee_id = '{emp_code}';")
            print()
