import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, X, Calendar, TrendingUp, FileText } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface Nudge {
  id: string;
  type: "deadline" | "opportunity" | "action";
  title: string;
  message: string;
  icon: React.ReactNode;
  color: string;
}

const SAMPLE_NUDGES: Nudge[] = [
  {
    id: "1",
    type: "deadline",
    title: "GRE Registration Closing Soon",
    message: "GRE registrations close in 14 days. Here's a prep plan tailored for you.",
    icon: <Calendar className="w-5 h-5" />,
    color: "from-amber-500/20 to-orange-500/20",
  },
  {
    id: "2",
    type: "opportunity",
    title: "New Scholarship Available",
    message: "MIT just opened applications for the AI Research Scholarship. You're a perfect match!",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    id: "3",
    type: "action",
    title: "Complete Your SOP",
    message: "You're 80% done with your Stanford SOP. Finish it today to stay on track!",
    icon: <FileText className="w-5 h-5" />,
    color: "from-indigo-500/20 to-purple-500/20",
  },
];

export function SmartNudge() {
  const [activeNudge, setActiveNudge] = useState<Nudge | null>(SAMPLE_NUDGES[0]);

  useEffect(() => {
    const timer = setInterval(() => {
      const idx = Math.floor(Math.random() * SAMPLE_NUDGES.length);
      setActiveNudge(SAMPLE_NUDGES[idx]);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  if (!activeNudge) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeNudge.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="mb-6"
      >
        <Card className={`p-4 bg-gradient-to-br ${activeNudge.color} border-white/10 backdrop-blur-md relative overflow-hidden group`}>
          <div className="flex gap-4 items-start relative z-10">
            <div className="p-2 rounded-xl bg-white/10 text-foreground group-hover:rotate-12 transition-transform">
              {activeNudge.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">{activeNudge.type}</span>
                <button 
                  onClick={() => setActiveNudge(null)}
                  className="p-1 rounded-full hover:bg-white/10 transition"
                >
                  <X className="w-3 h-3 text-foreground/40" />
                </button>
              </div>
              <h4 className="text-sm font-bold text-foreground mb-1">{activeNudge.title}</h4>
              <p className="text-xs text-foreground/70 leading-relaxed mb-3">
                {activeNudge.message}
              </p>
              <Button size="sm" className="h-7 text-[10px] bg-white/10 hover:bg-white/20 border-white/10 text-foreground font-bold">
                TAKE ACTION
              </Button>
            </div>
          </div>
          {/* Animated Background Pulse */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}