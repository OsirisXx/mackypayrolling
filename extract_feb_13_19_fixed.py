import openpyxl
import re

wb_values = openpyxl.load_workbook('PLANTA-DON2-2026 (2).xlsx', data_only=True)
wb_formulas = openpyxl.load_workbook('PLANTA-DON2-2026 (2).xlsx', data_only=False)

ws_v = wb_values['FEB 13-19']
ws_f = wb_formulas['FEB 13-19']

print("=" * 80)
print("EXTRACTING FEB 13-19 DATA")
print("=" * 80)

workers_data = []

# Data starts at row 5, names in column C
for row in range(5, 90):
    employee_id = ws_v[f'B{row}'].value
    name = ws_v[f'C{row}'].value
    
    if not name or not isinstance(name, str):
        continue
    
    if 'COMMISION' in name or 'Name:' in name or 'TOTAL' in name:
        continue
    
    days = ws_v[f'L{row}'].value
    ot_hours = ws_v[f'M{row}'].value or 0
    ot_pay = ws_v[f'N{row}'].value or 0
    daily_rate = ws_v[f'O{row}'].value
    
    # Check columns P and Q for bonus/SSS
    col_p = ws_v[f'P{row}'].value or 0
    col_q = ws_v[f'Q{row}'].value or 0
    
    # Check formula for bonus in column P
    formula_P = ws_f[f'P{row}'].value
    bonus = 0
    sss = 0
    
    if formula_P and isinstance(formula_P, str):
        bonus_match = re.search(r'\+(\d+)$', formula_P)
        if bonus_match:
            bonus = int(bonus_match.group(1))
    
    # If col_p has value and it's different from calculated, it might be SSS
    if isinstance(col_p, (int, float)) and col_p > 0:
        # Check if it's SSS deduction (column header says "sss")
        if col_p > 100:  # SSS values are typically 560, 1060, etc.
            sss = col_p
    
    total = col_q
    
    if not days or not daily_rate or not total:
        continue
    
    workers_data.append({
        'row': row,
        'employee_id': employee_id,
        'name': name.strip(),
        'days': int(days) if days else 0,
        'ot_hours': int(ot_hours) if ot_hours else 0,
        'ot_pay': float(ot_pay) if ot_pay else 0,
        'daily_rate': int(daily_rate) if daily_rate else 0,
        'bonus': bonus,
        'sss': int(sss) if sss else 0,
        'total': float(total) if total else 0
    })

print(f"\nTotal workers: {len(workers_data)}")
print(f"Sum of all totals: ₱{sum(w['total'] for w in workers_data):,.2f}")

# Show workers with bonuses or SSS
print("\n" + "=" * 80)
print("WORKERS WITH BONUSES OR SSS:")
print("=" * 80)

workers_with_adjustments = [w for w in workers_data if w['bonus'] > 0 or w['sss'] > 0]
print(f"Found {len(workers_with_adjustments)} workers with bonuses/SSS\n")

for w in workers_with_adjustments:
    print(f"{w['name']}: Bonus=+{w['bonus']}, SSS=-{w['sss']}")

# Show first 10 workers for verification
print("\n" + "=" * 80)
print("FIRST 10 WORKERS:")
print("=" * 80)

for i, w in enumerate(workers_data[:10], 1):
    print(f"{i}. {w['name']}: {w['days']} days, {w['ot_hours']} OT hrs, Rate={w['daily_rate']}, Total=₱{w['total']:,.2f}")

print("\n" + "=" * 80)
print(f"Total bonuses: ₱{sum(w['bonus'] for w in workers_data):,.2f}")
print(f"Total SSS: ₱{sum(w['sss'] for w in workers_data):,.2f}")
print(f"Grand Total: ₱{sum(w['total'] for w in workers_data):,.2f}")
print("=" * 80)

# Save to file for SQL generation
with open('feb_13_19_data.txt', 'w', encoding='utf-8') as f:
    for w in workers_data:
        f.write(f"{w['name']}|{w['days']}|{w['ot_hours']}|{w['daily_rate']}|{w['bonus']}|{w['sss']}|{w['total']}\n")

print("\nData saved to feb_13_19_data.txt")
