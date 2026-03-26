"""
Complete database cleanup - Remove ALL duplicates permanently
"""
from supabase import create_client

supabase = create_client(
    "https://tqadztsovfigraudmgkw.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYWR6dHNvdmZpZ3JhdWRtZ2t3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMzExOSwiZXhwIjoyMDg5NTA5MTE5fQ.uOLRh2GXIKCxJA5jP0AMtjHIqslFD5ZvJFW0FZyQXks"
)

print("DELETING ALL DATA AND RESEEDING CLEAN...\n")

# Step 1: Delete ALL subjects
print("1. Deleting all subjects...")
supabase.table("subjects").delete().neq("class_id", "").execute()
print("   ✓ Done\n")

# Step 2: Delete ALL classes
print("2. Deleting all classes...")
supabase.table("classes").delete().neq("institute_id", "").execute()
print("   ✓ Done\n")

# Step 3: Delete ALL institutes
print("3. Deleting all institutes...")
supabase.table("institutes").delete().neq("institute_id", "").execute()
print("   ✓ Done\n")

# Step 4: Reseed clean data
print("4. Reseeding clean data...\n")

institutes = [
    # Schools
    {"name": "Karachi Grammar School", "type": "School"},
    {"name": "The City School (PAF Chapter)", "type": "School"},
    {"name": "Beaconhouse School System", "type": "School"},
    {"name": "Habib Public School", "type": "School"},
    {"name": "Mama Parsi Girls' School", "type": "School"},
    {"name": "Malir Public School", "type": "School"},
    {"name": "Al-Furqan School Malir", "type": "School"},
    {"name": "Grammar School Malir", "type": "School"},
    {"name": "St. Michael's High School Malir", "type": "School"},
    {"name": "Quaid-e-Azam Academy Malir", "type": "School"},
    
    # Colleges
    {"name": "Adamjee Govt Science College", "type": "College"},
    {"name": "DJ Govt Science College", "type": "College"},
    {"name": "St. Patrick's College", "type": "College"},
    {"name": "Commecs College", "type": "College"},
    {"name": "PECHS Girls College", "type": "College"},
    {"name": "Malir Government Science College", "type": "College"},
    {"name": "Malir Arts & Science College", "type": "College"},
    {"name": "Quaid-e-Azam College Malir", "type": "College"},
    {"name": "Al-Khidmat College Malir", "type": "College"},
    
    # Universities
    {"name": "University of Karachi (UoK)", "type": "University"},
    {"name": "NED University of Engineering & Tech", "type": "University"},
    {"name": "IBA Karachi", "type": "University"},
    {"name": "Aga Khan University (AKU)", "type": "University"},
    {"name": "Habib University", "type": "University"},
    {"name": "FAST-NUCES Karachi", "type": "University"},
    {"name": "SZABIST Karachi", "type": "University"},
    {"name": "Dawood University of Engineering", "type": "University"},
    {"name": "Indus Valley School of Art", "type": "University"},
    {"name": "FUUAST Karachi Main Campus", "type": "University"},
    {"name": "FUUAST Gulshan Campus", "type": "University"},
    {"name": "FUUAST Abdul Haq Campus", "type": "University"},
]

for inst_data in institutes:
    res = supabase.table("institutes").insert(inst_data).execute()
    if res.data:
        inst = res.data[0]
        print(f"   {inst['name']}")
        
        # Add classes
        if inst_data['type'] == "School":
            classes = ["Class 8", "Class 9", "Class 10"]
        elif inst_data['type'] == "College":
            classes = ["Pre-Engineering (11)", "Pre-Engineering (12)", "Pre-Medical (11)", "Pre-Medical (12)", "General Science (11)", "General Science (12)"]
        else:
            classes = [f"Semester {i}" for i in range(1, 9)]
        
        for cls_name in classes:
            cls_res = supabase.table("classes").insert({
                "institute_id": inst['institute_id'],
                "name": cls_name
            }).execute()
            
            if cls_res.data:
                cls = cls_res.data[0]
                
                # Add subjects
                if inst_data['type'] == "University":
                    subjects = ["Programming Fundamentals", "Calculus & Analyt. Geometry", "Functional English", "ICT", "Applied Physics"]
                elif inst_data['type'] == "College":
                    if "Engineering" in cls_name:
                        subjects = ["Mathematics", "Physics", "Chemistry", "Mechanics", "English"]
                    elif "Medical" in cls_name:
                        subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English"]
                    else:
                        subjects = ["Mathematics", "Physics", "Chemistry", "Statistics", "English"]
                else:
                    subjects = ["Mathematics", "Physics", "Chemistry", "Biology/Comp", "English", "Urdu", "Islamiyat"]
                
                for sub in subjects:
                    supabase.table("subjects").insert({
                        "class_id": cls['class_id'],
                        "name": sub
                    }).execute()

print("\n✅ DATABASE CLEANED AND RESEEDED!\n")

# Verify
final_inst = supabase.table("institutes").select("*").execute().data
final_cls = supabase.table("classes").select("*").execute().data
final_sub = supabase.table("subjects").select("*").execute().data

print(f"FINAL COUNT:")
print(f"  Institutes: {len(final_inst)} (should be 31)")
print(f"  Classes: {len(final_cls)}")
print(f"  Subjects: {len(final_sub)}")

# Check for duplicates
unique_inst = {}
for inst in final_inst:
    key = f"{inst['name']}||{inst['type']}"
    unique_inst[key] = unique_inst.get(key, 0) + 1

duplicates = sum(1 for count in unique_inst.values() if count > 1)
print(f"\nDUPLICATES: {duplicates} (should be 0)")

if len(final_inst) == 31 and duplicates == 0:
    print("\n✅✅✅ SUCCESS! Database is clean!")
else:
    print("\n❌ Issue found!")
