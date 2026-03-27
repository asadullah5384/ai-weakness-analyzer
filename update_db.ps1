$envText = Get-Content '.env.local' -Raw
$envLines = $envText -split "`n"
$envDict = @{}
foreach ($line in $envLines) {
    if ($line -match '^(.*?)=(.*)$') {
        $envDict[$matches[1].Trim()] = $matches[2].Trim().Trim('"').Trim("'")
    }
}

$supabaseUrl = $envDict['SUPABASE_URL']
$supabaseKey = $envDict['SUPABASE_KEY']

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=minimal"
}

# 1. Delete existing
$deleteUrl = "$supabaseUrl/rest/v1/institutes?institute_id=not.is.null"
try {
    Invoke-RestMethod -Uri $deleteUrl -Method Delete -Headers $headers
    Write-Host "Successfully deleted existing institutes."
} catch {
    Write-Host "Delete warning: $_"
}

# 2. Insert new
$schools = @("Army Public School Malir Cantt", "Fazaia School and College Malir", "The City School PAF Chapter Malir", "Beaconhouse School Malir Campus", "Foundation Public School Karachi", "Qamar-e-Bani Hashim School", "Hassan Academy", "Bright Career School", "As-Sadiq School", "The Skill Grooming School", "Al-Kazim Model School", "The Educators Malir Campus", "Allied School Malir Campus", "Dar-e-Arqam School Malir Campus", "Falconhouse Grammar School")

$colleges = @("Adamjee Government Science College", "D. J. Sindh Government Science College", "Nixor College", "The Lyceum", "Cedar College", "Commecs College", "Bahria College Karsaz", "Fazaia Inter College Malir", "Government Degree College Malir Cantt", "St. Patrick’s College", "Superior College for Boys Karachi", "Khursheed Government Girls Degree College", "Alpha College", "British International College", "Generations School College Section")

$universities = @("FAST National University of Computer and Emerging Sciences Karachi", "Federal Urdu University of Arts, Science and Technology Gulshan Campus", "Federal Urdu University of Arts, Science and Technology Abdul Haq Campus", "NED University of Engineering and Technology", "Institute of Business Administration Karachi", "Institute of Business Management Karachi", "Habib University", "Bahria University Karachi Campus", "Sir Syed University of Engineering and Technology", "DHA Suffa University", "Iqra University Karachi", "University of Karachi", "SZABIST Karachi", "Indus University Karachi", "Ziauddin University")

$records = @()
foreach ($s in $schools) { $records += @{ name = $s; type = "School"; city = "Karachi" } }
foreach ($c in $colleges) { $records += @{ name = $c; type = "College"; city = "Karachi" } }
foreach ($u in $universities) { $records += @{ name = $u; type = "University"; city = "Karachi" } }

$jsonBody = $records | ConvertTo-Json -Depth 5

$insertUrl = "$supabaseUrl/rest/v1/institutes"
try {
    Invoke-RestMethod -Uri $insertUrl -Method Post -Headers $headers -Body $jsonBody
    Write-Host "Successfully inserted $($records.Length) institutes with city!"
} catch {
    Write-Host "Insert with city failed: $_"
    Write-Host "Attempting fallback logic without city..."
    
    $fallbackRecords = @()
    foreach ($r in $records) { $fallbackRecords += @{ name = $r.name; type = $r.type } }
    $fallbackJson = $fallbackRecords | ConvertTo-Json -Depth 5
    
    try {
        Invoke-RestMethod -Uri $insertUrl -Method Post -Headers $headers -Body $fallbackJson
        Write-Host "Successfully inserted records without city!"
    } catch {
        Write-Host "Fallback insert failed: $_"
    }
}
