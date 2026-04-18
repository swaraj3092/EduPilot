/**
 * src/lib/api.ts
 * Central API client for EduPilot backend.
 * All components import from here — one place to change the base URL.
 *
 * Usage:
 *   import { chatSend, analyzeEssay, getAdmissionProbability, getLoanEligibility } from '../lib/api';
 */

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  role: "assistant";
}

export interface EssayScore {
  label: string;
  score: number;
  feedback: string;
}

export interface EssayAnalysisResponse {
  overall_score: number;
  word_count: number;
  scores: EssayScore[];
  key_strengths: string[];
  areas_to_improve: string[];
  improved_version: string;
  plagiarism: {
    overall_originality: number;
    sources: { text: string; similarity: number; source: string }[];
  };
  error?: boolean;
  message?: string;
}

export interface AdmissionRequest {
  gre: number;
  gpa: number;
  toefl: number;
  backlogs?: number;
  research_papers?: number;
  internships?: number;
  work_experience_years?: number;
  target_course?: string;
  universities?: string[];
}

export interface UniversityResult {
  name: string;
  probability: number;
  color: string;
  rank: string;
  tuition: string;
  verdict: "Safe" | "Moderate" | "Reach";
}

export interface AdmissionResponse {
  base_score: number;
  profile_summary: string;
  universities: UniversityResult[];
  radar_data: { subject: string; A: number }[];
}

export interface LoanRequest {
  loan_amount: number;
  annual_income: number;
  credit_score: number;
  employment_years: number;
  course?: string;
  university?: string;
  country?: string;
}

export interface LoanResponse {
  score: number;
  status: "approved" | "review" | "improve";
  status_label: string;
  status_color: string;
  approved_amount: number;
  interest_rate: string;
  emi_options: { tenure_years: number; emi: number }[];
  ai_advice: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API functions
// ─────────────────────────────────────────────────────────────────────────────

/** Dashboard AI mentor chat */
export async function chatSend(
  messages: ChatMessage[],
  userProfile: Record<string, string> = {}
): Promise<ChatResponse> {
  const res = await fetch(`${BASE}/api/chat/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, user_profile: userProfile }),
  });
  if (!res.ok) throw new Error(`Chat API error: ${res.status}`);
  return res.json();
}

/** Essay Coach: analyze + score + rewrite */
export async function analyzeEssay(
  essayText: string,
  essayType: "sop" | "personal" | "diversity" = "sop"
): Promise<EssayAnalysisResponse> {
  const res = await fetch(`${BASE}/api/essay/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ essay_text: essayText, essay_type: essayType }),
  });
  if (!res.ok) throw new Error(`Essay API error: ${res.status}`);
  return res.json();
}

/** Admission probability per university */
export async function getAdmissionProbability(
  data: AdmissionRequest
): Promise<AdmissionResponse> {
  const res = await fetch(`${BASE}/api/admission/probability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Admission API error: ${res.status}`);
  return res.json();
}

/** Loan eligibility score + EMI options */
export async function getLoanEligibility(
  data: LoanRequest
): Promise<LoanResponse> {
  const res = await fetch(`${BASE}/api/loan/eligibility`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Loan API error: ${res.status}`);
  return res.json();
}
