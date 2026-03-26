import os
from supabase import create_client

supabase_url = "https://tqadztsovfigraudmgkw.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYWR6dHNvdmZpZ3JhdWRtZ2t3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMzExOSwiZXhwIjoyMDg5NTA5MTE5fQ.uOLRh2GXIKCxJA5jP0AMtjHIqslFD5ZvJFW0FZyQXks"

supabase = create_client(supabase_url, supabase_key)

print("=== CHECKING INSTITUTES IN DATABASE ===")
institutes_res = supabase.table("institutes").select("*").execute()
institutes = institutes_res.data

print(f"\nTotal Institute Records: {len(institutes)}")
print("\nSchools:")
schools = [i for i in institutes if i['type'] == 'School']
for s in schools:
    print(f"  - {s['name']}")

print("\nColleges:")
colleges = [i for i in institutes if i['type'] == 'College']
for c in colleges:
    print(f"  - {c['name']}")

print("\nUniversities:")
universities = [i for i in institutes if i['type'] == 'University']
for u in universities:
    print(f"  - {u['name']}")

# Check for duplicates
print("\n=== CHECKING FOR DUPLICATE INSTITUTES ===")
names = [i['name'] for i in institutes]
duplicates = [name for name in set(names) if names.count(name) > 1]
if duplicates:
    print(f"Found {len(duplicates)} duplicate institute names:")
    for dup in duplicates:
        count = names.count(dup)
        print(f"  - {dup} (appears {count} times)")
else:
    print("No duplicate institutes found!")

# Check classes for one institute
print("\n=== CHECKING CLASSES FOR 'Adamjee Govt Science College' ===")
adamjee = [i for i in institutes if 'Adamjee' in i['name']][0]
classes_res = supabase.table("classes").select("*").eq("institute_id", adamjee['institute_id']).execute()
classes = classes_res.data
print(f"Total Classes: {len(classes)}")
for cls in classes:
    print(f"  - {cls['name']}")
