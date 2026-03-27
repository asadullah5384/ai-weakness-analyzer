import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env.local"))

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_KEY not found in .env.local")
    exit(1)

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def run():
    base_endpoint = f"{url}/rest/v1/institutes"
    
    print("Deleting existing institutes...")
    # Delete where type is not equal to 'dummy_non_existent'
    del_res = requests.delete(f"{base_endpoint}?id=not.eq.00000000-0000-0000-0000-000000000000", headers=headers)
    
    if del_res.status_code >= 400:
        print("Delete failed, trying by name...")
        del_res = requests.delete(f"{base_endpoint}?name=not.eq.dummy_val", headers=headers)
        if del_res.status_code >= 400:
            print(f"Delete error: {del_res.text}")
    else:
        print(f"Delete response: {del_res.status_code}")
    
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
    
    ins_res = requests.post(base_endpoint, headers=headers, json=records)
    
    if ins_res.status_code >= 400:
        print(f"Insertion failed: {ins_res.text}")
        print("Attempting to insert without 'city' column...")
        fallback_records = [{"name": r["name"], "type": r["type"]} for r in records]
        
        ins_res2 = requests.post(base_endpoint, headers=headers, json=fallback_records)
        if ins_res2.status_code >= 400:
            print(f"Fallback insertion failed: {ins_res2.text}")
        else:
            print(f"Successfully inserted institutes without 'city' column. Status: {ins_res2.status_code}")
    else:
        print(f"Successfully inserted institutes! Status: {ins_res.status_code}")

if __name__ == "__main__":
    run()
