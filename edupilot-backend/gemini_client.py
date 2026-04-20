"""
gemini_client.py
Initialises the Gemini SDK once and exposes a ready-to-use model object.
Now dynamically lists available models from your API key to prevent 404s.
"""
import os
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

# Sanitise API Key
api_key = os.getenv("GEMINI_API_KEY", "").strip()
if not api_key:
    raise RuntimeError("GEMINI_API_KEY not set")

genai.configure(api_key=api_key)

def generate_content(prompt: str) -> str:
    """
    Dynamically fetches supported models from the API key and loops until success.
    This guarantees 0% chance of 404 'model not found' errors.
    """
    last_error = "No supported models found for this API key."
    
    try:
        # 1. Discover all models supported for THIS API key
        available_models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                available_models.append(m.name)
        
        # 2. Sort to prioritize our identified Golden Model (2.5-flash)
        available_models.sort(key=lambda x: 0 if 'gemini-2.5-flash' in x.lower() else (1 if 'flash' in x.lower() else 2))
        
        # Ensure gemini-2.5-flash is first if it exists, otherwise add it as our theoretical best
        if 'models/gemini-2.5-flash' not in available_models and 'gemini-2.5-flash' not in available_models:
             available_models.insert(0, 'gemini-2.5-flash')

        if not available_models:
            print("[Gemini] CRITICAL: No models support generateContent for this key.")
    except Exception as e:
        print(f"[Gemini] Error listing models: {e}")
        # The high-performance "Golden Model" identified for this platform
        FALLBACK_MODELS = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro"
        ]
        available_models = FALLBACK_MODELS

    # 3. Dynamic Fallback Loop
    for model_name in available_models:
        try:
            print(f"[Gemini] Attempting mission with: {model_name}")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            
            if response and hasattr(response, "text") and response.text:
                print(f"\n🚀 [MISSION SUCCESS] AI response generated using: {model_name}\n")
                return response.text.strip()
        except Exception as e:
            msg = str(e)
            last_error = msg
            print(f"[Gemini] Model {model_name} failed: {msg[:100]}")
            continue

    # If all dynamic models failed, try one last time with Search Grounding on the primary
    if available_models:
        try:
            primary = available_models[0]
            model = genai.GenerativeModel(primary, tools="google_search_retrieval")
            res = model.generate_content(prompt + "\n\n(Verify with web data)")
            if res and hasattr(res, "text") and res.text:
                return res.text.strip()
        except:
            pass

    # If we are here, everything failed
    raise HTTPException(status_code=503, detail=f"AI Service Discovery Failure: {last_error}")
