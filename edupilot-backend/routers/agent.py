import re
from fastapi import APIRouter
from pydantic import BaseModel
from gemini_client import generate_content
from supabase_client import get_cached_blueprint, save_cached_blueprint, is_stale

router = APIRouter()

class LeadProfile(BaseModel):
    name: str
    country: str
    field_of_study: str
    level: str

@router.post("/generate-blueprint")
async def generate_blueprint(profile: LeadProfile):
    # 1. Check Supabase Cache First
    cache = get_cached_blueprint(profile.field_of_study, profile.country)
    
    if cache and not is_stale(cache.get("created_at"), days=7):
        # Re-personalize the cached generic blueprint for the current user
        content = cache.get("content")
        blueprint_markdown = f"# Welcome, {profile.name}\n\n{content}"
        msg = "Blueprint served from Supabase cache (Fresh: <7 days)! ⚡"
    else:
        # 2. If no cache OR stale (>7 days), generate from scratch
        reason = "missing" if not cache else "stale (>7 days)"
        logger_msg = f"Generating new blueprint because cache was {reason}."
        
        prompt = f"""
        You are an expert AI Study Abroad Consultant. You are executing step 2 of a Zero-Human Growth Loop.
        A new student lead just signed up for our platform. 
        
        Target Country: {profile.country}
        Target Field: {profile.field_of_study}
        Degree Level: {profile.level}

        Write a deeply engaging "Global Study Blueprint" for the upcoming 2026-2027 academic cycle.
        DO NOT include a 'Welcome [Name]' line at the top. Start directly with '## Your Path'.
        DO NOT output markdown code block ticks, just the raw markdown.
        Include these sections:
        1. ## Your Path to {profile.country} in {profile.field_of_study} (2026/27)
        2. ## Top 3 Target Universities
        3. ## Cost & ROI Estimates (Latest April 2026 data)
        4. ## Action Plan (Next 30 Days)
        5. ## Financing Your Dream (Include a gentle nudge to check our Loan Eligibility tool to prepare early).

        Make it sound professional, encouraging, and highly specific to their field and country based on the latest 2026/27 trends.
        """
        
        generated_content = generate_content(prompt)
        
        # 3. Save to Supabase for future identical profile matches
        save_cached_blueprint(profile.field_of_study, profile.country, generated_content)
        
        blueprint_markdown = f"# Welcome, {profile.name}\n\n{generated_content}"
        msg = "Fresh blueprint generated via Gemini & cached to Supabase DB. 🤖"

    return {
        "status": "success",
        "blueprint": blueprint_markdown,
        "message": msg
    }
