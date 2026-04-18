import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowLeft, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { getLoanEligibility, LoanResponse } from "@lib";

export function LoanEligibility() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loanAmount: "80000",
    income: "50000",
    creditScore: "720",
    employmentYears: "3",
  });
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<LoanResponse | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const amount = parseInt(formData.loanAmount);
      const income = parseInt(formData.income);
      const credit = parseInt(formData.creditScore);
      const employment = parseInt(formData.employmentYears);

      if (isNaN(amount) || isNaN(income) || isNaN(credit) || isNaN(employment)) return;

      setLoading(true);
      try {
        const data = await getLoanEligibility({
          loan_amount: amount,
          annual_income: income,
          credit_score: credit,
          employment_years: employment
        });
        setApiData(data);
      } catch (error) {
        console.error("Loan API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 800);
    return () => clearTimeout(timer);
  }, [formData]);

  const eligibilityScore = apiData?.score ?? 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (animatedScore < eligibilityScore) {
        setAnimatedScore(animatedScore + 1);
      } else if (animatedScore > eligibilityScore) {
        setAnimatedScore(animatedScore - 1);
      }
    }, 15);
    return () => clearTimeout(timer);
  }, [animatedScore, eligibilityScore]);

  const approvalStatus = apiData?.status ?? "improve";

  // Calculate breakdown locally for UX
  const amount = parseInt(formData.loanAmount) || 0;
  const income = parseInt(formData.income) || 0;
  const credit = parseInt(formData.creditScore) || 0;
  const employment = parseInt(formData.employmentYears) || 0;

  const breakdown = [
    { label: "Stability", value: Math.min(100, (employment / 5) * 100) },
    { label: "Credit Health", value: Math.min(100, ((credit - 300) / 550) * 100) },
    { label: "Income Ratio", value: Math.min(100, (income > 0 ? (income / (amount / 2)) * 100 : 0)) }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-white">
      {/* Navigation */}
      <div className="relative z-10 p-6">
        <Button
          variant="ghost"
          className="text-white/70 hover:text-white"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">Loan Eligibility</h1>
          <p className="text-base md:text-xl text-white/60 mb-8 md:mb-12">
            Check your eligibility for education loans with real-time AI scoring
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 bg-white/5 backdrop-blur-sm border-white/10">
              <h3 className="text-2xl font-semibold text-white mb-6">Your Details</h3>
              
              <div className="space-y-6">
                <div>
                  <Label className="text-white/80 mb-2 block">Loan Amount Needed (USD)</Label>
                  <Input
                    type="number"
                    placeholder="80000"
                    className="bg-white/5 border-white/20 text-white text-lg"
                    value={formData.loanAmount}
                    onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                  />
                  <p className="text-xs text-white/50 mt-1">Average loan amount: $40,000 - $100,000</p>
                </div>

                <div>
                  <Label className="text-white/80 mb-2 block">Annual Income (USD)</Label>
                  <Input
                    type="number"
                    placeholder="50000"
                    className="bg-white/5 border-white/20 text-white text-lg"
                    value={formData.income}
                    onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                  />
                  <p className="text-xs text-white/50 mt-1">Include co-applicant income if applicable</p>
                </div>

                <div>
                  <Label className="text-white/80 mb-2 block">Credit Score</Label>
                  <Input
                    type="number"
                    placeholder="720"
                    className="bg-white/5 border-white/20 text-white text-lg"
                    value={formData.creditScore}
                    onChange={(e) => setFormData({ ...formData, creditScore: e.target.value })}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-white/50">300-850 range</p>
                    <p className="text-xs text-green-400">
                      {parseInt(formData.creditScore) >= 700 ? "Excellent ✓" : ""}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-white/80 mb-2 block">Years of Employment</Label>
                  <Input
                    type="number"
                    placeholder="3"
                    className="bg-white/5 border-white/20 text-white text-lg"
                    value={formData.employmentYears}
                    onChange={(e) => setFormData({ ...formData, employmentYears: e.target.value })}
                  />
                  <p className="text-xs text-white/50 mt-1">Total professional experience</p>
                </div>
              </div>

              {/* Info Card */}
              <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5" />
                  <div className="text-xs text-white/70">
                    <strong>Instant Decision:</strong> Our AI analyzes your profile in real-time. 
                    No credit check required for eligibility assessment.
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Right: Eligibility Score */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Score Card */}
            <Card className={`p-8 backdrop-blur-sm border-2 transition-colors duration-500 ${
              approvalStatus === "approved" 
                ? "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/50"
                : approvalStatus === "review"
                ? "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/50"
                : "bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/50"
            }`}>
              {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 rounded-xl backdrop-blur-[1px]">
                  <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
              )}
              <h3 className="text-lg font-semibold text-white/60 mb-6 text-center">
                AI Eligibility Score
              </h3>

              {/* Circular Progress */}
              <div className="relative w-48 h-48 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="16"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke={
                      approvalStatus === "approved" ? "#10b981" :
                      approvalStatus === "review" ? "#f59e0b" : "#ef4444"
                    }
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 80}`}
                    strokeDashoffset={`${2 * Math.PI * 80 * (1 - animatedScore / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                  />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold text-white mb-1">{animatedScore}</div>
                  <div className="text-sm text-white/50">Score</div>
                </div>
              </div>

              {/* Status */}
              <div className="text-center">
                {approvalStatus === "approved" && (
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                      <span className="text-2xl font-bold text-green-400">Approved!</span>
                    </div>
                    <p className="text-white/70">
                      Congratulations! You're eligible for a loan up to ${formData.loanAmount}
                    </p>
                  </div>
                )}
                
                {approvalStatus === "review" && (
                  <div>
                    <div className="text-2xl font-bold text-amber-400 mb-2">Under Review</div>
                    <p className="text-white/70">
                      Your application needs manual review. Consider improving your credit score.
                    </p>
                  </div>
                )}
                
                {approvalStatus === "improve" && (
                  <div>
                    <div className="text-2xl font-bold text-red-400 mb-2">Needs Improvement</div>
                    <p className="text-white/70">
                      Try increasing your income or reducing the loan amount.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Progress Breakdown */}
            <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10">
              <h4 className="text-white font-semibold mb-4">Score Breakdown</h4>
              
              <div className="space-y-4">
                {breakdown.map((item: any) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white/70">{item.label}</span>
                      <span className="text-white font-semibold">{Math.round(item.value)}%</span>
                    </div>
                    <Progress value={item.value} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Poonawalla CTA */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                className={`w-full text-lg py-6 ${
                  approvalStatus === "approved"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/50"
                    : "bg-white/5 border border-white/10"
                }`}
                disabled={approvalStatus !== "approved" || loading}
              >
                {approvalStatus === "approved" ? "Apply with Poonawalla Fincorp" : "Improve Score to Apply"}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}