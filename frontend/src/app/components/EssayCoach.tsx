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
    return () => analyzeTimeoutRef.current.forEach(clearTimeout);
  }, []);

  const handleAnalyze = async () => {
    if (!essay.trim()) return;
    setAnalyzing(true);
    setAnalyzed(false);
    setCurrentStep(-1);
    setCompletedSteps([]);
    analyzeTimeoutRef.current.forEach(clearTimeout);
    analyzeTimeoutRef.current = [];
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
      {/* Left: Input */}
      <motion.div
        className="lg:col-span-2 flex flex-col"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <Card className="p-6 bg-[#0F0F1A]/80 backdrop-blur-2xl border-white/5 flex-1 flex flex-col shadow-[0_0_40px_-15px_rgba(0,0,0,0.5)]">
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-2 block">Essay Type</label>
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

          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
              animate={{ boxShadow: ["0 0 20px rgba(168,85,247,0.4)", "0 0 40px rgba(236,72,153,0.6)", "0 0 20px rgba(168,85,247,0.4)"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <FileText className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-foreground">AI Essay Coach</h3>
              <p className="text-xs text-muted-foreground">Paste your essay for instant feedback</p>
            </div>
          </div>

          <Textarea
            placeholder={`Paste your ${ESSAY_TYPES.find(t => t.id === selectedType)?.label || "essay"} here...`}
            className="flex-1 bg-[#05050A]/60 border-white/5 text-white/90 placeholder:text-white/20 mb-3 resize-none min-h-[220px] text-sm p-4 focus:border-purple-500/50 focus:ring-0 transition-all rounded-xl"
            value={essay}
            onChange={(e) => { setEssay(e.target.value); setAnalyzed(false); }}
          />

          <div className="flex items-center justify-between text-xs text-white/50 mb-3 px-1">
            <div className="flex gap-3">
              <span>{wordCount} words</span>
              <span>{charCount} chars</span>
            </div>
            <span className={
              wordCount >= idealWordRange[0] && wordCount <= idealWordRange[1] ? "text-green-400" :
              wordCount > idealWordRange[1] ? "text-red-400" : "text-yellow-400"
            }>
              Ideal: {idealWordRange[0]} - {idealWordRange[1]}
            </span>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
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
                    <div className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze with AI
                    </div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
            <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 py-5" onClick={handleLoadSample} title="Load sample essay">
              <FileText className="w-4 h-4" />
            </Button>
            {analyzed && (
              <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 py-5" onClick={handleReset} title="Reset">
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>

          {versionHistory.length > 0 && (
            <button
              className="mt-3 flex items-center justify-center gap-2 text-xs text-white/40 hover:text-white/60 transition py-2 rounded-lg hover:bg-white/5"
              onClick={() => { setActiveTab("history"); setAnalyzed(true); }}
            >
              <History className="w-3.5 h-3.5" />
              {versionHistory.length} version{versionHistory.length !== 1 ? "s" : ""} saved
            </button>
          )}
        </Card>
      </motion.div>

      {/* Right: Feedback */}
      <div className="lg:col-span-3 overflow-y-auto pr-1 max-h-[calc(90vh-140px)]">
        <AnimatePresence mode="wait">
          {analyzed && (
            <motion.div key="analyzed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              {activeTab !== "history" && (
                <Card className={`p-6 bg-gradient-to-br ${getScoreGradient(overallScore)} backdrop-blur-xl shadow-2xl`}>
                  <div className="flex items-center gap-6">
                    <div className="relative w-28 h-28 flex-shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                        <motion.circle cx="50" cy="50" r="42" fill="none" stroke={overallScore >= 80 ? "#4ade80" : overallScore >= 65 ? "#facc15" : "#f87171"} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 42}`} initial={{ strokeDashoffset: 2 * Math.PI * 42 }} animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - overallScore / 100) }} transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</span>
                        <span className="text-[10px] text-white/50">/ 100</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {overallScore >= 80 ? "Excellent Essay!" : overallScore >= 65 ? "Good Work - Room to Shine" : "Needs Improvement"}
                      </h3>
                      <p className="text-xs text-white/60 mb-3">
                        {overallScore >= 80 ? "Your essay is strong and compelling." : overallScore >= 65 ? "Solid foundation with areas for improvement." : "Focus on the suggestions below."}
                      </p>
                      <div className="grid grid-cols-5 gap-2">
                        {scores.map((s) => (
                          <div key={s.label} className="text-center">
                            <div className={`text-base font-bold ${getScoreColor(s.score)}`}>{s.score}</div>
                            <div className="text-[9px] text-white/40 leading-tight truncate">{s.label.split(" ")[0]}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex gap-1.5 flex-wrap">
                {(["feedback", "plagiarism", "improved", "history"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all min-w-[100px] border ${
                      activeTab === tab
                        ? tab === "plagiarism" ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                        : tab === "history" ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                        : "bg-purple-500/20 border-purple-500/40 text-purple-300"
                        : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
                    }`}
                  >
                    {tab === "feedback" ? "Feedback" : tab === "improved" ? "AI Improved" : tab === "plagiarism" ? "Plagiarism" : `History (${versionHistory.length})`}
                  </button>
                ))}
              </div>

              <div className="relative">
                <AnimatePresence mode="wait">
                  {activeTab === "feedback" && (
                    <motion.div key="feedback" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-3">
                      {scores.map((item, i) => (
                        <Card key={item.label} className="p-4 bg-[#0F0F1A]/60 border-white/5 hover:border-purple-500/30 transition-colors shadow-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {item.score >= 75 ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                              <span className="text-sm text-white/90 font-semibold">{item.label}</span>
                            </div>
                            <span className={`text-lg font-bold ${getScoreColor(item.score)}`}>{item.score}</span>
                          </div>
                          <Progress value={item.score} className="h-1.5 mb-2 bg-white/5" />
                          <p className="text-xs text-white/50 leading-relaxed font-light">{item.feedback}</p>
                        </Card>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === "plagiarism" && plagiarism && (
                    <motion.div key="plagiarism" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
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
                              <span className={`text-3xl font-bold ${plagiarism.overallOriginality >= 90 ? "text-green-400" : plagiarism.overallOriginality >= 75 ? "text-yellow-400" : "text-red-400"}`}>
                                {plagiarism.overallOriginality}%
                              </span>
                              <span className="text-[10px] text-white/50">Original</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                              {plagiarism.overallOriginality >= 90 ? <ShieldCheck className="w-5 h-5 text-green-400" /> : <ShieldAlert className="w-5 h-5 text-amber-400" />}
                              {plagiarism.overallOriginality >= 90 ? "Highly Original!" : "Potential Matches Found"}
                            </h3>
                            <p className="text-xs text-white/60">Your essay has been checked against major academic databases.</p>
                          </div>
                        </div>
                      </Card>
                      <div className="space-y-3">
                        {plagiarism.sources.map((source, i) => (
                          <div key={i} className="p-3 rounded-lg bg-[#0F0F1A]/60 border border-white/5 shadow-inner">
                            <div className="flex items-start justify-between gap-3 mb-1">
                              <p className="text-xs text-amber-300/80 italic font-medium">"{source.text}"</p>
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/30">{source.similarity}% match</span>
                            </div>
                            <p className="text-[10px] text-white/30 font-light">Source: {source.source}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "improved" && (
                    <motion.div key="improved" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                      <Card className="p-5 bg-[#0F0F1A]/60 border-white/5 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-base font-bold text-white/90 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            AI-Improved Version
                          </h4>
                          <Button size="sm" variant="outline" className="gap-1.5 border-white/10 hover:bg-white/5 text-white/70" onClick={handleCopyImproved}>
                            {copied ? <ClipboardCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
                          </Button>
                        </div>
                        <div className="p-4 rounded-xl bg-[#05050A]/40 border border-white/5 text-sm text-white/80 leading-relaxed font-light whitespace-pre-line">
                          {improvedVersion}
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {activeTab === "history" && (
                    <motion.div key="history" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
                      {versionHistory.map((version, i) => (
                        <Card key={version.id} className="p-4 bg-card border-border hover:border-indigo-500/30 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="text-sm text-white/90 font-semibold">Version {versionHistory.length - i}</div>
                                <div className="text-[10px] text-white/40 flex items-center gap-2">
                                  <Clock className="w-3 h-3" />
                                  {version.timestamp.toLocaleDateString()}
                                  <span>•</span>
                                  {version.wordCount} words
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`text-lg font-bold ${getScoreColor(version.overallScore)}`}>{version.overallScore}</div>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => loadVersion(version)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-500" onClick={() => deleteVersion(version.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {!analyzed && !analyzing && (
            <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="h-full">
              <Card className="p-12 bg-[#0F0F1A]/40 backdrop-blur-2xl border-white/5 border-dashed flex flex-col items-center justify-center text-center min-h-[500px] shadow-2xl">
                <div className="flex flex-col items-center">
                  <Sparkles className="w-16 h-16 text-white/20 mb-6" />
                  <p className="text-lg text-white/40 mb-2">Paste your essay and click "Analyze with AI"</p>
                  <Button variant="outline" className="mt-4" onClick={handleLoadSample}>
                    Load Sample Essay
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {analyzing && (
            <motion.div key="loading" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <Card className="p-10 bg-[#0F0F1A]/60 backdrop-blur-2xl border-white/5 flex flex-col items-center justify-center text-center min-h-[500px] shadow-2xl">
                <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-purple-500 animate-spin mb-8" />
                <div className="w-full max-w-sm">
                  <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                    <span>Analyzing</span>
                    <span>{totalProgress}%</span>
                  </div>
                  <Progress value={totalProgress} className="h-2" />
                </div>
                <div className="mt-8 space-y-2 w-full max-w-sm">
                  {ANALYSIS_STEPS.map((step, i) => {
                    const isCompleted = completedSteps.includes(i);
                    const isActive = currentStep === i;
                    return (
                      <div key={i} className={`flex items-center gap-3 px-4 py-2 rounded-lg ${isActive ? "bg-purple-500/10 border border-purple-500/30" : "opacity-40"}`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <div className="w-4 h-4 rounded-full border border-white/20" />}
                        <span className="text-sm text-white/70">{step.label}</span>
                      </div>
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
