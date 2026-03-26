import os
from supabase import create_client

supabase_url = "https://tqadztsovfigraudmgkw.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYWR6dHNvdmZpZ3JhdWRtZ2t3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMzExOSwiZXhwIjoyMDg5NTA5MTE5fQ.uOLRh2GXIKCxJA5jP0AMtjHIqslFD5ZvJFW0FZyQXks"

supabase = create_client(supabase_url, supabase_key)

print("=== CLEANING DATABASE ===\n")

# Old class names to delete (from previous seed runs)
old_classes = [
    "Class 10 (Matric)",
    "First Year (Intermediate)",
    "Second Year (12)",
    "Semester 1 (Undergrad)",
]

# New class names to keep
new_classes = [
    "Class 8",
    "Class 9", 
    "Class 10",
    "Pre-Engineering (11)",
    "Pre-Engineering (12)",
    "Pre-Medical (11)",
    "Pre-Medical (12)",
    "General Science (11)",
    "General Science (12)",
    "Semester 1",
    "Semester 2",
    "Semester 3",
    "Semester 4",
    "Semester 5",
    "Semester 6",
    "Semester 7",
    "Semester 8",
]

# Institutes to keep (don't delete these)
institutes_to_keep = [
    "Karachi Grammar School", "The City School (PAF Chapter)", 
    "Beaconhouse School System", "Habib Public School", 
    "Mama Parsi Girls' School", "Malir Public School",
    "Al-Furqan School Malir", "Grammar School Malir",
    "St. Michael's High School Malir", "Quaid-e-Azam Academy Malir",
    "Adamjee Govt Science College", "DJ Govt Science College",
    "St. Patrick's College", "Commecs College", "PECHS Girls College",
    "Malir Government Science College", "Malir Arts & Science College",
    "Quaid-e-Azam College Malir", "Al-Khidmat College Malir",
    "University of Karachi (UoK)", "NED University of Engineering & Tech",
    "IBA Karachi", "Aga Khan University (AKU)", "Habib University",
    "FAST-NUCES Karachi", "SZABIST Karachi", "Dawood University of Engineering",
    "Indus Valley School of Art", "FUUAST Karachi Main Campus",
    "FUUAST Gulshan Campus", "FUUAST Abdul Haq Campus"
]

print("1. Deleting old class types...")
# Get all classes and delete old ones
all_classes = supabase.table("classes").select("*").execute().data
deleted_count = 0

for cls in all_classes:
    if cls['name'] in old_classes:
        try:
            supabase.table("classes").delete().eq("class_id", cls['class_id']).execute()
            print(f"   ✓ Deleted old class: {cls['name']}")
            deleted_count += 1
        except Exception as e:
            print(f"   ✗ Failed to delete {cls['name']}: {e}")

print(f"\nDeleted {deleted_count} old class records\n")

# Get all institutes
all_institutes = supabase.table("institutes").select("*").execute().data

print(f"2. Total institutes in database: {len(all_institutes)}")

# Count duplicates
print("\n3. Checking for duplicates...")
name_counts = {}
for inst in all_institutes:
    name = inst['name']
    if name not in name_counts:
        name_counts[name] = []
    name_counts[name].append(inst)

duplicates = {name: insts for name, insts in name_counts.items() if len(insts) > 1}

if duplicates:
    print(f"\nFound {len(duplicates)} institutes with duplicates:")
    for name, insts in duplicates.items():
        print(f"\n   {name} (appears {len(insts)} times)")
        for i, inst in enumerate(insts, 1):
            print(f"      #{i} ID: {inst['institute_id']}")
            
    print("\n⚠️  IMPORTANT: Supabase will automatically delete duplicate institutes")
    print("   when you run the seed script again (due to UNIQUE constraint on name).")
    print("   So you'll see errors about duplicates - that's EXPECTED and OK.\n")
else:
    print("   No duplicate institutes found!")

print("\n4. Checking for institutes NOT in our curated list...")
unwanted = [inst for inst in all_institutes if inst['name'] not in institutes_to_keep]
if unwanted:
    print(f"   Found {len(unwanted)} institutes NOT in our list (can be manually deleted):")
    for inst in unwanted:
        print(f"      - {inst['name']}")
else:
    print("   All institutes are in our curated list!")

print("\n=== CLEANUP CHECK COMPLETE ===")
print("\nNEXT STEPS:")
print("1. Run: python seed_karachi.py")
print("2. You'll see errors about duplicate institute names - that's EXPECTED")
print("3. These errors happen because the DB still has old duplicate names")
print("4. After seed runs, the new clean data will be there")
print("5. Hard refresh your browser: Ctrl+Shift+R")
print("6. Test the signup flow again")
