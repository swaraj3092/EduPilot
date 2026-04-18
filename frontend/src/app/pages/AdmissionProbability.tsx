import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowLeft, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Card } from "@components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { getAdmissionProbability, AdmissionResponse } from "@lib";

export function AdmissionProbability() {
  const navigate = useNavigate();
  const [scores, setScores] = useState({
    gre: "325",
    gpa: "3.8",
    toefl: "110",
  });
  const [targetUni, setTargetUni] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<AdmissionResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const greNum = parseInt(scores.gre);
      const gpaNum = parseFloat(scores.gpa);
      const toeflNum = parseInt(scores.toefl);

      if (isNaN(greNum) || isNaN(gpaNum) || isNaN(toeflNum)) return;

      setLoading(true);
      try {
        const data = await getAdmissionProbability({
          gre: greNum,
          gpa: gpaNum,
          toefl: toeflNum,
          universities: targetUni ? [targetUni] : []
        });
        setApiData(data);
      } catch (error) {
        console.error("Admission API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 800); // Debounce
    return () => clearTimeout(timer);
  }, [scores, targetUni]);

  // Use API data or fallback
  const overallScore = apiData?.base_score ?? 0;
  
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (animatedScore < overallScore) {
        setAnimatedScore(animatedScore + 1);
      } else if (animatedScore > overallScore) {
        setAnimatedScore(animatedScore - 1);
      }
    }, 15);
    return () => clearTimeout(timer);
  }, [animatedScore, overallScore]);

  const radarData = apiData?.radar_data ?? [
    { subject: 'GRE', A: 0 },
    { subject: 'GPA', A: 0 },
    { subject: 'TOEFL', A: 0 },
    { subject: 'Research', A: 0 },
    { subject: 'Experience', A: 0 },
    { subject: 'Essays', A: 0 },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden text-white bg-slate-950">
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">Admission Probability</h1>
          <p className="text-base md:text-xl text-white/60 mb-8 md:mb-12">
            See your chances at top universities based on your profile
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {/* Left: Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10">
              <h3 className="text-lg font-semibold text-white mb-6">Your Scores</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/80">GRE Score (260-340)</Label>
                  <Input
                    type="number"
                    placeholder="325"
                    className="bg-white/5 border-white/20 text-white"
                    value={scores.gre}
                    onChange={(e: any) => setScores({ ...scores, gre: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80">GPA (0.0-4.0)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="3.8"
                    className="bg-white/5 border-white/20 text-white"
                    value={scores.gpa}
                    onChange={(e: any) => setScores({ ...scores, gpa: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80">TOEFL Score (0-120)</Label>
                  <Input
                    type="number"
                    placeholder="110"
                    className="bg-white/5 border-white/20 text-white"
                    value={scores.toefl}
                    onChange={(e: any) => setScores({ ...scores, toefl: e.target.value })}
                  />
                </div>

                <div className="pt-4 border-t border-white/10 mt-4">
                  <Label className="text-indigo-400 font-bold mb-2 block flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Target Specific University
                  </Label>
                  <Input
                    placeholder="e.g. Harvard, NTU, Oxford"
                    className="bg-white/10 border-indigo-500/30 text-white placeholder:text-white/20 focus:border-indigo-500"
                    value={targetUni}
                    onChange={(e: any) => setTargetUni(e.target.value)}
                  />
                  <p className="text-[10px] text-white/40 mt-1 italic">We'll use AI to calculate odds for any school worldwide.</p>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-white/70">
                    This analysis uses machine learning trained on 50,000+ admission decisions.
                  </p>
                </div>
              </div>
            </Card>

            {/* Radar Chart */}
            <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Profile Radar</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.4)' }} />
                    <Radar 
                      name="Your Profile" 
                      dataKey="A" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.5}
                      isAnimationActive={true}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Center: Big Circular Gauge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8 bg-white/5 backdrop-blur-sm border-white/10 h-full flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold text-white/60 mb-8">Overall Admission Strength</h3>
              
              {/* Circular Gauge */}
              <div className="relative w-64 h-64 mb-8">
                {loading && (
                   <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/5 rounded-full backdrop-blur-[2px]">
                      <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                   </div>
                )}
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background Circle */}
                  <circle
                    cx="128"
                    cy="128"
                    r="110"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="20"
                    fill="none"
                  />
                  {/* Animated Progress Circle */}
                  <circle
                    cx="128"
                    cy="128"
                    r="110"
                    stroke="url(#probability-gradient)"
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 110}`}
                    strokeDashoffset={`${2 * Math.PI * 110 * (1 - animatedScore / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                  />
                  <defs>
                    <linearGradient id="probability-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-6xl font-bold text-white mb-2">{animatedScore}</div>
                  <div className="text-sm text-white/50">out of 100</div>
                </div>
              </div>

              <p className="text-center text-white/70 max-w-xs min-h-[60px]">
                {apiData?.profile_summary ?? "Enter your scores to analyze your admission strength..."}
              </p>
            </Card>
          </motion.div>

          {/* Right: University List with Probability Bars */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar"
          >
            <h3 className="text-lg font-semibold text-white mb-4">University Probabilities</h3>
            
            {(apiData?.universities ?? []).map((uni: any, i: number) => (
              <motion.div
                key={uni.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
              >
                <Card className="p-4 bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">{uni.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold" style={{ color: uni.color }}>
                        {uni.probability}%
                      </span>
                      <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: uni.color }} />
                    </div>
                  </div>
                  
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{ backgroundColor: uni.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${uni.probability}%` }}
                      transition={{ duration: 1, delay: 0.6 + i * 0.05 }}
                    />
                  </div>
                  
                  <div className="mt-2 text-xs text-white/50 flex justify-between">
                    <span>{uni.verdict} School</span>
                    <span>Tuition: {uni.tuition}</span>
                  </div>
                </Card>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-amber-400" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Secure Your Spot</h4>
                  <p className="text-sm text-white/70 mb-4">
                    High admission probability? Get pre-approved for an education loan in minutes.
                  </p>
                  <Button 
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
                    onClick={() => navigate('/loan-eligibility')}
                  >
                    Check Loan Eligibility
                  </Button>
                </div>
              </Card>
            </motion.div>

            {(!apiData || (apiData.universities && apiData.universities.length === 0)) && (
              <div className="text-center py-20 text-white/30 italic">
                No universities to display yet.
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}