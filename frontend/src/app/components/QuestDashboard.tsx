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
}

export function QuestDashboard({ isOpen, onClose, userStats }: QuestDashboardProps) {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);

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
          
          const profile = JSON.parse(localStorage.getItem("edupilot-profile") || "{}");
          setCompletedQuests(profile.quests_completed || []);
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
           
           // Force page refresh or state sync if needed, 
           // but for now we navigate away which usually triggers context update
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
            className={`fixed inset-4 md:inset-10 ${isExpanded ? 'lg:inset-10' : 'lg:inset-20'} bg-[#0D0D1A]/90 border border-white/10 rounded-[40px] z-[101] overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-indigo-500/10 transition-all duration-300`}
          >
            {/* Sidebar Stats */}
            <div className={`w-full ${isExpanded ? 'md:w-64' : 'md:w-80'} bg-white/5 border-r border-white/10 p-8 flex flex-col transition-all overflow-y-auto`}>
              <div className="flex justify-between items-start mb-8 md:hidden">
                <div className="text-2xl font-bold text-white">Quest Log</div>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white/50">
                  <X className="w-6 h-6" />
                </Button>
              </div>

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

                {!isExpanded && (
                  <div className="grid grid-cols-2 gap-3">
                     {badges.map((b, i) => (
                       <div key={i} className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/10">
                         <b.icon className={`w-6 h-6 mb-1 ${b.color}`} />
                         <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">{b.name}</span>
                       </div>
                     ))}
                  </div>
                )}
              </div>

              <Button onClick={onClose} variant="outline" className="mt-8 border-white/10 hover:bg-white/5 text-white/70 hidden md:flex">
                Back to Dashboard
              </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-gradient-to-br from-indigo-500/5 via-transparent to-pink-500/5">
              <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{isExpanded ? 'Global Leaderboard' : 'Quest Center'}</h1>
                    <p className="text-white/50">{isExpanded ? 'See how you stack up against the best' : 'Level up your journey by completing missions'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {isExpanded && (
                      <Button variant="ghost" onClick={() => setIsExpanded(false)} className="text-white/60">
                        Back to Quests
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-white/50 hidden md:flex">
                      <X className="w-6 h-6" />
                    </Button>
                  </div>
                </header>

                {!isExpanded ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Current Quests */}
                    <section>
                      <div className="flex items-center gap-2 mb-6 text-white font-bold">
                        <Target className="w-5 h-5 text-indigo-400" />
                        Active Missions
                      </div>
                      <div className="space-y-4">
                        {quests.map((q, i) => (
                          <Card 
                            key={i} 
                            onClick={() => handleQuestClick(q)}
                            className={`p-5 backdrop-blur-xl border-white/10 relative overflow-hidden group transition-all cursor-pointer ${q.status === 'completed' ? 'bg-green-500/5' : 'bg-white/5 hover:bg-white/10 hover:border-indigo-500/30'}`}
                          >
                            <div className="absolute top-4 right-4 text-white/0 group-hover:text-white/30 transition-all">
                               <ArrowRight className="w-4 h-4" />
                            </div>
                            {q.status === 'completed' && (
                              <div className="absolute top-2 right-2 bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Completed</div>
                            )}
                            <div className="flex justify-between items-start mb-2">
                               <div>
                                 <h4 className="text-white font-bold mb-1">{q.title}</h4>
                                 <p className="text-white/50 text-xs">{q.desc}</p>
                               </div>
                               <div className="flex items-center gap-1 text-purple-400 font-bold text-sm pr-6">
                                 <Zap className="w-3 h-3 fill-purple-400" />
                                 +{q.xp}
                               </div>
                            </div>
                            {q.status === 'in-progress' && q.current && q.total && (
                              <div className="mt-4">
                                <div className="flex justify-between text-[10px] text-white/40 mb-1">
                                  <span>Progress</span>
                                  <span>{q.current}/{q.total}</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500" style={{ width: `${(q.current/q.total)*100}%` }} />
                                </div>
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    </section>

                    {/* Mini Leaderboard */}
                    <section>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-white font-bold">
                          <Crown className="w-5 h-5 text-yellow-500" />
                          Top Navigators
                        </div>
                        <Button 
                          variant="link" 
                          onClick={() => setIsExpanded(true)}
                          className="text-indigo-400 text-xs font-bold hover:text-indigo-300"
                        >
                          View Full Rankings
                        </Button>
                      </div>
                      <Card className="bg-white/5 border-white/10 divide-y divide-white/10">
                        {isLoading ? (
                           <div className="p-8 text-center text-white/30 italic">Calculating rankings...</div>
                        ) : (
                          <>
                           {leaderboard.length === 0 && !isLoading && (
                             <div className="py-10 text-center text-white/30 italic text-sm">
                               No explorers found yet. Be the first to reach the top!
                             </div>
                           )}
                           {leaderboard.slice(0, 5).map((u, i) => (
                             <motion.div
                               key={i}
                               initial={{ opacity: 0, x: -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: 0.2 + i * 0.05 }}
                               className={`p-3 rounded-xl flex items-center justify-between border ${
                                 u.full_name?.trim().toLowerCase() === userStats.name?.trim().toLowerCase()
                                   ? "bg-indigo-500/20 border-indigo-500/50" 
                                   : "bg-white/5 border-white/10"
                               }`}
                             >
                               <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">
                                   {i + 1}
                                 </div>
                                 <div>
                                   <div className="text-white font-bold text-sm flex items-center gap-2">
                                     {u.full_name}
                                     {u.full_name?.trim().toLowerCase() === userStats.name?.trim().toLowerCase() && <span className="text-[10px] bg-indigo-500/30 text-indigo-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">You</span>}
                                   </div>
                                   <div className="text-[10px] text-white/50 uppercase flex items-center gap-1">
                                      <Globe className="w-3 h-3" />
                                      {u.target_country || "Global Citizen"}
                                   </div>
                                </div>
                              </div>
                              <div className="text-white font-bold text-sm">
                                {(u.xp || 0).toLocaleString()} <span className="text-[10px] text-white/30">XP</span>
                              </div>
                            </motion.div>
                          ))}
                          </>
                        )}
                      </Card>
                    </section>
                  </div>
                ) : (
                  /* Expanded Leaderboard View */
                  <div className="space-y-6">
                    <Card className="bg-white/5 border-white/10 overflow-hidden">
                       <table className="w-full text-left">
                         <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                              <th className="p-4 md:p-6 text-white/50 text-xs font-bold uppercase">Rank</th>
                              <th className="p-4 md:p-6 text-white/50 text-xs font-bold uppercase">User</th>
                              <th className="p-4 md:p-6 text-white/50 text-xs font-bold uppercase">Destination</th>
                              <th className="p-4 md:p-6 text-white/50 text-xs font-bold uppercase text-right">XP Points</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-white/10 text-white">
                           {leaderboard.map((u, i) => (
                              <tr key={i} className={`hover:bg-white/5 transition-colors ${u.full_name === userStats.name ? 'bg-indigo-500/5' : ''}`}>
                                <td className="p-4 md:p-6">
                                   <div className="flex items-center gap-3">
                                      {i < 3 && <Trophy className={`w-4 h-4 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-300' : 'text-amber-700'}`} />}
                                      <span className={`font-bold ${i < 3 ? 'text-white' : 'text-white/30'}`}>{i + 1}</span>
                                   </div>
                                </td>
                                <td className="p-4 md:p-6 font-bold flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                      {u.full_name?.charAt(0) || "U"}
                                   </div>
                                   <div>
                                      <span>{u.full_name}</span>
                                      {u.full_name === userStats.name && <span className="ml-2 text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full uppercase">You</span>}
                                   </div>
                                </td>
                                <td className="p-4 md:p-6 text-white/60">{u.target_country || "Global"}</td>
                                <td className="p-4 md:p-6 text-right font-black text-indigo-400">
                                   {(u.xp || 0).toLocaleString()}
                                </td>
                              </tr>
                           ))}
                         </tbody>
                       </table>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
