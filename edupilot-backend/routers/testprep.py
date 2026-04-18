"""
routers/testprep.py
POST /api/testprep/requirements  → AI-generated real university test requirements
POST /api/testprep/analyze       → AI score analysis & feedback
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import json, re

from gemini_client import generate_content

router = APIRouter()


class TestRequirementsRequest(BaseModel):
    field: str = "Computer Science"
    level: str = "Masters"
    country: str = "USA"


class ScoreAnalysisRequest(BaseModel):
    test_type: str  # gre | toefl | ielts | gmat
    scores: dict    # e.g. {"verbal": 155, "quant": 165, "awa": 4.0}
    target_field: str = "Computer Science"
    target_country: str = "USA"


@router.post("/requirements")
async def get_test_requirements(req: TestRequirementsRequest):
    prompt = f"""You are a graduate admissions expert with current 2024-2025 data.

List the GRE, TOEFL, and IELTS score requirements for the top 5 universities for {req.level} in {req.field} in {req.country}.

Respond ONLY with a valid JSON array — no markdown, no extra text.

Each object must follow exactly:
{{
  "name": "<university name>",
  "gre": "<minimum GRE total score or N/A>",
  "toefl": "<minimum TOEFL score or N/A>",
  "ielts": "<minimum IELTS band or N/A>",
  "gmat": "<minimum GMAT score or N/A>",
  "notes": "<any important note e.g. GRE waived for certain applicants>"
}}

Use real, current publicly stated minimum scores. Include schools from MIT to Georgia Tech."""

    raw = generate_content(prompt)
    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    raw = re.sub(r"\s*```$", "", raw)

    try:
        data = json.loads(raw)
        return {"requirements": data}
    except json.JSONDecodeError:
        return {"error": True, "message": "Could not parse AI response.", "raw": raw[:300]}


@router.post("/analyze")
async def analyze_test_score(req: ScoreAnalysisRequest):
    scores_str = ", ".join([f"{k}: {v}" for k, v in req.scores.items()])
    prompt = f"""You are a test prep expert helping an Indian student apply for {req.target_field} programs in {req.target_country}.

Student's {req.test_type.upper()} section scores: {scores_str}

Provide an analysis. Respond ONLY with a valid JSON object — no markdown, no extra text:
{{
  "predicted_total": <calculated total score as integer>,
  "percentile": "<estimated percentile e.g. 75th>",
  "rating": "<Excellent|Good|Average|Below Average>",
  "feedback": "<2-3 sentences of personalized feedback>",
  "universities_achievable": ["<uni1>", "<uni2>", "<uni3>"],
  "improvement_tips": ["<tip1>", "<tip2>", "<tip3>"]
}}"""

    raw = generate_content(prompt)
    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    raw = re.sub(r"\s*```$", "", raw)

    try:
        data = json.loads(raw)
        return data
    except json.JSONDecodeError:
        return {"error": True, "message": "Could not parse AI response.", "raw": raw[:300]}
