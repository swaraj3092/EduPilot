# EduPilot System Architecture

The following diagram illustrates the high-level architecture and data flow for the EduPilot platform. 

```mermaid
graph TD
    %% Define Styles
    classDef frontend fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff
    classDef backend fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    classDef ai fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff
    classDef db fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff
    classDef external fill:#64748b,stroke:#334155,stroke-width:2px,color:#fff

    %% Nodes
    User(("🧑‍🎓 Student / User"))
    
    subgraph Client ["Frontend Layer (Vite + React 18)"]
        UI["User Interface (Tailwind + Framer Motion)"]:::frontend
        Gamification["Gamification Engine (Missions/XP)"]:::frontend
        Dashboard["Real-time Dashboard (ROI & Radar Charts)"]:::frontend
    end

    subgraph Server ["Backend API (FastAPI)"]
        API["FastAPI Gateway & Routers"]:::backend
        AI_Orchestrator["AI Orchestration Service"]:::backend
        Auth_Service["Authentication & User Service"]:::backend
    end

    subgraph AI_Layer ["AI & Machine Learning (Google Gemini)"]
        GeminiFlash["Gemini 2.5 Flash Engine"]:::ai
        GroundedSearch["Grounded Search (Real-time Web)"]:::ai
        Logic_Engine["ML Engine (Admission Odds & ROI)"]:::ai
    end

    subgraph Database ["Data Persistence (Supabase)"]
        Postgres[(PostgreSQL DB)]:::db
        RLS["Row-Level Security (RLS)"]:::db
    end

    %% Connections
    User <-->|HTTPS / WebSockets| UI
    UI <--> Dashboard
    UI <--> Gamification
    
    Client <-->|REST API / SSE Streams| API
    
    API <--> Auth_Service
    API <--> AI_Orchestrator
    
    Auth_Service <-->|Secure Token Exchange| RLS
    RLS <--> Postgres
    
    AI_Orchestrator <-->|Prompt & Context| GeminiFlash
    GeminiFlash <-->|Retrieval Augmented Gen| GroundedSearch
    AI_Orchestrator <-->|Process Profile Data| Logic_Engine
    
    Logic_Engine -.->|Fetch University Data| Postgres
```

## Architecture Layers

### 1. Frontend Client
- **Tech Stack:** React 18, Vite, Tailwind CSS, Framer Motion.
- **Responsibility:** Handles user interactions, real-time visual feedback (radar charts, ROI graphs), and Server-Sent Events (SSE) for streaming AI chat responses.

### 2. Backend Server
- **Tech Stack:** FastAPI (Python), Uvicorn.
- **Responsibility:** Acts as the central gateway. It orchestrates user requests, connects to the database for state management, and acts as a secure proxy to the Gemini AI models.

### 3. AI & ML Engine
- **Tech Stack:** Google Gemini 2.5 Flash, Custom Python ML Logic.
- **Responsibility:** Generates personalized study-abroad guidance, analyzes Statement of Purpose (SOP) essays, and calculates data-driven admission probabilities.

### 4. Database & Auth
- **Tech Stack:** Supabase (PostgreSQL).
- **Responsibility:** securely stores user profiles, quest progress, and saved universities with strict Row-Level Security (RLS) ensuring data privacy.
