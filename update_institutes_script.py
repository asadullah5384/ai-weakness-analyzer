import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(os.path.join(os.path.dirname(__file__), ".env.local"))

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_KEY not found in .env.local")
    exit(1)

supabase: Client = create_client(url, key)

def run():
    print("Deleting existing institutes...")
    try:
        # Delete all records by matching a condition that is always true
        res = supabase.table("institutes").delete().neq("name", "non_existent_dummy_name_123").execute()
        print(f"Deleted {len(res.data)} existing institutes.")
    except Exception as e:
        print(f"Error during deletion: {e}")
    
    schools = [
        "Army Public School Malir Cantt", "Fazaia School and College Malir", "The City School PAF Chapter Malir",
        "Beaconhouse School Malir Campus", "Foundation Public School Karachi", "Qamar-e-Bani Hashim School",
        "Hassan Academy", "Bright Career School", "As-Sadiq School", "The Skill Grooming School",
        "Al-Kazim Model School", "The Educators Malir Campus", "Allied School Malir Campus",
        "Dar-e-Arqam School Malir Campus", "Falconhouse Grammar School"
    ]
    
    colleges = [
        "Adamjee Government Science College", "D. J. Sindh Government Science College", "Nixor College",
        "The Lyceum", "Cedar College", "Commecs College", "Bahria College Karsaz", "Fazaia Inter College Malir",
        "Government Degree College Malir Cantt", "St. Patrick’s College", "Superior College for Boys Karachi",
        "Khursheed Government Girls Degree College", "Alpha College", "British International College",
        "Generations School College Section"
    ]
    
    universities = [
        "FAST National University of Computer and Emerging Sciences Karachi",
        "Federal Urdu University of Arts, Science and Technology Gulshan Campus",
        "Federal Urdu University of Arts, Science and Technology Abdul Haq Campus",
        "NED University of Engineering and Technology",
        "Institute of Business Administration Karachi",
        "Institute of Business Management Karachi",
        "Habib University", "Bahria University Karachi Campus",
        "Sir Syed University of Engineering and Technology",
        "DHA Suffa University", "Iqra University Karachi", "University of Karachi",
        "SZABIST Karachi", "Indus University Karachi", "Ziauddin University"
    ]
    
    records = []
    
    for s in schools:
        records.append({"name": s.strip(), "type": "School", "city": "Karachi"})
    for c in colleges:
        records.append({"name": c.strip(), "type": "College", "city": "Karachi"})
    for u in universities:
        records.append({"name": u.strip(), "type": "University", "city": "Karachi"})
        
    print(f"Attempting to insert {len(records)} new institutes...")
    try:
        ins_res = supabase.table("institutes").insert(records).execute()
        print(f"Successfully inserted {len(ins_res.data)} institutes!")
    except Exception as e:
        print(f"Insertion with 'city' failed: {e}")
        print("Attempting to insert without 'city' column to match old schema...")
        fallback_records = [{"name": r["name"], "type": r["type"]} for r in records]
        
        try:
            ins_res2 = supabase.table("institutes").insert(fallback_records).execute()
            print(f"Successfully inserted {len(ins_res2.data)} institutes without 'city' column.")
        except Exception as e2:
            print(f"Fallback insertion failed: {e2}")

if __name__ == "__main__":
    run()
