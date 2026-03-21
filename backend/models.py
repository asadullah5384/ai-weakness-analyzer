from pydantic import BaseModel
from typing import List, Optional

class SubjectInput(BaseModel):
    name: str
    marks: int

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
