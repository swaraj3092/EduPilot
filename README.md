---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- Python 3.9+
- Supabase account
- Google AI Studio (Gemini) API Key

### 1. Backend Setup

```bash
cd edupilot-backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

> Create a `.env` file in `edupilot-backend/` with:
> ```
> GEMINI_API_KEY=your_key_here
> SUPABASE_URL=your_url_here
> SUPABASE_KEY=your_key_here
> ```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## 👥 Team

**Swaraj Kumar Behera** — *Lead Full-Stack Architect*
- Engineered the entire EduPilot ecosystem from concept to production deployment.
- Built the core AI Agent dual-engine (Generative + Grounded Search).
- Designed the end-to-end gamification framework and real-time database synchronization.
- Oversaw full-stack integration across all academic and financial modules.

**Yagnish Anupam** — *Backend & Systems Integration*
- Designed the backend routing architecture and secure authentication handshakes.
- Optimized the university comparison engine for real-time high-fidelity data retrieval.

**Prajakta Kuila** — *UI/UX Design & Brand Identity*
- Crafted the premium glassmorphism aesthetic and interactive design system.
- Optimized the mobile AI Mentor experience for seamless on-the-go navigation.

---

## 📄 License

MIT License — feel free to build upon this project!
