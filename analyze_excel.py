import pandas as pd

# Load the Excel file
df = pd.read_excel('PLANTA-DON2-2026 (2).xlsx', sheet_name=0, header=None)

print('='*80)
print('EXCEL FILE: PLANTA-DON2-2026 (2).xlsx')
print('Period:', df.iloc[1, 2])
print('='*80)

# Get all workers with their data from rows 8-68
print('\nWORKER DATA:')
print(f"{'Name':<25} {'Days':>5} {'OT':>5} {'Rate':>6} {'Incentive':>10} {'Total':>10}")
print('-'*70)

total_sum = 0
worker_count = 0

for i in range(8, 70):
    name = df.iloc[i, 3]
    if pd.isna(name) or str(name).strip() == '':
        continue
    
    days = df.iloc[i, 10] if pd.notna(df.iloc[i, 10]) else 0
    ot = df.iloc[i, 11] if pd.notna(df.iloc[i, 11]) else 0
    rate = df.iloc[i, 13] if pd.notna(df.iloc[i, 13]) else 0
    incentive = df.iloc[i, 15] if pd.notna(df.iloc[i, 15]) else 0
    total = df.iloc[i, 16] if pd.notna(df.iloc[i, 16]) else 0
    
    print(f"{str(name):<25} {days:>5} {ot:>5} {rate:>6} {incentive:>10} {total:>10}")
    total_sum += float(total) if total else 0
    worker_count += 1

# Check rows 4-5 for Bacol and Ylagan (special rows)
print('\n--- SPECIAL ROWS (Bacol & Ylagan at top) ---')
for i in [4, 5]:
    name = df.iloc[i, 3]
    days = df.iloc[i, 10] if pd.notna(df.iloc[i, 10]) else 0
    ot = df.iloc[i, 11] if pd.notna(df.iloc[i, 11]) else 0
    rate = df.iloc[i, 13] if pd.notna(df.iloc[i, 13]) else 0
    incentive = df.iloc[i, 15] if pd.notna(df.iloc[i, 15]) else 0
    total = df.iloc[i, 16] if pd.notna(df.iloc[i, 16]) else 0
    sss = df.iloc[i, 14] if pd.notna(df.iloc[i, 14]) else 0
    print(f"Row {i} - {name}: Days={days}, OT={ot}, Rate={rate}, Incentive={incentive}, SSS={sss}, Total={total}")

# Get totals row
print('\n--- EXCEL TOTALS ---')
print(f"Row 78 Grand Total: {df.iloc[77, 16]}")
print(f"Sum of worker totals (rows 8-74): {total_sum}")
print(f"Worker count: {worker_count}")

# Now get ALL workers including rows 63-74
print('\n--- COMPLETE ANALYSIS ---')
all_total = 0
for i in range(8, 75):
    val = df.iloc[i, 16]
    if pd.notna(val):
        all_total += float(val)

bacol = float(df.iloc[4, 16]) if pd.notna(df.iloc[4, 16]) else 0
ylagan = float(df.iloc[5, 16]) if pd.notna(df.iloc[5, 16]) else 0

print(f"Sum of rows 8-74: {all_total}")
print(f"Bacol (row 4): {bacol}")
print(f"Ylagan (row 5): {ylagan}")
print(f"Calculated Grand Total: {all_total + bacol + ylagan}")
print(f"Excel Row 78 Total: {df.iloc[77, 16]}")
