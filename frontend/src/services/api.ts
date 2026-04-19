/**
 * src/lib/api.ts
 * Central API client for EduPilot backend.
 * All components import from here — one place to change the base URL.
 *
 * Usage:
 *   import { chatSend, analyzeEssay, getAdmissionProbability, getLoanEligibility } from '../lib/api';
 */

// Normalize BASE URL: Remove trailing slash if it exists to avoid double-slashes in fetch calls (e.g. //api/...)
let rawBase = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const BASE = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

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
// Helper: extract meaningful error from backend JSON
// ─────────────────────────────────────────────────────────────────────────────
async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type");
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    if (contentType && contentType.includes("application/json")) {
      try {
        const err = await res.json();
        if (err?.detail) detail = err.detail;
      } catch { /* ignore */ }
    }
    throw new Error(detail);
  }
  
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("Invalid response from server: Expected JSON");
  }

  return res.json();
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
  return handleResponse<ChatResponse>(res);
}

/** Essay Coach: analyze + score + rewrite */
export async function analyzeEssay(
  essayText: string,
  essayType: "sop" | "personal" | "diversity" = "sop",
  userId?: string
): Promise<EssayAnalysisResponse> {
  const res = await fetch(`${BASE}/api/essay/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ essay_text: essayText, essay_type: essayType, user_id: userId }),
  });
  return handleResponse<EssayAnalysisResponse>(res);
}

/** Fetch Essay History */
export async function getEssayHistory(userId: string): Promise<{ status: string; history: any[] }> {
    const res = await fetch(`${BASE}/api/essay/history/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(res);
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
  return handleResponse<AdmissionResponse>(res);
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
  return handleResponse<LoanResponse>(res);
}

// ─────────────────────────────────────────────────────────────────────────────
// Scholarships
// ─────────────────────────────────────────────────────────────────────────────
export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: string;
  country: string;
  fieldOfStudy: string[];
  deadline: string;
  eligibility: string[];
  matchScore: number;
  link: string;
}

export async function findScholarships(params: {
  country: string;
  field_of_study: string;
  level: string;
  nationality?: string;
}): Promise<{ scholarships: Scholarship[]; query: any }> {
  const res = await fetch(`${BASE}/api/scholarships/find`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

// ─────────────────────────────────────────────────────────────────────────────
// Universities
// ─────────────────────────────────────────────────────────────────────────────
export interface UniversityData {
  id: string;
  name: string;
  location: string;
  ranking: string;
  tuition: string;
  acceptance: string;
  avgSalary: string;
  roi: string;
  students: string;
  programDuration: string;
  highlights: string[];
}

export async function compareUniversities(params: {
  names: string[];
  field: string;
}): Promise<{ universities: UniversityData[] }> {
  const res = await fetch(`${BASE}/api/universities/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export interface ROIData {
  country: string;
  tuition_per_year_usd: number;
  living_cost_per_year_usd: number;
  average_starting_salary_usd: number;
  average_salary_growth_rate: number;
  currency_symbol: string;
  key_facts: string[];
}

export async function getROIData(params: {
  country: string;
  field: string;
  level: string;
}): Promise<ROIData> {
  const res = await fetch(`${BASE}/api/universities/roi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function getTopUniversities(): Promise<{ universities: any[] }> {
  const res = await fetch(`${BASE}/api/universities/top`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse(res);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Prep
// ─────────────────────────────────────────────────────────────────────────────
export interface TestRequirement {
  name: string;
  gre: string;
  toefl: string;
  ielts: string;
  gmat: string;
  notes: string;
}

export async function getTestRequirements(params: {
  field: string;
  level: string;
  country: string;
}): Promise<{ requirements: TestRequirement[] }> {
  const res = await fetch(`${BASE}/api/testprep/requirements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function analyzeTestScore(params: {
  test_type: string;
  scores: Record<string, number>;
  target_field?: string;
  target_country?: string;
}): Promise<{
  predicted_total: number;
  percentile: string;
  rating: string;
  feedback: string;
  universities_achievable: string[];
  improvement_tips: string[];
}> {
  const res = await fetch(`${BASE}/api/testprep/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

// ─────────────────────────────────────────────────────────────────────────────
// Applications
// ─────────────────────────────────────────────────────────────────────────────
export interface AppTrackerResponse {
  tracker: {
    deadline: string;
    documents: { name: string; uploaded: boolean }[];
    notes: string;
  };
}

export async function generateApplicationTracker(params: {
  university: string;
  program: string;
}): Promise<AppTrackerResponse> {
  const res = await fetch(`${BASE}/api/applications/generate-tracker`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent (Zero-Human Growth Loop)
// ─────────────────────────────────────────────────────────────────────────────
export async function generateAgentBlueprint(params: {
  name: string;
  country: string;
  field_of_study: string;
  level: string;
}): Promise<{ status: string; blueprint: string; message: string }> {
  const res = await fetch(`${BASE}/api/agent/generate-blueprint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}
// ─────────────────────────────────────────────────────────────────────────────
// Authentication
// ─────────────────────────────────────────────────────────────────────────────
export async function registerUser(params: {
  email: string;
  password: string;
  referrer_code?: string;
}): Promise<{ status: string; user_id: string }> {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function loginUser(params: {
  email: string;
  password: string;
}): Promise<{ status: string; user: any; profile: any }> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function updateProfile(params: {
  user_id: string;
  full_name: string;
  phone?: string;
  target_country?: string;
  target_field?: string;
  degree_level?: string;
  xp?: number;
  streak?: number;
  profile_picture?: string;
  referral_code?: string;
}): Promise<{ status: string; profile: any }> {
  const res = await fetch(`${BASE}/api/auth/update-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function resetPassword(params: {
  email: string;
  password: string;
}): Promise<{ status: string; message: string }> {
  const res = await fetch(`${BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function awardXP(params: {
  user_id: string;
  amount: number;
  reason: string;
}): Promise<{ status: string; new_xp: number }> {
  const res = await fetch(`${BASE}/api/auth/award-xp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function getLeaderboard(): Promise<{ status: string; leaderboard: any[] }> {
  const res = await fetch(`${BASE}/api/auth/leaderboard`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse(res);
}

export async function getUserProfile(userId: string): Promise<{ status: string; profile: any }> {
  const res = await fetch(`${BASE}/api/auth/profile/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse(res);
}

export async function getPublicProfile(referralCode: string): Promise<{ status: string; profile: any }> {
  const res = await fetch(`${BASE}/api/auth/public-profile/${referralCode}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse(res);
}

export async function completeQuest(params: {
  user_id: string;
  quest_id: string;
  xp_reward: number;
}): Promise<{ status: string; message: string; new_xp: number }> {
  const res = await fetch(`${BASE}/api/auth/complete-quest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

// ─────────────────────────────────────────────────────────────────────────────
// News
// ─────────────────────────────────────────────────────────────────────────────
export async function getLatestNews(country: string = "USA"): Promise<{ articles: any[] }> {
  const res = await fetch(`${BASE}/api/news/latest?country=${encodeURIComponent(country)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse(res);
}
