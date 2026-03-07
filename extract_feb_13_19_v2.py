import openpyxl
import re

wb_values = openpyxl.load_workbook('PLANTA-DON2-2026 (2).xlsx', data_only=True)
wb_formulas = openpyxl.load_workbook('PLANTA-DON2-2026 (2).xlsx', data_only=False)

ws_v = wb_values['FEB 13-19']
ws_f = wb_formulas['FEB 13-19']

print("=" * 80)
print("EXTRACTING FEB 13-19 DATA")
print("=" * 80)

# From scan: Row 5: C=1, K=1.3, L=7, M=21, N=918.75, O=350, P=560, Q=3418.75
# This means: C=employee_id, K=?, L=days, M=OT, N=OT_pay, O=daily_rate, P=SSS, Q=total
# But where are the names? Let me check column B

print("\nChecking structure - first 20 rows:")
for row in range(1, 21):
    b_val = ws_v[f'B{row}'].value
    c_val = ws_v[f'C{row}'].value
    l_val = ws_v[f'L{row}'].value
    q_val = ws_v[f'Q{row}'].value
    if b_val or c_val or l_val or q_val:
        print(f"Row {row}: B={b_val}, C={c_val}, L={l_val}, Q={q_val}")

print("\n" + "=" * 80)
