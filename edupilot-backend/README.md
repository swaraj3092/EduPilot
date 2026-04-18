# EduPilot Backend — Setup Guide

## Stack
- **FastAPI** (Python) — REST API
- **Gemini 2.0 Flash** — Free AI (1500 req/day)
- **Uvicorn** — ASGI server

---

## 1. Get your FREE Gemini API Key

1. Go to → https://aistudio.google.com/app/apikey
2. Click **"Create API key"**
3. Copy the key (starts with `AIza...`)

---

## 2. Local Setup

```bash
# Clone / navigate to this folder
cd edupilot-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Open .env and paste your Gemini API key

# Run the server
uvicorn main:app --reload --port 8000
```

API is live at → http://localhost:8000
Swagger docs  → http://localhost:8000/docs

---

## 3. Frontend: Add .env

In your **frontend** project root create `.env`:
```
VITE_API_URL=http://localhost:8000
```

Create `src/lib/api.ts` — copy the file from `frontend-integration/api.ts`.

---

## 4. Wire the components (in order)

| Priority | Component | Patch file |
|---|---|---|
| 1 | Dashboard chat | `frontend-integration/Dashboard-handleSend.tsx` |
| 2 | Essay Coach | `frontend-integration/EssayCoach-patch.tsx` |
| 3 | Admission Probability | `frontend-integration/AdmissionAndLoan-patches.tsx` |
| 4 | Loan Eligibility | `frontend-integration/AdmissionAndLoan-patches.tsx` |

---

## 5. Deploy to Railway (FREE, 5 min)

1. Push backend folder to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Select your repo
4. Add environment variables in Railway dashboard:
   - `GEMINI_API_KEY` = your key
   - `FRONTEND_URL` = https://your-app.vercel.app
5. Railway auto-detects Python + gives you a public URL

---

## 6. Deploy Frontend to Vercel (FREE, 2 min)

1. Push frontend to GitHub
2. Go to https://vercel.com → New Project → Import repo
3. Add environment variable:
   - `VITE_API_URL` = https://your-railway-app.railway.app
4. Deploy → done!

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/chat/send | AI mentor chat |
| POST | /api/chat/stream | SSE streaming chat |
| POST | /api/essay/analyze | SOP analysis + rewrite |
| POST | /api/admission/probability | Per-university admission odds |
| POST | /api/loan/eligibility | Poonawalla-style loan score |

---

## Gemini Free Tier Limits
- **1,500 requests/day** — more than enough for a hackathon demo
- **gemini-2.0-flash** — fastest model, great quality
- No credit card needed
