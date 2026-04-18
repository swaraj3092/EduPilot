"""
routers/scholarships.py
POST /api/scholarships/find  → AI-generated real scholarship listings
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import json, re
from datetime import datetime

from gemini_client import generate_content

router = APIRouter()


class ScholarshipRequest(BaseModel):
    country: str = "USA"
    field_of_study: str = "Computer Science"
    level: str = "Masters"  # Masters | PhD | Bachelors
    nationality: str = "Indian"


@router.post("/find")
async def find_scholarships(req: ScholarshipRequest):
    current_date = datetime.now().strftime("%Y-%m-%d")
    prompt = f"""You are a study abroad scholarship expert. The current exact date is {current_date}.

List 4 REAL, highly-regarded, and actually existing scholarships for a {req.nationality} student pursuing {req.level} in {req.field_of_study} in {req.country} (or globally applicable).

CRITICAL ANTI-HALLUCINATION RULES:
1. Every scholarship MUST actually exist in the real world. Do not invent names, amounts, or programs. Stick to major, well-known scholarships if necessary (e.g., Fulbright, Chevening, DAAD, Erasmus, specific verified University grants).
2. The `link` MUST be a verified, existing URL. If you do not know the exact deep-link to the application portal, provide the verified root URL of the scholarship provider (e.g., 'https://www.chevening.org' or 'https://us.fulbrightonline.org'). Do NOT guess or invent URL paths.
3. ALL deadlines MUST be strictly in the future (after {current_date}) or set to "Rolling". Do NOT list any expired scholarships.

Respond ONLY with a valid JSON array — no markdown, no extra text.

Each scholarship object must follow this exact structure:
{{
  "id": "<unique number string>",
  "name": "<exact official scholarship name>",
  "provider": "<organization/government providing it>",
  "amount": "<exact award amount in USD/local currency>",
  "country": "<country where you study>",
  "fieldOfStudy": ["<field1>", "<field2>"],
  "deadline": "<YYYY-MM-DD of next application cycle deadline>",
  "eligibility": ["<requirement1>", "<requirement2>", "<requirement3>"],
  "matchScore": <integer 60-98, higher for more relevant>,
  "link": "<official scholarship URL>"
}}

Focus on REAL scholarships that {req.nationality} students can actually apply to. Use currently accurate amounts and deadlines for the 2025-2026 cycle."""

    raw = generate_content(prompt)
    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    raw = re.sub(r"\s*```$", "", raw)

    try:
        data = json.loads(raw)
        return {"scholarships": data, "query": {"country": req.country, "field": req.field_of_study, "level": req.level}}
    except json.JSONDecodeError:
        return {"error": True, "message": "Could not parse AI response. Please try again.", "raw": raw[:300]}
