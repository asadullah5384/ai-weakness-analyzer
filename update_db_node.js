const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key && val.length > 0) acc[key.trim()] = val.join('=').trim().replace(/^"|"$/g, '');
    return acc;
}, {});

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE credentials in .env.local", env);
  process.exit(1);
}

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

const schools = [
  "Army Public School Malir Cantt", "Fazaia School and College Malir", "The City School PAF Chapter Malir",
  "Beaconhouse School Malir Campus", "Foundation Public School Karachi", "Qamar-e-Bani Hashim School",
  "Hassan Academy", "Bright Career School", "As-Sadiq School", "The Skill Grooming School",
  "Al-Kazim Model School", "The educators Malir Campus", "Allied School Malir Campus",
  "Dar-e-Arqam School Malir Campus", "Falconhouse Grammar School"
];

const colleges = [
  "Adamjee Government Science College", "D. J. Sindh Government Science College", "Nixor College",
  "The Lyceum", "Cedar College", "Commecs College", "Bahria College Karsaz", "Fazaia Inter College Malir",
  "Government Degree College Malir Cantt", "St. Patrick’s College", "Superior College for Boys Karachi",
  "Khursheed Government Girls Degree College", "Alpha College", "British International College",
  "Generations School College Section"
];

const universities = [
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
];

async function run() {
  try {
    console.log("Deleting existing institutes completely...");
    const delRes = await fetch(`${SUPABASE_URL}/rest/v1/institutes?institute_id=not.is.null`, {
      method: 'DELETE',
      headers
    });
    if (!delRes.ok) console.error("Warning on delete:", await delRes.text());
    else console.log("Deleted old records successfully.");

    let records = [];
    schools.forEach(s => records.push({ name: s, type: "School", city: "Karachi" }));
    colleges.forEach(c => records.push({ name: c, type: "College", city: "Karachi" }));
    universities.forEach(u => records.push({ name: u, type: "University", city: "Karachi" }));

    console.log(`Inserting ${records.length} new records...`);
    
    // Attempt with 'city'
    let insRes = await fetch(`${SUPABASE_URL}/rest/v1/institutes`, {
      method: 'POST',
      headers,
      body: JSON.stringify(records)
    });

    if (!insRes.ok) {
        console.log("Insert with city failed, trying without city. Error:", await insRes.text());
        // Attempt without city
        const fallback = records.map(r => ({ name: r.name, type: r.type }));
        let insRes2 = await fetch(`${SUPABASE_URL}/rest/v1/institutes`, {
          method: 'POST',
          headers,
          body: JSON.stringify(fallback)
        });
        if (!insRes2.ok) {
            console.error("Fallback insert failed:", await insRes2.text());
        } else {
            console.log("Successfully inserted records (without city)!");
        }
    } else {
        console.log("Successfully inserted records (with city)!");
    }
  } catch (err) {
    console.error("Fatal Error:", err);
  }
}

run();
