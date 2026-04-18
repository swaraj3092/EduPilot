import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  Send, Sparkles, TrendingUp, DollarSign, FileText, Award,
  GraduationCap, Target, Calendar, BookOpen, GitCompare,
  Settings as SettingsIcon, Menu, X, Flame, Zap
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@components/ui/dialog";
import { EssayCoach } from "@components/EssayCoach";
import { SmartNudge } from "@components/SmartNudge";
import { NotificationCenter } from "@components/NotificationCenter";
import { GrowthFlow } from "@components/GrowthFlow";
import { Footer } from "@components/Footer";
import { BackToTop } from "@components/BackToTop";
import { chatSend, getLeaderboard, completeQuest, awardXP, ChatMessage, getUserProfile, getTopUniversities } from "@services";
import { QuestDashboard } from "@components/QuestDashboard";

const MOCK_UNIVERSITIES = [
  { name: "MIT", location: "USA", match: 85, tuition: "$53,790", ranking: "#1" },
  { name: "Stanford", location: "USA", match: 82, tuition: "$56,169", ranking: "#3" },
  { name: "Oxford", location: "UK", match: 78, tuition: "£28,950", ranking: "#2" },
  { name: "ETH Zurich", location: "Switzerland", match: 75, tuition: "CHF 1,460", ranking: "#6" },
];

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
  const [showNudge, setShowNudge] = useState(true);

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
        const uniRes = await getTopUniversities();
        if (uniRes.universities) {
            const formatted = uniRes.universities.map((u: any) => ({
                name: u.name,
                location: u.country,
                match: u.match_score || 85,
                tuition: u.tuition || "N/A",
                ranking: u.ranking || "N/A"
            }));
            setFilteredUniversities(formatted);
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
  const [filteredUniversities, setFilteredUniversities] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `👋 Hi ${(userStats.name || "Explorer").split(' ')[0]}! I'm your AI Study Abroad Mentor. I can help you explore universities, compare programs, and plan your journey. What would you like to know?`,
    },
  ]);

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

      if (response.reply.toLowerCase().includes("toronto") || response.reply.toLowerCase().includes("melbourne")) {
        setFilteredUniversities([
          { name: "U of Toronto", location: "Canada", match: 88, tuition: "$45,000 CAD", ranking: "#18" },
          { name: "U of Melbourne", location: "Australia", match: 84, tuition: "$42,000 AUD", ranking: "#14" },
        ]);
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
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
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
              <DialogContent className="max-w-[95vw] sm:max-w-[95vw] w-[95vw] h-[90vh] overflow-hidden bg-[#0D0D1A]/95 backdrop-blur-2xl border-white/10 p-0 flex flex-col">
                <div className="p-6 md:p-8 pb-3">
                  <DialogHeader>
                    <DialogTitle className="text-foreground text-xl md:text-2xl">AI Essay Coach</DialogTitle>
                    <DialogDescription className="text-foreground/60">
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
                className="fixed inset-0 bg-black/50 z-30 lg:hidden"
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
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-xl opacity-60" />
                <div className="absolute inset-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
                </div>
              </motion.div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-foreground">AI Career Navigator</h2>
                <p className="text-xs md:text-sm text-foreground/60">Your personal study abroad mentor</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((message, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] md:max-w-[80%] p-3 md:p-4 rounded-2xl shadow-xl backdrop-blur-md ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-indigo-600/90 to-purple-600/90 border border-white/10 text-foreground"
                      : "bg-[#0B0B1A]/80 border border-white/20 text-foreground/95 font-medium"
                  }`}
                >
                  <p className="whitespace-pre-line text-xs md:text-sm leading-relaxed">{message.content}</p>
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

        {/* Right: Live University Cards */}
        <div className="w-full lg:w-[420px] xl:w-[500px] overflow-y-auto p-4 md:p-6 space-y-4">
          {showNudge && (
            <SmartNudge />
          )}

          {filteredUniversities.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 className="mb-4"
               >
                 <Sparkles className="w-8 h-8 text-indigo-400 opacity-50" />
               </motion.div>
               <h4 className="text-sm font-medium text-foreground/60 italic">Scanning for your elite matches...</h4>
            </div>
          ) : (
            filteredUniversities.map((uni, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{
                scale: 1.02,
                rotateY: 5,
                transition: { duration: 0.2 },
              }}
              style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
            >
              <Card className="p-4 md:p-6 bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition">
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div>
                    <h4 className="text-base md:text-lg font-bold text-foreground">{uni.name}</h4>
                    <p className="text-xs md:text-sm text-foreground/60">{uni.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] md:text-sm text-foreground/50">World Rank</div>
                    <div className="text-base md:text-lg font-bold text-indigo-400">{uni.ranking}</div>
                  </div>
                </div>

                {/* Match Score */}
                <div className="mb-3 md:mb-4">
                  <div className="flex items-center justify-between text-xs md:text-sm mb-1.5">
                    <span className="text-foreground/60">Match Score</span>
                    <span className="text-foreground font-semibold">{uni.match}%</span>
                  </div>
                  <div className="h-1.5 md:h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${
                        uni.match >= 80
                          ? "bg-gradient-to-r from-green-400 to-emerald-500"
                          : uni.match >= 70
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                          : "bg-gradient-to-r from-red-400 to-pink-500"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${uni.match}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs md:text-sm">
                  <div>
                    <div className="text-white/50">Annual Tuition</div>
                    <div className="text-white font-semibold">{uni.tuition}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/10 text-xs">
                      Details
                    </Button>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2" onClick={() => navigate('/loan-eligibility')}>
                      Check Loan
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )))}
        </div>
      </div>

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
