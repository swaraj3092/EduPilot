import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, ChevronRight, Bot, Mail, ShieldCheck, Rocket } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { generateAgentBlueprint } from "@services";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export function GrowthFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [generatedBlueprint, setGeneratedBlueprint] = useState("");

  const steps = [
    {
      title: "AI User Acquisition",
      desc: "Autonomous agents scrape forum signals (Reddit, Quora) and generate personalized ad copy/content that targets high-intent students.",
      icon: Rocket,
      color: "from-blue-500 to-indigo-500",
      status: "Analyzing 12.4k signals..."
    },
    {
      title: "Hyper-Personalized Nurturing",
      desc: "LLMs generate a custom 40-page 'Global Study Blueprint' for every lead within 30 seconds of signup, establishing immediate trust.",
      icon: Bot,
      color: "from-indigo-500 to-purple-500",
      status: "Generative AI Blueprint Active"
    },
    {
      title: "Predictive Conversion",
      desc: "AI identifies 'Conversion Windows'—when a student views a high-ROI course, the agent triggers a personalized loan offer nudge.",
      icon: ShieldCheck,
      color: "from-purple-500 to-pink-500",
      status: "Real-time eligibility engine"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <Card className="bg-[#0D0D1A]/80 backdrop-blur-xl border-white/10 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
      
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-indigo-400" />
        <h3 className="text-xl font-bold text-white">Zero-Human Growth Loop</h3>
        <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 uppercase tracking-tighter">
          Autonomous Agent Live
        </span>
      </div>

      <div className="space-y-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = activeStep === i;
          
          return (
            <motion.div
              key={i}
              className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                isActive 
                  ? `bg-gradient-to-r ${step.color} border-transparent shadow-xl` 
                  : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
              onClick={() => {
                setActiveStep(i);
                setIsAutoPlaying(false);
              }}
              layout
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? "bg-white/20" : "bg-white/10"}`}>
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-indigo-400"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-bold ${isActive ? "text-white" : "text-white/80"}`}>{step.title}</h4>
                    {isActive && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="text-[10px] text-white/70 italic"
                      >
                        {step.status}
                      </motion.div>
                    )}
                  </div>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="text-xs text-white/80 leading-relaxed overflow-hidden"
                      >
                        <p className="mb-3">{step.desc}</p>
                        
                        {i === 1 && (
                          <div className="mt-2 flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={async (e) => {
                                e.stopPropagation();
                                setIsGenerating(true);
                                setOpenDialog(true);
                                try {
                                  // Call the REAL backend agent
                                  const savedProfile = localStorage.getItem("edupilot-profile");
                                  const userProfileObj = savedProfile ? JSON.parse(savedProfile) : { name: "User", country: "USA", field: "Computer Science", level: "master" };
                                  if (!userProfileObj.country) userProfileObj.country = "USA";
                                  if (!userProfileObj.field) userProfileObj.field = "Computer Science";
                                  
                                  const response = await generateAgentBlueprint({
                                    name: userProfileObj.name || "Student",
                                    country: userProfileObj.country,
                                    field_of_study: userProfileObj.field,
                                    level: userProfileObj.level || "masters"
                                  });
                                  setGeneratedBlueprint(response.blueprint);
                                } catch (error) {
                                  console.error(error);
                                  setGeneratedBlueprint("Failed to reach the AI agent. Ensure the backend is running.");
                                } finally {
                                  setIsGenerating(false);
                                }
                              }}
                              className="bg-white/20 hover:bg-white/30 text-white border-none shadow-md"
                            >
                              <Bot className="w-3 h-3 mr-1" /> View Real Generated Blueprint
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {isActive && (
                <motion.div 
                  className="absolute bottom-0 left-0 h-1 bg-white/30"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0D0D1A] bg-zinc-800 flex items-center justify-center text-[10px] text-white">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-[10px] text-white/50 leading-tight">
              <span className="text-indigo-400 font-bold">142 leads</span> acquired<br/>by agents in last 24h
            </div>
          </div>
          <Button size="sm" variant="ghost" className="text-xs text-indigo-400 hover:text-white group">
            Agent Dashboard <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-[90vw] md:max-w-2xl bg-[#0D0D1A] border-white/20 text-white max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              Agent-Generated Study Blueprint
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-2">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-70">
                <Spinner className="w-8 h-8 mb-4 text-indigo-500 animate-spin" />
                <p>AI Agent is currently generating the blueprint...</p>
                <p className="text-xs text-white/50 mt-2">Takes about 5 seconds</p>
              </div>
            ) : (
              <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono p-4 bg-white/5 rounded-xl border border-white/10">
                {generatedBlueprint}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Simple internal hidden component just for the spinner if needed
function Spinner(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
