import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles, CheckCircle2, AlertCircle, TrendingUp, Copy, RotateCcw,
  FileText, Lightbulb, ClipboardCheck, History, ChevronDown, ChevronUp,
  Shield, ShieldCheck, ShieldAlert, Eye, ArrowLeftRight, Clock, Trash2,
  Search, BookOpen, Pen, Wand2, Check
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { analyzeEssay, EssayAnalysisResponse, getEssayHistory } from "@services";

interface FeedbackScore {
  label: string;
  score: number;
  feedback: string;
}

interface PlagiarismResult {
  overallOriginality: number;
  sources: { text: string; similarity: number; source: string }[];
}

interface EssayVersion {
  id: string;
  essayText: string;
  essayType: string;
  overallScore: number;
  scores: FeedbackScore[];
  improvedVersion: string;
  plagiarism: PlagiarismResult;
  timestamp: Date;
  wordCount: number;
}

const ESSAY_TYPES = [
  { id: "sop", label: "Statement of Purpose", icon: FileText },
  { id: "personal", label: "Personal Statement", icon: Lightbulb },
  { id: "diversity", label: "Diversity Essay", icon: Sparkles },
];

const SAMPLE_ESSAYS: Record<string, string> = {
  sop: "Growing up in a small town, I always dreamed of pursuing higher education abroad. My fascination with computer science began when I built my first website at age 14. Since then, I have dedicated myself to understanding the intersection of technology and human experience.\n\nDuring my undergraduate studies at Delhi University, I maintained a 3.8 GPA while leading the AI Research Club. My capstone project on natural language processing for regional languages received recognition at the National Tech Symposium.\n\nI am drawn to MIT's Computer Science program because of its emphasis on interdisciplinary research. Professor Johnson's work on ethical AI aligns perfectly with my research interests. I believe my background in both technical development and social impact positions me uniquely to contribute to this program.",
  personal: "The monsoon rain hammered against the tin roof of our community center as I watched a farmer struggle to understand a government document written in English. That moment crystallized my purpose — to bridge the gap between technology and accessibility.\n\nThis experience drove me to develop a mobile app that translates official documents into 12 regional languages, serving over 50,000 users in rural India. The project taught me that technology's true value lies not in its complexity but in its ability to empower.",
  diversity: "As a first-generation college student from a tribal community in northeastern India, my journey to higher education has been anything but conventional. Growing up without electricity until age 12, I learned to study by candlelight, developing a resilience that has defined my academic career.\n\nMy unique perspective has allowed me to approach problems differently. When our village needed clean water, I didn't just see a problem — I saw an engineering challenge that my community's traditional knowledge could help solve.",
};

// Analysis step definitions
const ANALYSIS_STEPS = [
  { label: "Reading essay content", icon: Eye, color: "text-blue-400", duration: 500 },
  { label: "Scanning grammar & syntax", icon: Search, color: "text-cyan-400", duration: 700 },
  { label: "Checking for plagiarism", icon: Shield, color: "text-amber-400", duration: 800 },
  { label: "Analyzing structure & flow", icon: BookOpen, color: "text-purple-400", duration: 600 },
  { label: "Evaluating voice & impact", icon: Pen, color: "text-pink-400", duration: 500 },
  { label: "Generating AI improvements", icon: Wand2, color: "text-green-400", duration: 600 },
];

export function EssayCoach() {
  const [essay, setEssay] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [scores, setScores] = useState<FeedbackScore[]>([]);
  const [improvedVersion, setImprovedVersion] = useState("");
  const [selectedType, setSelectedType] = useState("sop");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"feedback" | "improved" | "plagiarism" | "history">("feedback");
  const [plagiarism, setPlagiarism] = useState<PlagiarismResult | null>(null);
  const [versionHistory, setVersionHistory] = useState<EssayVersion[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState<[string | null, string | null]>([null, null]);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const analyzeTimeoutRef = useRef<NodeJS.Timeout[]>([]);

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const charCount = essay.length;
  const idealWordRange = selectedType === "sop" ? [500, 1000] : selectedType === "personal" ? [400, 800] : [300, 600];

  // Fetch History on mount
  useEffect(() => {
    const fetchHistory = async () => {
      const authUser = JSON.parse(localStorage.getItem("edupilot-user") || "{}");
      if (!authUser.id) return;

      try {
        const res = await getEssayHistory(authUser.id);
        if (res.status === "success" && res.history) {
          const mapped: EssayVersion[] = res.history.map((h: any) => ({
            id: h.id,
            essayText: h.essay_text,
            essayType: h.essay_type,
            overallScore: h.overall_score,
            scores: h.scores,
            improvedVersion: h.improved_version,
            plagiarism: {
              overallOriginality: h.plagiarism.overall_originality,
              sources: h.plagiarism.sources || []
            },
            timestamp: new Date(h.created_at),
            wordCount: h.word_count
          }));
          setVersionHistory(mapped);
        }
      } catch (e) {
        console.error("Failed to load essay history", e);
      }
    };
    fetchHistory();

    return () => {
      analyzeTimeoutRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleAnalyze = async () => {
    if (!essay.trim()) return;
    
    setAnalyzing(true);
    setAnalyzed(false);
    setCurrentStep(-1);
    setCompletedSteps([]);

    // Clear old timeouts
    analyzeTimeoutRef.current.forEach(clearTimeout);
    analyzeTimeoutRef.current = [];

    // Run animated steps sequentially while API calls in background
    let cumulativeDelay = 200;
    ANALYSIS_STEPS.forEach((step, i) => {
      const startTimeout = setTimeout(() => setCurrentStep(i), cumulativeDelay);
      analyzeTimeoutRef.current.push(startTimeout);
      cumulativeDelay += step.duration;
      const completeTimeout = setTimeout(() => {
        setCompletedSteps(prev => [...prev, i]);
      }, cumulativeDelay);
      analyzeTimeoutRef.current.push(completeTimeout);
      cumulativeDelay += 100;
    });

    try {
      const authUser = JSON.parse(localStorage.getItem("edupilot-user") || "{}");
      const response = await analyzeEssay(essay, selectedType as "sop" | "personal" | "diversity", authUser.id);
      
      // Wait for at least the animations to finish a bit or finish them early if API was slow
      const finalTimeout = setTimeout(() => {
        const newScores: FeedbackScore[] = response.scores;
        const improved = response.improved_version;
        const plagResult: PlagiarismResult = {
          overallOriginality: response.plagiarism.overall_originality,
          sources: response.plagiarism.sources.map(s => ({
            text: s.text,
            similarity: s.similarity,
            source: s.source
          }))
        };

        setScores(newScores);
        setImprovedVersion(improved);
        setPlagiarism(plagResult);

        // Save to version history
        const newVersion: EssayVersion = {
          id: Date.now().toString(),
          essayText: essay,
          essayType: selectedType,
          overallScore: response.overall_score,
          scores: newScores,
          improvedVersion: improved,
          plagiarism: plagResult,
          timestamp: new Date(),
          wordCount: response.word_count,
        };
        setVersionHistory(prev => [newVersion, ...prev]);

        setAnalyzing(false);
        setAnalyzed(true);
        setActiveTab("feedback");
      }, Math.max(cumulativeDelay + 300, 2000));
      analyzeTimeoutRef.current.push(finalTimeout);

    } catch (error) {
      console.error("Essay API Error:", error);
      setAnalyzing(false);
      // Fallback or error message could go here
    }
  };

  const handleCopyImproved = () => {
    navigator.clipboard.writeText(improvedVersion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setEssay("");
    setAnalyzed(false);
    setAnalyzing(false);
    setScores([]);
    setImprovedVersion("");
    setPlagiarism(null);
    setCurrentStep(-1);
    setCompletedSteps([]);
  };

  const handleLoadSample = () => {
    setEssay(SAMPLE_ESSAYS[selectedType] || SAMPLE_ESSAYS.sop);
    setAnalyzed(false);
  };

  const deleteVersion = (id: string) => {
    setVersionHistory(prev => prev.filter(v => v.id !== id));
  };

  const loadVersion = (version: EssayVersion) => {
    setEssay(version.essayText);
    setSelectedType(version.essayType);
    setScores(version.scores);
    setImprovedVersion(version.improvedVersion);
    setPlagiarism(version.plagiarism);
    setAnalyzed(true);
    setActiveTab("feedback");
  };

  const overallScore = scores.length > 0
    ? Math.round(scores.reduce((acc, s) => acc + s.score, 0) / scores.length)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 65) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-green-500/20 to-emerald-500/20 border-green-500/30";
    if (score >= 65) return "from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
    return "from-red-500/20 to-pink-500/20 border-red-500/30";
  };

  const getCompareVersions = () => {
    const v1 = versionHistory.find(v => v.id === compareVersions[0]);
    const v2 = versionHistory.find(v => v.id === compareVersions[1]);
    return [v1, v2] as const;
  };

  const totalProgress = ANALYSIS_STEPS.length > 0
    ? Math.round((completedSteps.length / ANALYSIS_STEPS.length) * 100)
    : 0;

  return (
    <div className="grid lg:grid-cols-5 gap-6 w-full min-h-[600px]">
      {/* Left: Input — 2 columns */}
      <motion.div
        className="lg:col-span-2 flex flex-col"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10 flex-1 flex flex-col shadow-2xl">
          {/* Essay Type Selector */}
          <div className="mb-4">
            <label className="text-xs text-white/50 mb-2 block">Essay Type</label>
            <div className="flex gap-2">
              {ESSAY_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setSelectedType(type.id); setAnalyzed(false); }}
                    className={`flex-1 px-3 py-2 rounded-lg border text-xs transition-all flex items-center gap-1.5 justify-center ${
                      selectedType === type.id
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                        : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {type.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Header */}
          <motion.div className="flex items-center gap-3 mb-4">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
              animate={{ boxShadow: ["0 0 20px rgba(168,85,247,0.4)", "0 0 40px rgba(236,72,153,0.6)", "0 0 20px rgba(168,85,247,0.4)"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Essay Coach</h3>
              <p className="text-xs text-white/60">Paste your essay for instant feedback</p>
            </div>
          </motion.div>

          {/* Textarea */}
          <Textarea
            placeholder={`Paste your ${ESSAY_TYPES.find(t => t.id === selectedType)?.label || "essay"} here...`}
            className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/30 mb-3 resize-none min-h-[220px] text-sm p-4 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
            value={essay}
            onChange={(e) => { setEssay(e.target.value); setAnalyzed(false); }}
          />

          {/* Word Count Bar */}
          <div className="flex items-center justify-between text-xs text-white/50 mb-3 px-1">
            <div className="flex gap-3">
              <span>{wordCount} words</span>
              <span>{charCount} chars</span>
            </div>
            <span className={
              wordCount >= idealWordRange[0] && wordCount <= idealWordRange[1] ? "text-green-400" :
              wordCount > idealWordRange[1] ? "text-red-400" : "text-yellow-400"
            }>
              Ideal: {idealWordRange[0]}–{idealWordRange[1]}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-5 shadow-xl"
                onClick={handleAnalyze}
                disabled={!essay || analyzing}
              >
                <AnimatePresence mode="wait">
                  {analyzing ? (
                    <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                      <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                      Analyzing...
                    </motion.div>
                  ) : (
                    <motion.div key="analyze" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze with AI
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
            <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 py-5" onClick={handleLoadSample} title="Load sample essay">
              <FileText className="w-4 h-4" />
            </Button>
            {analyzed && (
              <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 py-5" onClick={handleReset} title="Reset">
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Version History Count */}
          {versionHistory.length > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-center gap-2 text-xs text-white/40 hover:text-white/60 transition py-2 rounded-lg hover:bg-white/5"
              onClick={() => { setActiveTab("history"); setAnalyzed(true); }}
            >
              <History className="w-3.5 h-3.5" />
              {versionHistory.length} version{versionHistory.length !== 1 ? "s" : ""} saved
            </motion.button>
          )}
        </Card>
      </motion.div>

      {/* Right: Feedback — 3 columns */}
      <div className="lg:col-span-3 overflow-y-auto pr-1 max-h-[calc(90vh-140px)]">
        <AnimatePresence mode="wait">
          {analyzed && (
            <motion.div key="analyzed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              {/* Overall Score Ring */}
              {activeTab !== "history" && (
                <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}>
                  <Card className={`p-6 bg-gradient-to-br ${getScoreGradient(overallScore)} backdrop-blur-xl shadow-2xl`}>
                    <div className="flex items-center gap-6">
                      <div className="relative w-28 h-28 flex-shrink-0">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                          <motion.circle cx="50" cy="50" r="42" fill="none" stroke={overallScore >= 80 ? "#4ade80" : overallScore >= 65 ? "#facc15" : "#f87171"} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 42}`} initial={{ strokeDashoffset: 2 * Math.PI * 42 }} animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - overallScore / 100) }} transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <motion.span className={`text-3xl font-bold ${getScoreColor(overallScore)}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.5 }}>{overallScore}</motion.span>
                          <span className="text-[10px] text-white/50">/ 100</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {overallScore >= 80 ? "Excellent Essay!" : overallScore >= 65 ? "Good Work — Room to Shine" : "Needs Improvement"}
                        </h3>
                        <p className="text-xs text-white/60 mb-3">
                          {overallScore >= 80 ? "Your essay is strong and compelling." : overallScore >= 65 ? "Solid foundation with areas for improvement." : "Focus on the suggestions below."}
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                          {scores.map((s, i) => (
                            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }} className="text-center">
                              <div className={`text-base font-bold ${getScoreColor(s.score)}`}>{s.score}</div>
                              <div className="text-[9px] text-white/40 leading-tight truncate">{s.label.split(" ")[0]}</div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Tab Toggle */}
              <div className="flex gap-1.5 flex-wrap">
                {(["feedback", "plagiarism", "improved", "history"] as const).map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs transition-all min-w-[100px] ${
                      activeTab === tab
                        ? tab === "plagiarism" ? "bg-amber-500/20 border border-amber-500/50 text-amber-300"
                        : tab === "history" ? "bg-indigo-500/20 border border-indigo-500/50 text-indigo-300"
                        : "bg-purple-500/20 border border-purple-500/50 text-purple-300"
                        : "bg-white/5 border border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    {tab === "feedback" ? "Feedback" : tab === "improved" ? "AI Improved" : tab === "plagiarism" ? "Plagiarism" : `History (${versionHistory.length})`}
                  </motion.button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {/* Feedback Tab */}
                {activeTab === "feedback" && (
                  <motion.div key="feedback-tab" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }} className="space-y-3">
                    {scores.map((item, i) => (
                      <motion.div key={item.label} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.05 + i * 0.08 }} whileHover={{ scale: 1.01 }}>
                        <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {item.score >= 75 ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                              <span className="text-sm text-white font-semibold">{item.label}</span>
                            </div>
                            <span className={`text-lg font-bold ${getScoreColor(item.score)}`}>{item.score}</span>
                          </div>
                          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.2 + i * 0.08 }} className="origin-left">
                            <Progress value={item.score} className="h-1.5 mb-2" />
                          </motion.div>
                          <p className="text-xs text-white/70 leading-relaxed">{item.feedback}</p>
                        </Card>
                      </motion.div>
                    ))}
                    {/* Quick Tips */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                      <Card className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-yellow-400" />
                          <h4 className="text-sm text-white font-semibold">Quick Wins</h4>
                        </div>
                        <ul className="space-y-1.5">
                          {["Start with a compelling hook — a specific moment or experience", "Show, don't tell: use concrete examples instead of generic claims", "Connect your past experiences directly to your future goals", "End with a forward-looking statement about your contribution"].map((tip, i) => (
                            <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.08 }} className="flex items-start gap-2 text-xs text-white/60">
                              <span className="text-purple-400 mt-0.5">•</span>{tip}
                            </motion.li>
                          ))}
                        </ul>
                      </Card>
                    </motion.div>
                  </motion.div>
                )}

                {/* Plagiarism Tab */}
                {activeTab === "plagiarism" && plagiarism && (
                  <motion.div key="plagiarism-tab" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }} className="space-y-4">
                    {/* Originality Score */}
                    <Card className={`p-6 bg-gradient-to-br backdrop-blur-xl shadow-2xl ${
                      plagiarism.overallOriginality >= 90 ? "from-green-500/15 to-emerald-500/15 border-green-500/30" :
                      plagiarism.overallOriginality >= 75 ? "from-yellow-500/15 to-amber-500/15 border-yellow-500/30" :
                      "from-red-500/15 to-pink-500/15 border-red-500/30"
                    }`}>
                      <div className="flex items-center gap-6">
                        <div className="relative w-28 h-28 flex-shrink-0">
                          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                            <motion.circle cx="50" cy="50" r="42" fill="none"
                              stroke={plagiarism.overallOriginality >= 90 ? "#4ade80" : plagiarism.overallOriginality >= 75 ? "#facc15" : "#f87171"}
                              strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 42}`}
                              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                              animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - plagiarism.overallOriginality / 100) }}
                              transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span className={`text-3xl font-bold ${plagiarism.overallOriginality >= 90 ? "text-green-400" : plagiarism.overallOriginality >= 75 ? "text-yellow-400" : "text-red-400"}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.4 }}>
                              {plagiarism.overallOriginality}%
                            </motion.span>
                            <span className="text-[10px] text-white/50">Original</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {plagiarism.overallOriginality >= 90 ? (
                              <ShieldCheck className="w-6 h-6 text-green-400" />
                            ) : (
                              <ShieldAlert className="w-6 h-6 text-amber-400" />
                            )}
                            <h3 className="text-lg font-bold text-white">
                              {plagiarism.overallOriginality >= 90 ? "Highly Original!" :
                               plagiarism.overallOriginality >= 75 ? "Mostly Original" :
                               "Potential Plagiarism Detected"}
                            </h3>
                          </div>
                          <p className="text-xs text-white/60 mb-3">
                            {plagiarism.overallOriginality >= 90
                              ? "Your essay demonstrates strong originality. Only common phrases were flagged."
                              : plagiarism.overallOriginality >= 75
                              ? "Some phrases were found in existing databases. Consider rephrasing the flagged sections."
                              : "Several passages closely match existing sources. Significant revision recommended."}
                          </p>
                          <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-green-400" />
                              <span className="text-white/50">{plagiarism.overallOriginality}% Original</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-red-400" />
                              <span className="text-white/50">{100 - plagiarism.overallOriginality}% Matched</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Flagged Sources */}
                    {plagiarism.sources.length > 0 && (
                      <Card className="p-5 bg-white/5 backdrop-blur-xl border-white/10">
                        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                          <Search className="w-4 h-4 text-amber-400" />
                          Flagged Phrases ({plagiarism.sources.length})
                        </h4>
                        <div className="space-y-3">
                          {plagiarism.sources.map((source, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.1 }} className="p-3 rounded-lg bg-white/5 border border-white/10">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <p className="text-xs text-amber-300/80 italic flex-1">"{source.text}"</p>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  source.similarity <= 10 ? "bg-green-500/20 text-green-300" : "bg-amber-500/20 text-amber-300"
                                }`}>
                                  {source.similarity}% match
                                </span>
                              </div>
                              <p className="text-[10px] text-white/40">Source: {source.source}</p>
                            </motion.div>
                          ))}
                        </div>
                      </Card>
                    )}

                    <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
                      <p className="text-xs text-white/60 flex items-start gap-2">
                        <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        This is a simulated plagiarism check for demonstration purposes. For official checks, use tools like Turnitin or Grammarly Premium.
                      </p>
                    </Card>
                  </motion.div>
                )}

                {/* Improved Tab */}
                {activeTab === "improved" && (
                  <motion.div key="improved-tab" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                    <Card className="p-5 bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                            <TrendingUp className="w-5 h-5 text-green-400" />
                          </motion.div>
                          <h4 className="text-base font-bold text-white">AI-Improved Version</h4>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/10 gap-1.5" onClick={handleCopyImproved}>
                            {copied ? (<><ClipboardCheck className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400 text-xs">Copied!</span></>) : (<><Copy className="w-3.5 h-3.5" /><span className="text-xs">Copy</span></>)}
                          </Button>
                        </motion.div>
                      </div>
                      <motion.div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 leading-relaxed whitespace-pre-line" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        {improvedVersion}
                      </motion.div>
                      <p className="text-[10px] text-white/40 mt-2">This is an AI-generated suggestion. Always personalize and review before submitting.</p>
                    </Card>
                  </motion.div>
                )}

                {/* History Tab */}
                {activeTab === "history" && (
                  <motion.div key="history-tab" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-4">
                    {/* Compare Mode Toggle */}
                    {versionHistory.length >= 2 && (
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <History className="w-4 h-4 text-indigo-400" />
                          Version History
                        </h4>
                        <Button size="sm" variant={compareMode ? "default" : "outline"} className={compareMode ? "bg-indigo-500 hover:bg-indigo-600 text-xs" : "border-white/20 hover:bg-white/10 text-xs"} onClick={() => { setCompareMode(!compareMode); setCompareVersions([null, null]); }}>
                          <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" />
                          {compareMode ? "Exit Compare" : "Compare"}
                        </Button>
                      </div>
                    )}

                    {/* Compare View */}
                    {compareMode && (
                      <Card className="p-4 bg-indigo-500/10 border-indigo-500/20">
                        <p className="text-xs text-indigo-300 mb-3">Select two versions to compare side by side</p>
                        {compareVersions[0] && compareVersions[1] && (() => {
                          const [v1, v2] = getCompareVersions();
                          if (!v1 || !v2) return null;
                          const scoreDiff = v2.overallScore - v1.overallScore;
                          return (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                                  <div className="text-[10px] text-white/40 mb-1">Version {versionHistory.findIndex(v => v.id === v1.id) + 1}</div>
                                  <div className={`text-2xl font-bold ${getScoreColor(v1.overallScore)}`}>{v1.overallScore}</div>
                                  <div className="text-[10px] text-white/50">{v1.wordCount} words</div>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                                  <div className="text-[10px] text-white/40 mb-1">Version {versionHistory.findIndex(v => v.id === v2.id) + 1}</div>
                                  <div className={`text-2xl font-bold ${getScoreColor(v2.overallScore)}`}>{v2.overallScore}</div>
                                  <div className="text-[10px] text-white/50">{v2.wordCount} words</div>
                                </div>
                              </div>
                              <div className="text-center p-2 rounded-lg bg-white/5">
                                <span className={`text-sm font-bold ${scoreDiff > 0 ? "text-green-400" : scoreDiff < 0 ? "text-red-400" : "text-white/60"}`}>
                                  {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff} point{Math.abs(scoreDiff) !== 1 ? "s" : ""} {scoreDiff > 0 ? "improvement" : scoreDiff < 0 ? "decrease" : "no change"}
                                </span>
                              </div>
                              {/* Per-category comparison */}
                              <div className="space-y-2">
                                {v1.scores.map((s1, i) => {
                                  const s2 = v2.scores[i];
                                  if (!s2) return null;
                                  const diff = s2.score - s1.score;
                                  return (
                                    <div key={s1.label} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5">
                                      <span className="text-white/70">{s1.label}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-white/50">{s1.score}</span>
                                        <span className="text-white/30">→</span>
                                        <span className="text-white/80">{s2.score}</span>
                                        <span className={`text-[10px] font-semibold ${diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-white/40"}`}>
                                          {diff > 0 ? `+${diff}` : diff}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          );
                        })()}
                      </Card>
                    )}

                    {/* Version List */}
                    {versionHistory.length === 0 ? (
                      <Card className="p-8 bg-white/5 border-white/10 text-center">
                        <History className="w-10 h-10 text-white/20 mx-auto mb-3" />
                        <p className="text-sm text-white/40">No versions yet. Analyze an essay to create your first version.</p>
                      </Card>
                    ) : (
                      versionHistory.map((version, i) => {
                        const isSelected = compareVersions.includes(version.id);
                        return (
                          <motion.div key={version.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <Card className={`p-4 bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all ${
                              isSelected ? "ring-1 ring-indigo-500/50 border-indigo-500/30" : ""
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  {compareMode && (
                                    <button
                                      onClick={() => {
                                        if (isSelected) {
                                          setCompareVersions(prev => prev.map(v => v === version.id ? null : v) as [string | null, string | null]);
                                        } else {
                                          setCompareVersions(prev => {
                                            if (!prev[0]) return [version.id, prev[1]];
                                            if (!prev[1]) return [prev[0], version.id];
                                            return [prev[1], version.id];
                                          });
                                        }
                                      }}
                                      className={`w-5 h-5 rounded border flex items-center justify-center transition ${
                                        isSelected ? "bg-indigo-500 border-indigo-400" : "border-white/30 hover:border-white/50"
                                      }`}
                                    >
                                      {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </button>
                                  )}
                                  <div>
                                    <div className="text-sm text-white font-semibold flex items-center gap-2">
                                      Version {versionHistory.length - i}
                                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-white/50">
                                        {ESSAY_TYPES.find(t => t.id === version.essayType)?.label || "Essay"}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-white/40 flex items-center gap-2 mt-0.5">
                                      <Clock className="w-3 h-3" />
                                      {version.timestamp.toLocaleString()}
                                      <span>•</span>
                                      {version.wordCount} words
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={`text-xl font-bold ${getScoreColor(version.overallScore)}`}>{version.overallScore}</div>
                                  <button onClick={() => setExpandedVersion(expandedVersion === version.id ? null : version.id)} className="p-1 rounded hover:bg-white/10 transition">
                                    {expandedVersion === version.id ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
                                  </button>
                                </div>
                              </div>

                              {/* Mini scores row */}
                              <div className="flex gap-1 mb-2">
                                {version.scores.map(s => (
                                  <div key={s.label} className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/10">
                                    <div className={`h-full rounded-full ${s.score >= 75 ? "bg-green-400" : s.score >= 60 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: `${s.score}%` }} />
                                  </div>
                                ))}
                              </div>

                              <AnimatePresence>
                                {expandedVersion === version.id && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                                    <div className="pt-3 border-t border-white/10 mt-2 space-y-2">
                                      <p className="text-xs text-white/60 line-clamp-3">{version.essayText.substring(0, 200)}...</p>
                                      <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/10 text-xs flex-1" onClick={() => loadVersion(version)}>
                                          <Eye className="w-3 h-3 mr-1" /> Load
                                        </Button>
                                        <Button size="sm" variant="outline" className="border-red-500/30 hover:bg-red-500/10 text-red-400 text-xs" onClick={() => deleteVersion(version.id)}>
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </Card>
                          </motion.div>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Empty State */}
          {!analyzed && !analyzing && (
            <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="h-full">
              <Card className="p-12 bg-white/5 backdrop-blur-xl border-white/10 border-dashed flex flex-col items-center justify-center text-center min-h-[500px]">
                <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                  <Sparkles className="w-16 h-16 text-white/20 mb-6" />
                </motion.div>
                <p className="text-lg text-white/40 mb-2">Paste your essay and click "Analyze with AI"</p>
                <p className="text-sm text-white/30 mb-6">Or load a sample essay to see how the analysis works</p>
                <Button variant="outline" className="border-white/20 hover:bg-white/10" onClick={handleLoadSample}>
                  <FileText className="w-4 h-4 mr-2" /> Load Sample Essay
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Analyzing State — Enhanced Steps */}
          {analyzing && (
            <motion.div key="loading" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <Card className="p-10 bg-white/5 backdrop-blur-xl border-white/10 flex flex-col items-center justify-center text-center min-h-[500px]">
                {/* Central spinner */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="mb-8 relative"
                >
                  <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-purple-500 border-r-pink-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </div>
                </motion.div>

                {/* Progress bar */}
                <div className="w-full max-w-sm mb-6">
                  <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                    <span>Analyzing</span>
                    <span>{totalProgress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      animate={{ width: `${totalProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Step list */}
                <div className="space-y-2 w-full max-w-sm">
                  {ANALYSIS_STEPS.map((step, i) => {
                    const StepIcon = step.icon;
                    const isCompleted = completedSteps.includes(i);
                    const isActive = currentStep === i && !isCompleted;
                    const isPending = currentStep < i;
                    return (
                      <motion.div
                        key={step.label}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08, type: "spring", stiffness: 120 }}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                          isActive ? "bg-purple-500/15 border border-purple-500/30" :
                          isCompleted ? "bg-green-500/10 border border-green-500/20" :
                          "bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                          {isCompleted ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            </motion.div>
                          ) : isActive ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                              <StepIcon className={`w-5 h-5 ${step.color}`} />
                            </motion.div>
                          ) : (
                            <StepIcon className="w-5 h-5 text-white/20" />
                          )}
                        </div>
                        <span className={`text-sm flex-1 text-left ${
                          isCompleted ? "text-green-300/80" :
                          isActive ? "text-white" :
                          "text-white/30"
                        }`}>
                          {step.label}
                        </span>
                        {isActive && (
                          <motion.div
                            className="flex gap-0.5"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            {[0, 1, 2].map(dot => (
                              <motion.div
                                key={dot}
                                className="w-1 h-1 rounded-full bg-purple-400"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ delay: dot * 0.15, duration: 0.6, repeat: Infinity }}
                              />
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
