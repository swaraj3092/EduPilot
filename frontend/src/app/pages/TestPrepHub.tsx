import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowLeft, Target, BookOpen, Award, TrendingUp, Globe, BarChart3, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Progress } from "@components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { getTestRequirements, analyzeTestScore, TestRequirement } from "@services";

const FIELDS = ["Computer Science", "AI / Machine Learning", "Data Science", "Electrical Engineering", "Business", "Biotechnology"];
const COUNTRIES = ["USA", "UK", "Canada", "Australia", "Germany", "India"];

export function TestPrepHub() {
  const navigate = useNavigate();

  // Load from Settings Profile
  const savedProfile = localStorage.getItem("edupilot-profile");
  const profile = savedProfile ? JSON.parse(savedProfile) : {};

  const [selectedField, setSelectedField] = useState(profile.field || "Computer Science");
  const [selectedCountry, setSelectedCountry] = useState(profile.country ? (profile.country === 'india' ? 'India' : (profile.country === 'uk' ? 'UK' : 'USA')) : "USA");

  const [requirements, setRequirements] = useState<TestRequirement[]>([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [reqError, setReqError] = useState<string | null>(null);

  const [greScores, setGreScores] = useState({ verbal: "", quant: "", awa: "" });
  const [toeflScores, setToeflScores] = useState({ reading: "", listening: "", speaking: "", writing: "" });
  const [ieltsScores, setIeltsScores] = useState({ reading: "", listening: "", speaking: "", writing: "" });
  const [gmatScores, setGmatScores] = useState({ verbal: "", quant: "", ir: "", awa: "" });

  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const loadRequirements = useCallback(async () => {
    setReqLoading(true);
    setReqError(null);
    try {
      const result = await getTestRequirements({ field: selectedField, level: "Masters", country: selectedCountry });
      setRequirements(result.requirements || []);
    } catch (err: any) {
      setReqError(err?.message ?? "Failed to load requirements");
    } finally {
      setReqLoading(false);
    }
  }, [selectedField, selectedCountry]);

  useEffect(() => {
    loadRequirements();
  }, []);

  const analyzeScore = async (testType: string, scores: Record<string, string>) => {
    const numericScores: Record<string, number> = {};
    for (const [k, v] of Object.entries(scores)) {
      if (v) numericScores[k] = parseFloat(v);
    }
    if (Object.keys(numericScores).length === 0) return;

    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    try {
      const result = await analyzeTestScore({
        test_type: testType,
        scores: numericScores,
        target_field: selectedField,
        target_country: selectedCountry,
      });
      setAnalysisResult({ ...result, testType });
    } catch (err: any) {
      setAnalysisError(err?.message ?? "Analysis failed");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const ScorePredictor = ({
    title, icon, color, testType, scoreFields, scores, setScores, maxNote,
  }: {
    title: string; icon: any; color: string; testType: string;
    scoreFields: { label: string; key: string; step?: string }[];
    scores: Record<string, string>; setScores: (v: any) => void; maxNote: string;
  }) => (
    <Card className="p-6 bg-card backdrop-blur-xl border-border shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
      </div>
      <div className="space-y-4 mb-6">
        {scoreFields.map(({ label, key, step }) => (
          <div key={key}>
            <label className="text-sm text-muted-foreground mb-2 block font-medium">{label}</label>
            <Input type="number" step={step} placeholder="Enter your practice score"
              value={scores[key]} onChange={(e) => setScores({ ...scores, [key]: e.target.value })}
              className="bg-input border-border text-foreground" />
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-4">{maxNote}</p>
      <Button onClick={() => analyzeScore(testType, scores)} disabled={analysisLoading}
        className={`w-full bg-gradient-to-r ${color}`}>
        {analysisLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
        {analysisLoading ? "Analyzing..." : "Analyze with AI"}
      </Button>

      {analysisError && analysisResult?.testType !== testType && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm">⚠️ {analysisError}</p>
        </div>
      )}

      {analysisResult && analysisResult.testType === testType && !analysisLoading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 rounded-xl bg-primary/5 border border-primary/20 shadow-sm shadow-primary/5">
          <div className="text-center mb-4">
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">AI Predicted Score</div>
            <div className="text-4xl font-black text-foreground">{analysisResult.predicted_total}</div>
            <div className="text-sm text-muted-foreground font-medium mt-1">{analysisResult.percentile} · <span className={`font-black uppercase tracking-tight ${
              analysisResult.rating === "Excellent" ? "text-green-600" :
              analysisResult.rating === "Good" ? "text-blue-600" :
              analysisResult.rating === "Average" ? "text-yellow-600" : "text-red-600"
            }`}>{analysisResult.rating}</span></div>
          </div>
          <p className="text-sm text-muted-foreground font-medium italic mb-4">{analysisResult.feedback}</p>
          {analysisResult.universities_achievable?.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-white/50 mb-2">Universities Within Reach</div>
              <div className="flex flex-wrap gap-2">
                {analysisResult.universities_achievable.map((u: string, i: number) => (
                  <span key={i} className="px-2 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs">{u}</span>
                ))}
              </div>
            </div>
          )}
          {analysisResult.improvement_tips?.length > 0 && (
            <div>
              <div className="text-xs text-white/50 mb-2">Improvement Tips</div>
              <ul className="space-y-1">
                {analysisResult.improvement_tips.map((tip: string, i: number) => (
                  <li key={i} className="text-xs text-white/70 flex items-start gap-2">
                    <span className="text-green-400">•</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      <nav className="relative z-10 backdrop-blur-xl bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent italic">
                Test Prep Hub
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)}
              className="px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm font-medium">
              {FIELDS.map(f => <option key={f} value={f} className="bg-card text-foreground">{f}</option>)}
            </select>
            <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm font-medium">
              {COUNTRIES.map(c => <option key={c} value={c} className="bg-card text-foreground">{c}</option>)}
            </select>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <Tabs defaultValue="gre" className="space-y-8">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="gre" className="data-[state=active]:bg-card data-[state=active]:text-primary font-bold">GRE</TabsTrigger>
            <TabsTrigger value="toefl" className="data-[state=active]:bg-card data-[state=active]:text-primary font-bold">TOEFL</TabsTrigger>
            <TabsTrigger value="ielts" className="data-[state=active]:bg-card data-[state=active]:text-primary font-bold">IELTS</TabsTrigger>
            <TabsTrigger value="gmat" className="data-[state=active]:bg-card data-[state=active]:text-primary font-bold">GMAT</TabsTrigger>
            <TabsTrigger value="requirements" className="data-[state=active]:bg-card data-[state=active]:text-primary font-bold">Uni Requirements</TabsTrigger>
          </TabsList>

          <TabsContent value="gre">
            <ScorePredictor title="GRE Score Analysis" icon={<Target className="w-6 h-6 text-green-400" />}
              color="from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              testType="gre"
              scoreFields={[
                { label: "Verbal Reasoning (130-170)", key: "verbal" },
                { label: "Quantitative Reasoning (130-170)", key: "quant" },
                { label: "Analytical Writing (0-6)", key: "awa", step: "0.5" },
              ]}
              scores={greScores} setScores={setGreScores} maxNote="Max score: 340 (Verbal + Quant) + 6.0 AW" />
          </TabsContent>

          <TabsContent value="toefl">
            <ScorePredictor title="TOEFL Score Analysis" icon={<Globe className="w-6 h-6 text-blue-400" />}
              color="from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              testType="toefl"
              scoreFields={[
                { label: "Reading (0-30)", key: "reading" },
                { label: "Listening (0-30)", key: "listening" },
                { label: "Speaking (0-30)", key: "speaking" },
                { label: "Writing (0-30)", key: "writing" },
              ]}
              scores={toeflScores} setScores={setToeflScores} maxNote="Max total score: 120" />
          </TabsContent>

          <TabsContent value="ielts">
            <ScorePredictor title="IELTS Band Analysis" icon={<Globe className="w-6 h-6 text-teal-400" />}
              color="from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              testType="ielts"
              scoreFields={[
                { label: "Listening (1-9)", key: "listening", step: "0.5" },
                { label: "Reading (1-9)", key: "reading", step: "0.5" },
                { label: "Writing (1-9)", key: "writing", step: "0.5" },
                { label: "Speaking (1-9)", key: "speaking", step: "0.5" },
              ]}
              scores={ieltsScores} setScores={setIeltsScores} maxNote="Max overall band: 9.0" />
          </TabsContent>

          <TabsContent value="gmat">
            <ScorePredictor title="GMAT Score Analysis" icon={<BarChart3 className="w-6 h-6 text-amber-400" />}
              color="from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              testType="gmat"
              scoreFields={[
                { label: "Verbal Reasoning (6-51)", key: "verbal" },
                { label: "Quantitative Reasoning (6-51)", key: "quant" },
                { label: "Integrated Reasoning (1-8)", key: "ir" },
                { label: "Analytical Writing (0-6)", key: "awa", step: "0.5" },
              ]}
              scores={gmatScores} setScores={setGmatScores} maxNote="Max total score: 800 (V+Q scaled)" />
          </TabsContent>

          <TabsContent value="requirements">
            <Card className="p-6 bg-card backdrop-blur-xl border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">
                  Real Score Requirements · {selectedField} · {selectedCountry}
                </h3>
                <Button onClick={loadRequirements} disabled={reqLoading} size="sm"
                  className="bg-gradient-to-r from-green-500 to-emerald-500">
                  {reqLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  <span className="ml-2">{reqLoading ? "Loading..." : "Refresh"}</span>
                </Button>
              </div>

              {reqError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                  <p className="text-red-400">⚠️ {reqError}</p>
                </div>
              )}

              {reqLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <span className="text-sm text-muted-foreground font-medium">Fetching real requirements from AI...</span>
                </div>
              )}

              {!reqLoading && requirements.length > 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-5 gap-4 px-4 pb-3 border-b border-border">
                    {["University", "GRE", "TOEFL", "IELTS", "Notes"].map(h => (
                      <div key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</div>
                    ))}
                  </div>
                  {requirements.map((uni, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/20 transition">
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="font-bold text-foreground">{uni.name}</div>
                        <div className="text-center">
                          <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-sm font-semibold">{uni.gre}</span>
                        </div>
                        <div className="text-center">
                          <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-300 text-sm font-semibold">{uni.toefl}</span>
                        </div>
                        <div className="text-center">
                          <span className="px-2 py-1 rounded-lg bg-teal-500/20 text-teal-300 text-sm font-semibold">{uni.ielts}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium italic">{uni.notes || "—"}</div>
                      </div>
                    </motion.div>
                  ))}
                  <p className="text-[10px] text-muted-foreground/50 pt-4 text-center font-medium">Data generated by Gemini AI · Verify with official university pages</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}