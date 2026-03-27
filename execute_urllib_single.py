import urllib.request
import json
import os

env = {}
with open('.env.local', 'r') as f:
    for line in f:
        if '=' in line:
            k, v = line.strip().split('=', 1)
            env[k] = v.strip('"\'')

url = env.get("SUPABASE_URL")
key = env.get("SUPABASE_KEY")

base_url = f"{url}/rest/v1/institutes"
headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# The previous script successfully deleted the database, so we just need to insert.
with open('payload_nocity.json', 'r', encoding='utf-8') as f:
    records = json.load(f)

print(f"Starting batched insertion for {len(records)} records to avoid MTU drop...")

success_count = 0
for i, rec in enumerate(records):
    # Insert one by one
    data = json.dumps([rec]).encode('utf-8')
    req = urllib.request.Request(base_url, data=data, method="POST", headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            success_count += 1
            print(f"Inserted [{i+1}/{len(records)}]", rec['name'])
    except Exception as e:
        print(f"Error on {rec['name']}:", e)

print(f"Finished! Successfully inserted {success_count}/{len(records)} records.")
