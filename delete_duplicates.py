"""
Delete all duplicate institutes, classes, and subjects
Keep only one copy of each unique institute
"""
from supabase import create_client

supabase = create_client(
    "https://tqadztsovfigraudmgkw.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYWR6dHNvdmZpZ3JhdWRtZ2t3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMzExOSwiZXhwIjoyMDg5NTA5MTE5fQ.uOLRh2GXIKCxJA5jP0AMtjHIqslFD5ZvJFW0FZyQXks"
)

print("🔥 DELETING DUPLICATES...\n")

# Get all institutes
all_inst = supabase.table("institutes").select("*").execute().data

# Find which IDs to keep (first occurrence of each name+type combination)
keep_ids = set()
seen = {}

for inst in all_inst:
    key = f"{inst['name']}||{inst['type']}"
    if key not in seen:
        seen[key] = inst['institute_id']
        keep_ids.add(inst['institute_id'])

delete_inst_ids = [i['institute_id'] for i in all_inst if i['institute_id'] not in keep_ids]

print(f"📊 Summary:")
print(f"   Total institutes: {len(all_inst)}")
print(f"   Unique institutes: {len(keep_ids)}")
print(f"   Duplicates to delete: {len(delete_inst_ids)}\n")

# Delete duplicate institutes (which will cascade if there's FK)
print(f"🗑️ Deleting {len(delete_inst_ids)} duplicate institutes...\n")

deleted_count = 0
for inst_id in delete_inst_ids:
    try:
        supabase.table("institutes").delete().eq("institute_id", inst_id).execute()
        deleted_count += 1
        if deleted_count % 20 == 0:
            print(f"   ✓ Deleted {deleted_count} institutes...")
    except Exception as e:
        print(f"   ✗ Error deleting {inst_id}: {e}")

print(f"\n✅ Deleted {deleted_count} duplicate institutes!")

# Verify
remaining = supabase.table("institutes").select("*").execute().data
print(f"📝 Remaining institutes: {len(remaining)}")
