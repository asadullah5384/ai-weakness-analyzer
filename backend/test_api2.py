import requests
import json

payload = {
    "user_name": "Test",
    "subjects": [
        {"name": "urdu", "marks": 77},
        {"name": "computer", "marks": 75},
        {"name": "math", "marks": 67},
        {"name": "english", "marks": 52}
    ]
}

try:
    response = requests.post("http://localhost:8000/api/analyze", json=payload)
    with open("response.json", "w", encoding="utf-8") as f:
        f.write(response.text)
except Exception as e:
    print("Error:", e)
