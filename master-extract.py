import openpyxl
import json
import re

wb_values = openpyxl.load_workbook('PLANTA-DON2-2026 (2).xlsx', data_only=True)
wb_formulas = openpyxl.load_workbook('PLANTA-DON2-2026 (2).xlsx', data_only=False)

all_periods = {}

# ============================================================
# FEB 6-12 (columns: B=id, C=name, K=days, L=OT, M=OT_pay, N=rate, O=SSS, P=subtotal, Q=total)
# ============================================================
ws_v = wb_values['feb 6-12']
ws_f = wb_formulas['feb 6-12']

print("=" * 80)
print("FEB 6-12")
print("=" * 80)

feb6_workers = []
for row in range(4, 80):
    name = ws_v[f'C{row}'].value
    if not name or not isinstance(name, str):
        continue
    if any(x in name for x in ['COMMISION', 'Name:', 'TOTAL', 'total']):
        continue
    
    days = ws_v[f'K{row}'].value
    ot_hours = ws_v[f'L{row}'].value or 0
    ot_pay = ws_v[f'M{row}'].value or 0
    daily_rate = ws_v[f'N{row}'].value
    sss = ws_v[f'O{row}'].value or 0
    subtotal = ws_v[f'P{row}'].value or 0
    total = ws_v[f'Q{row}'].value
    
    if not days or not daily_rate or total is None:
        continue
    
    # Calculate bonus: subtotal = (days*rate) + ot_pay + bonus
    expected_base = (days * daily_rate) + ot_pay
    bonus = round(subtotal - expected_base) if subtotal > expected_base else 0
    
    # Verify total = subtotal - sss
    calc_total = subtotal - sss
    
    feb6_workers.append({
        'name': name.strip(),
        'days': int(days),
        'ot_hours': round(float(ot_hours), 1) if ot_hours else 0,
        'ot_pay': round(float(ot_pay), 2) if ot_pay else 0,
        'daily_rate': round(float(daily_rate)),
        'bonus': round(float(bonus)),
        'sss': round(float(sss)),
        'subtotal': round(float(subtotal), 2),
        'total': round(float(total), 2),
        'calc_total': round(calc_total, 2)
    })

feb6_subtotal = sum(w['subtotal'] for w in feb6_workers)
feb6_sss = sum(w['sss'] for w in feb6_workers)
feb6_total = sum(w['total'] for w in feb6_workers)

print(f"Workers: {len(feb6_workers)}")
print(f"Subtotal (before SSS): {feb6_subtotal:,.2f}")
print(f"Total SSS: {feb6_sss:,.2f}")
print(f"Grand Total: {feb6_total:,.2f}")

# Verify each worker
mismatches = [w for w in feb6_workers if abs(w['total'] - w['calc_total']) > 1]
if mismatches:
    print(f"\nWARNING: {len(mismatches)} workers with total mismatch:")
    for w in mismatches:
        print(f"  {w['name']}: Excel total={w['total']}, Calculated={w['calc_total']}")

all_periods['feb_6_12'] = {
    'start': '2026-02-06',
    'end': '2026-02-12',
    'workers': feb6_workers,
    'subtotal': feb6_subtotal,
    'total_sss': feb6_sss,
    'grand_total': feb6_total
}

# ============================================================
# FEB 13-19 (columns: C=id, D=name, L=days, M=OT, N=OT_pay, O=rate, P=SSS, Q=subtotal?, R=total?)
# ============================================================
ws_v = wb_values['FEB 13-19']
ws_f = wb_formulas['FEB 13-19']

print("\n" + "=" * 80)
print("FEB 13-19")
print("=" * 80)

# First verify column mapping by checking row 5
print(f"\nRow 5 check: D={ws_v['D5'].value}, L={ws_v['L5'].value}, O={ws_v['O5'].value}, P={ws_v['P5'].value}, Q={ws_v['Q5'].value}, R={ws_v['R5'].value}")

feb13_workers = []
for row in range(5, 90):
    name = ws_v[f'D{row}'].value
    if not name or not isinstance(name, str):
        continue
    if any(x in name for x in ['COMMISION', 'Name:', 'TOTAL', 'total']):
        continue
    
    days = ws_v[f'L{row}'].value
    ot_hours = ws_v[f'M{row}'].value or 0
    ot_pay = ws_v[f'N{row}'].value or 0
    daily_rate = ws_v[f'O{row}'].value
    sss = ws_v[f'P{row}'].value or 0
    col_q = ws_v[f'Q{row}'].value  # Could be subtotal or total
    col_r = ws_v[f'R{row}'].value  # Could be total
    
    if not days or not daily_rate:
        continue
    
    # Determine which column is subtotal and which is total
    # If col_r exists and is less than col_q, then col_q=subtotal, col_r=total
    # Otherwise col_q is total
    if col_r is not None and isinstance(col_r, (int, float)):
        subtotal = float(col_q) if col_q else 0
        total = float(col_r)
    else:
        subtotal = float(col_q) if col_q else 0
        total = float(col_q) if col_q else 0
    
    # Calculate bonus
    expected_base = (days * daily_rate) + ot_pay
    bonus = round(subtotal - expected_base) if subtotal > expected_base else 0
    
    feb13_workers.append({
        'name': name.strip(),
        'days': int(days),
        'ot_hours': round(float(ot_hours), 1) if ot_hours else 0,
        'ot_pay': round(float(ot_pay), 2) if ot_pay else 0,
        'daily_rate': round(float(daily_rate)),
        'bonus': round(float(bonus)),
        'sss': round(float(sss)),
        'subtotal': round(subtotal, 2),
        'total': round(total, 2)
    })

feb13_subtotal = sum(w['subtotal'] for w in feb13_workers)
feb13_sss = sum(w['sss'] for w in feb13_workers)
feb13_total = sum(w['total'] for w in feb13_workers)

print(f"Workers: {len(feb13_workers)}")
print(f"Subtotal (before SSS): {feb13_subtotal:,.2f}")
print(f"Total SSS: {feb13_sss:,.2f}")
print(f"Grand Total: {feb13_total:,.2f}")

# Check what the Excel total rows say
for row in range(70, 90):
    for col in ['Q', 'R']:
        val = ws_v[f'{col}{row}'].value
        if val and isinstance(val, (int, float)) and val > 50000:
            print(f"  Excel {col}{row} = {val:,.2f}")

all_periods['feb_13_19'] = {
    'start': '2026-02-13',
    'end': '2026-02-19',
    'workers': feb13_workers,
    'subtotal': feb13_subtotal,
    'total_sss': feb13_sss,
    'grand_total': feb13_total
}

# Save everything to JSON for JS import
with open('payroll_data.json', 'w', encoding='utf-8') as f:
    json.dump(all_periods, f, ensure_ascii=False, indent=2)

print("\n" + "=" * 80)
print("SAVED to payroll_data.json")
print("=" * 80)
