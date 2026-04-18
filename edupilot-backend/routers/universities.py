"""
routers/universities.py
POST /api/universities/compare  → AI-generated real university comparison data
GET  /api/universities/search   → search universities by name
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import json, re

from gemini_client import generate_content
from supabase_client import get_cached_data, save_cached_data, is_stale

router = APIRouter()


class UniversitySearchRequest(BaseModel):
    names: List[str]
    field: str = "Computer Science"


class ROIRequest(BaseModel):
    country: str = "USA"
    field: str = "Computer Science"
    level: str = "Masters"


@router.post("/compare")
async def compare_universities(req: UniversitySearchRequest):
    # Unique key for this comparison
    sorted_names = sorted(req.names)
    cache_key = f"compare_{req.field}_{'_'.join(sorted_names)}".lower().replace(" ", "_")
    
    # 1. Check Cache
    cache = get_cached_data(cache_key)
    if cache and not is_stale(cache.get("created_at"), days=7):
        return {"universities": json.loads(cache.get("content")), "cached": True}

    # 2. Generate if missing or stale
    names_str = ", ".join(req.names)
    prompt = f"""You are a university data expert with access to the latest (2026-2027 academic cycle) data.

Provide accurate, real-time data for these universities for a {req.field} {req.field} program: {names_str}

Respond ONLY with a valid JSON array — no markdown, no extra text.

Each object must exactly follow this structure:
{{
  "id": "<number string>",
  "name": "<official university name>",
  "location": "<City, Country>",
  "ranking": "<Latest QS World Ranking (2026/27) e.g. #1>",
  "tuition": "<current annual tuition for international MS students in USD or local currency>",
  "acceptance": "<latest acceptance rate for graduate programs>",
  "avgSalary": "<latest average starting salary for {req.field} graduates in USD>",
  "roi": "<estimated 5-year ROI percentage>",
  "students": "<total enrollment>",
  "programDuration": "<typical MS duration e.g. 2 years>",
  "highlights": ["<strength1>", "<strength2>", "<strength3>"]
}}

Use the most current publicly known data as of April 2026. Be precise and accurate."""

    raw = generate_content(prompt)
    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    raw = re.sub(r"\s*```$", "", raw)

    try:
        data = json.loads(raw)
        # 3. Save to Cache
        save_cached_data(cache_key, json.dumps(data))
        return {"universities": data, "cached": False}
    except json.JSONDecodeError:
        return {"error": True, "message": "Could not parse AI response.", "raw": raw[:300]}


@router.post("/roi")
async def get_roi_data(req: ROIRequest):
    cache_key = f"roi_{req.country}_{req.field}_{req.level}".lower().replace(" ", "_")
    
    # 1. Check Cache
    cache = get_cached_data(cache_key)
    if cache and not is_stale(cache.get("created_at"), days=7):
        return {**json.loads(cache.get("content")), "cached": True}

    # 2. Generate if missing or stale
    prompt = f"""You are a financial expert on international education ROI for the 2026-2027 cycle.

Provide real current market data for studying {req.field} at Masters level in {req.country}.

Respond ONLY with a valid JSON object — no markdown, no extra text:
{{
  "country": "{req.country}",
  "tuition_per_year_usd": <integer, latest average annual tuition>,
  "living_cost_per_year_usd": <integer, current estimated annual living cost>,
  "average_starting_salary_usd": <integer, latest average starting salary for {req.field} graduates>,
  "average_salary_growth_rate": <float, e.g. 0.08 for 8% annual growth>,
  "currency_symbol": "<$ or £ or CAD$ etc>",
  "key_facts": ["<fact1 about studying/working in {req.country}>", "<fact2>", "<fact3>"]
}}

Use real, current market data as of April 2026."""

    raw = generate_content(prompt)
    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    raw = re.sub(r"\s*```$", "", raw)

    try:
        data = json.loads(raw)
        # 3. Save to Cache
        save_cached_data(cache_key, json.dumps(data))
        return {**data, "cached": False}
    except json.JSONDecodeError:
        return {"error": True, "message": "Could not parse AI response.", "raw": raw[:300]}
