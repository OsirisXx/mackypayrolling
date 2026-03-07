import openpyxl

wb_values = openpyxl.load_workbook('PLANTA-DON2-2026 (2).xlsx', data_only=True)
wb_formulas = openpyxl.load_workbook('PLANTA-DON2-2026 (2).xlsx', data_only=False)

ws_v = wb_values['feb 6-12']
ws_f = wb_formulas['feb 6-12']

print("=" * 80)
print("CHECKING ESPINA AIDA (Row 32)")
print("=" * 80)

row = 32
name = ws_v[f'B{row}'].value
days = ws_v[f'K{row}'].value
ot_hours = ws_v[f'L{row}'].value
ot_pay = ws_v[f'M{row}'].value
daily_rate = ws_v[f'N{row}'].value
sss = ws_v[f'O{row}'].value
subtotal = ws_v[f'P{row}'].value
total = ws_v[f'Q{row}'].value

formula_P = ws_f[f'P{row}'].value

print(f"Name: {name}")
print(f"Days: {days}")
print(f"OT Hours: {ot_hours}")
print(f"OT Pay: {ot_pay}")
print(f"Daily Rate: {daily_rate}")
print(f"SSS: {sss}")
print(f"Subtotal (P): {subtotal}")
print(f"Total (Q): {total}")
print(f"Formula P: {formula_P}")

# Calculate what it should be
base_pay = days * daily_rate if days and daily_rate else 0
print(f"\nCalculation:")
print(f"Base pay: {days} × {daily_rate} = {base_pay}")
print(f"OT pay: {ot_pay}")
print(f"Subtotal: {base_pay} + {ot_pay} = {base_pay + (ot_pay or 0)}")

# Extract bonus from formula
import re
bonus = 0
if formula_P and isinstance(formula_P, str):
    bonus_match = re.search(r'\+(\d+)$', formula_P)
    if bonus_match:
        bonus = int(bonus_match.group(1))

print(f"Bonus from formula: {bonus}")
print(f"With bonus: {base_pay + (ot_pay or 0) + bonus}")
print(f"After SSS: {base_pay + (ot_pay or 0) + bonus - (sss or 0)}")
print(f"Excel total: {total}")

# System shows: 7 days × 350 = 2450 + 100 bonus = 2550
# Excel should show: 7 days × 350 = 2450 + ??? = 2900
print(f"\nSystem calculation: 7 × 350 + 100 = 2550")
print(f"Excel shows: {total}")
print(f"Difference: {total - 2550}")
