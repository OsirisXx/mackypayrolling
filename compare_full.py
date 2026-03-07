# Complete comparison: using the EXACT values from user's app output
# Compare calculated subtotal using app formula vs what Excel shows

# From user's pasted app data (all workers)
app_workers = [
    ("Bacol, Vivian", 7, 21, 350, 0, 560, 0, 3418.75, 2858.75),
    ("Ylagan Robert", 7, 15, 500, 0, 1060, 0, 4437.50, 3377.50),
    ("Abaday Emelyn", 6, 0, 350, 0, 0, 0, 2100.00, 2100.00),
    ("Abaday Ike Jun", 6, 12, 400, 0, 0, 0, 3000.00, 3000.00),
    ("Absin Jimmy", 4, 10, 400, 0, 0, 0, 2100.00, 2100.00),
    ("Abunda Bobby", 6, 24, 400, 0, 0, 0, 3600.00, 3600.00),
    ("Abunda, Renjay", 4, 19, 400, 0, 0, 0, 2550.00, 2550.00),
    ("Aislyn Lintawahan", 0, 0, 400, 0, 0, 0, 0.00, 0.00),
    ("Alimbog Hilbert", 5, 0, 400, 0, 0, 0, 2000.00, 2000.00),
    ("Alimbog, Alquin", 4, 0, 400, 0, 0, 0, 1600.00, 1600.00),
    ("Alimbog, Gabby", 4, 11, 400, 0, 0, 0, 2150.00, 2150.00),
    ("Alimbog, jhon", 6, 8, 400, 0, 0, 0, 2800.00, 2800.00),
    ("Alimbog, Livy", 5, 7, 400, 0, 0, 0, 2350.00, 2350.00),
    ("Alimbog,marque", 6, 4, 400, 0, 0, 0, 2600.00, 2600.00),
    ("Alimbog,Rolly", 4, 0, 400, 0, 0, 0, 1600.00, 1600.00),
    ("Amandaron JImmy", 0, 0, 400, 0, 0, 0, 0.00, 0.00),
    ("Amandon Junibert", 0, 0, 400, 0, 0, 0, 0.00, 0.00),
    ("Amoncio,Jendel", 5, 8, 400, 0, 0, 0, 2400.00, 2400.00),
    ("Andaol Zerbi", 7, 20, 400, 0, 0, 0, 3800.00, 3800.00),
    ("Angan, e", 7, 0, 400, 0, 0, 0, 2800.00, 2800.00),
    ("Arnesx Sarinao", 6, 8, 400, 0, 0, 0, 2800.00, 2800.00),
    ("Atlawan, jimboy", 7, 15, 400, 0, 0, 0, 3550.00, 3550.00),
    ("Baculio Daren", 5, 0, 400, 0, 0, 0, 2000.00, 2000.00),
    ("Baculio Rosito", 7, 0, 400, 0, 0, 0, 2800.00, 2800.00),
    ("Balbuena Randy", 5, 12, 400, 0, 0, 0, 2600.00, 2600.00),
    ("bayantong Edgar", 5, 26, 500, 0, 0, 0, 4125.00, 4125.00),
    ("Bulak Marvin", 7, 32, 400, 0, 0, 0, 4400.00, 4400.00),
    ("Bulak Melvin", 6, 0, 400, 0, 0, 0, 2400.00, 2400.00),
    ("Bulak Norvin", 4, 0, 400, 0, 0, 0, 1600.00, 1600.00),
    ("Bulak, Alvin", 7, 0, 400, 0, 0, 0, 2800.00, 2800.00),
    ("Cabornay, Celio", 7, 0, 400, 0, 0, 0, 2800.00, 2800.00),
    ("Camahay Diego", 6, 14, 400, 0, 0, 0, 3100.00, 3100.00),
    ("Cartahan, boboy", 0, 0, 400, 0, 0, 0, 0.00, 0.00),
    ("Cartahan, Kevin", 6, 8, 400, 0, 0, 0, 2800.00, 2800.00),
    ("Catuan, Ryan", 4, 8, 400, 0, 0, 0, 2000.00, 2000.00),
    ("Conahan,Aaron", 4, 11, 400, 0, 0, 0, 2150.00, 2150.00),
    ("Curbo Regie", 5, 11, 400, 0, 0, 0, 2550.00, 2550.00),
    ("Dagalia Cruz Popoy", 5, 4, 400, 0, 0, 0, 2200.00, 2200.00),
    ("Dagpong crist", 5, 4, 400, 0, 0, 0, 2200.00, 2200.00),
    ("Datuin James", 6, 20, 400, 0, 0, 0, 3400.00, 3400.00),
    ("Decaso Jclaid", 6, 28, 400, 0, 0, 0, 3800.00, 3800.00),
    ("Dela Cruz", 0, 0, 400, 0, 0, 0, 0.00, 0.00),
    ("Espina Aida", 5, 8, 350, 0, 0, 0, 2100.00, 2100.00),
    ("Felizarda,Lintacan", 6, 0, 400, 0, 0, 0, 2400.00, 2400.00),
    ("Francisco, Mark", 4, 0, 400, 0, 0, 0, 1600.00, 1600.00),
    ("Funa, Muela", 7, 21, 350, 0, 0, 0, 3368.75, 3368.75),
    ("Gonhay Jemmuel", 5, 6, 400, 0, 0, 0, 2300.00, 2300.00),
    ("Guilan MElchor", 0, 0, 400, 0, 0, 0, 0.00, 0.00),
    ("Guilan MEnard", 4, 0, 400, 0, 0, 0, 1600.00, 1600.00),
    ("Gullan MEnard", 0, 0, 400, 0, 0, 0, 0.00, 0.00),
    ("Igot, Marani", 4, 0, 400, 0, 0, 0, 1600.00, 1600.00),
    ("Lagnas, Jovan", 3, 0, 400, 0, 0, 0, 1200.00, 1200.00),
    ("Lan ayan Raul", 5, 26, 400, 0, 0, 0, 3300.00, 3300.00),
    ("Lan-ayan Renemee", 5, 8, 400, 0, 0, 0, 2400.00, 2400.00),
    ("Lastimosa Ricky", 5, 16, 400, 0, 0, 0, 2800.00, 2800.00),
    ("Mahunyag, christ", 5, 7, 400, 0, 0, 0, 2350.00, 2350.00),
    ("Marjunel Angan", 5, 8, 400, 0, 0, 0, 2400.00, 2400.00),
    ("Pagayod Beebth", 5, 2, 400, 0, 0, 0, 2100.00, 2100.00),
    ("Pagayon jason", 4, 0, 400, 0, 0, 0, 1600.00, 1600.00),
    ("Pagayon Joanrd", 5, 6, 400, 0, 0, 0, 2300.00, 2300.00),
    ("Renel Angan", 7, 12, 550, 0, 0, 0, 4675.00, 4675.00),
    ("Sagansan Jerry", 7, 20, 400, 0, 0, 0, 3800.00, 3800.00),
    ("sagansan renie", 6, 19, 400, 0, 0, 0, 3350.00, 3350.00),
    ("Sagansan, Dexter", 4, 2, 400, 0, 0, 0, 1700.00, 1700.00),
    ("Sagansan, Jeran", 0, 0, 400, 0, 0, 0, 0.00, 0.00),
    ("Salait Ariel", 7, 0, 400, 0, 0, 0, 2800.00, 2800.00),
    ("Sandalan jevin", 6, 24, 400, 0, 0, 0, 3600.00, 3600.00),
    ("Sumayan Roland", 3, 11, 400, 0, 0, 0, 1750.00, 1750.00),
    ("Tomonglay, Rhyder", 0, 0, 400, 0, 0, 0, 0.00, 0.00),
    ("Tumantan, Roalndo", 4, 0, 400, 0, 0, 0, 1600.00, 1600.00),
    ("ubanan Enel", 5, 6, 400, 0, 0, 0, 2300.00, 2300.00),
    ("Yake jordan", 2, 0, 400, 0, 0, 0, 800.00, 800.00),
    ("Yake rex", 0, 0, 400, 0, 0, 0, 0.00, 0.00),
    ("Yake rodonio", 5, 0, 400, 0, 0, 0, 2000.00, 2000.00),
    ("Yanuhon JOvil", 4, 0, 400, 0, 0, 0, 1600.00, 1600.00),
    ("Yunson Alfred", 5, 14, 400, 0, 0, 0, 2700.00, 2700.00),
    ("yUnson niper", 6, 28, 400, 0, 0, 0, 3800.00, 3800.00),
]
# name, days, ot, rate, bonus, sss, ded, subtotal, total

print("=== VERIFY: Does app formula match displayed subtotals? ===")
print("Formula: subtotal = days*rate + (rate/8)*OT + bonus + extra(50 for Bacol)")
print()
mismatches = []
for name, days, ot, rate, bonus, sss, ded, subtotal, total in app_workers:
    is_bacol = 'bacol' in name.lower() and 'vivian' in name.lower()
    extra = 50 if is_bacol else 0
    calc = days * rate + (rate / 8) * ot + bonus + extra
    if abs(calc - subtotal) > 0.01:
        mismatches.append((name, calc, subtotal, calc - subtotal))
        print(f"  FORMULA MISMATCH: {name}: calculated={calc}, displayed={subtotal}, diff={calc-subtotal}")

if not mismatches:
    print("  All workers: app formula matches displayed subtotals perfectly!")

# Now compare app values vs Excel values (same inputs)
print()
print("=== KEY COMPARISON: Workers with DIFFERENT values between Excel and App ===")
print("(where inputs are same but results differ, or inputs differ)")
print()

# Excel data: name -> (days, ot, rate, Q_total)
excel = {
    "Bacol, Vivian": (7, 21, 350, 3418.75),
    "Ylagan Robert": (7, 15, 500, 4437.50),
    "Abaday Emelyn": (6, 0, 350, 2100.00),
    "Abaday Ike Jun": (6, 12, 400, 3000.00),
    "Absin Jimmy": (4, 10, 400, 2100.00),
    "Abunda Bobby": (6, 24, 400, 3600.00),
    "Abunda, Renjay": (4, 19, 400, 2550.00),
    "Alimbog, Gabby": (4, 11, 400, 2150.00),
    "Alimbog, jhon": (6, 8, 400, 2800.00),
    "Alimbog Hilbert": (5, 0, 400, 2000.00),
    "Alimbog, Livy": (5, 7, 400, 2350.00),
    "Alimbog,marque": (6, 4, 400, 2600.00),
    "Amoncio,Jendel": (5, 8, 400, 2400.00),
    "Andaol Zerbi": (7, 20, 400, 3800.00),
    "Angan, e": (7, 0, 400, 2800.00),
    "Arnesx Sarinao": (6, 8, 400, 2800.00),
    "Atlawan, jimboy": (7, 15, 400, 3550.00),
    "Baculio Daren": (5, 0, 400, 2000.00),
    "Baculio Rosito": (7, 0, 400, 2800.00),
    "Balbuena Randy": (5, 12, 400, 2600.00),
    "bayantong Edgar": (5, 26, 500, 4125.00),
    "Bulak Marvin": (7, 32, 400, 4400.00),
    "Bulak Melvin": (6, 0, 400, 2400.00),
    "Bulak Norvin": (4, 0, 400, 1600.00),
    "Bulak, Alvin": (7, 0, 400, 2800.00),
    "Cabornay, Celio": (7, 0, 400, 2800.00),
    "Camahay Diego": (6, 14, 400, 3100.00),
    "Cartahan, boboy": (0, 0, 400, 0.00),
    "Cartahan, Kevin": (6, 8, 400, 2800.00),
    "Conahan,Aaron": (4, 11, 400, 2150.00),
    "Curbo Regie": (5, 11, 400, 2550.00),
    "Dagalia Cruz Popoy": (5, 4, 400, 2200.00),
    "Dagpong crist": (5, 4, 400, 2200.00),
    "Datuin James": (6, 20, 400, 3400.00),
    "Decaso Jclaid": (6, 28, 400, 3800.00),
    "Espina Aida": (5, 8, 350, 2100.00),
    "Felizarda,Lintacan": (6, 0, 400, 2400.00),
    "Funa, Muela": (7, 21, 350, 3368.75),
    "Gonhay Jemmuel": (5, 6, 400, 2300.00),
    "Guilan MEnard": (4, 0, 400, 1600.00),
    "Lan ayan Raul": (5, 26, 400, 3300.00),
    "Lan-ayan Renemee": (5, 8, 400, 2400.00),
    "Lastimosa Ricky": (5, 16, 400, 2800.00),
    "Mahunyag, christ": (5, 7, 400, 2350.00),
    "Marjunel Angan": (5, 8, 400, 2400.00),
    "Pagayod Beebth": (5, 2, 400, 2100.00),
    "Pagayon jason": (4, 0, 400, 1600.00),
    "Pagayon Joanrd": (5, 6, 400, 2300.00),
    "Renel Angan": (7, 12, 550, 4675.00),
    "Sagansan Jerry": (7, 20, 400, 3800.00),
    "sagansan renie": (6, 19, 400, 3350.00),
    "Sagansan, Dexter": (4, 2, 400, 1700.00),
    "Salait Ariel": (7, 0, 400, 2800.00),
    "Sandalan jevin": (6, 24, 400, 3600.00),
    "Sumayan Roland": (3, 11, 400, 1750.00),
    "ubanan Enel": (5, 6, 400, 2300.00),
    "Yake jordan": (2, 0, 400, 800.00),
    "Yake rex": (0, 0, 400, 0.00),
    "Yake rodonio": (5, 0, 400, 2000.00),
    "Yanuhon JOvil": (4, 0, 400, 1600.00),
    "Yunson Alfred": (5, 14, 400, 2700.00),
    "Yunson niper": (6, 28, 400, 3800.00),
    "Alimbog,Rolly": (4, 0, 400, 1600.00),
    "Francisco, Mark": (4, 0, 400, 1600.00),
    "Alimbog, Alquin": (4, 0, 400, 1600.00),
    "Igot, Marani": (3, 0, 400, 1200.00),  # NOTE: Excel has 3 days!
    "Lagnas, Jovan": (3, 0, 400, 1200.00),
    "Catuan, Ryan": (4, 8, 400, 2000.00),
    "Tumantan, Roalndo": (4, 0, 400, 1600.00),
]

# Build app lookup (normalize names for matching)
app_lookup = {}
for name, days, ot, rate, bonus, sss, ded, subtotal, total in app_workers:
    app_lookup[name] = {"days": days, "ot": ot, "rate": rate, "subtotal": subtotal}

# Match and compare
total_excel = 0
total_app = 0
input_diffs = []
value_diffs = []

for excel_name, (e_days, e_ot, e_rate, e_total) in excel.items():
    total_excel += e_total
    
    # Find matching app worker
    app_match = app_lookup.get(excel_name)
    if not app_match:
        # Try case-insensitive
        for aname, aval in app_lookup.items():
            if aname.lower().replace(' ', '') == excel_name.lower().replace(' ', ''):
                app_match = aval
                break
    
    if app_match:
        a_days = app_match["days"]
        a_ot = app_match["ot"]
        a_rate = app_match["rate"]
        a_subtotal = app_match["subtotal"]
        total_app += a_subtotal
        
        # Check input differences
        if e_days != a_days or e_ot != a_ot or e_rate != a_rate:
            input_diffs.append(f"  {excel_name}: Excel(d={e_days},ot={e_ot},r={e_rate}) vs App(d={a_days},ot={a_ot},r={a_rate})")
        
        # Check value differences
        if abs(e_total - a_subtotal) > 0.01:
            value_diffs.append(f"  {excel_name}: Excel Q={e_total} vs App subtotal={a_subtotal}, diff={a_subtotal - e_total}")
    else:
        print(f"  WARNING: No app match for Excel worker: {excel_name}")

# Workers in app but not in Excel (extras with 0 values)
extras_total = 0
for name, days, ot, rate, bonus, sss, ded, subtotal, total in app_workers:
    if name not in excel:
        # Check if match exists under different name
        found = False
        for ename in excel:
            if ename.lower().replace(' ', '') == name.lower().replace(' ', ''):
                found = True
                break
        if not found:
            extras_total += subtotal
            if subtotal > 0:
                print(f"  App-only worker with value: {name}: subtotal={subtotal}")

print("INPUT DIFFERENCES (same worker, different input values):")
if input_diffs:
    for d in input_diffs:
        print(d)
else:
    print("  None!")

print()
print("VALUE DIFFERENCES (subtotal differs despite same inputs):")
if value_diffs:
    for d in value_diffs:
        print(d)
else:
    print("  None!")

print()
print(f"Total Excel Q sum: {total_excel}")
print(f"Total App subtotal (matched workers): {total_app}")
print(f"App extras total: {extras_total}")
print(f"App total (all): {total_app + extras_total}")
print(f"App displayed subtotal: 173275.00")
print(f"Difference from Excel: {total_app + extras_total - total_excel}")
