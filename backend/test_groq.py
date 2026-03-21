import os
from dotenv import load_dotenv
load_dotenv()

from ai_service import generate_feedback

print("Testing generate_feedback...")

subjects = [
    {"name": "urdu", "marks": 77, "category": "Strong"},
    {"name": "english", "marks": 52, "category": "Average"}
]
weak = []
top = {"name": "urdu", "marks": 77}
weakest = {"name": "english", "marks": 52}

try:
    res = generate_feedback("Test", subjects, weak, top, weakest, 64.5)
    print("RAW RES:", repr(res))
except Exception as e:
    print("EXCEPTION:", repr(e))
