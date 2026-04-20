# ✈️ EduPilot: Your AI-Powered Study Abroad Navigator

**EduPilot** is a gamified, AI-driven platform designed to simplify the complex journey of studying abroad. From university selection and AI-based admission probability to ROI calculation and financial planning, EduPilot acts as a personal mentor for aspiring global scholars.

Built for the **TenzorX Hackathon**, the platform combines high-end design with robust AI agents and a real-time gamification engine.

---

## 🚀 Key Features

### 🎮 Gamified Dashboard
- **Leveling System:** Progress from an "Elite Navigator" to a "Global Scholar" by completing missions.
- **Quest Center:** Real-time tracking of research, application, and ROI milestones.
- **Navigator Board:** Compete with other scholars on the global leaderboard.

### 🤖 AI-Powered Mentorship
- **Admission Probability:** Instant analysis of your profile against top global universities.
- **Essay Coach:** AI-driven SOP/Essay feedback to strengthen your application.
- **Smart University Search:** Find the perfect fit based on budget, field of study, and destination.

### 📊 Strategic Planning
- **ROI Calculator:** Compare the financial viability of different countries and programs.
- **Loan Eligibility:** Instant check for educational financing options.
- **Scholarship Finder:** Personalized scholarship recommendations.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite)
- **Tailwind CSS** (for styling)
- **Motion (Framer)** (for premium animations)
- **Lucide React** (for iconography)

### Backend
- **FastAPI** (Python)
- **Uvicorn** (production-grade server)
- **Google Gemini AI API** (LLM operations)
- **Supabase** (PostgreSQL Database & Auth)

---

## 📦 Project Structure

```bash
├── frontend          # React (Vite) Application
├── edupilot-backend  # FastAPI Python Backend
└── screenshots       # Visuals of the platform in action
```

---

## 🛠️ Getting Started

### 1. Backend Setup
```bash
cd edupilot-backend
# Set up virtual environment
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```
*Note: Ensure you have a `.env` file with `GEMINI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_KEY`.*

### 2. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Run the dev server
npm run dev
```

---

## 🏆 Meets the Crew

Developed with ❤️ by the EduPilot Team for the **TenzorX Hackathon**:

- **Swaraj** — *Lead Full-Stack Architect & AI Specialist*
  - Engineered the core AI Agent architecture and multi-model fallback systems.
  - Implemented the gamified dashboard logic and database synchronization.

- **Yagnish Anupam** — *Lead Systems Architect & Core Integration Specialist*
  - Designed the robust backend routing and secure authentication handshakes.
  - Optimized the university comparison engine for real-time high-fidelity data retrieval.

- **Prajakta Kuila** — *Head of UI/UX Design & Brand Identity Lead*
  - Crafted the premium "Glassmorphism" aesthetic and interactive design system.
  - Optimized the mobile AI Mentor experience for seamless on-the-go navigation.

Dedicated to making global education accessible and gamified for everyone.

---

## 📄 License
MIT License - feel free to build upon this project!
