import urllib.request
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

print("Deleting...")
req = urllib.request.Request(f"{base_url}?institute_id=not.is.null", method="DELETE", headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        print("Delete Status:", response.status)
except Exception as e:
    print("Delete error:", e)

with open('payload_city.json', 'r', encoding='utf-8') as f:
    data = f.read().encode('utf-8')

print("Inserting city...")
req2 = urllib.request.Request(base_url, data=data, method="POST", headers=headers)
try:
    with urllib.request.urlopen(req2) as response:
        print("Insert City Status:", response.status)
        print("Successfully seeded database!")
except Exception as e:
    print("Insert city error:", e)
    with open('payload_nocity.json', 'r', encoding='utf-8') as f:
        data2 = f.read().encode('utf-8')
    print("Inserting no-city...")
    req3 = urllib.request.Request(base_url, data=data2, method="POST", headers=headers)
    try:
        with urllib.request.urlopen(req3) as response:
            print("Insert NoCity Status:", response.status)
            print("Successfully seeded database (without city column)!")
    except Exception as e2:
        print("Insert nocity error:", e2)
