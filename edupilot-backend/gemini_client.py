"""
gemini_client.py
Initialises the Gemini SDK once and exposes a ready-to-use model object.
Every router imports `model` from here — no duplicate setup.
"""
import os
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY not set — copy .env.example → .env and add your key")

genai.configure(api_key=api_key)

# Verified production model aliases
FALLBACK_MODELS = [
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash"
]

def generate_content(prompt: str) -> str:
    """
    Call Gemini and return the text.
    Loops through available models to find one that works (handles quotas).
    """
    last_error = None
    
    for model_name in FALLBACK_MODELS:
        # Try with Google Search Grounding for real-time internet data
        try:
            model = genai.GenerativeModel(model_name, tools="google_search_retrieval")
            prompt_with_instructions = prompt + "\n\n(IMPORTANT: Search the internet for latest real-time 2025 facts to provide this data. Be completely accurate and up-to-date.)"
            response = model.generate_content(prompt_with_instructions)
            if response and hasattr(response, "text") and response.text:
                print(f"[Gemini] Success using {model_name} (with search grounding)")
                return response.text.strip()
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "quota" in error_msg.lower() or "ResourceExhausted" in error_msg:
                last_error = error_msg
                print(f"[Gemini] Search quota error with {model_name}: {error_msg}")
            
        # Try WITHOUT search grounding if the search tool failed/rejected or search quota exhausted
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            if response and hasattr(response, "text") and response.text:
                print(f"[Gemini] Success using model: {model_name} (no search grounding)")
                return response.text.strip()
        except Exception as e:
            error_msg = str(e)
            last_error = error_msg
            if "404" in error_msg:
                print(f"[Gemini] Model {model_name} skipped (Not found/Unsupported)")
                continue
            print(f"[Gemini] API Error with {model_name}: {error_msg}")

    # If all models failed
    if last_error:
        if "429" in last_error or "quota" in last_error.lower() or "ResourceExhausted" in last_error:
            raise HTTPException(
                status_code=503,
                detail="All Gemini models ran out of quota. Please update GEMINI_API_KEY with a fresh key."
            )
        raise HTTPException(status_code=503, detail=f"AI service error: {last_error}")
        
    raise HTTPException(status_code=503, detail="Unknown AI failure (no response generated).")
