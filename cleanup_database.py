"""Clean up duplicate institutes in the database"""
import os
from supabase import create_client

# Supabase credentials
supabase_url = "https://tqadztsovfigraudmgkw.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYWR6dHNvdmZpZ3JhdWRtZ2t3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMzExOSwiZXhwIjoyMDg5NTA5MTE5fQ.uOLRh2GXIKCxJA5jP0AMtjHIqslFD5ZvJFW0FZyQXks"

supabase = create_client(supabase_url, supabase_key)

print("🧹 Starting cleanup of duplicates...\n")

# Step 1: Get all institutes and find duplicates
print("📊 Analyzing institutes...")
all_institutes = supabase.table("institutes").select("*").execute()

institute_map = {}
duplicates_to_delete = []

for inst in all_institutes.data:
    key = f"{inst['name']}||{inst['type']}"
    if key not in institute_map:
        institute_map[key] = []
    institute_map[key].append(inst['institute_id'])

duplicate_count = 0
for key, ids in institute_map.items():
    if len(ids) > 1:
        duplicate_count += len(ids) - 1
        # Keep the first one, delete the rest
        for inst_id in ids[1:]:
            duplicates_to_delete.append(inst_id)

print(f"   Found {duplicate_count} duplicate institute rows\n")

# Step 2: Delete duplicate classes and subjects for duplicate institutes
if duplicates_to_delete:
    print(f"🗑️ Deleting duplicate data...\n")
    
    # Get all classes for duplicate institutes
    all_classes = supabase.table("classes").select("*").execute()
    classes_to_delete = [c['class_id'] for c in all_classes.data if c.get('institute_id') in duplicates_to_delete]
    
    # Get all subjects for those classes
    subjects_to_delete = []
    if classes_to_delete:
        all_subjects = supabase.table("subjects").select("*").execute()
        subjects_to_delete = [s['subject_id'] for s in all_subjects.data if s.get('class_id') in classes_to_delete]
    
    # Delete subjects
    if subjects_to_delete:
        print(f"   Deleting {len(subjects_to_delete)} subjects...")
        for sub_id in subjects_to_delete:
            try:
                supabase.table("subjects").delete().eq("subject_id", sub_id).execute()
            except:
                pass
    
    # Delete classes
    if classes_to_delete:
        print(f"   Deleting {len(classes_to_delete)} classes...")
        for cls_id in classes_to_delete:
            try:
                supabase.table("classes").delete().eq("class_id", cls_id).execute()
            except:
                pass
    
    # Delete duplicate institutes
    print(f"   Deleting {len(duplicates_to_delete)} duplicate institutes...")
    for inst_id in duplicates_to_delete:
        try:
            supabase.table("institutes").delete().eq("institute_id", inst_id).execute()
        except:
            pass

print("\n✨ Cleanup complete!")
print("📋 Summary:")
all_institutes_after = supabase.table("institutes").select("*").execute()
print(f"   Total institutes: {len(all_institutes_after.data)}")

