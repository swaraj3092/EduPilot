/**
 * ═══════════════════════════════════════════════════════════════
 * PATCH A — AdmissionProbability.tsx
 * ═══════════════════════════════════════════════════════════════
 *
 * Step 1 — Add import at the top:
 *   import { getAdmissionProbability } from '../../lib/api';
 *
 * Step 2 — Add state:
 *   const [apiData, setApiData] = useState<any>(null);
 *   const [isLoading, setIsLoading] = useState(false);
 *
 * Step 3 — Replace any useEffect that computes scores with this:
 */

// Inside AdmissionProbability component:
const fetchProbability = async () => {
  setIsLoading(true);
  try {
    const result = await getAdmissionProbability({
      gre:   parseInt(scores.gre)  || 0,
      gpa:   parseFloat(scores.gpa) || 0,
      toefl: parseInt(scores.toefl) || 0,
    });
    setApiData(result);
    // Kick off the animated score counter using result.base_score
    setOverallScore(result.base_score);
  } catch (err) {
    console.error("Admission API error:", err);
  } finally {
    setIsLoading(false);
  }
};

// Add a "Calculate" button next to your inputs that calls fetchProbability()
// OR call it in a useEffect with a debounce:
//
// useEffect(() => {
//   const t = setTimeout(fetchProbability, 800);
//   return () => clearTimeout(t);
// }, [scores.gre, scores.gpa, scores.toefl]);
//
// Then use apiData.universities instead of the hardcoded UNIVERSITIES array.
// Use apiData.radar_data instead of the hardcoded radarData array.
// Show apiData.profile_summary below the score circle.


/**
 * ═══════════════════════════════════════════════════════════════
 * PATCH B — LoanEligibility.tsx
 * ═══════════════════════════════════════════════════════════════
 *
 * Step 1 — Add import at the top:
 *   import { getLoanEligibility } from '../../lib/api';
 *
 * Step 2 — Add state:
 *   const [loanResult, setLoanResult] = useState<any>(null);
 *   const [isLoading, setIsLoading]   = useState(false);
 *
 * Step 3 — Replace your score useEffect with this:
 */

// Inside LoanEligibility component:
const fetchEligibility = async () => {
  setIsLoading(true);
  try {
    const result = await getLoanEligibility({
      loan_amount:      parseFloat(formData.loanAmount)      || 0,
      annual_income:    parseFloat(formData.income)          || 0,
      credit_score:     parseInt(formData.creditScore)       || 0,
      employment_years: parseInt(formData.employmentYears)   || 0,
    });
    setLoanResult(result);
    setEligibilityScore(result.score);  // keeps your animated score counter working
  } catch (err) {
    console.error("Loan API error:", err);
  } finally {
    setIsLoading(false);
  }
};

// Trigger it when formData changes (with debounce to avoid hammering the API):
//
// useEffect(() => {
//   const t = setTimeout(fetchEligibility, 800);
//   return () => clearTimeout(t);
// }, [formData]);
//
// Then:
//  - Replace approvalStatus with loanResult?.status
//  - Replace hardcoded EMI math with loanResult?.emi_options
//  - Show loanResult?.ai_advice in a Card below the score circle
//  - Show loanResult?.approved_amount as the sanctioned loan amount
