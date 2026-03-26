import os
from supabase import create_client

# Load from .env.local format manually since it's just a file read
supabase_url = "https://tqadztsovfigraudmgkw.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYWR6dHNvdmZpZ3JhdWRtZ2t3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMzExOSwiZXhwIjoyMDg5NTA5MTE5fQ.uOLRh2GXIKCxJA5jP0AMtjHIqslFD5ZvJFW0FZyQXks"

supabase = create_client(supabase_url, supabase_key)

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

def seed():
    print("Seeding institutes...")
    for inst_data in karachi_institutes:
        try:
            # Check if this institute already exists
            existing = supabase.table("institutes").select("*").eq("name", inst_data['name']).eq("type", inst_data['type']).execute()
            if existing.data:
                inst = existing.data[0]  # Use the existing one
                print(f"✓ Institute exists: {inst['name']}")
            else:
                # Insert new institute
                res = supabase.table("institutes").insert(inst_data).execute()
                if not res.data:
                    print(f"Failed to add {inst_data['name']}: No data returned")
                    continue
                inst = res.data[0]
                print(f"+ Added Institute: {inst['name']}")
        except Exception as e:
            print(f"Error adding institute {inst_data['name']}: {str(e)}")
            continue
            
        # Add classes/fields based on type
        classes_to_add = []
        if inst_data['type'] == "School":
            classes_to_add = ["Class 8", "Class 9", "Class 10"]
        elif inst_data['type'] == "College":
            # Fields instead of classes for colleges
            classes_to_add = ["Pre-Engineering (11)", "Pre-Engineering (12)", "Pre-Medical (11)", "Pre-Medical (12)", "General Science (11)", "General Science (12)"]
        else:  # University
            classes_to_add = [f"Semester {i}" for i in range(1, 9)]  # Semesters 1-8
        
        # Add each class/field
        for class_name in classes_to_add:
            try:
                # Check if class already exists for this institute
                existing_cls = supabase.table("classes").select("*").eq("institute_id", inst['institute_id']).eq("name", class_name).execute()
                if existing_cls.data:
                    cls = existing_cls.data[0]
                    print(f"  ✓ Class exists: {cls['name']}")
                else:
                    cls_res = supabase.table("classes").insert({
                        "institute_id": inst['institute_id'], 
                        "name": class_name
                    }).execute()
                    
                    if cls_res.data:
                        cls = cls_res.data[0]
                        print(f"  + Added: {cls['name']}")
                    else:
                        continue
                
                # Add relevant subjects
                if inst_data['type'] == "University":
                    subjects = ["Programming Fundamentals", "Calculus & Analyt. Geometry", "Functional English", "ICT", "Applied Physics"]
                elif inst_data['type'] == "College":
                    # Subjects based on field
                    if "Engineering" in class_name:
                        subjects = ["Mathematics", "Physics", "Chemistry", "Mechanics", "English"]
                    elif "Medical" in class_name:
                        subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English"]
                    else:  # General Science
                        subjects = ["Mathematics", "Physics", "Chemistry", "Statistics", "English"]
                else:  # School
                    subjects = ["Mathematics", "Physics", "Chemistry", "Biology/Comp", "English", "Urdu", "Islamiyat"]
                    
                for sub in subjects:
                    try:
                        # Check if subject already exists
                        existing_sub = supabase.table("subjects").select("*").eq("class_id", cls['class_id']).eq("name", sub).execute()
                        if not existing_sub.data:
                            supabase.table("subjects").insert({
                                "class_id": cls['class_id'], 
                                "name": sub
                            }).execute()
                    except:
                        pass  # Ignore subject errors
            except Exception as e:
                print(f"  Error adding {class_name}: {str(e)}")
            
    print("Seed complete!")

if __name__ == "__main__":
    seed()
