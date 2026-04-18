import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  Send, Sparkles, TrendingUp, DollarSign, FileText, Award,
  GraduationCap, Target, Calendar, BookOpen, GitCompare,
  Settings as SettingsIcon, Menu, X, Flame, Zap, Newspaper, Compass, Map, ListTodo, PlayCircle, Info, Loader2
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@components/ui/dialog";
import { EssayCoach } from "@components/EssayCoach";
import { NotificationCenter } from "@components/NotificationCenter";
import { GrowthFlow } from "@components/GrowthFlow";
import { Footer } from "@components/Footer";
import { BackToTop } from "@components/BackToTop";
import { QuestDashboard } from "@components/QuestDashboard";
import { 
  chatSend, getLeaderboard, completeQuest, awardXP, ChatMessage, 
  getUserProfile, getTopUniversities, getLatestNews, generateAgentBlueprint 
} from "@services";
import ReactMarkdown from 'react-markdown';
import { toast } from "sonner";

const DEFAULT_ELITES = [
  { name: "Harvard University", location: "USA", match: "Elite", tuition: "$54,402", ranking: "#1" },
  { name: "National Univ. of Singapore", location: "Singapore", match: "High", tuition: "$32,000", ranking: "#8" },
  { name: "University of Oxford", location: "UK", match: "Elite", tuition: "£28,950", ranking: "#3" },
  { name: "MIT", location: "USA", match: "Elite", tuition: "$53,790", ranking: "#1" },
  { name: "Stanford University", location: "USA", match: "Elite", tuition: "$56,169", ranking: "#3" },
];

const MOCK_UNIVERSITIES: any[] = DEFAULT_ELITES;

const NAV_ITEMS = [
  { label: "Admission Odds", icon: Target, path: "/admission-probability" },
  { label: "ROI Calc", icon: TrendingUp, path: "/roi-calculator" },
  { label: "Loan Check", icon: DollarSign, path: "/loan-eligibility" },
  { label: "Applications", icon: Calendar, path: "/application-tracker" },
  { label: "Compare", icon: GitCompare, path: "/university-comparison" },
  { label: "Scholarships", icon: Award, path: "/scholarships" },
];

export function Dashboard() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isQuestOpen, setIsQuestOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"matches" | "discover">("matches");
  const [news, setNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [blueprint, setBlueprint] = useState("");
  const [blueprintLoading, setBlueprintLoading] = useState(false);

  const savedProfile = localStorage.getItem("edupilot-profile");
  const initialProfile = savedProfile ? JSON.parse(savedProfile) : { name: "Explorer", xp: 0, streak: 1 };
  
  const [profile, setProfile] = useState(initialProfile);
  const savedUser = JSON.parse(localStorage.getItem("edupilot-user") || "{}");
  const calculateLevel = (xp: number) => {
    if (xp < 1000) return 1;
    if (xp < 2500) return 2;
    if (xp < 5000) return 3;
    if (xp < 10000) return 4;
    return Math.floor(xp / 5000) + 2;
  };

  const calculateLevelTitle = (lvl: number) => {
    if (lvl <= 2) return "Elite Navigator";
    if (lvl <= 5) return "Global Scholar"; 
    if (lvl <= 10) return "Master Strategist";
    return "Visionary Leader";
  };

  const [userStats, setUserStats] = useState({
    xp: initialProfile.xp || 0,
    streak: initialProfile.streak || 1,
    level: calculateLevel(initialProfile.xp || 0),
    levelTitle: calculateLevelTitle(calculateLevel(initialProfile.xp || 0)),
    name: initialProfile.full_name || initialProfile.name || savedUser.name || "Tenzor Explorer"
  });

  // Fetch fresh legit data from DB on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // 1. Fetch Top Universities from DB
        try {
          const uniRes = await getTopUniversities();
          if (uniRes && Array.isArray(uniRes.universities)) {
              const formatted = uniRes.universities.map((u: any) => ({
                  name: u.name,
                  location: u.country || u.location || "Global",
                  match: u.match_score || 85,
                  tuition: u.tuition || "N/A",
                  ranking: u.ranking || "N/A"
              }));
              setFilteredUniversities(formatted);
          }
        } catch (uniError) {
          console.warn("Top universities fetch failed, using defaults:", uniError);
          // Stay with DEFAULT_ELITES
        }

        // 2. Fetch Profile Stats
        const authUser = JSON.parse(localStorage.getItem("edupilot-user") || "{}");
        const userId = authUser.id || authUser.user_id;
        if (!userId) return;

        const res = await getUserProfile(userId);
        if (res.status === "success" && res.profile) {
          const dbProfile = res.profile;
          const updatedProfile = {
            ...profile,
            name: dbProfile.full_name,
            full_name: dbProfile.full_name,
            xp: dbProfile.xp,
            streak: dbProfile.streak || 1,
            quests_completed: dbProfile.quests_completed || []
          };
          localStorage.setItem("edupilot-profile", JSON.stringify(updatedProfile));
          setProfile(updatedProfile);
          
          setUserStats({
            xp: dbProfile.xp,
            streak: dbProfile.streak || 1,
            level: calculateLevel(dbProfile.xp),
            levelTitle: calculateLevelTitle(calculateLevel(dbProfile.xp)),
            name: dbProfile.full_name
          });
        }
      } catch (e) {
        console.error("Dashboard sync failed", e);
      }
    };
    fetchStatus();
  }, []);

  const [input, setInput] = useState("");
  const [filteredUniversities, setFilteredUniversities] = useState<any[]>(DEFAULT_ELITES);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `👋 Hi ${(userStats.name || "Explorer").split(' ')[0]}! I'm your AI Study Abroad Mentor. I can help you explore universities, compare programs, and plan your journey. What would you like to know?`,
    },
  ]);

  // CHAT & MATCH PERSISTENCE: Load saved data on mount
  useEffect(() => {
    const savedChat = localStorage.getItem("edupilot-chat-history");
    if (savedChat) setMessages(JSON.parse(savedChat));
    
    const savedMatches = localStorage.getItem("edupilot-discovered-matches");
    if (savedMatches) setFilteredUniversities(JSON.parse(savedMatches));
  }, []);

  // PERSISTENCE: Save data on update
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem("edupilot-chat-history", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (filteredUniversities.length > 0) {
      localStorage.setItem("edupilot-discovered-matches", JSON.stringify(filteredUniversities));
    }
  }, [filteredUniversities]);

  // Fetch news when jumping to discover
  useEffect(() => {
    if (activeTab === "discover" && news.length === 0) {
      const fetchNews = async () => {
        setNewsLoading(true);
        try {
          const res = await getLatestNews(profile.target_country || "USA");
          setNews(res.articles);
        } finally {
          setNewsLoading(false);
        }
      };
      fetchNews();
    }
  }, [activeTab]);

  const handleGenerateBlueprint = async () => {
    const user = JSON.parse(localStorage.getItem("edupilot-user") || "{}").id;
    if (!user) return;
    
    setIsBlueprintOpen(true);
    setBlueprintLoading(true);
    try {
      const res = await generateAgentBlueprint({
        name: userStats.name.split(' ')[0],
        country: profile.target_country || "USA",
        field_of_study: profile.target_field || "STEM",
        level: profile.degree_level || "Postgraduate"
      });
      setBlueprint(res.blueprint);
    } catch (err) {
      setBlueprint("Failed to generate your master plan. Please try again.");
    } finally {
      setBlueprintLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const user_id = JSON.parse(localStorage.getItem("edupilot-user") || "{}").id;
    const userMessage = { role: "user" as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await chatSend([...messages, userMessage], profile);
      setMessages(prev => [...prev, { role: "assistant" as const, content: response.reply }]);
      
      // Dynamic Card Update Logic: Look for university mentions in the reply
      const reply = response.reply.toLowerCase();
      const detected: any[] = [];
      
      if (reply.includes("milan") || reply.includes("polimi") || reply.includes("italy")) detected.push({ name: "Politecnico di Milano", location: "Italy", match: 89, tuition: "€3,900", ranking: "#111" });
      if (reply.includes("vienna") || reply.includes("austria")) detected.push({ name: "University of Vienna", location: "Austria", match: 85, tuition: "€1,500", ranking: "#137" });
      if (reply.includes("arkansas state")) detected.push({ name: "Arkansas State University", location: "USA", match: 92, tuition: "$14,500", ranking: "Tier 2" });
      if (reply.includes("arizona state") || reply.includes("asu")) detected.push({ name: "Arizona State University", location: "USA", match: 89, tuition: "$31,000", ranking: "#156" });
      if (reply.includes("texas at arlington") || reply.includes("uta") || reply.includes("arlington")) detected.push({ name: "Univ. of Texas at Arlington", location: "USA", match: 87, tuition: "$22,000", ranking: "Tier 2" });
      if (reply.includes("georgia tech") || reply.includes("gatech")) detected.push({ name: "Georgia Institute of Tech", location: "USA", match: 94, tuition: "$31,000", ranking: "#33" });
      if (reply.includes("toronto")) detected.push({ name: "University of Toronto", location: "Canada", match: 88, tuition: "$45,000", ranking: "#18" });
      if (reply.includes("leeds")) detected.push({ name: "University of Leeds", location: "UK", match: 82, tuition: "£26,500", ranking: "#86" });
      if (reply.includes("berlin") || reply.includes("tu berlin")) detected.push({ name: "TU Berlin", location: "Germany", match: 90, tuition: "€320 (Fees)", ranking: "#148" });
      if (reply.includes("aachen") || reply.includes("rwth")) detected.push({ name: "RWTH Aachen", location: "Germany", match: 92, tuition: "€300 (Fees)", ranking: "#99" });
      if (reply.includes("warsaw") || reply.includes("poland")) detected.push({ name: "Univ. of Warsaw", location: "Poland", match: 78, tuition: "$4,000", ranking: "#262" });
      if (reply.includes("melbourne")) detected.push({ name: "University of Melbourne", location: "Australia", match: 84, tuition: "$42,000", ranking: "#14" });
      if (reply.includes("germany") || reply.includes("tum") || reply.includes("munich")) detected.push({ name: "Technical Univ. of Munich", location: "Germany", match: 95, tuition: "€250 (Fees)", ranking: "#37" });
      if (reply.includes("ntu") || reply.includes("singapore")) detected.push({ name: "Nanyang Tech University", location: "Singapore", match: 91, tuition: "$32,000", ranking: "#12" });
      if (reply.includes("scholarship")) detected.push({ name: "Ambedkar Scholarship", location: "Global", match: 99, tuition: "Full Funded", ranking: "N/A" });
      if (reply.includes("delft") || reply.includes("netherlands")) detected.push({ name: "TU Delft", location: "Netherlands", match: 88, tuition: "€16,000", ranking: "#61" });
      if (reply.includes("lse") || reply.includes("london")) detected.push({ name: "LSE", location: "UK", match: 84, tuition: "£24,500", ranking: "#45" });
      
      if (detected.length > 0) {
        setFilteredUniversities(prev => {
          // Remove potential defaults if we have real matches
          const current = prev.filter(p => p.name !== "Harvard University" && p.name !== "National Univ. of Singapore");
          const combined = [...detected, ...current];
          const unique = Array.from(new Map(combined.map(item => [item.name, item])).values());
          return unique.slice(0, 10);
        });
      }

      // Award Legit XP for engagement
      if (user_id) {
        const reward = await awardXP({ user_id, amount: 50, reason: "AI Mentorship Interaction" });
        setUserStats(prev => ({ 
          ...prev, 
          xp: reward.new_xp,
          level: Math.floor(reward.new_xp / 2000) + 1
        }));
        
        // Sync back to profile
        const newProfile = { ...profile, xp: reward.new_xp };
        setProfile(newProfile);
        localStorage.setItem("edupilot-profile", JSON.stringify(newProfile));
      }
    } catch (error: any) {
      console.error("Chat Error:", error);
      const errMsg = error?.message ?? "Unknown error";
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ AI unavailable: ${errMsg}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Top Navigation */}
      <nav className="relative z-20 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <GraduationCap className="w-7 h-7 md:w-8 md:h-8 text-indigo-400" />
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              EduPilot
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="text-foreground/70 hover:text-foreground">
                  <FileText className="w-4 h-4 mr-2" />
                  Essay Coach
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-[95vw] w-[95vw] h-[90vh] overflow-hidden bg-background/98 backdrop-blur-3xl border-border p-0 flex flex-col shadow-[0_0_80px_-20px_rgba(99,102,241,0.4)]">
                <div className="p-6 md:p-8 pb-3 flex items-center justify-between">
                  <DialogHeader className="text-left">
                    <DialogTitle className="text-foreground text-xl md:text-2xl">AI Essay Coach</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Get instant AI-powered feedback on your Statement of Purpose
                    </DialogDescription>
                  </DialogHeader>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full hover:bg-foreground/10 text-foreground/50 hover:text-foreground"
                    onClick={() => {
                        const closeBtn = document.querySelector('[data-radix-collection-item]') as HTMLElement;
                        if (closeBtn) closeBtn.click();
                    }}
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-6 md:pb-8">
                  <EssayCoach />
                </div>
              </DialogContent>
            </Dialog>

            {NAV_ITEMS.map((item) => {
              // Show only the 4 most critical buttons in Desktop Nav
              if (["Admission Odds", "ROI Calc", "Loan Check", "Compare"].includes(item.label)) {
                return (
                  <Button key={item.path} variant="ghost" className="text-foreground/70 hover:text-foreground" onClick={() => navigate(item.path)}>
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                );
              }
              return null;
            })}

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsQuestOpen(true)}
                className="hidden sm:flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full hover:bg-orange-500/20 transition-colors active:scale-95 group"
              >
                <Flame className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">{userStats.streak} Day Pulse</span>
              </button>
              <button 
                onClick={() => setIsQuestOpen(true)}
                className="hidden sm:flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full mr-2 hover:bg-purple-500/20 transition-colors active:scale-95 group"
              >
                <Zap className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">{userStats.xp.toLocaleString()} XP</span>
              </button>
              <NotificationCenter />
            </div>

            <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground" onClick={() => navigate("/settings")}>
              <SettingsIcon className="w-5 h-5" />
            </Button>
            <Button variant="outline" className="border-white/20 hover:bg-white/10" onClick={() => navigate("/profile")}>
              Profile
            </Button>
            <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => {
              localStorage.removeItem("edupilot-user");
              navigate("/");
            }}>
              Log Out
            </Button>
          </div>

          {/* Mobile Nav Buttons */}
          <div className="flex lg:hidden items-center gap-2">
            <NotificationCenter />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition text-foreground/70"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="absolute top-full left-0 right-0 z-40 bg-[#0D0D1A]/95 backdrop-blur-2xl border-b border-white/10 overflow-hidden lg:hidden"
              >
                <div className="px-4 py-4 space-y-1">
                  {/* Essay Coach as a button in mobile */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/70 hover:text-foreground hover:bg-white/10 transition"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FileText className="w-5 h-5 text-purple-400" />
                        <span className="text-sm">Essay Coach</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] sm:max-w-[95vw] w-[95vw] h-[90vh] overflow-hidden bg-[#0D0D1A]/95 backdrop-blur-2xl border-white/10 p-0 flex flex-col">
                      <div className="p-5 pb-3">
                        <DialogHeader>
                          <DialogTitle className="text-foreground text-xl">AI Essay Coach</DialogTitle>
                          <DialogDescription className="text-foreground/60">
                            Get instant AI-powered feedback on your SOP
                          </DialogDescription>
                        </DialogHeader>
                      </div>
                      <div className="flex-1 overflow-y-auto px-5 pb-5">
                        <EssayCoach />
                      </div>
                    </DialogContent>
                  </Dialog>

                  {NAV_ITEMS.map((item, i) => (
                    <motion.button
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.05 }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/70 hover:text-foreground hover:bg-white/10 transition"
                      onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                    >
                      <item.icon className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm">{item.label}</span>
                    </motion.button>
                  ))}

                  <div className="border-t border-white/10 mt-2 pt-2 flex gap-2">
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-foreground/70 hover:text-foreground hover:bg-white/10 transition"
                      onClick={() => { navigate("/settings"); setMobileMenuOpen(false); }}
                    >
                      <SettingsIcon className="w-5 h-5" />
                      <span className="text-sm">Settings</span>
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/20 text-foreground/70 hover:text-foreground hover:bg-white/10 transition"
                      onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }}
                    >
                      <span className="text-sm">Profile</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content — Responsive Split Pane */}
      <div className="relative z-10 max-w-[1800px] mx-auto flex flex-col lg:flex-row lg:h-[calc(100vh-73px)]">
        {/* Left: AI Chat */}
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 min-h-[50vh] lg:min-h-0">
          {/* Chat Header */}
          <div className="p-4 md:p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <motion.div
                className="relative w-12 h-12 md:w-16 md:h-16"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-purple-500 blur-xl opacity-60" />
                <div className="absolute inset-2 rounded-full bg-gradient-to-r from-primary to-purple-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                </div>
              </motion.div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-foreground">AI Career Navigator</h2>
                <p className="text-xs md:text-sm text-muted-foreground">Your personal study abroad mentor</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-lg border ${
                  msg.role === "user" 
                    ? "bg-indigo-600 border-indigo-500 text-white" 
                    : "bg-muted/80 backdrop-blur-md border-border text-foreground"
                }`}>
                  <p className="whitespace-pre-line text-xs md:text-sm leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-1">
                  <motion.div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} />
                  <motion.div className="w-1.5 h-1.5 bg-purple-400 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                  <motion.div className="w-1.5 h-1.5 bg-pink-400 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 md:p-6 border-t border-white/10">
            <div className="flex items-center gap-2 md:gap-3">
              <Input
                placeholder="Ask me anything..."
                className="flex-1 bg-white/5 border-white/20 text-foreground placeholder:text-foreground/30 text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button
                size="icon"
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 flex-shrink-0"
                onClick={handleSend}
                disabled={isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] md:text-xs text-foreground/40 mt-2 hidden sm:block">
              💡 Try: "Compare MIT and Stanford" or "Show me scholarships"
            </p>
          </div>
        </div>

        {/* Right: Live University Cards & Discover Hub */}
        <div className="w-full lg:w-[420px] xl:w-[500px] flex flex-col h-full bg-foreground/[0.02] border-l border-border/10 overflow-hidden">
          
          {/* Action Center - Prioritized AI Nudges */}
          <div className="p-4 border-b border-border/10 bg-indigo-500/[0.03]">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Zap className="w-3 h-3" />
              AI Action Center
            </h3>
            <div className="space-y-2">
              <motion.div 
                whileHover={{ x: 5 }}
                onClick={() => navigate('/loan-eligibility')}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/20 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground line-clamp-1">Secure Financing Early</p>
                  <p className="text-[10px] text-foreground/40">Poonawalla Fincorp rates dropped by 0.5%</p>
                </div>
                <PlayCircle className="w-4 h-4 text-foreground/20" />
              </motion.div>

              <motion.div 
                whileHover={{ x: 5 }}
                onClick={handleGenerateBlueprint}
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 cursor-pointer hover:from-indigo-500/20 transition-colors shadow-lg shadow-indigo-500/5"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                  <Map className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-indigo-100">AI Global Roadmap</p>
                  <p className="text-[10px] text-indigo-100/60">Generate your 12-month mission plan</p>
                </div>
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              </motion.div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 p-2 bg-muted/30 m-4 rounded-xl border border-border/10">
            <button 
              onClick={() => setActiveTab("matches")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "matches" ? "bg-card text-indigo-400 shadow-sm border border-border/10" : "text-foreground/40 hover:text-foreground/60"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              Elite Matches
            </button>
            <button 
              onClick={() => setActiveTab("discover")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "discover" ? "bg-card text-indigo-400 shadow-sm border border-border/10" : "text-foreground/40 hover:text-foreground/60"
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              AI Discover
            </button>
          </div>

          {/* Feature Showcase Grid (NEW) - Show on both tabs as a fixed header if needed, or inside matches scroll */}
          {activeTab === "matches" && (
            <div className="px-4 mb-4 grid grid-cols-2 gap-3">
              <motion.div 
                whileHover={{ y: -5 }}
                onClick={() => navigate('/roi-calculator')}
                className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 cursor-pointer group hover:bg-indigo-500/30 transition-all shadow-lg"
              >
                <TrendingUp className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-[11px] font-bold text-foreground">ROI Insights</p>
                <p className="text-[9px] text-foreground/40">Calculate your 5-year gains</p>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5 }}
                onClick={() => navigate('/admission-probability')}
                className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 cursor-pointer group hover:bg-purple-500/30 transition-all shadow-lg"
              >
                <Target className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-[11px] font-bold text-foreground">Admission Odds</p>
                <p className="text-[9px] text-foreground/40">Check your university match</p>
              </motion.div>
            </div>
          )}

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
            <AnimatePresence mode="wait">
              {activeTab === "matches" ? (
                <motion.div
                  key="matches"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {filteredUniversities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-dashed border-border/20 mt-10">
                      <Sparkles className="w-8 h-8 text-indigo-400 opacity-30 mb-4" />
                      <h4 className="text-sm font-medium text-foreground/40 italic">Waiting for your preferences...</h4>
                    </div>
                  ) : (
                    filteredUniversities.map((uni, i) => (
                      <Card key={i} className="p-4 bg-card border-border/10 hover:border-indigo-500/30 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-indigo-500/10 transition-colors" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-bold text-foreground line-clamp-1">{uni.name}</h4>
                              <span className="text-[10px] font-bold text-primary/60 bg-primary/10 px-1.5 py-0.5 rounded uppercase">{uni.ranking}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-3">
                              <Map className="w-3 h-3" />
                              {uni.location}
                            </div>
                            
                            <div className="flex items-center justify-between text-[10px] mb-2">
                              <span className="text-muted-foreground">AI Match Confidence</span>
                              <span className="text-foreground font-bold">{uni.match}%</span>
                            </div>
                            <div className="h-1 bg-muted rounded-full overflow-hidden mb-4">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${uni.match}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                            </div>
                            <div className="flex items-center justify-between border-t border-border/5 pt-3">
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase leading-none mb-1">Tuition</p>
                                <p className="text-xs font-bold text-foreground">{uni.tuition}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  className="h-8 text-[10px] text-muted-foreground hover:text-indigo-400 hover:bg-transparent p-0"
                                  onClick={() => navigate("/admission-probability", { state: { university: uni.name } })}
                                >
                                  Analysis
                                </Button>
                                <Button 
                                  className="h-8 bg-indigo-500 hover:bg-indigo-600 text-[10px] px-4 rounded-lg shadow-lg shadow-indigo-500/20 text-white"
                                  onClick={() => {
                                    const apps = JSON.parse(localStorage.getItem("edupilot-applications") || "[]");
                                    if (!apps.find((a: any) => a.university === uni.name)) {
                                      const newApp = {
                                        id: Date.now().toString(),
                                        university: uni.name,
                                        country: uni.location,
                                        status: "planning",
                                        deadline: "Jan 15, 2027",
                                        logo: `https://logo.clearbit.com/${uni.name.toLowerCase().replace(/\s+/g, '')}.edu`
                                      };
                                      localStorage.setItem("edupilot-applications", JSON.stringify([...apps, newApp]));
                                      toast.success(`Tracked ${uni.name}! Check your Tracker.`);
                                    }
                                  }}
                                >
                                  Track
                                </Button>
                              </div>
                            </div>
                          </div>
                      </Card>
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="discover"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {newsLoading ? (
                    <div className="flex flex-col items-center justify-center p-20">
                      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mb-3" />
                      <p className="text-xs text-foreground/40">Curating global insights...</p>
                    </div>
                  ) : (
                    news.map((item, i) => (
                      <Card key={i} className="p-4 bg-card border-border/10 hover:border-indigo-500/20 transition-all cursor-pointer group">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-[9px] font-bold text-indigo-400 border border-indigo-500/20 uppercase tracking-tighter">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-foreground/30">{item.date}</span>
                        </div>
                        <h4 className="text-xs font-bold text-foreground mb-2 group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                        <p className="text-[10px] text-foreground/50 line-clamp-2 leading-relaxed">{item.summary}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[9px] text-foreground/30 flex items-center gap-1">
                             <BookOpen className="w-2.5 h-2.5" /> {item.readTime} read
                          </span>
                          <Button variant="ghost" className="h-6 text-[9px] p-0 text-indigo-400 hover:bg-transparent">Read Full AI Insight →</Button>
                        </div>
                      </Card>
                    ))
                  )}
                  <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 border-dashed">
                     <p className="text-[10px] text-orange-400/80 text-center uppercase font-bold tracking-widest mb-1">Poonawalla Alert</p>
                     <p className="text-[11px] text-foreground/60 text-center">New financing options for {profile.target_country || 'global'} studies just dropped. Check your eligibility to get pre-approved.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* AI Master Blueprint Modal */}
      <Dialog open={isBlueprintOpen} onOpenChange={setIsBlueprintOpen}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 bg-background/95 backdrop-blur-2xl border-indigo-500/20 overflow-hidden">
          <div className="p-6 border-b border-border/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">12-Month Global Success Blueprint</h2>
                <p className="text-xs text-foreground/50">AI-Generated Roadmap for {profile.name || 'you'}</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 md:p-10 prose prose-invert prose-indigo max-w-none prose-sm">
             {blueprintLoading ? (
               <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
                 <div className="relative">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-12 h-12 rounded-full border-t-2 border-indigo-500" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                 </div>
                 <p className="text-sm text-foreground/60 italic animate-pulse">Consulting global database for the latest 2026 application trends...</p>
                 <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ x: [-200, 200] }} 
                      transition={{ duration: 2, repeat: Infinity }} 
                      className="h-full w-1/3 bg-indigo-500" 
                    />
                 </div>
               </div>
             ) : (
               <div className="bg-card/30 p-8 rounded-3xl border border-border/10">
                 <ReactMarkdown className="text-foreground/90 leading-relaxed text-base space-y-6">
                   {blueprint}
                 </ReactMarkdown>
                 <div className="mt-10 pt-10 border-t border-border/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold">98%</div>
                      <p className="text-xs text-foreground/60 max-w-[200px]">Probability of success if all milestones are met on schedule.</p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="h-10 border-border/20 text-xs" onClick={() => window.print()}>Download PDF</Button>
                      <Button className="h-10 bg-indigo-600 hover:bg-indigo-700 text-xs px-6" onClick={() => {
                        toast.success("Blueprint milestones synced to Tracker!");
                        navigate("/application-tracker");
                      }}>Add to Tracker</Button>
                    </div>
                 </div>
               </div>
             )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
      <BackToTop />

      <QuestDashboard 
        isOpen={isQuestOpen} 
        onClose={() => setIsQuestOpen(false)} 
        userStats={userStats}
      />
    </div>
  );
}
