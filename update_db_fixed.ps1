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

# 1. Delete Existing
$deleteUrl = "$supabaseUrl/rest/v1/institutes?institute_id=not.is.null"
try {
    Invoke-RestMethod -Uri $deleteUrl -Method Delete -Headers $headers
    Write-Host "Successfully deleted existing institutes."
} catch {
    Write-Host "Delete warning: $_"
}

# 2. Insert new using raw JSON from file
$jsonWithCity = Get-Content 'payload_city.json' -Raw
$insertUrl = "$supabaseUrl/rest/v1/institutes"

try {
    Invoke-RestMethod -Uri $insertUrl -Method Post -Headers $headers -Body $jsonWithCity
    Write-Host "Successfully inserted institutes with City!"
} catch {
    Write-Host "Insert with City failed: $_"
    Write-Host "Attempting fallback (no City column)..."
    
    $jsonNoCity = Get-Content 'payload_nocity.json' -Raw
    try {
        Invoke-RestMethod -Uri $insertUrl -Method Post -Headers $headers -Body $jsonNoCity
        Write-Host "Successfully inserted institutes without City!"
    } catch {
        Write-Host "Fallback insert failed: $_"
    }
}
