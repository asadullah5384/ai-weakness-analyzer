"""
Complete database reset and reseed
"""
from supabase import create_client

supabase = create_client(
    "https://tqadztsovfigraudmgkw.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYWR6dHNvdmZpZ3JhdWRtZ2t3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMzExOSwiZXhwIjoyMDg5NTA5MTE5fQ.uOLRh2GXIKCxJA5jP0AMtjHIqslFD5ZvJFW0FZyQXks"
)

print("🔥 COMPLETE DATABASE RESET\n")

# Delete everything in correct order (subjects first, then classes, then institutes)
print("1. Deleting all subjects...")
try:
    supabase.table("subjects").delete().neq("class_id", "").execute()
    print("   ✅ Subjects deleted")
except:
    print("   ⚠️ Error deleting subjects")

print("2. Deleting all classes...")
try:
    supabase.table("classes").delete().neq("institute_id", "").execute()
    print("   ✅ Classes deleted")
except:
    print("   ⚠️ Error deleting classes")

print("3. Deleting all institutes...")
try:
    supabase.table("institutes").delete().neq("institute_id", "").execute()
    print("   ✅ Institutes deleted")
except:
    print("   ⚠️ Error deleting institutes")

print("\n✨ Database is now completely empty!")
print("🔄 Now reseeding with clean data...\n")

# Now reseed with the clean data
karachi_institutes = [
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
    # FUUAST - Karachi Campuses Only
    {"name": "FUUAST Karachi Main Campus", "type": "University"},
    {"name": "FUUAST Gulshan Campus", "type": "University"},
    {"name": "FUUAST Abdul Haq Campus", "type": "University"},
]

for inst_data in karachi_institutes:
    try:
        res = supabase.table("institutes").insert(inst_data).execute()
        if not res.data:
            print(f"Failed to add {inst_data['name']}")
            continue
        inst = res.data[0]
        print(f"✓ Added: {inst['name']}")

        # Add classes based on type
        classes_to_add = []
        if inst_data['type'] == "School":
            classes_to_add = ["Class 8", "Class 9", "Class 10"]
        elif inst_data['type'] == "College":
            classes_to_add = ["Pre-Engineering (11)", "Pre-Engineering (12)", "Pre-Medical (11)", "Pre-Medical (12)", "General Science (11)", "General Science (12)"]
        else:  # University
            classes_to_add = [f"Semester {i}" for i in range(1, 9)]

        for class_name in classes_to_add:
            cls_res = supabase.table("classes").insert({
                "institute_id": inst['institute_id'],
                "name": class_name
            }).execute()

            if cls_res.data:
                cls = cls_res.data[0]

                # Add subjects
                if inst_data['type'] == "University":
                    subjects = ["Programming Fundamentals", "Calculus & Analyt. Geometry", "Functional English", "ICT", "Applied Physics"]
                elif inst_data['type'] == "College":
                    if "Engineering" in class_name:
                        subjects = ["Mathematics", "Physics", "Chemistry", "Mechanics", "English"]
                    elif "Medical" in class_name:
                        subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English"]
                    else:  # General Science
                        subjects = ["Mathematics", "Physics", "Chemistry", "Statistics", "English"]
                else:  # School
                    subjects = ["Mathematics", "Physics", "Chemistry", "Biology/Comp", "English", "Urdu", "Islamiyat"]

                for sub in subjects:
                    supabase.table("subjects").insert({
                        "class_id": cls['class_id'],
                        "name": sub
                    }).execute()
    except Exception as e:
        print(f"Error: {e}")

print("\n✅ Database reset and reseeded successfully!")
print("📊 Final counts:")

# Verify final counts
final_inst = supabase.table("institutes").select("*").execute().data
final_classes = supabase.table("classes").select("*").execute().data
final_subjects = supabase.table("subjects").select("*").execute().data

print(f"   Institutes: {len(final_inst)}")
print(f"   Classes: {len(final_classes)}")
print(f"   Subjects: {len(final_subjects)}")