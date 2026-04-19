import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Flame, Zap, Trophy, Target, Star, Shield, TrendingUp, Users, Crown, ArrowRight, ExternalLink, Globe } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { getLeaderboard, completeQuest } from "@services";
import { useNavigate } from "react-router";

interface QuestDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: {
    xp: number;
    streak: number;
    level: number;
    levelTitle: string;
    name: string;
  };
  completedQuests: string[];
  setCompletedQuests: (quests: string[]) => void;
}

export function QuestDashboard({ isOpen, onClose, userStats, completedQuests, setCompletedQuests }: QuestDashboardProps) {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState<"missions" | "rankings" | "mastery">("missions");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Real Level Calculation Logic
  const levelThresholds = [0, 1000, 2500, 5000, 10000, 15000, 25000];
  const currentLvlIdx = Math.min(userStats.level - 1, levelThresholds.length - 2);
  const nextXP = levelThresholds[currentLvlIdx + 1];
  const currentXPBase = levelThresholds[currentLvlIdx];
  const progress = Math.min(100, ((userStats.xp - currentXPBase) / (nextXP - currentXPBase)) * 100);

  useEffect(() => {
    if (isOpen) {
      const fetchLeaderboard = async () => {
        setIsLoading(true);
        try {
          const res = await getLeaderboard();
          setLeaderboard(res.leaderboard);
        } catch (e) {
          console.error("Failed to fetch leaderboard");
        } finally {
          setIsLoading(false);
        }
      };
      fetchLeaderboard();
    }
  }, [isOpen]);

  const rawQuests = [
    { id: 'sop', title: "SOP Architect", desc: "Complete your first AI SOP review", xp: 500, path: "/admission-probability" },
    { id: 'roi', title: "ROI Strategist", desc: "Calculate ROI for 3 different universities", xp: 300, path: "/roi-calculator" },
    { id: 'compare', title: "Dreamer", desc: "Add 4 universities to your comparison list", xp: 450, path: "/university-comparison" },
    { id: 'loan', title: "Financial Planner", desc: "Check your loan eligibility", xp: 600, path: "/loan-eligibility" },
    { id: 'profile', title: "Global Citizen", desc: "Complete your personal study profile", xp: 1000, path: "/profile" },
  ];

  const quests = rawQuests.map(q => ({
    ...q,
    status: completedQuests.includes(q.id) ? 'completed' : 'in-progress'
  }));

  const handleQuestClick = async (quest: any) => {
    try {
      const userStr = localStorage.getItem("edupilot-user") || "{}";
      const user = JSON.parse(userStr);
      const user_id = user.id || user.user_id;

      if (!user_id) {
        console.error("User ID not found, cannot complete quest");
        navigate(quest.path);
        onClose();
        return;
      }

      if (quest.status !== 'completed') {
        const res = await completeQuest({ user_id, quest_id: quest.id, xp_reward: quest.xp });
        if (res.new_xp) {
           const profile = JSON.parse(localStorage.getItem("edupilot-profile") || "{}");
           const updated = { ...profile, xp: res.new_xp, quests_completed: [...(profile.quests_completed || []), quest.id] };
           localStorage.setItem("edupilot-profile", JSON.stringify(updated));
           setCompletedQuests(updated.quests_completed);
        }
      }
    } catch (e) {
      console.error("Quest completion failed:", e);
    } finally {
      navigate(quest.path);
      onClose();
    }
  };

  const badges = [
    { icon: Target, name: "Deadshot", color: "text-red-400" },
    { icon: Shield, name: "Guardian", color: "text-blue-400" },
    { icon: Star, name: "Superstar", color: "text-yellow-400" },
    { icon: Zap, name: "Flash", color: "text-purple-400" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#06060F]/80 backdrop-blur-xl z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className={`fixed inset-0 md:inset-4 lg:inset-10 ${isExpanded ? 'lg:inset-10' : 'lg:inset-20'} bg-[#0D0D1A] md:bg-[#0D0D1A]/90 border-0 md:border md:border-white/10 rounded-none md:rounded-[40px] z-[101] overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-indigo-500/10 transition-all duration-300`}
          >
            {/* Sidebar Stats (Desktop Only) */}
            <div className={`hidden md:flex w-full ${isExpanded ? 'md:w-64' : 'md:w-80'} bg-white/5 border-r border-white/10 p-8 flex-col transition-all overflow-y-auto`}>
              <div className="flex flex-col items-center text-center mb-10">
                <div className="relative mb-4 group cursor-pointer" onClick={() => navigate('/profile')}>
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-1">
                    <div className="w-full h-full rounded-[22px] bg-[#0D0D1A] flex items-center justify-center text-3xl text-white font-bold">
                      {userStats.name?.charAt(0) || "U"}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-[#0D0D1A]">
                    LVL {userStats.level}
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">{userStats.name}</h2>
                <p className="text-white/50 text-sm">{userStats.levelTitle || "Elite Navigator"}</p>
              </div>

              <div className="space-y-6 flex-1">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
                    <span className="text-white font-bold">{userStats.streak} Day Pulse</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map(d => (
                      <div key={d} className={`h-1.5 flex-1 rounded-full ${d <= userStats.streak % 7 || userStats.streak >= 7 ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm font-medium">XP Progress</span>
                    <span className="text-indigo-400 text-xs font-bold">{userStats.xp.toLocaleString()} / {nextXP.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   {badges.map((b, i) => (
                     <div key={i} className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/10">
                       <b.icon className={`w-6 h-6 mb-1 ${b.color}`} />
                       <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">{b.name}</span>
                     </div>
                   ))}
                </div>
              </div>

              <Button onClick={onClose} variant="outline" className="mt-8 border-white/10 hover:bg-white/5 text-white/70">
                Back to Dashboard
              </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-gradient-to-br from-indigo-500/5 via-transparent to-pink-500/5">
              <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6">
                  <div className="w-full">
                    {/* Compact Mobile Header */}
                    <div className="flex items-center gap-3 md:hidden mb-6 p-3 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">{userStats.name?.charAt(0)}</div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">{userStats.name}</p>
                          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Level {userStats.level} • {userStats.levelTitle}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-white/40 h-10 w-10">
                          <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Mobile Tab Switcher */}
                    <div className="flex md:hidden items-center p-1 bg-white/5 rounded-xl border border-white/5 mb-6 shadow-sm">
                      {['missions', 'rankings', 'mastery'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setMobileTab(tab as any)}
                          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${
                            mobileTab === tab ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-white/30"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    <h1 className="hidden md:block text-3xl font-bold text-white mb-2">{isExpanded ? 'Global Leaderboard' : 'Quest Log'}</h1>
                    <p className="hidden md:block text-white/50 text-sm">Level up your journey by completing mission objectives</p>
                  </div>
                </header>

                <div className="w-full">
                  <AnimatePresence mode="wait">
                    {/* Missions View */}
                    {(mobileTab === "missions" || !isMobile) && (
                      <motion.div
                        key="missions"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className={`space-y-4 ${mobileTab !== 'missions' && 'hidden md:block'}`}
                      >
                         <h3 className="hidden md:flex items-center gap-2 text-white font-bold mb-4">
                           <Target className="w-5 h-5 text-indigo-400" />
                           Active Missions
                         </h3>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                            {quests.map((q, i) => (
                              <Card 
                                key={i} 
                                onClick={() => handleQuestClick(q)}
                                className={`p-4 backdrop-blur-xl border-white/10 relative overflow-hidden group transition-all cursor-pointer ${q.status === 'completed' ? 'bg-green-500/5' : 'bg-white/5 hover:bg-white/10'}`}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${q.status === 'completed' ? 'bg-green-400/20 text-green-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                    {q.status === 'completed' ? <Shield className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-bold text-sm mb-0.5 truncate">{q.title}</h4>
                                    <p className="text-white/40 text-[10px] truncate">{q.desc}</p>
                                  </div>
                                  <div className="flex items-center gap-1 text-purple-400 font-bold text-[10px] bg-purple-400/10 px-2 py-1 rounded-lg border border-purple-400/10">
                                    <Zap className="w-3 h-3 fill-purple-400" />
                                    +{q.xp}
                                  </div>
                                </div>
                              </Card>
                            ))}
                         </div>
                      </motion.div>
                    )}

                    {/* Rankings View */}
                    {(mobileTab === "rankings" || !isMobile) && (
                      <motion.div
                        key="rankings"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className={`space-y-4 md:mt-12 ${mobileTab !== 'rankings' && 'hidden md:block'}`}
                      >
                        <h3 className="flex items-center gap-2 text-white font-bold mb-4">
                           <Crown className="w-5 h-5 text-yellow-500" />
                           Global Rankings
                        </h3>
                        <div className="space-y-2">
                           {leaderboard.length === 0 ? (
                             <div className="py-20 text-center text-white/20 italic">Loading navigators...</div>
                           ) : (
                             leaderboard.slice(0, 10).map((u, i) => (
                               <div key={i} className={`p-4 rounded-2xl flex items-center justify-between border ${u.full_name?.toLowerCase() === userStats.name?.toLowerCase() ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-white/5 border-white/10 shadow-sm'}`}>
                                 <div className="flex items-center gap-4">
                                   <span className={`text-sm font-black ${i < 3 ? 'text-indigo-400' : 'text-white/20'}`}>{i + 1}</span>
                                   <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shadow-inner">{u.full_name?.charAt(0)}</div>
                                   <div className="min-w-0">
                                     <p className="text-white text-sm font-bold truncate max-w-[140px]">{u.full_name}</p>
                                     <p className="text-[10px] text-white/40">{u.target_country || 'Worldwide'}</p>
                                   </div>
                                 </div>
                                 <div className="text-right">
                                   <p className="text-indigo-400 font-black text-sm">{u.xp}</p>
                                   <p className="text-[10px] text-white/30 uppercase font-black">XP</p>
                                 </div>
                               </div>
                             ))
                           )}
                        </div>
                      </motion.div>
                    )}

                    {/* Mastery View */}
                    {(mobileTab === "mastery") && (
                      <motion.div
                        key="mastery"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="md:hidden space-y-6"
                      >
                        <div className="p-8 rounded-[40px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 text-center shadow-xl">
                           <div className="inline-flex p-4 rounded-3xl bg-indigo-500 text-white mb-4 shadow-lg shadow-indigo-500/30">
                              <Trophy className="w-8 h-8" />
                           </div>
                           <h3 className="text-2xl font-black text-white mb-1">{userStats.xp.toLocaleString()} <span className="text-indigo-400">XP</span></h3>
                           <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase mb-8">Career Mission Points</p>
                           
                           <div className="flex gap-1.5 mb-2">
                             {[1,2,3,4,5,6,7].map(d => (
                               <div key={d} className={`h-2 flex-1 rounded-full ${d <= userStats.streak % 7 ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-white/10'}`} />
                             ))}
                           </div>
                           <div className="flex justify-between items-center text-orange-400">
                             <div className="flex items-center gap-1.5 font-black text-xs italic tracking-tighter">
                               <Flame className="w-4 h-4 fill-orange-400" />
                               {userStats.streak} DAY STREAK
                             </div>
                             <span className="text-[10px] font-bold text-white/40">KEEP IT UP!</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pb-10">
                           {badges.map((b, i) => (
                             <div key={i} className="p-5 rounded-[32px] bg-white/5 border border-white/10 flex flex-col items-center shadow-sm">
                               <div className={`p-3 rounded-2xl bg-white/5 mb-3`}>
                                 <b.icon className={`w-8 h-8 ${b.color}`} />
                               </div>
                               <p className="text-[10px] font-black text-white uppercase tracking-widest">{b.name}</p>
                             </div>
                           ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-8 md:hidden">
                      <Button onClick={onClose} className="w-full h-14 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-transform">
                          Back to Dashboard
                      </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
