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

# Sanitise API Key to prevent invisible characters from causing 404s
api_key = os.getenv("GEMINI_API_KEY", "").strip()
if not api_key:
    raise RuntimeError("GEMINI_API_KEY not set — check Render Environment Variables")

genai.configure(api_key=api_key)

# The most stable models for high-fidelity 2026 academic data
# We use the standard production names that have 99.9% availability
FALLBACK_MODELS = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash",
    "gemini-pro"
]

def generate_content(prompt: str) -> str:
    """
    Ultra-resilient AI generation with automatic fallback and grounding-retry.
    """
    last_error = None
    
    for model_name in FALLBACK_MODELS:
        # Try 1: Standard Generation (Highest Reliability)
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            if response and hasattr(response, "text") and response.text:
                print(f"[Gemini] Success using: {model_name}")
                return response.text.strip()
        except Exception as e:
            msg = str(e)
            last_error = msg
            print(f"[Gemini] Standard fail for {model_name}: {msg[:100]}")
            # If it's a 404, the model just doesn't exist for this key/region
            if "404" in msg:
                continue

        # Try 2: Only try search grounding IF standard failed and it's not a 404
        # (Internet search can be unstable or quota-heavy)
        try:
            model = genai.GenerativeModel(model_name, tools="google_search_retrieval")
            prompt_ext = prompt + "\n\n(Verify with latest 2026 web data)"
            response = model.generate_content(prompt_ext)
            if response and hasattr(response, "text") and response.text:
                print(f"[Gemini] Success using search grounding on: {model_name}")
                return response.text.strip()
        except Exception as e:
            print(f"[Gemini] Search fail for {model_name}")
            continue

    # If we are here, everything failed
    if "429" in (last_error or "").lower():
        raise HTTPException(status_code=429, detail="AI Quota Exhausted. Switching to backup soon.")
    
    raise HTTPException(status_code=503, detail=f"AI service currently unavailable: {last_error}")
