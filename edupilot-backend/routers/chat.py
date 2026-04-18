"""
routers/chat.py
POST /api/chat/send          → full JSON response (simple, works everywhere)
POST /api/chat/stream        → SSE streaming (token-by-token, for the typing effect)

The Dashboard's AI mentor uses /send for reliability.
Swap to /stream if you want the live typewriter effect.
"""
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import json

from gemini_client import generate_content

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────
class Message(BaseModel):
    role: str       # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    user_profile: dict = {}   # name, destination, budget, course from Onboarding


# ── System prompt ─────────────────────────────────────────────────────────────
def build_system_prompt(profile: dict) -> str:
    name        = profile.get("name", "the student")
    destination = profile.get("destination", "abroad")
    budget      = profile.get("budget", "not specified")
    course      = profile.get("role", "postgraduate studies")

    return f"""You are EduPilot — an expert AI study abroad mentor helping Indian students.

Student profile:
- Name: {name}
- Destination: {destination}
- Budget: {budget}
- Program: {course}

Your personality:
- Warm, encouraging, data-driven
- Use specific numbers (rankings, salary ranges, tuition in INR/USD)
- Keep replies concise — max 4 short paragraphs
- Use relevant emojis sparingly (1-2 per reply)
- When comparing universities, always mention: ranking, tuition, avg salary, visa ease for Indians
- End every reply with ONE follow-up question to keep the conversation going

IMPORTANT: You are helping the student decide on universities AND understand education loan options with Poonawalla Fincorp. Naturally mention loan options when the student discusses costs or budget."""


# ── /send — standard JSON response ───────────────────────────────────────────
@router.post("/send")
async def chat_send(req: ChatRequest):
    system_prompt = build_system_prompt(req.user_profile)
    
    # Build a flat string representing history
    chat_history_str = ""
    if len(req.messages) > 1:
        chat_history_str = "--- PREVIOUS CHAT HISTORY ---\n"
        for msg in req.messages[:-1]:
            chat_history_str += f"{msg.role.upper()}: {msg.content}\n"
        chat_history_str += "-----------------------------\n"

    latest_message = req.messages[-1].content
    full_prompt = f"{system_prompt}\n\n{chat_history_str}\nUSER: {latest_message}\nASSISTANT:"

    reply_text = generate_content(full_prompt)

    return {"reply": reply_text, "role": "assistant"}


# ── /stream — SSE token-by-token (typewriter effect) ─────────────────────────
@router.post("/stream")
async def chat_stream(req: ChatRequest):
    # Streaming endpoint disabled for fallback mechanism
    # The frontend uses /send by default.
    return {"error": "Use /send instead of /stream"}
