from dotenv import load_dotenv
import os
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import chat, essay, admission, loan, scholarships, universities, testprep, applications, agent, auth, news

app = FastAPI(
    title="EduPilot API",
    description="AI-powered study abroad platform backend — powered by Gemini",
    version="1.0.0",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
# allow_origins=["*"] + allow_credentials=False is the only spec-compliant way
# to unblock all origins. Auth tokens live in localStorage, not cookies,
# so credentials mode is not needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(chat.router,         prefix="/api/chat",         tags=["Chat"])
app.include_router(essay.router,        prefix="/api/essay",        tags=["Essay Coach"])
app.include_router(admission.router,    prefix="/api/admission",    tags=["Admission"])
app.include_router(loan.router,         prefix="/api/loan",         tags=["Loan"])
app.include_router(scholarships.router, prefix="/api/scholarships", tags=["Scholarships"])
app.include_router(universities.router, prefix="/api/universities", tags=["Universities"])
app.include_router(testprep.router,     prefix="/api/testprep",     tags=["Test Prep"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])
app.include_router(agent.router,        prefix="/api/agent",        tags=["AI Agent"])
app.include_router(auth.router,         prefix="/api/auth",         tags=["Authentication"])
app.include_router(news.router,         prefix="/api/news",         tags=["News"])


@app.get("/api/status")
def api_status():
    return {
        "status": "EduPilot API Gateway is active 🛰️",
        "prefixes": ["/api/chat", "/api/auth", "/api/universities", "/api/essay"]
    }

@app.get("/")
def root():
    return {"status": "EduPilot API is running 🚀", "model": "gemini-2.5-flash"}
