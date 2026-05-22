import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, FileText, Sparkles, Send, Copy, Check, RefreshCw, Zap, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";

export function LORDrafter() {
  const [profName, setProfName] = useState("");
  const [course, setCourse] = useState("");
  const [relationship, setRelationship] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<null | { email: string; briefing: string }>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!profName || !course || !relationship) {
      toast.error("All protocols must be initialized. Please fill all fields.");
      return;
    }

    setIsGenerating(true);
    // Simulate high-perf AI generation
    setTimeout(() => {
      setDraft({
        email: `Subject: Recommendation Letter Request - [Your Name]\n\nDear Professor ${profName},\n\nI hope this email finds you well. I am writing to you today because I am preparing my applications for ${course} and would be honored if you would consider writing a letter of recommendation on my behalf.\n\nHaving thoroughly enjoyed your classes on ${relationship}, I believe your perspective on my academic performance and character would be invaluable to the admissions committee.\n\nI have attached a structured briefing document and my current resume to assist you in this process. Thank you very much for your time and for everything I have learned under your guidance.\n\nBest regards,\n[Your Name]`,
        briefing: `### STUDENT BRIEFING DOCUMENT\n\n**Candidate:** [Your Name]\n**Target Program:** ${course}\n**Interaction Context:** ${relationship}\n\n**Key Academic Highlights:**\n- Significant project work in [Course Name]\n- Demonstrated strong analytical skills during [Specific Lab/Project]\n- Active participation in class discussions regarding [Topic]\n\n**Core Strengths to Emphasize:**\n1. Technical Proficiency in [Subject Area]\n2. Collaboration & Team Leadership\n3. Resilience and Problem-Solving under pressure\n\n**Future Goals:**\nTo specialize in [Research Area] and contribute to [Industry/Field].`
      });
      setIsGenerating(false);
      toast.success("Neural Drafts Synthesized Successfully.");
    }, 1500);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast.success(`${type} copied to system buffer.`);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 text-foreground">
      <AnimatePresence mode="wait">
        {!draft ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-12">
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-6"
              >
                <Zap className="w-3 h-3 fill-current" />
                Strategic Protocol Alpha
              </motion.div>
              <h2 className="text-5xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/50 leading-none">
                LOR Drafter
              </h2>
              <p className="text-muted-foreground mt-4 font-bold uppercase text-[10px] tracking-widest max-w-sm mx-auto">
                Synthesize professional briefing documents and request protocols for your academic network.
              </p>
            </div>

            <Card className="p-10 bg-card backdrop-blur-3xl border-border shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group rounded-[40px]">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative z-10 space-y-10">
                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/80 ml-1">Academic Authority Name</Label>
                    <Input 
                      placeholder="e.g. Dr. Arishetty" 
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50 h-14 rounded-2xl transition-all text-base font-medium"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/80 ml-1">Objective Program</Label>
                      <Input 
                        placeholder="e.g. MS in CS" 
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50 h-14 rounded-2xl transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/80 ml-1">Interaction Context</Label>
                      <Input 
                        placeholder="e.g. Thesis Student" 
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50 h-14 rounded-2xl transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full h-16 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-foreground font-black uppercase tracking-[0.25em] rounded-2xl shadow-2xl shadow-indigo-500/20 group overflow-hidden relative border-t border-white/20 transition-all active:scale-95"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {isGenerating ? (
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Synthesizing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Initialize Synthesis
                    </div>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="space-y-10"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-card border border-border p-5 rounded-[32px] backdrop-blur-3xl shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <FileText className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Drafts Generated</h4>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Protocol Sync Complete</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button 
                  variant="ghost" 
                  onClick={() => setDraft(null)} 
                  className="text-muted-foreground hover:text-foreground hover:bg-muted h-14 px-8 font-black uppercase tracking-widest text-[10px] rounded-2xl border border-border/50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                
                <Button 
                  onClick={() => copyToClipboard(draft.email, "Email")} 
                  className={`h-14 px-10 text-[10px] font-black uppercase tracking-widest transition-all duration-500 rounded-2xl flex items-center gap-3 border ${
                    copiedType === "Email" 
                      ? "bg-emerald-500 text-foreground border-emerald-400 shadow-emerald-500/20" 
                      : "bg-indigo-600 hover:bg-indigo-500 text-foreground border-border shadow-indigo-500/20"
                  } shadow-xl active:scale-95`}
                >
                  {copiedType === "Email" ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  {copiedType === "Email" ? "Copied" : "Copy Email"}
                </Button>
                
                <Button 
                  onClick={() => copyToClipboard(draft.briefing, "Briefing")} 
                  className={`h-14 px-10 text-[10px] font-black uppercase tracking-widest transition-all duration-500 rounded-2xl flex items-center gap-3 border ${
                    copiedType === "Briefing" 
                      ? "bg-emerald-500 text-foreground border-emerald-400 shadow-emerald-500/20" 
                      : "bg-purple-600 hover:bg-purple-500 text-foreground border-border shadow-purple-500/20"
                  } shadow-xl active:scale-95`}
                >
                  {copiedType === "Briefing" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedType === "Briefing" ? "Copied" : "Copy Briefing"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-20">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-1 bg-gradient-to-b from-indigo-500/30 to-transparent rounded-[40px] border-0 overflow-hidden shadow-2xl">
                  <div className="bg-card p-8 h-[650px] flex flex-col rounded-[39px]">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3 text-indigo-400 font-black uppercase text-[10px] tracking-[0.3em]">
                        <Mail className="w-4 h-4" />
                        Communication Draft
                      </div>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-sm leading-[1.8] text-foreground/80 bg-muted/50 p-8 rounded-[30px] border border-border/50 custom-scrollbar font-medium">
                      {draft.email}
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-1 bg-gradient-to-b from-purple-500/30 to-transparent rounded-[40px] border-0 overflow-hidden shadow-2xl">
                  <div className="bg-card p-8 h-[650px] flex flex-col rounded-[39px]">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3 text-purple-400 font-black uppercase text-[10px] tracking-[0.3em]">
                        <FileText className="w-4 h-4" />
                        Professor Briefing
                      </div>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-sm leading-[1.8] text-foreground/80 bg-muted/50 p-8 rounded-[30px] border border-border/50 custom-scrollbar font-medium prose prose-invert max-w-none">
                      {draft.briefing}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.2);
        }
      `}</style>
    </div>
  );
}
