import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Flame, Zap, Trophy, Target, Star, Shield, TrendingUp, Users, Crown, ArrowRight, ExternalLink, Globe, ShieldCheck, Award, CheckCircle2 } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";
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
    { id: 'sop', title: "SOP Architect", desc: "Complete your first AI SOP review", xp: 500, path: "/admission-probability", color: "from-indigo-500 to-purple-600" },
    { id: 'roi', title: "ROI Strategist", desc: "Calculate ROI for 3 different universities", xp: 300, path: "/roi-calculator", color: "from-emerald-500 to-teal-600" },
    { id: 'compare', title: "Dreamer", desc: "Add 4 universities to your comparison list", xp: 450, path: "/university-comparison", color: "from-blue-500 to-cyan-600" },
    { id: 'loan', title: "Financial Planner", desc: "Check your loan eligibility", xp: 600, path: "/loan-eligibility", color: "from-orange-500 to-amber-600" },
    { id: 'profile', title: "Global Citizen", desc: "Complete your personal study profile", xp: 1000, path: "/profile", color: "from-pink-500 to-rose-600" },
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
            className="fixed inset-0 bg-black/80 backdrop-blur-3xl z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className={`fixed inset-0 md:inset-4 lg:inset-10 bg-[#0A0A15]/95 border border-white/10 rounded-none md:rounded-[40px] z-[101] overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,1)] transition-all duration-300 will-change-transform`}
          >
            {/* Sidebar Stats */}
            <div className={`hidden md:flex w-full ${isExpanded ? 'md:w-64' : 'md:w-80'} bg-white/[0.02] border-r border-white/5 p-10 flex-col transition-all overflow-y-auto`}>
              <div className="flex flex-col items-center text-center mb-12">
                <div className="relative mb-6 group cursor-pointer" onClick={() => navigate('/profile')}>
                  <div className="w-28 h-28 rounded-[32px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-1 shadow-2xl shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-[30px] bg-[#0A0A15] flex items-center justify-center text-4xl text-white font-black italic tracking-tighter">
                      {userStats.name?.charAt(0) || "U"}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl border-4 border-[#0A0A15] uppercase tracking-widest shadow-xl">
                    LVL {userStats.level}
                  </div>
                </div>
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{userStats.name}</h2>
                <p className="text-indigo-400/60 text-[10px] font-black uppercase tracking-[0.3em] mt-3">{userStats.levelTitle || "Elite Navigator"}</p>
              </div>

              <div className="space-y-8 flex-1">
                <div className="p-6 rounded-[24px] bg-white/[0.03] border border-white/10 shadow-inner group">
                  <div className="flex items-center gap-3 mb-4">
                    <Flame className="w-5 h-5 text-orange-500 fill-orange-500 group-hover:scale-110 transition-transform" />
                    <span className="text-white font-black text-[10px] uppercase tracking-[0.2em]">{userStats.streak} DAY PULSE</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7].map(d => (
                      <div key={d} className={`h-1.5 flex-1 rounded-full ${d <= userStats.streak % 7 || userStats.streak >= 7 ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-white/5'}`} />
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-[24px] bg-white/[0.03] border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">XP Sync Status</span>
                    <span className="text-indigo-400 text-[10px] font-black">{userStats.xp.toLocaleString()} / {nextXP.toLocaleString()}</span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   {badges.map((b, i) => (
                     <div key={i} className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-colors group">
                       <b.icon className={`w-7 h-7 mb-2 ${b.color} group-hover:scale-110 transition-transform`} />
                       <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">{b.name}</span>
                     </div>
                   ))}
                </div>
              </div>

              <Button onClick={onClose} variant="ghost" className="mt-8 text-white/40 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl border border-white/5">
                Close Dossier
              </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-transparent custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="w-full">
                    {/* Mobile Header */}
                    <div className="flex items-center gap-4 md:hidden mb-8 p-5 bg-white/[0.03] rounded-[28px] border border-white/10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black italic text-2xl shadow-xl">{userStats.name?.charAt(0)}</div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-white uppercase tracking-tighter italic leading-none">{userStats.name}</p>
                          <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.3em] mt-2">Level {userStats.level}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-white/40 h-12 w-12 rounded-xl bg-white/5">
                          <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                       <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Strategic Mission Hub</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">Quest Log</h1>
                  </div>
                </header>

                {/* Desktop Tabs */}
                <div className="flex items-center gap-8 border-b border-white/5 pb-6">
                   <button 
                    onClick={() => setMobileTab("missions")}
                    className={`text-sm font-black uppercase tracking-[0.2em] transition-all relative ${mobileTab === 'missions' ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
                   >
                     Active Missions
                     {mobileTab === 'missions' && <motion.div layoutId="tab" className="absolute -bottom-[25px] left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]" />}
                   </button>
                   <button 
                    onClick={() => setMobileTab("rankings")}
                    className={`text-sm font-black uppercase tracking-[0.2em] transition-all relative ${mobileTab === 'rankings' ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
                   >
                     Global Rankings
                     {mobileTab === 'rankings' && <motion.div layoutId="tab" className="absolute -bottom-[25px] left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]" />}
                   </button>
                </div>

                <div className="w-full pb-20">
                  <AnimatePresence mode="wait">
                    {mobileTab === "missions" ? (
                        <motion.div
                          key="missions"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="grid grid-cols-1 gap-6"
                        >
                          {quests.map((q, i) => (
                            <motion.div
                              key={q.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <Card 
                                onClick={() => handleQuestClick(q)}
                                className={`p-8 bg-white/[0.03] border border-white/10 hover:border-indigo-500/50 transition-all duration-500 cursor-pointer group relative overflow-hidden rounded-[32px] ${q.status === 'completed' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                              >
                                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${q.color} opacity-5 group-hover:opacity-10 blur-[60px] transition-all duration-700 group-hover:scale-150`} />
                                
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                                  <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-[24px] bg-gradient-to-br ${q.color} flex items-center justify-center text-white shadow-2xl border border-white/20 group-hover:rotate-12 transition-transform`}>
                                      {q.status === 'completed' ? <CheckCircle2 className="w-8 h-8" /> : <Zap className="w-8 h-8" />}
                                    </div>
                                    <div>
                                      <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">{q.title}</h4>
                                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">{q.desc}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-6 w-full sm:w-auto">
                                     <div className="text-right">
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Reward</p>
                                        <p className="text-xl font-black text-white italic">+{q.xp} XP</p>
                                     </div>
                                     <Button className="h-14 px-8 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 group-hover:border-white/30 transition-all">
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                     </Button>
                                  </div>
                                </div>
                              </Card>
                            </motion.div>
                          ))}
                        </motion.div>
                    ) : (
                        <motion.div
                          key="rankings"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-4"
                        >
                          {isLoading ? (
                            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden p-6 space-y-4">
                               <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                  <Skeleton className="h-4 w-12 bg-white/5" />
                                  <Skeleton className="h-4 w-32 bg-white/5" />
                                  <Skeleton className="h-4 w-24 bg-white/5 ml-auto" />
                               </div>
                               {[1, 2, 3, 4, 5].map((i) => (
                                 <div key={i} className="flex items-center gap-4 py-3">
                                   <Skeleton className="h-8 w-8 rounded-lg bg-white/5" />
                                   <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
                                   <Skeleton className="h-4 w-32 bg-white/5" />
                                   <Skeleton className="h-4 w-20 bg-white/5 ml-auto" />
                                 </div>
                               ))}
                            </div>
                          ) : (
                            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden">
                               <table className="w-full text-left">
                                 <thead>
                                   <tr className="border-b border-white/5">
                                      <th className="p-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Rank</th>
                                      <th className="p-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Navigator</th>
                                      <th className="p-6 text-right text-[10px] font-black text-white/20 uppercase tracking-widest">Sync Level</th>
                                   </tr>
                                 </thead>
                                 <tbody>
                                   {leaderboard.map((user, i) => (
                                     <tr 
                                       key={user.referral_code || i} 
                                       className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                                       onClick={() => {
                                         if (user.referral_code) {
                                           navigate(`/public-profile/${user.referral_code}`);
                                           onClose(); // close the dashboard modal
                                         }
                                       }}
                                     >
                                        <td className="p-6">
                                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black italic ${i === 0 ? 'bg-yellow-500/20 text-yellow-500' : i === 1 ? 'bg-slate-300/20 text-slate-300' : i === 2 ? 'bg-amber-600/20 text-amber-600' : 'text-white/20'}`}>
                                             #{i + 1}
                                           </div>
                                        </td>
                                        <td className="p-6">
                                           <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sm font-black text-indigo-400 border border-white/5">{user.full_name?.charAt(0)}</div>
                                              <span className="text-sm font-black text-white uppercase italic tracking-tighter">{user.full_name}</span>
                                           </div>
                                        </td>
                                        <td className="p-6 text-right">
                                           <span className="text-sm font-black text-indigo-400 italic">{(user.xp || 0).toLocaleString()} XP</span>
                                        </td>
                                     </tr>
                                   ))}
                                 </tbody>
                               </table>
                            </div>
                          )}
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.2);
        }
      `}</style>
    </AnimatePresence>
  );
}
