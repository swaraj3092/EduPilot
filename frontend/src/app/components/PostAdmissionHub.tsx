import { motion } from "motion/react";
import { GraduationCap, Home, Heart, CreditCard, Smartphone, MapPin, CheckCircle2, Circle, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useState } from "react";

const ONBOARDING_STEPS = [
  { id: "visa", title: "Student Visa (F1/Tier 4)", desc: "Schedule interview & pay SEVIS fee", icon: ShieldCheck, category: "Legal" },
  { id: "housing", title: "Accommodation", desc: "Book dorm or find off-campus housing", icon: Home, category: "Living" },
  { id: "banking", title: "US/UK Bank Account", desc: "Open an international student account", icon: CreditCard, category: "Finance" },
  { id: "insurance", title: "Health Insurance", desc: "Verify university waiver or buy plan", icon: Heart, category: "Health" },
  { id: "sim", title: "Local SIM Card", desc: "Order your international SIM card", icon: Smartphone, category: "Comm" },
  { id: "orientation", title: "Orientation Week", desc: "Register for international orientation", icon: MapPin, category: "Uni" },
];

export function PostAdmissionHub() {
  const [completed, setCompleted] = useState<string[]>([]);
  
  const toggleStep = (id: string) => {
    setCompleted(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const progress = Math.round((completed.length / ONBOARDING_STEPS.length) * 100);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-10">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-[30px] flex items-center justify-center mx-auto shadow-xl shadow-green-500/20"
        >
          <GraduationCap className="w-10 h-10 text-white" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-foreground italic tracking-tight uppercase">Congrats, Graduate!</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">You've cleared the hardest part. Now, let's get you ready for your life abroad with your personalized onboarding roadmap.</p>
        </div>
      </div>

      {/* Progress Tracker */}
      <Card className="p-6 bg-card border-primary/20 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
           <Zap className="w-12 h-12 text-primary opacity-10" />
        </div>
        <div className="flex justify-between items-end mb-4">
           <div>
              <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-1">Departure Readiness</p>
              <h3 className="text-2xl font-bold text-foreground">{progress}% Complete</h3>
           </div>
           <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">{ONBOARDING_STEPS.length - completed.length} tasks remaining</p>
           </div>
        </div>
        <Progress value={progress} className="h-3 bg-muted" />
      </Card>

      {/* Step Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ONBOARDING_STEPS.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card 
              onClick={() => toggleStep(step.id)}
              className={`p-5 cursor-pointer transition-all border shadow-sm group ${
                completed.includes(step.id) 
                  ? 'bg-green-500/5 border-green-500/30' 
                  : 'bg-card border-border/40 hover:border-primary/40'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                  completed.includes(step.id) ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground group-hover:text-primary'
                }`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{step.category}</span>
                    {completed.includes(step.id) && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                  </div>
                  <h4 className={`font-bold text-lg mt-0.5 ${completed.includes(step.id) ? 'text-foreground/60 line-through' : 'text-foreground'}`}>
                    {step.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="pt-6 border-t border-border/40 flex items-center justify-between">
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Verified by EduPilot Global Partners
         </div>
         <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10">
            Export Checklist (PDF)
         </Button>
      </div>
    </div>
  );
}
