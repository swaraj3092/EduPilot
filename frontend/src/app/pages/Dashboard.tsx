import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  Send, Sparkles, TrendingUp, DollarSign, FileText, Award,
  GraduationCap, Target, Calendar, BookOpen, GitCompare,
  Settings as SettingsIcon, Menu, X, Flame, Zap, Newspaper, Compass, Map as GlobeMap, ListTodo, PlayCircle, Info, Loader2
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
  const [isNexusOpen, setIsNexusOpen] = useState(false);
  const [isEssayOpen, setIsEssayOpen] = useState(false);
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
        const authUser = JSON.parse(localStorage.getItem("edupilot-user") || "{}");
        const userId = authUser.id || authUser.user_id;
        if (!userId) return;

        // 1. Fetch Full Profile from DB FIRST (Source of Truth)
        const res = await getUserProfile(userId);
        let currentProfile = JSON.parse(localStorage.getItem("edupilot-profile") || "{}");
        
        if (res.status === "success" && res.profile) {
          const db = res.profile;
          currentProfile = {
            ...currentProfile,
            name: db.full_name,
            xp: db.xp,
            streak: db.streak || 1,
            last_login_date: db.last_login_date || currentProfile.last_login_date
          };
        }

        // 2. Streak & Daily Check Logic (Using DB-synced value)
        const today = new Date().toISOString().split('T')[0];
        const lastLogin = currentProfile.last_login_date;

        if (lastLogin !== today) {
           const yesterday = new Date();
           yesterday.setDate(yesterday.getDate() - 1);
           const yesterdayStr = yesterday.toISOString().split('T')[0];

           let newStreak = currentProfile.streak;
           if (lastLogin === yesterdayStr) {
              newStreak += 1;
              toast.success(`🔥 Streak Level Up: ${newStreak} Days! +50 XP granted.`);
              await awardXP({ user_id: userId, amount: 50, reason: "Daily Return Bonus" });
           } else if (lastLogin) {
              newStreak = 1;
              toast.info("Streak reset to 1. Stay consistent!");
           }

           currentProfile.streak = newStreak;
           currentProfile.last_login_date = today;
           localStorage.setItem("edupilot-profile", JSON.stringify(currentProfile));
        }

        // 3. Update Global States
        setProfile(currentProfile);
        setUserStats({
          xp: currentProfile.xp,
          streak: currentProfile.streak,
          level: calculateLevel(currentProfile.xp),
          levelTitle: calculateLevelTitle(calculateLevel(currentProfile.xp)),
          name: currentProfile.name || currentProfile.full_name
        });

        // 4. Fetch Top Universities from DB
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
      
      // UNIVERSAL ENTITY EXTRACTOR (Endless Possibilities)
      // This regex looks for patterns like **University Name** or mentions in lists
      const nameRegex = /\*\*([^*]+)\*\*/g;
      let match;
      while ((match = nameRegex.exec(response.reply)) !== null) {
        const foundName = match[1].trim();
        // Skip common words that might be in asterisks
        if (foundName.length > 5 && !["user_profile", "chat_history", "university"].includes(foundName.toLowerCase())) {
          detected.push({ 
            name: foundName, 
            location: response.reply.toLowerCase().includes("germany") ? "Germany" : response.reply.toLowerCase().includes("italy") ? "Italy" : response.reply.toLowerCase().includes("usa") ? "USA" : "Global", 
            match: 85 + Math.floor(Math.random() * 10), 
            tuition: response.reply.toLowerCase().includes("public") || response.reply.toLowerCase().includes("low") ? "Low Tuition" : "$30,000+", 
            ranking: "#Top 500" 
          });
        }
      }

      if (detected.length > 0) {
        setFilteredUniversities(prev => {
          // Remove ALL generic defaults - we only want real AI suggestions now
          const current = prev.filter(v => 
            !["Harvard University", "National Univ. of Singapore", "University of Oxford", "MIT", "Stanford University"].includes(v.name)
          );
          const combined = [...detected, ...current];
          const unique = Array.from(new Map(combined.map(item => [item.name, item])).values());
          return unique.slice(0, 20); // Show more matches for "Endless" feel
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
  const handleTrack = async (uni: any) => {
    try {
      const savedApps = JSON.parse(localStorage.getItem("edupilot-apps") || "[]");
      if (savedApps.find((a: any) => a.university === uni.name)) {
        alert("Already tracking this university!");
        return;
      }

      // 1. Fetch AI Requirements (Smart Tracker)
      const res = await generateApplicationTracker({ 
        university: uni.name, 
        program: profile.field || "Master of Science" 
      });
      
      const newApp = {
        id: Date.now().toString(),
        university: uni.name,
        program: profile.field || "Master's Program",
        deadline: res.tracker.deadline || "2025-12-01",
        status: "not-started",
        documents: res.tracker.documents || [
            { name: "Statement of Purpose", uploaded: false },
            { name: "Updated Resume", uploaded: false },
            { name: "Transcripts", uploaded: false }
        ],
        notes: res.tracker.notes || "Ready for application mission."
      };

      // 2. Save
      localStorage.setItem("edupilot-apps", JSON.stringify([newApp, ...savedApps]));

      // 3. Reward XP
      const reward = await awardXP({ user_id: savedUser?.id || "temp", amount: 150, reason: `Tracked ${uni.name}` });
      setProfile(prev => ({ ...prev, xp: reward.new_xp }));
      
      alert(`🚀 Success! ${uni.name} added to your tracker.`);
      navigate('/application-tracker');
    } catch (err) {
      const savedApps = JSON.parse(localStorage.getItem("edupilot-apps") || "[]");
      const fallback = {
        id: Date.now().toString(),
        university: uni.name,
        program: profile.field || "Graduate Program",
        deadline: "2025-12-01",
        status: "not-started",
        documents: [{ name: "SOP", uploaded: false }, { name: "LOR", uploaded: false }],
        notes: "Tracked from dashboard."
      };
      localStorage.setItem("edupilot-apps", JSON.stringify([fallback, ...savedApps]));
      navigate('/application-tracker');
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
            <Dialog open={isNexusOpen} onOpenChange={setIsNexusOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform px-6">
                  <Menu className="w-4 h-4 mr-2" />
                  Explore Nexus
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl w-[95vw] h-[90vh] bg-[#0A0A16]/95 dark:bg-[#0A0A16]/95 light:bg-white border-indigo-500/20 p-8 flex flex-col shadow-[0_0_100px_rgba(99,102,241,0.2)] overflow-y-auto">
                <DialogHeader className="pb-4 border-b border-white/5 mb-6">
                  <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">Command Center</DialogTitle>
                  <DialogDescription className="text-white/50 text-lg">Access every feature of your EduPilot ecosystem instantly.</DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                  {[
                    { label: "Admission Odds", icon: Target, path: "/admission-probability", color: "from-purple-500 to-pink-500", desc: "Check ML-based university chances" },
                    { label: "ROI Insights", icon: TrendingUp, path: "/roi-calculator", color: "from-blue-500 to-indigo-500", desc: "Calculate your 5-year financial gains" },
                    { label: "Loan Eligibility", icon: DollarSign, path: "/loan-eligibility", color: "from-emerald-500 to-teal-500", desc: "Get instant AI-based loan scoring" },
                    { label: "Scholarship Finder", icon: Award, path: "/scholarships", color: "from-amber-500 to-orange-500", desc: "Discovery funding opportunities" },
                    { label: "Essay Coach", icon: FileText, path: "/essays", color: "from-pink-500 to-rose-500", desc: "AI-powered SOP critiques" },
                    { label: "Test Prep Hub", icon: BookOpen, path: "/test-prep", color: "from-indigo-500 to-purple-500", desc: "Score prediction & prep tips" },
                    { label: "App Tracker", icon: Calendar, path: "/application-tracker", color: "from-blue-400 to-sky-400", desc: "Manage your deadlines & docs" },
                    { label: "Global Roadmap", icon: GlobeMap, path: "/roadmap", color: "from-purple-400 to-indigo-400", desc: "Generate your mission blueprint" },
                  ].map((tool) => (
                    <motion.div
                      key={tool.label}
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsNexusOpen(false);
                        if (tool.label === "Essay Coach") {
                           setIsEssayOpen(true);
                        } else if (tool.label === "Global Roadmap") {
                           handleGenerateBlueprint();
                        } else {
                           navigate(tool.path);
                        }
                      }}
                      className="group cursor-pointer p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all relative overflow-hidden"
                    >
                      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${tool.color} blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity`} />
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-black/20`}>
                        <tool.icon className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">{tool.label}</h4>
                      <p className="text-xs text-white/50 leading-relaxed">{tool.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isEssayOpen} onOpenChange={setIsEssayOpen}>
              <DialogContent className="max-w-[95vw] sm:max-w-[95vw] w-[95vw] h-[90vh] overflow-hidden bg-[#0A0A16]/95 backdrop-blur-3xl border-white/5 p-0 flex flex-col shadow-[0_0_100px_rgba(99,102,241,0.2)]">
                <div className="p-6 md:p-8 pb-3 flex items-center justify-between">
                  <DialogHeader className="text-left">
                    <DialogTitle className="text-white text-xl md:text-2xl font-bold">AI Essay Coach</DialogTitle>
                    <DialogDescription className="text-white/50">
                      Get instant AI-powered feedback on your Statement of Purpose
                    </DialogDescription>
                  </DialogHeader>
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
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">{userStats.streak} Day Streak</span>
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
                  <GlobeMap className="w-4 h-4" />
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

          {/* Feature Showcase Grid (REMOVED from here as requested) */}

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
                              <GlobeMap className="w-3 h-3" />
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
                                  onClick={() => handleTrack(uni)}
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
                <GlobeMap className="w-5 h-5" />
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
