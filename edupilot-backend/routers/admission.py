"""
routers/admission.py
POST /api/admission/probability  → returns per-university admission probability
                                    + AI-generated profile summary
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import json
import re

from gemini_client import generate_content

router = APIRouter()


class AdmissionRequest(BaseModel):
    gre: int = 0
    gpa: float = 0.0
    toefl: int = 0
    backlogs: int = 0
    research_papers: int = 0
    internships: int = 0
    work_experience_years: int = 0
    target_course: str = "MS Computer Science"
    universities: List[str] = []


# ── Pure-math base score (fast, no API needed) ────────────────────────────────
def calc_base_score(req: AdmissionRequest) -> int:
    score = 0
    score += min(35, int((req.gre / 340) * 35))
    score += min(35, int((req.gpa / 4.0) * 35))
    score += min(20, int((req.toefl / 120) * 20))
    score += min(5,  req.research_papers * 2)
    score += min(5,  req.internships)
    score -= req.backlogs * 3
    return max(0, min(100, score))


# ── University thresholds (realistic for Indian applicants) ───────────────────
UNIVERSITY_DATA = {
    "MIT":              {"base_req": 88, "rank": "#1",  "tuition": "$57,986"},
    "Stanford":         {"base_req": 85, "rank": "#3",  "tuition": "$56,169"},
    "Carnegie Mellon":  {"base_req": 82, "rank": "#2",  "tuition": "$58,924"},
    "UC Berkeley":      {"base_req": 80, "rank": "#4",  "tuition": "$29,026"},
    "Georgia Tech":     {"base_req": 72, "rank": "#5",  "tuition": "$31,370"},
    "Cornell":          {"base_req": 78, "rank": "#12", "tuition": "$55,188"},
    "Princeton":        {"base_req": 90, "rank": "#1",  "tuition": "$57,410"},
    "Harvard":          {"base_req": 92, "rank": "#2",  "tuition": "$54,768"},
    "Caltech":          {"base_req": 87, "rank": "#6",  "tuition": "$60,816"},
    "UIUC":             {"base_req": 68, "rank": "#5",  "tuition": "$33,054"},
    "University of Toronto": {"base_req": 70, "rank": "#18", "tuition": "CAD 45,280"},
    "University of Melbourne": {"base_req": 65, "rank": "#14", "tuition": "AUD 42,000"},
    "Oxford":           {"base_req": 86, "rank": "#2",  "tuition": "£28,950"},
    "ETH Zurich":       {"base_req": 80, "rank": "#7",  "tuition": "CHF 1,460"},
}


def calc_university_probability(base_score: int, uni_req: int) -> int:
    diff = base_score - uni_req
    if diff >= 15:   return min(95, 80 + diff)
    elif diff >= 5:  return 65 + diff
    elif diff >= 0:  return 50 + diff * 2
    elif diff >= -10: return max(20, 45 + diff * 2)
    else:            return max(5, 20 + diff)


@router.post("/probability")
async def admission_probability(req: AdmissionRequest):
    base_score = calc_base_score(req)

    # Default university list if none supplied
    # If user provided a specific list (like from search), use that.
    # Otherwise use top 10 from our data.
    unis = req.universities if req.universities and req.universities[0] != "" else list(UNIVERSITY_DATA.keys())[:10]

    university_results = []
    for uni_name in unis:
        data = UNIVERSITY_DATA.get(uni_name, {"base_req": 75, "rank": "Top Tier", "tuition": "$45,000+"})
        req_score = data["base_req"]
        
        prob = calc_university_probability(base_score, req_score)
        color = "#10b981" if prob >= 65 else "#f59e0b" if prob >= 45 else "#ef4444"
        university_results.append({
            "name":        uni_name,
            "probability": prob,
            "color":       color,
            "rank":        data["rank"],
            "tuition":     data["tuition"],
            "verdict":     "Safe" if prob >= 65 else "Moderate" if prob >= 45 else "Reach",
        })

    # Sort best → worst
    university_results.sort(key=lambda x: x["probability"], reverse=True)

    # Gemini: generate a personalised 3-line profile summary
    prompt = f"""An Indian student applying for {req.target_course} has:
GRE: {req.gre}/340, GPA: {req.gpa}/4.0, TOEFL: {req.toefl}/120,
Research papers: {req.research_papers}, Internships: {req.internships},
Backlogs: {req.backlogs}, Work experience: {req.work_experience_years} years.
Their overall profile score is {base_score}/100.

Write a 2-sentence encouraging profile summary for this student. Be specific.
Do NOT use markdown. Plain text only."""

    profile_summary = generate_content(prompt)

    return {
        "base_score":         base_score,
        "profile_summary":    profile_summary,
        "universities":       university_results,
        "radar_data": [
            {"subject": "GRE",        "A": round((req.gre / 340) * 100)},
            {"subject": "GPA",        "A": round((req.gpa / 4.0) * 100)},
            {"subject": "TOEFL",      "A": round((req.toefl / 120) * 100)},
            {"subject": "Research",   "A": min(100, req.research_papers * 25)},
            {"subject": "Experience", "A": min(100, req.internships * 20 + req.work_experience_years * 10)},
            {"subject": "Essays",     "A": 75},  # placeholder — updated after essay coach
        ],
    }
