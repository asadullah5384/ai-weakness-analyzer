import os
import uuid
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from groq import Groq

# 1. Configuration & Initializations
# Note: Vercel provides environment variables directly, no load_dotenv needed.

# Supabase
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

print("Initializing Supabase...")
supabase: Optional[Client] = None
if supabase_url and supabase_key:
    try:
        supabase = create_client(supabase_url, supabase_key)
        print("Supabase client created successfully.")
    except Exception as e:
        print(f"Error initializing Supabase: {e}")

# Groq
print("Initializing Groq...")
groq_api_key = os.environ.get("GROQ_API_KEY")
groq_model_id = os.environ.get("GROQ_MODEL_ID", "llama3-8b-8192")
groq_client = Groq(api_key=groq_api_key) if groq_api_key else None
if groq_client: print("Groq client created.")

# 2. Models
class UserAuth(BaseModel):
    email: str # Use str instead of EmailStr to avoid dependency issues on some platforms
    password: str
    name: Optional[str] = None

class SubjectInput(BaseModel):
    name: str
    marks: int
    topic_id: Optional[str] = None

class InstituteBase(BaseModel):
    name: str
    type: str

class ClassBase(BaseModel):
    name: str
    institute_id: str
class AnalyzeRequest(BaseModel):
    user_name: Optional[str] = "Student"
    user_email: Optional[str] = None
    subjects: List[SubjectInput]

class SubjectResult(BaseModel):
    name: str
    marks: int
    category: str

class AnalyzeResponse(BaseModel):
    user_id: str
    results: List[SubjectResult]
    total_marks: int
    total_max_marks: int
    overall_percentage: float
    top_subject: Optional[str]
    weakest_subject: Optional[str]
    ai_feedback: str

class StudySessionInput(BaseModel):
    user_id: str
    subject_id: Optional[str] = None
    duration_minutes: int

class GoalInput(BaseModel):
    user_id: str
    goal_text: str
    target_date: Optional[str] = None

# 3. AI Service Logic
def generate_feedback(student_name: str, subjects: list, weak_subjects: list, top_subject: dict, weakest_subject: dict, overall_percentage: float) -> str:
    if not groq_client: return "AI service not configured."
    
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
AI Summary:
[A very short 1-sentence summary of the overall status]

Motivational Greeting:
[Greeting addressing the student's name and overall performance]

Student Analysis:
[Write a 2-3 sentence paragraph explaining which subjects the student is weak in and which they are strong in. Recommend exactly how many hours/minutes per week they should dedicate to EACH subject based on their marks.]

Detailed Weekly Study Schedule:
Please assign specific study time slots showing exactly how the student should divide their week's time from Monday to Friday. Prioritize the weak subjects.
Monday:
• [Time] - [Subject/Task]
...
Weekend Roadmap:
Saturday: ...
Sunday: ...
"""
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a friendly and precise AI tutor."},
                {"role": "user", "content": prompt}
            ],
            model=groq_model_id,
            max_tokens=800,
            temperature=0.7
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        return f"AI Feedback generation failed: {str(e)}"

def analyze_why_weak(subject_name: str, marks: int, history: list) -> str:
    if not groq_client: return "AI service not configured."
    
    prompt = f"Student is weak in {subject_name} with {marks}/100 marks.\n"
    if history:
        prompt += f"Previous marks in this subject: {', '.join(map(str, history))}\n"
    
    prompt += """
Act as an academic counselor. Explain 'Why' the student might be struggling and provide 3-4 deep behavioral or conceptual tips to overcome this weakness. 
Keep it conversational and helpful. 
Format: 
- Why? [Explanation]
- Actionable Steps: [List]
"""
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a supportive academic advisor."},
                {"role": "user", "content": prompt}
            ],
            model=groq_model_id,
            max_tokens=400,
            temperature=0.7
        )
        return chat_completion.choices[0].message.content
    except Exception:
        return "Could not generate analysis at this time."

# 4. FastAPI App
app = FastAPI(title="AI Weakness Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    import sys
    return {
        "status": "ok",
        "python_version": sys.version,
        "env": {
            "SUPABASE_URL": bool(supabase_url),
            "SUPABASE_KEY": bool(supabase_key),
            "GROQ_API_KEY": bool(groq_api_key),
            "GROQ_MODEL_ID": bool(groq_model_id)
        }
    }

# --- Auth Endpoints ---
@app.post("/api/auth/signup")
async def signup(user: UserAuth):
    if not supabase: raise HTTPException(status_code=500, detail="Supabase not configured.")
    try:
        # 1. Sign up with Supabase Auth
        auth_res = supabase.auth.sign_up({"email": user.email, "password": user.password})
        if not auth_res.user: 
            raise HTTPException(status_code=400, detail="Signup failed.")
        
        # 2. Add to our users table
        supabase.table("users").insert({
            "user_id": auth_res.user.id,
            "name": user.name or "Student",
            "email": user.email
        }).execute()
        
        return {"message": "User created successfully", "user_id": auth_res.user.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login")
async def login(user: UserAuth):
    if not supabase: raise HTTPException(status_code=500, detail="Supabase not configured.")
    try:
        res = supabase.auth.sign_in_with_password({"email": user.email, "password": user.password})
        if not res.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {"access_token": res.session.access_token, "user": res.user}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

# --- Data Fetching ---
@app.get("/api/institutes")
async def get_institutes(type: Optional[str] = None):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized. Check ENV variables.")
    try:
        query = supabase.table("institutes").select("*")
        if type:
            query = query.eq("type", type)
        res = query.execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/classes/{institute_id}")
async def get_classes(institute_id: str):
    if not supabase: raise HTTPException(status_code=500, detail="Supabase client not initialized.")
    res = supabase.table("classes").select("*").eq("institute_id", institute_id).execute()
    return res.data

@app.get("/api/subjects/{class_id}")
async def get_subjects(class_id: str):
    if not supabase: raise HTTPException(status_code=500, detail="Supabase client not initialized.")
    res = supabase.table("subjects").select("*").eq("class_id", class_id).execute()
    return res.data

@app.get("/api/topics/{subject_id}")
async def get_topics(subject_id: str):
    if not supabase: raise HTTPException(status_code=500, detail="Supabase client not initialized.")
    res = supabase.table("topics").select("*").eq("subject_id", subject_id).execute()
    return res.data

# --- Data Management (Admin-like) ---
@app.post("/api/institutes")
async def create_institute(inst: InstituteBase):
    res = supabase.table("institutes").insert(inst.dict()).execute()
    return res.data[0]

@app.post("/api/classes")
async def create_class(cls: ClassBase):
    res = supabase.table("classes").insert(cls.dict()).execute()
    return res.data[0]

@app.post("/api/subjects")
async def create_subject(name: str, class_id: str):
    res = supabase.table("subjects").insert({"name": name, "class_id": class_id}).execute()
    return res.data[0]

@app.post("/api/topics")
async def create_topic(name: str, subject_id: str):
    res = supabase.table("topics").insert({"name": name, "subject_id": subject_id}).execute()
    return res.data[0]

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_performance(request: AnalyzeRequest):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured.")
        
    try:
        user_email = request.user_email or f"anon_{uuid.uuid4()}@example.com"
        user_name = request.user_name or "Anonymous Student"
        
        # 1. Create or get user
        user_res = supabase.table("users").select("*").eq("email", user_email).execute()
        if not user_res.data:
            new_user = supabase.table("users").insert({"name": user_name, "email": user_email}).execute()
            user_id = new_user.data[0]["user_id"]
        else:
            user_id = user_res.data[0]["user_id"]
        
        # 2. Categorize subjects
        results = []
        weak_subjects_list = []
        total_marks = 0
        total_max_marks = len(request.subjects) * 100
        top_subject = None
        weakest_subject = None
        
        for sub in request.subjects:
            cat = "Weak" if sub.marks < 50 else ("Average" if sub.marks <= 75 else "Strong")
            res = SubjectResult(name=sub.name, marks=sub.marks, category=cat)
            results.append(res)
            total_marks += sub.marks
            
            if top_subject is None or sub.marks > top_subject.marks: top_subject = res
            if weakest_subject is None or sub.marks < weakest_subject.marks: weakest_subject = res
            if cat == "Weak": weak_subjects_list.append({"name": sub.name, "marks": sub.marks, "category": cat})
                
            # Subject & Record
            subj_res = supabase.table("subjects").select("*").eq("name", sub.name).execute()
            if not subj_res.data:
                sid = supabase.table("subjects").insert({"name": sub.name}).execute().data[0]["subject_id"]
            else:
                sid = subj_res.data[0]["subject_id"]
                
            supabase.table("performance_records").insert({
                "user_id": user_id, "subject_id": sid, "marks": sub.marks, "category": cat
            }).execute()

        # 3. AI Feedback
        overall_perc = (total_marks / total_max_marks) * 100 if total_max_marks > 0 else 0
        feedback_dicts = [{"name": r.name, "marks": r.marks, "category": r.category} for r in results]
        top_d = {"name": top_subject.name, "marks": top_subject.marks} if top_subject else None
        weak_d = {"name": weakest_subject.name, "marks": weakest_subject.marks} if weakest_subject else None
        
        fb_text = generate_feedback(user_name, feedback_dicts, weak_subjects_list, top_d, weak_d, overall_perc)
        
        # Store & Log
        supabase.table("suggestions").insert({"user_id": user_id, "suggestion_text": fb_text, "is_ai_generated": True}).execute()
        supabase.table("analytics_logs").insert({
            "user_id": user_id, "action_type": "analysis", "action_details": {"subjects": len(request.subjects)}
        }).execute()

        return AnalyzeResponse(
            user_id=user_id, results=results, total_marks=total_marks, total_max_marks=total_max_marks,
            overall_percentage=overall_perc, top_subject=top_subject.name if top_subject else None,
            weakest_subject=weakest_subject.name if weakest_subject else None, ai_feedback=fb_text
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history/{user_id}")
async def get_history(user_id: str):
    if not supabase: raise HTTPException(status_code=500, detail="Supabase client not initialized. Check ENV variables.")
    try:
        recs = supabase.table("performance_records").select("*, subjects(name)").eq("user_id", user_id).execute()
        sugs = supabase.table("suggestions").select("*").eq("user_id", user_id).execute()
        return {"performance": recs.data, "suggestions": sugs.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analyze/why-weak")
async def get_why_weak(user_id: str, subject_name: str):
    if not supabase: raise HTTPException(status_code=500, detail="Supabase not configured.")
    try:
        # Get history for this subject
        res = supabase.table("performance_records").select("marks").eq("user_id", user_id).execute()
        # Note: In a real app, I'd filter by subject_id, but here I'll use latest marks for simplicity
        # or just pass the subject name.
        
        # We also need the current marks. For now, let's just use the history to find the subject.
        history = [r["marks"] for r in res.data]
        latest_marks = history[-1] if history else 40
        
        analysis = analyze_why_weak(subject_name, latest_marks, history[:-1])
        return {"subject": subject_name, "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Productivity Endpoints ---
@app.post("/api/sessions")
async def save_session(session: StudySessionInput):
    res = supabase.table("study_sessions").insert(session.dict()).execute()
    return res.data[0]

@app.get("/api/goals/{user_id}")
async def get_goals(user_id: str):
    res = supabase.table("goals").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return res.data

@app.post("/api/goals")
async def create_goal(goal: GoalInput):
    res = supabase.table("goals").insert(goal.dict()).execute()
    return res.data[0]

# --- Chatbot Endpoint ---
@app.post("/api/chat")
async def chat_with_ai(request: dict):
    try:
        message = request.get("message", "")
        user_id = request.get("user_id", "anonymous")
        context = request.get("context", {})

        if not message:
            return {"response": "Please ask me something!"}

        # Create context-aware prompt
        context_str = ""
        if context.get("level"):
            context_str += f"You are helping a {context['level']} student. "
        if context.get("institute"):
            context_str += f"They study at {context['institute']}. "
        if context.get("class"):
            context_str += f"They are in {context['class']}. "
        if context.get("field"):
            context_str += f"Their field is {context['field']}. "

        prompt = f"""{context_str}You are an empathetic AI study assistant for students in Pakistan. 
        Respond to: "{message}"
        
        Guidelines:
        - Be encouraging and supportive
        - Provide practical study tips
        - Keep responses concise but helpful
        - Use simple language
        - If they ask about subjects, relate to Sindh Board curriculum
        - If they need motivation, give specific actionable advice
        - Always end with a positive note"""

        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=groq_model_id,
            max_tokens=300,
            temperature=0.7
        )
        
        response = chat_completion.choices[0].message.content
        return {"response": response}
        
    except Exception as e:
        print(f"Chat error: {e}")
        return {"response": "I'm sorry, I'm having trouble responding right now. Please try again later!"}

# No handler needed for Vercel if app is named 'app' or 'index'
