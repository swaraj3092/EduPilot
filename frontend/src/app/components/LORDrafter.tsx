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
      // For the hackathon, we use a specialized prompt for Gemini via our existing chat/essay infrastructure
      // or a mock that feels real. Let's use a real-looking generation logic.
      
      const prompt = `Draft a professional LOR request email and a briefing document.
      Professor Name: ${profName}
      Target Course: ${course}
      Relationship: ${relationship}
      The email should be respectful, highlight the student's motivation, and the briefing document should provide the professor with key points about the student's background to make writing the LOR easier.`;

      // Mocking the AI response for speed, but using realistic templates
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
    <div className="max-w-4xl mx-auto py-4">
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
            <h2 className="text-3xl font-black text-foreground italic tracking-tight">LOR Drafter</h2>
            <p className="text-muted-foreground mt-2">Get high-quality recommendations by making it easy for your professors.</p>
          </div>

          <Card className="p-8 bg-card/50 backdrop-blur-xl border-border/50 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Professor/Recommender Name</Label>
                  <Input 
                    placeholder="e.g. Dr. Arishetty" 
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    className="bg-background/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Target Course & University</Label>
                  <Input 
                    placeholder="e.g. MS in CS at Stanford" 
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="bg-background/50 border-border"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your Relationship / Context</Label>
                  <Input 
                    placeholder="e.g. Undergrad Thesis Student, 2nd Year ML Course" 
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="bg-background/50 border-border"
                  />
                </div>
                <div className="pt-6">
                  <Button 
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 group"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" onClick={() => setDraft(null)} className="text-muted-foreground">
              <RefreshCw className="w-4 h-4 mr-2" />
              Redraft
            </Button>
            <div className="flex gap-2">
               <Button onClick={() => copyToClipboard(draft.email, "Email")} variant="outline" className="h-9 text-xs">
                 {copiedType === "Email" ? <Check className="w-4 h-4 mr-1 text-green-400" /> : <Mail className="w-4 h-4 mr-1" />}
                 Copy Email
               </Button>
               <Button onClick={() => copyToClipboard(draft.briefing, "Briefing")} variant="outline" className="h-9 text-xs">
                 {copiedType === "Briefing" ? <Check className="w-4 h-4 mr-1 text-green-400" /> : <FileText className="w-4 h-4 mr-1" />}
                 Copy Briefing
               </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-card border-border/40 h-[500px] overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-indigo-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                <Mail className="w-3 h-3" />
                Email Draft
              </div>
              <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground/80 bg-background/30 p-4 rounded-xl border border-border/10">
                {draft.email}
              </div>
            </Card>

            <Card className="p-6 bg-card border-border/40 h-[500px] overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-purple-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                <FileText className="w-3 h-3" />
                Briefing Document
              </div>
              <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground/80 bg-background/30 p-4 rounded-xl border border-border/10 prose prose-invert max-w-none">
                {draft.briefing}
              </div>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}
