import openpyxl
import re

wb_formulas = openpyxl.load_workbook('PLANTA-DON2-2026 (1).xlsx', data_only=False)
wb_values = openpyxl.load_workbook('PLANTA-DON2-2026 (1).xlsx', data_only=True)

ws_f = wb_formulas['feb 6-12']
ws_v = wb_values['feb 6-12']

print("=" * 80)
print("FINDING ALL BONUSES IN FEB 6-12")
print("=" * 80)

bonuses_found = []

for row in range(4, 69):
    name = ws_v[f'B{row}'].value
    if not name or name == 'COMMISION SCHEDULE':
        continue
    
    formula_P = ws_f[f'P{row}'].value
    
    if formula_P and isinstance(formula_P, str):
        # Look for +number pattern
        bonus_match = re.search(r'\+(\d+)', formula_P)
        if bonus_match:
            bonus_amount = int(bonus_match.group(1))
            employee_id = ws_v[f'A{row}'].value
            total = ws_v[f'Q{row}'].value
            
            bonuses_found.append({
                'row': row,
                'employee_id': employee_id,
                'name': name,
                'bonus': bonus_amount,
                'formula': formula_P,
                'total': total
            })

print(f"\nFound {len(bonuses_found)} workers with bonuses:\n")

total_bonuses = 0
for b in bonuses_found:
    print(f"Row {b['row']}: {b['name']} (ID: {b['employee_id']})")
    print(f"  Bonus: +{b['bonus']}")
    print(f"  Formula: {b['formula']}")
    print(f"  Total: ₱{b['total']}")
    print()
    total_bonuses += b['bonus']

print(f"Total bonuses: ₱{total_bonuses}")
print(f"\nThis explains the ₱{total_bonuses} difference!")
