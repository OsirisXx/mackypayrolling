import json
d = json.load(open('jan30_feb5_data.json'))
w = [x for x in d['jan_30_feb_5']['workers'] if 'Renel' in x['name']][0]
print(w)
print(f"Base: {w['days']*w['daily_rate']}")
print(f"OT pay from Excel: {w['ot_pay']}")
print(f"Subtotal: {w['subtotal']}")
print(f"Total: {w['total']}")
print(f"Calculated total: {w['days']*w['daily_rate'] + w['ot_pay'] + w['bonus'] - w['sss']}")
print(f"hourly_rate = {w['daily_rate']/8}")
print(f"Exact OT hours needed = {w['ot_pay'] / (w['daily_rate']/8)}")
