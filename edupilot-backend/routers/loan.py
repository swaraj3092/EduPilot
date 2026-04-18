"""
routers/loan.py
POST /api/loan/eligibility  → eligibility score, loan offer, EMI breakdown,
                              + Gemini-generated personalised repayment advice
"""
from fastapi import APIRouter
from pydantic import BaseModel
from gemini_client import generate_content

router = APIRouter()


class LoanRequest(BaseModel):
    loan_amount: float       # in USD/INR — frontend sends raw number
    annual_income: float     # co-applicant (parent) annual income
    credit_score: int        # 300–900
    employment_years: int
    course: str = "MS"
    university: str = ""
    country: str = "USA"


def calculate_eligibility(req: LoanRequest) -> dict:
    score = 0

    # 1. Income-to-loan ratio (30 pts)
    ratio = req.loan_amount / req.annual_income if req.annual_income > 0 else 999
    if ratio <= 2:    score += 30
    elif ratio <= 3:  score += 20
    elif ratio <= 5:  score += 10
    
    # ── PRACTICALITY BUFFER: Debt-to-Income Penalty ───────────────────────
    if ratio > 10:
        score -= 50  # Basically an automatic rejection for sane financial norms
    elif ratio > 6:
        score -= 20
    # ────────────────────────────────────────────────────────────────────────
    
    # 2. Credit score (40 pts)
    if req.credit_score >= 750:   score += 40
    elif req.credit_score >= 700: score += 30
    elif req.credit_score >= 650: score += 20
    elif req.credit_score >= 600: score += 10

    # 3. Employment stability (30 pts)
    if req.employment_years >= 5:   score += 30
    elif req.employment_years >= 3: score += 20
    elif req.employment_years >= 1: score += 10

    # Ensure score doesn't go below 0
    score = max(0, min(100, score))

    # Approval status
    if score >= 70:
        status  = "approved"
        label   = "Pre-Approved"
        color   = "#10b981"
        max_amt = req.loan_amount           # full amount
    elif score >= 50:
        status  = "review"
        label   = "Under Review"
        color   = "#f59e0b"
        max_amt = req.loan_amount * 0.75   # 75%
    else:
        status  = "improve"
        label   = "Needs Improvement"
        color   = "#ef4444"
        max_amt = req.loan_amount * 0.50   # 50%

    # EMI options (Poonawalla-style: 10.5% p.a. flat)
    interest_rate = 0.105
    def emi(principal: float, years: int) -> float:
        r = interest_rate / 12
        n = years * 12
        if r == 0:
            return principal / n
        return principal * r * (1 + r) ** n / ((1 + r) ** n - 1)

    emi_options = [
        {"tenure_years": 5,  "emi": round(emi(max_amt, 5))},
        {"tenure_years": 7,  "emi": round(emi(max_amt, 7))},
        {"tenure_years": 10, "emi": round(emi(max_amt, 10))},
    ]

    return {
        "score":        score,
        "status":       status,
        "status_label": label,
        "status_color": color,
        "approved_amount": round(max_amt),
        "interest_rate": f"{interest_rate * 100}% p.a.",
        "emi_options":  emi_options,
    }


@router.post("/eligibility")
async def loan_eligibility(req: LoanRequest):
    result = calculate_eligibility(req)

    # Gemini: personalised repayment + next-steps advice
    prompt = f"""An Indian student is taking an education loan for {req.course} at {req.university or 'a top university'} in {req.country}.

Loan details:
- Amount requested: {req.loan_amount:,.0f}
- Approved amount: {result['approved_amount']:,.0f}
- Eligibility score: {result['score']}/100
- Status: {result['status_label']}
- Best EMI option: {result['emi_options'][1]['emi']:,.0f}/month for {result['emi_options'][1]['tenure_years']} years

Write 2 short, practical sentences of advice for this student about managing this loan and improving their financial future. Be encouraging but realistic. Plain text only."""

    ai_advice = generate_content(prompt)

    return {**result, "ai_advice": ai_advice}
