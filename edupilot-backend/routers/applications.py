"""
routers/applications.py
POST /api/applications/generate-tracker  → AI-generated actual Application checklist & deadline
"""
from fastapi import APIRouter
from pydantic import BaseModel
import json, re

from gemini_client import generate_content

router = APIRouter()

class AppTrackerRequest(BaseModel):
    university: str
    program: str

@router.post("/generate-tracker")
async def generate_tracker(req: AppTrackerRequest):
    prompt = f"""You are a graduate admissions counselor preparing a concrete application checklist for a student applying to {req.program} at {req.university}.

Respond ONLY with a valid JSON object — no markdown, no extra text.

Provide the exact (or most accurate estimated) application deadline for the Fall 2025 or Fall 2026 intake, and the typical list of documents strictly required by this specific university and program.

Structure exactly:
{{
  "deadline": "<YYYY-MM-DD>",
  "documents": [
    {{"name": "Transcripts", "uploaded": false}},
    {{"name": "document 2 (be specific to {req.university})", "uploaded": false}}
  ],
  "notes": "<Brief advice or unique requirement for {req.university} {req.program}>"
}}
"""
    raw = generate_content(prompt)
    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    raw = re.sub(r"\s*```$", "", raw)

    try:
        data = json.loads(raw)
        return {"tracker": data}
    except json.JSONDecodeError:
        return {"error": True, "message": "Could not parse AI response.", "raw": raw[:300]}
