import os
from groq import Groq

# Initialize Groq client
api_key = os.environ.get("GROQ_API_KEY")
model_id = os.environ.get("GROQ_MODEL_ID", "openai/gpt-oss-120b")
client = Groq(api_key=api_key)

def generate_feedback(student_name: str, subjects: list, weak_subjects: list, top_subject: dict, weakest_subject: dict, overall_percentage: float) -> str:
    prompt = f"Student '{student_name}' has an overall percentage of {overall_percentage:.1f}%.\n"
    if top_subject:
        prompt += f"Top Subject: {top_subject['name']} with {top_subject['marks']} marks.\n"
    if weakest_subject:
        prompt += f"Weakest Subject: {weakest_subject['name']} with {weakest_subject['marks']} marks.\n"
    
    prompt += "\nSubjects Details:\n"
    for sub in subjects:
        prompt += f"- {sub['name']}: {sub['marks']} ({sub['category']})\n"
    
    prompt += """
Please act as an empathetic, expert human tutor. Provide personalized, highly encouraging feedback in exactly this structure. Write naturally, not robotically. DO NOT use markdown tables or complex formatting.

Output Format Example:
[Motivational greeting addressing the student's overall performance]

Student Analysis:
[Write a 2-3 sentence paragraph explaining which subjects the student is weak in and which they are strong in. Recommend exactly how many hours/minutes per week they should dedicate to EACH subject (e.g., "You should spend 4 hours a week on Science, and 2 hours on Math") based on their marks.]

Detailed Weekly Study Schedule:
Please assign specific study time slots (e.g. 4:00 PM - 5:30 PM) showing exactly how the student should divide their week's time from Monday to Friday. Prioritize the weak subjects.
Monday:
• [Specific Time Range] - [Subject and specific topic/task]
(Continue similarly for Tuesday, Wednesday, Thursday, Friday...)

Weekend Roadmap:
Please suggest what the student should do specifically on Saturday and Sunday (e.g. mock tests, light revision, rest).
Saturday:
• [Actionable suggestion]
Sunday:
• [Actionable suggestion]
"""
    
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a friendly and precise AI tutor."
            },
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model=model_id,
        max_tokens=600,
        temperature=0.7
    )
    
    return chat_completion.choices[0].message.content
