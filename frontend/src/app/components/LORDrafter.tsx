import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, FileText, Sparkles, Send, Copy, Check, RefreshCw, UserPlus } from "lucide-react";
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
      toast.error("Please fill in all fields to generate a high-quality draft.");
      return;
    }

    setIsGenerating(true);
    try {
      setTimeout(() => {
        setDraft({
          email: `Subject: Recommendation Letter Request - [Your Name]\n\nDear Professor ${profName},\n\nI hope this email finds you well. I am writing to you today because I am preparing my applications for ${course} and would be honored if you would consider writing a letter of recommendation on my behalf.\n\nHaving thoroughly enjoyed your classes on ${relationship}, I believe your perspective on my academic performance and character would be invaluable to the admissions committee.\n\nI have attached a structured briefing document and my current resume to assist you in this process. Thank you very much for your time and for everything I have learned under your guidance.\n\nBest regards,\n[Your Name]`,
          briefing: `### STUDENT BRIEFING DOCUMENT\n\n**Candidate:** [Your Name]\n**Target Program:** ${course}\n**Interaction Context:** ${relationship}\n\n**Key Academic Highlights:**\n- Significant project work in [Course Name]\n- Demonstrated strong analytical skills during [Specific Lab/Project]\n- Active participation in class discussions regarding [Topic]\n\n**Core Strengths to Emphasize:**\n1. Technical Proficiency in [Subject Area]\n2. Collaboration & Team Leadership\n3. Resiliance and Problem-Solving under pressure\n\n**Future Goals:**\nTo specialize in [Research Area] and contribute to [Industry/Field].`
        });
        setIsGenerating(false);
        toast.success("AI has successfully drafted your LOR documents!");
      }, 2000);
    } catch (err) {
      toast.error("Failed to generate draft. Please try again.");
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast.success(`${type} copied to clipboard!`);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 text-foreground">
      {!draft ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">
              <Sparkles className="w-3 h-3" />
              AI LOR Suite
            </div>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">LOR Drafter</h2>
            <p className="text-muted-foreground mt-2 font-medium">Get high-quality recommendations by making it easy for your professors.</p>
          </div>

          <Card className="p-8 bg-white/[0.03] backdrop-blur-3xl border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Professor Name</Label>
                  <Input 
                    placeholder="e.g. Dr. Arishetty" 
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-indigo-500/50 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Target Program</Label>
                  <Input 
                    placeholder="e.g. MS in CS at Stanford" 
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-indigo-500/50 h-12"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Relationship Context</Label>
                  <Input 
                    placeholder="e.g. Undergrad Thesis Student" 
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-indigo-500/50 h-12"
                  />
                </div>
                <div className="pt-6">
                  <Button 
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-xl shadow-xl shadow-indigo-500/20 group overflow-hidden relative"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {isGenerating ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                        Generate AI Drafts
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button variant="ghost" onClick={() => setDraft(null)} className="text-muted-foreground hover:text-white hover:bg-white/5 w-full sm:w-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              Redraft
            </Button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
               <Button onClick={() => copyToClipboard(draft.email, "Email")} variant="outline" className="h-10 text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-white/5 border-white/10 hover:bg-white/10 w-full sm:w-auto">
                 {copiedType === "Email" ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Mail className="w-4 h-4 mr-2" />}
                 Copy Email
               </Button>
               <Button onClick={() => copyToClipboard(draft.briefing, "Briefing")} variant="outline" className="h-10 text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-white/5 border-white/10 hover:bg-white/10 w-full sm:w-auto">
                 {copiedType === "Briefing" ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <FileText className="w-4 h-4 mr-2" />}
                 Copy Briefing
               </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
            <Card className="p-6 bg-white/[0.02] border-white/10 h-[550px] overflow-hidden flex flex-col group relative">
              <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2 mb-4 text-indigo-400 font-black uppercase text-[10px] tracking-[0.3em] relative z-10">
                <Mail className="w-3 h-3" />
                Email Draft
              </div>
              <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-white/70 bg-black/40 p-6 rounded-2xl border border-white/5 relative z-10 custom-scrollbar">
                {draft.email}
              </div>
            </Card>

            <Card className="p-6 bg-white/[0.02] border-white/10 h-[550px] overflow-hidden flex flex-col group relative">
              <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2 mb-4 text-purple-400 font-black uppercase text-[10px] tracking-[0.3em] relative z-10">
                <FileText className="w-3 h-3" />
                Briefing Document
              </div>
              <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-white/70 bg-black/40 p-6 rounded-2xl border border-white/5 relative z-10 custom-scrollbar prose prose-invert max-w-none">
                {draft.briefing}
              </div>
            </Card>
          </div>
        </motion.div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
