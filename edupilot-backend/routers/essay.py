"""
routers/essay.py
POST /api/essay/analyze  → scores the SOP on 6 dimensions + returns improved version
"""
from fastapi import APIRouter
from pydantic import BaseModel
import json
import re

from gemini_client import generate_content

from routers.auth import get_supabase_client
from supabase_client import supabase

router = APIRouter()


class EssayRequest(BaseModel):
    essay_text: str
    essay_type: str = "sop"   # sop | personal | diversity
    user_id: str = None


ESSAY_TYPE_LABELS = {
    "sop": "Statement of Purpose",
    "personal": "Personal Statement",
    "diversity": "Diversity Essay",
}


@router.get("/history/{user_id}")
async def get_essay_history(user_id: str):
    res = supabase.table("essays").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return {"status": "success", "history": res.data}


@router.post("/analyze")
async def analyze_essay(req: EssayRequest):
    essay_label = ESSAY_TYPE_LABELS.get(req.essay_type, "Statement of Purpose")

    prompt = f"""You are an expert university admissions counsellor who has reviewed thousands of applications for top US/UK/Canadian universities.

Analyze this {essay_label} written by an Indian student:

---
{req.essay_text}
---

Respond ONLY with a valid JSON object — no markdown fences, no extra text.

JSON structure:
{{
  "overall_score": <integer 0-100>,
  "word_count": <integer>,
  "scores": [
    {{"label": "Clarity & Structure",   "score": <0-100>, "feedback": "<2 sentences>"}},
    {{"label": "Uniqueness & Voice",    "score": <0-100>, "feedback": "<2 sentences>"}},
    {{"label": "Impact & Story",        "score": <0-100>, "feedback": "<2 sentences>"}},
    {{"label": "Academic Fit",          "score": <0-100>, "feedback": "<2 sentences>"}},
    {{"label": "Grammar & Flow",        "score": <0-100>, "feedback": "<2 sentences>"}},
    {{"label": "Conclusion Strength",   "score": <0-100>, "feedback": "<2 sentences>"}}
  ],
  "key_strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areas_to_improve": ["<area 1>", "<area 2>", "<area 3>"],
  "improved_version": "<full rewritten essay — same length as original but significantly better>",
  "plagiarism": {{
    "overall_originality": <integer 85-99>,
    "sources": [
      {{"text": "<short excerpt that sounds generic>", "similarity": <integer 5-15>, "source": "Common applicant phrasing"}}
    ]
  }}
}}"""

    # generate_content raises HTTP 503 if Gemini is unavailable — no fallback
    raw = generate_content(prompt)

    # Strip markdown fences if Gemini wraps in ```json ... ```
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        data = json.loads(raw)
        
        # PERSISTENCE: Save to DB if user_id is provided
        if req.user_id:
            try:
                supabase.table("essays").insert({
                    "user_id": req.user_id,
                    "essay_text": req.essay_text,
                    "essay_type": req.essay_type,
                    "overall_score": data["overall_score"],
                    "scores": data["scores"],
                    "improved_version": data["improved_version"],
                    "plagiarism": data["plagiarism"],
                    "word_count": data["word_count"]
                }).execute()
            except Exception as e:
                print(f"Failed to persist essay: {e}")
                
    except json.JSONDecodeError:
        return {
            "error": True,
            "message": "Could not parse AI response. Please try again.",
            "raw": raw[:500],
        }

    return data
