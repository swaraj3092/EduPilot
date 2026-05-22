import { motion } from "motion/react";
import { Shield, Heart, Share2, Target, Calendar, CheckCircle2, TrendingUp, DollarSign, Lock, Eye, ArrowRight, ShieldCheck } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { toast } from "sonner";

export function ParentDashboard() {
  const profile = JSON.parse(localStorage.getItem("edupilot-profile") || "{}");
  const apps = JSON.parse(localStorage.getItem("edupilot-apps") || "[]");
  
  const handleShare = async () => {
    const link = `${window.location.origin}/ref/${profile.referral_code || 'demo'}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Family Trust Link synthesized and copied to clipboard.");
    } catch (err) {
      toast.success("Link generated!", { description: link });
    }
  };

  const totalSteps = apps.length * 5;
  const completedSteps = apps.filter((a: any) => a.status === "submitted").length * 5;
  const overallProgress = apps.length > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-16 text-foreground">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-rose-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="space-y-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/20 text-[10px] font-black text-rose-400 uppercase tracking-[0.3em]"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Family Trust Protocol
          </motion.div>
          <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/50 leading-none">
            Parent Hub
          </h2>
          <p className="text-muted-foreground max-w-lg font-bold uppercase text-[10px] tracking-widest leading-loose">
            Synchronized, read-only transparency for your family ecosystem. Track application velocity and financial milestones in real-time.
          </p>
        </div>

        <Button 
          className="bg-rose-600 hover:bg-rose-500 text-foreground font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-rose-500/30 h-16 px-10 group relative overflow-hidden w-full lg:w-auto transition-all active:scale-95 border-t border-white/20"
          onClick={handleShare}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <Share2 className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
          Share Access Key
        </Button>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <motion.div variants={itemVariants}>
          <Card className="p-8 bg-card border-border shadow-2xl rounded-[32px] flex flex-col items-center text-center group relative overflow-hidden hover:border-indigo-500/50 transition-all duration-500">
            <div className="absolute inset-0 bg-indigo-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 rounded-[24px] bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500 border border-indigo-500/10">
              <Target className="w-8 h-8" />
            </div>
            <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-muted-foreground mb-2">Live Target Count</h4>
            <p className="text-5xl font-black text-foreground italic tracking-tighter">{apps.length}</p>
            <p className="text-[10px] text-indigo-400 uppercase font-black tracking-[0.2em] mt-3">University Protocols</p>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="p-8 bg-card border-border shadow-2xl rounded-[32px] flex flex-col items-center text-center group relative overflow-hidden hover:border-emerald-500/50 transition-all duration-500">
            <div className="absolute inset-0 bg-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 rounded-[24px] bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-500 border border-emerald-500/10">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-muted-foreground mb-2">Journey Completion</h4>
            <p className="text-5xl font-black text-foreground italic tracking-tighter">{overallProgress}%</p>
            <p className="text-[10px] text-emerald-400 uppercase font-black tracking-[0.2em] mt-3">Objective Velocity</p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-8 bg-card border-border shadow-2xl rounded-[32px] flex flex-col items-center text-center group relative overflow-hidden hover:border-orange-500/50 transition-all duration-500">
            <div className="absolute inset-0 bg-orange-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 rounded-[24px] bg-orange-500/10 flex items-center justify-center text-orange-400 mb-6 group-hover:scale-110 group-hover:bg-orange-500/20 transition-all duration-500 border border-orange-500/10">
              <DollarSign className="w-8 h-8" />
            </div>
            <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-muted-foreground mb-2">Fiscal Readiness</h4>
            <p className="text-5xl font-black text-foreground italic tracking-tighter">Gold</p>
            <p className="text-[10px] text-orange-400 uppercase font-black tracking-[0.2em] mt-3">Financing Verified</p>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-10 bg-muted/50 border-border shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden rounded-[40px]">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] rotate-12">
             <Shield className="w-80 h-80" />
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 relative z-10">
            <h3 className="text-xl font-black uppercase tracking-[0.3em] text-foreground flex items-center gap-4 italic">
              <Calendar className="w-7 h-7 text-indigo-500" />
              Active Milestone Feed
            </h3>
            <div className="px-5 py-2 bg-muted border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" />
              Real-time Sync Active
            </div>
          </div>
          
          <div className="space-y-12 relative z-10 ml-4">
            {apps.length > 0 ? apps.map((app: any, i: number) => (
              <motion.div 
                key={app.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="relative pl-12 border-l-2 border-border/50 pb-10 last:pb-0"
              >
                 <div className={`absolute left-[-11px] top-0 w-5 h-5 rounded-full border-4 border-[#0A0A15] shadow-2xl transition-all duration-700 ${app.status === 'submitted' ? 'bg-emerald-500 shadow-emerald-500/50 scale-125' : 'bg-white/10'}`} />
                 
                 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 bg-muted/50 border border-border/50 rounded-[24px] hover:bg-white/[0.04] transition-all group">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-black text-xl text-foreground uppercase tracking-tighter italic">{app.university}</h4>
                        {app.status === 'submitted' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{app.program}</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
                      <div className="flex-1 lg:w-48">
                         <div className="flex justify-between mb-2">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Protocol Stage</span>
                            <span className="text-[9px] font-black text-foreground/60 uppercase tracking-widest">{app.status === 'submitted' ? '100%' : '45%'}</span>
                         </div>
                         <Progress value={app.status === 'submitted' ? 100 : 45} className={`h-1.5 ${app.status === 'submitted' ? 'bg-emerald-500/20' : 'bg-muted'}`} />
                      </div>
                      <div className={`text-[9px] font-black px-6 py-2 rounded-xl uppercase tracking-[0.25em] transition-all duration-500 ${app.status === 'submitted' ? 'bg-emerald-500 text-foreground shadow-lg shadow-emerald-500/20' : 'bg-muted text-muted-foreground border border-border'}`}>
                        {app.status === 'submitted' ? 'DEPLOYED' : 'INITIALIZING'}
                      </div>
                    </div>
                 </div>
              </motion.div>
            )) : (
              <div className="text-center py-24 bg-muted/50 rounded-[40px] border-2 border-dashed border-border/50">
                 <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-foreground/10" />
                 </div>
                 <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-xs">No active protocols detected.</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
      
      <div className="flex items-center gap-4 p-8 bg-rose-500/5 rounded-[32px] border border-rose-500/10 text-[10px] text-rose-400 font-black uppercase tracking-[0.25em] relative overflow-hidden group">
        <div className="absolute inset-0 bg-rose-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
        <Lock className="w-4 h-4 shrink-0" />
        This interface is operating under high-security read-only protocols. Access is restricted to real-time observation only.
        <ArrowRight className="w-4 h-4 ml-auto opacity-20" />
      </div>
    </div>
  );
}
