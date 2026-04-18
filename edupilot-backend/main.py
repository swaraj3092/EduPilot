from dotenv import load_dotenv
import os
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import chat, essay, admission, loan, scholarships, universities, testprep, applications, agent, auth

app = FastAPI(
    title="EduPilot API",
    description="AI-powered study abroad platform backend — powered by Gemini",
    version="1.0.0",
)

# ── CORS (allow your Vite dev server + Vercel deployment) ─────────────────────
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Allow dev and production origins
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:8000",
]

# Add Vercel env var if available
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="https://.*\.vercel\.app", # Allow all Vercel previews
    allow_credentials=True,
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


@app.get("/")
def root():
    return {"status": "EduPilot API is running 🚀", "model": "gemini-2.5-flash"}
