import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from models import AnalyzeRequest, AnalyzeResponse, SubjectResult
from database import supabase
from ai_service import generate_feedback

app = FastAPI(title="AI Weakness Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_performance(request: AnalyzeRequest):
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

        # 2. Categorize subjects and insert records
        results = []
        weak_subjects = []
        total_marks = 0
        total_max_marks = len(request.subjects) * 100
        top_subject = None
        weakest_subject = None
        
        for sub in request.subjects:
            category = "Weak" if sub.marks < 50 else ("Average" if sub.marks <= 75 else "Strong")
            res = SubjectResult(name=sub.name, marks=sub.marks, category=category)
            results.append(res)
            
            total_marks += sub.marks
            if top_subject is None or sub.marks > top_subject.marks:
                top_subject = res
            if weakest_subject is None or sub.marks < weakest_subject.marks:
                weakest_subject = res

            if category == "Weak":
                weak_subjects.append({"name": sub.name, "marks": sub.marks, "category": category})
                
            # Ensure subject exists
            subj_res = supabase.table("subjects").select("*").eq("name", sub.name).execute()
            if not subj_res.data:
                new_subj = supabase.table("subjects").insert({"name": sub.name}).execute()
                subject_id = new_subj.data[0]["subject_id"]
            else:
                subject_id = subj_res.data[0]["subject_id"]
                
            # Log performance record
            supabase.table("performance_records").insert({
                "user_id": user_id,
                "subject_id": subject_id,
                "marks": sub.marks,
                "category": category
            }).execute()

        # 3. Generate AI Feedback
        overall_percentage = (total_marks / total_max_marks) * 100 if total_max_marks > 0 else 0
        feedback_dict_list = [{"name": r.name, "marks": r.marks, "category": r.category} for r in results]
        
        top_dict = {"name": top_subject.name, "marks": top_subject.marks} if top_subject else None
        weak_dict = {"name": weakest_subject.name, "marks": weakest_subject.marks} if weakest_subject else None
        
        feedback_text = generate_feedback(user_name, feedback_dict_list, weak_subjects, top_dict, weak_dict, overall_percentage)
        
        # Store suggestion
        supabase.table("suggestions").insert({
            "user_id": user_id,
            "suggestion_text": feedback_text,
            "is_ai_generated": True
        }).execute()
        
        # Log analytics
        supabase.table("analytics_logs").insert({
            "user_id": user_id,
            "action_type": "analysis",
            "action_details": {"subjects_count": len(request.subjects), "weak_count": len(weak_subjects)}
        }).execute()

        return AnalyzeResponse(
            user_id=user_id,
            results=results,
            total_marks=total_marks,
            total_max_marks=total_max_marks,
            overall_percentage=overall_percentage,
            top_subject=top_subject.name if top_subject else None,
            weakest_subject=weakest_subject.name if weakest_subject else None,
            ai_feedback=feedback_text
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history/{user_id}")
async def get_history(user_id: str):
    try:
        records_res = supabase.table("performance_records").select("*, subjects(name)").eq("user_id", user_id).execute()
        suggestions_res = supabase.table("suggestions").select("*").eq("user_id", user_id).execute()
        return {
            "performance": records_res.data,
            "suggestions": suggestions_res.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount frontend directory
frontend_path = os.path.join(os.path.dirname(__file__), "../frontend")
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
