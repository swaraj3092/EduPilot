import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowLeft, Flame, Trophy, Users, Share2, Copy, CheckCircle2, Zap, Target, BookOpen, Award, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { getUserProfile } from "@services";

const BADGES = [
  { id: "early_adopter", name: "Early Adopter", icon: "🚀", unlocked: true, desc: "Joined EduPilot" },
  { id: "profile_complete", name: "Profile Complete", icon: "✅", unlocked: true, desc: "100% profile completion" },
  { id: "uni_explorer", name: "University Explorer", icon: "🎓", unlocked: false, desc: "Explored 10+ universities" },
  { id: "ai_chat", name: "AI Conversationalist", icon: "💬", unlocked: false, desc: "50+ AI chat messages" },
  { id: "roi_master", name: "ROI Master", icon: "📊", unlocked: false, desc: "Compared 5+ countries" },
  { id: "referral_champ", name: "Referral Champion", icon: "🏆", unlocked: false, desc: "Referred 3+ friends" },
  { id: "app_ready", name: "Application Ready", icon: "📝", unlocked: false, desc: "Completed SOP review" },
  { id: "scholarship_hunter", name: "Scholarship Hunter", icon: "💰", unlocked: false, desc: "Applied to scholarships" },
];

export function Profile() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const savedUser = JSON.parse(localStorage.getItem("edupilot-user") || "{}");
  
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState(BADGES);

  useEffect(() => {
    async function fetchProfile() {
      if (!savedUser.id) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await getUserProfile(savedUser.id);
        if (res.status === "success") {
          setProfile(res.data || res.profile);
          
          // Update badges based on real data
          const owned = (res.data || res.profile).badges || [];
          setBadges(BADGES.map(b => ({
            ...b,
            unlocked: b.unlocked || owned.includes(b.id)
          })));
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [savedUser.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const userData = {
    name: profile?.full_name || savedUser.name || "Explorer",
    streak: profile?.streak || 0,
    points: profile?.xp || 0,
    referrals: profile?.referrals_count || 0,
    nextReward: 10,
  };

  const shareCode = profile?.referral_code || (userData.name).toLowerCase().replace(/\s+/g, '');
  const referralLink = `${window.location.origin}/ref/${shareCode}`;

  // Dynamic Journey Progress
  const completedQuests = profile?.quests_completed || [];
  const journeyProgress = [
    { label: "Profile Completion", value: 100, icon: Target, color: "green" }, // Base is always 100 since they see this
    { label: "University Research", value: Math.min(100, (completedQuests.length / 5) * 100), icon: BookOpen, color: "purple" },
    { label: "Application Ready", value: completedQuests.includes("dreamer_quest") ? 100 : 30, icon: Award, color: "indigo" },
  ];

  const handleSocialShare = () => {
    const text = `I'm leveling up my Study Abroad journey with EduPilot! Join me using my link: ${referralLink}`;
    if (navigator.share) {
      navigator.share({ title: 'EduPilot', text, url: referralLink });
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
    }
  };

  const handleCopy = () => {
    // Fallback method for clipboard API
    const textArea = document.createElement("textarea");
    textArea.value = referralLink;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Navigation */}
      <div className="relative z-10 p-4 md:p-6">
        <Button
          variant="ghost"
          className="text-white/70 hover:text-white"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pb-20">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-8 md:mb-12">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[40px] bg-gradient-to-br from-primary via-purple-500 to-pink-500 p-1 shadow-2xl overflow-hidden">
            <div className="w-full h-full rounded-[36px] bg-card flex items-center justify-center overflow-hidden">
               {profile?.profile_picture ? (
                 <img src={profile.profile_picture} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <div className="text-4xl md:text-5xl font-black text-primary/30 italic">{userData.name.charAt(0)}</div>
               )}
            </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black text-foreground mb-1 italic tracking-tight">{userData.name}</h1>
            <p className="text-sm md:text-lg text-muted-foreground font-medium uppercase tracking-widest">{profile?.degree_level || "Master"} Navigator</p>
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
          {/* Streak Counter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm border-orange-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />
              <div className="relative">
                <Flame className="w-8 h-8 text-orange-400 mb-3" />
                <div className="text-4xl font-bold text-white mb-1">{userData.streak}</div>
                <div className="text-sm text-white/60">Day Streak 🔥</div>
              </div>
            </Card>
          </motion.div>

          {/* Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border-purple-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
              <div className="relative">
                <Zap className="w-8 h-8 text-purple-400 mb-3" />
                <div className="text-4xl font-bold text-foreground mb-1">{userData.points}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
            </Card>
          </motion.div>

          {/* Referrals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border-green-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />
              <div className="relative">
                <Users className="w-8 h-8 text-green-400 mb-3" />
                <div className="text-4xl font-bold text-white mb-1">{userData.referrals}</div>
                <div className="text-sm text-white/60">Friends Referred</div>
              </div>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 backdrop-blur-sm border-indigo-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
              <div className="relative">
                <Trophy className="w-8 h-8 text-indigo-400 mb-3" />
                <div className="text-4xl font-bold text-foreground mb-1">
                  {badges.filter(b => b.unlocked).length}/{BADGES.length}
                </div>
                <div className="text-sm text-muted-foreground">Badges Earned</div>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column: Progress & Badges */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Rings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-8 bg-card backdrop-blur-sm border-border shadow-sm">
                <h3 className="text-2xl font-bold text-foreground mb-6">Your Journey Progress</h3>
                
                <div className="grid grid-cols-3 gap-4 md:gap-8">
                  {journeyProgress.map((item, i) => (
                    <div key={i} className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                          <defs>
                            <linearGradient id={`profile-gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor={item.color === "green" ? "#10b981" : item.color === "purple" ? "#a855f7" : "#6366f1"} />
                              <stop offset="100%" stopColor={item.color === "green" ? "#059669" : item.color === "purple" ? "#ec4899" : "#3b82f6"} />
                            </linearGradient>
                          </defs>
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="12"
                            fill="none"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke={`url(#profile-gradient-${i})`}
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - item.value / 100)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <item.icon className="w-6 h-6 text-muted-foreground mb-1" />
                          <div className="text-2xl font-bold text-foreground">{item.value}%</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">{item.label}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Badges Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-8 bg-white/5 backdrop-blur-sm border-white/10">
                <h3 className="text-2xl font-bold text-white mb-6">Achievement Badges</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {badges.map((badge, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + i * 0.05 }}
                      whileHover={{ scale: badge.unlocked ? 1.05 : 1 }}
                      className={`p-4 rounded-xl border transition text-center ${
                        badge.unlocked
                          ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/50"
                          : "bg-white/5 border-white/10 opacity-40"
                      }`}
                    >
                      <div className="text-4xl mb-2 filter" style={{ 
                        filter: badge.unlocked ? 'none' : 'grayscale(1)' 
                      }}>
                        {badge.icon}
                      </div>
                      <div className="text-xs text-white font-semibold mb-1">{badge.name}</div>
                      <div className="text-xs text-white/50">{badge.desc}</div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column: Referral */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-8 bg-card backdrop-blur-sm border-border shadow-lg sticky top-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                  <Share2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Referral Growth Loop</h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Invite friends and unlock premium features together
                </p>
              </div>

              {/* Progress to Next Reward */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-white/70">Progress to Premium Report</span>
                  <span className="text-white font-semibold">{userData.referrals}/{userData.nextReward}</span>
                </div>
                <Progress value={(userData.referrals / userData.nextReward) * 100} className="h-3" />
                <p className="text-xs text-white/50 mt-2">
                  {userData.nextReward - userData.referrals} more referral{userData.nextReward - userData.referrals !== 1 ? 's' : ''} to unlock!
                </p>
              </div>

              {/* Referral Link */}
              <div className="mb-6">
                <Label className="text-white/80 mb-2 block">Your Unique Link</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={referralLink}
                    readOnly
                    className="bg-white/5 border-white/20 text-white flex-1"
                  />
                  <Button
                    size="icon"
                    className={`${
                      copied
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-indigo-500 hover:bg-indigo-600"
                    }`}
                    onClick={handleCopy}
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Premium Admission Report</div>
                    <div className="text-white/60 text-xs">Detailed analysis + personalized strategy</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Priority Support</div>
                    <div className="text-white/60 text-xs">24/7 counselor access</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Bonus Points</div>
                    <div className="text-white/60 text-xs">500 points per referral</div>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleSocialShare}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
              >
                Share on Social Media
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}