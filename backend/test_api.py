import requests

payload = {
    "user_name": "Test",
    "subjects": [
        {"name": "Math", "marks": 40},
        {"name": "English", "marks": 80}
    ]
}

try:
    response = requests.post("http://localhost:8000/api/analyze", json=payload)
    print("Status:", response.status_code)
    print("Response:", response.text)
except Exception as e:
    print("Error:", e)
