@echo off
setlocal enabledelayedexpansion

for /f "tokens=1* delims==" %%A in (.env.local) do (
    set key=%%A
    set val=%%B
    if "!key!"=="SUPABASE_URL" (
        set val=!val:"=!
        set URL=!val!
    )
    if "!key!"=="SUPABASE_KEY" (
        set val=!val:"=!
        set KEY=!val!
    )
)

echo Deleting existing institutes...
curl.exe -s -X DELETE "%URL%/rest/v1/institutes?institute_id=not.is.null" -H "apikey: %KEY%" -H "Authorization: Bearer %KEY%"

echo Inserting institutes with city...
curl.exe -s -X POST "%URL%/rest/v1/institutes" -H "apikey: %KEY%" -H "Authorization: Bearer %KEY%" -H "Content-Type: application/json" -H "Prefer: return=minimal" -d @payload_city.json > curl_out_city.txt
type curl_out_city.txt

echo Checking if failure occurred...
findstr /i "error" curl_out_city.txt >nul
if %errorlevel%==0 (
    echo Attempting without city column...
    curl.exe -s -X POST "%URL%/rest/v1/institutes" -H "apikey: %KEY%" -H "Authorization: Bearer %KEY%" -H "Content-Type: application/json" -H "Prefer: return=minimal" -d @payload_nocity.json > curl_out_nocity.txt
    type curl_out_nocity.txt
)
