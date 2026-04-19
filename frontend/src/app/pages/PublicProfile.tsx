import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, Flame, Zap, Award, Sparkles, 
  ArrowRight, GraduationCap, Globe, Users, 
  CheckCircle2, Star, Rocket, Loader2 
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { getPublicProfile } from "@services";
import { AnimatedWorld } from "../components/AnimatedWorld";

export function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!username) return;
      try {
        const res = await getPublicProfile(username);
        if (res.status === "success") {
          const p = res.profile;
          setProfile(p);
          // Save for tracking credit if they sign up later
          localStorage.setItem("edupilot-referrer", username);

          // 🛠️ Dynamic Meta Tags Injection (Cloud Symphony Magic)
          document.title = `${p.full_name}'s Achievement Card | EduPilot`;
          
          const setMeta = (property: string, content: string) => {
            let el = document.querySelector(`meta[property="${property}"]`);
            if (!el) {
              el = document.createElement('meta');
              el.setAttribute('property', property);
              document.head.appendChild(el);
            }
            el.setAttribute('content', content);
          };

          setMeta('og:title', `${p.full_name}'s Elite Study Profile`);
          setMeta('og:description', `Joined the 1% of students using AI to master admissions. Check out ${p.full_name}'s stats!`);
          setMeta('og:image', p.profile_picture || 'https://edupilot.vercel.app/og-preview.png');
          setMeta('twitter:card', 'summary_large_image');
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Public Profile Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[#060610]">
        <AnimatedWorld />
        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">Fetching {username}'s Achievement Card...</h2>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[#060610]">
        <AnimatedWorld />
        <Card className="relative z-10 p-8 max-w-md text-center bg-card/80 backdrop-blur-xl border-border">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Profile Not Found</h2>
          <p className="text-muted-foreground mb-8">This referral link might have expired or been moved.</p>
          <Button onClick={() => navigate("/auth")} className="w-full bg-primary text-white">Join EduPilot Anyway</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-6 bg-[#060610]">
      {/* Premium Background */}
      <AnimatedWorld />

      {/* Floating Elements for Sparkle */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ y: [-20, 20], opacity: [0.3, 0.6] }} 
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 blur-[100px] rounded-full" 
        />
        <motion.div 
          animate={{ y: [20, -20], opacity: [0.3, 0.6] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500/20 blur-[100px] rounded-full" 
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        
        {/* Left Side: The "Hero" Card */}
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            whileHover={{ rotateY: -5, rotateX: 5, scale: 1.02 }}
            className="perspective-1000"
          >
            <Card className="relative p-8 bg-gradient-to-br from-indigo-500/20 via-slate-900/40 to-purple-500/20 backdrop-blur-3xl border border-white/20 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden group">
              {/* Animated Inner Shine */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent skew-y-12 translate-y-full group-hover:translate-y-[-100%] transition-transform duration-1000" />
              
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary via-purple-500 to-pink-500 p-1 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-[20px] bg-card flex items-center justify-center overflow-hidden">
                      {profile.profile_picture ? (
                        <img src={profile.profile_picture} alt={profile.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-4xl font-bold text-primary/30">
                          {profile.full_name[0]}
                        </div>
                      )}
                    </div>
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-2 border-[#0A0A1F] flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{profile.full_name}</h3>
                  <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold tracking-wide uppercase">
                    <GraduationCap className="w-4 h-4" />
                    Global Explorer
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{profile.xp}</div>
                  <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Mastery XP</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{profile.streak}</div>
                  <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Day Streak</div>
                </div>
              </div>

              {/* Achievements Showcase */}
              <div className="space-y-4 mb-8">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Latest Achievements</h4>
                <div className="flex gap-3 flex-wrap">
                  {(profile.badges || ["early_adopter", "profile_complete"]).slice(0, 3).map((badge: string, i: number) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary flex items-center gap-1.5"
                    >
                      <Star className="w-3 h-3 fill-primary" />
                      {badge.replace('_', ' ').toUpperCase()}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Target Goal */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary">
                 <div className="text-[10px] text-white/40 font-bold uppercase mb-1">Target Mission</div>
                 <div className="text-sm text-white font-medium">
                    Applying to study {profile.target_field || "Global Technology"} in {profile.target_country || "USA"}
                 </div>
              </div>

              {/* Join Badge */}
              <div className="absolute top-4 right-4 rotate-12">
                 <div className="px-2 py-1 bg-white text-[#0A0A1F] text-[8px] font-bold uppercase tracking-wide shadow-lg"> Verified Pilot </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Side: Join EduPilot CTA */}
        <div className="flex-1 text-center lg:text-left">
           <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.6 }}
           >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold mb-6">
                 <Rocket className="w-4 h-4" />
                 LEVEL {Math.floor(profile.xp / 1000) + 1} PILOT ENTRANCE
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-indigo-500">{profile.full_name.split(' ')[0]}'s</span> Study Abroad Crew.
              </h1>
              <p className="text-lg text-white/60 mb-10 max-w-lg mx-auto lg:mx-0">
                Level up your education journey with AI-powered SOP reviews, 
                university matching, and real-time loan eligibility checks.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                 <Button 
                   size="lg" 
                   onClick={() => navigate("/auth")}
                   className="h-16 px-10 text-lg font-bold bg-white text-[#0A0A1F] hover:bg-white/90 rounded-2xl group shadow-2xl shadow-primary/20"
                 >
                    Join {profile.full_name.split(' ')[0]}'s Crew
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 </Button>
                 <div className="flex items-center gap-3 text-white/40">
                   <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#0A0A1F] flex items-center justify-center text-[8px] font-bold">U{i}</div>
                      ))}
                   </div>
                   <span className="text-xs font-medium">Joined by 10k+ navigators</span>
                 </div>
              </div>

              {/* Features Hint */}
              <div className="grid grid-cols-2 gap-8 mt-12">
                 <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                       <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                       <div className="text-white font-bold text-sm">AI SOP Review</div>
                       <div className="text-[10px] text-white/40">Instant feedback & scoring</div>
                    </div>
                 </div>
                 <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                       <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-left">
                       <div className="text-white font-bold text-sm">Loan Pre-Approval</div>
                       <div className="text-[10px] text-white/40">Real-time eligibility checks</div>
                    </div>
                 </div>
              </div>
           </motion.div>
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}

function DollarSign({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function AlertCircle({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
