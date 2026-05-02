import { motion } from "motion/react";
import { Shield, Heart, Share2, Target, Calendar, CheckCircle2, TrendingUp, DollarSign, Lock } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { toast } from "sonner";

export function ParentDashboard() {
  const profile = JSON.parse(localStorage.getItem("edupilot-profile") || "{}");
  const apps = JSON.parse(localStorage.getItem("edupilot-apps") || "[]");
  
  const handleShare = () => {
    const link = `${window.location.origin}/parent-view/${profile.referral_code || 'demo'}`;
    navigator.clipboard.writeText(link);
    toast.success("Parent-ready link copied to clipboard!");
  };

  const totalSteps = apps.length * 5; // Simplified
  const completedSteps = apps.filter((a: any) => a.status === "submitted").length * 5;
  const overallProgress = apps.length > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-10 text-foreground">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20 text-xs font-bold text-rose-400 uppercase tracking-widest">
            <Heart className="w-3 h-3" />
            Family Trust View
          </div>
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">Parent Portal</h2>
          <p className="text-muted-foreground font-medium">A transparent, read-only view for your family to stay updated on your journey.</p>
        </div>
        <Button 
          className="bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest rounded-xl shadow-xl shadow-rose-500/20 h-12 px-8 group relative overflow-hidden w-full md:w-auto"
          onClick={handleShare}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <Share2 className="w-4 h-4 mr-2" />
          Share Access
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white/[0.03] border-white/10 shadow-xl flex flex-col items-center text-center group">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
            <Target className="w-7 h-7" />
          </div>
          <h4 className="font-black uppercase tracking-widest text-[10px] text-white/40">Applications</h4>
          <p className="text-3xl font-black text-white mt-2">{apps.length}</p>
          <p className="text-[9px] text-indigo-400 uppercase font-black tracking-[0.2em] mt-1">Universities Tracked</p>
        </Card>
        
        <Card className="p-6 bg-white/[0.03] border-white/10 shadow-xl flex flex-col items-center text-center group">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-7 h-7" />
          </div>
          <h4 className="font-black uppercase tracking-widest text-[10px] text-white/40">Overall Progress</h4>
          <p className="text-3xl font-black text-white mt-2">{overallProgress}%</p>
          <p className="text-[9px] text-emerald-400 uppercase font-black tracking-[0.2em] mt-1">Journey Completed</p>
        </Card>

        <Card className="p-6 bg-white/[0.03] border-white/10 shadow-xl flex flex-col items-center text-center group">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
            <DollarSign className="w-7 h-7" />
          </div>
          <h4 className="font-black uppercase tracking-widest text-[10px] text-white/40">Financial Readiness</h4>
          <p className="text-3xl font-black text-white mt-2">Verified</p>
          <p className="text-[9px] text-orange-400 uppercase font-black tracking-[0.2em] mt-1">Poonawalla Fincorp Eligible</p>
        </Card>
      </div>

      <Card className="p-8 bg-white/[0.02] border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
           <Shield className="w-64 h-64" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-[0.2em] text-white/90 mb-8 flex items-center gap-3">
          <Calendar className="w-6 h-6 text-indigo-500" />
          Live Application Milestones
        </h3>
        
        <div className="space-y-8 relative z-10">
          {apps.length > 0 ? apps.map((app: any, i: number) => (
            <div key={app.id} className="relative pl-10 border-l border-white/10 pb-8 last:pb-0">
               <div className={`absolute left-[-11px] top-0 w-5 h-5 rounded-full border-4 border-[#0D0D1A] shadow-lg ${app.status === 'submitted' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-white/10'}`} />
               <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h4 className="font-black text-lg text-white uppercase tracking-tight">{app.university}</h4>
                    <p className="text-xs text-white/40 font-medium">{app.program}</p>
                  </div>
                  <div className={`text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-[0.2em] ${app.status === 'submitted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/20 border border-white/5'}`}>
                    {app.status === 'submitted' ? 'Milestone Reached' : 'In Progress'}
                  </div>
               </div>
            </div>
          )) : (
            <div className="text-center py-16 bg-white/5 rounded-3xl border border-dashed border-white/10">
               <p className="text-white/20 font-bold uppercase tracking-widest text-sm">No active milestones yet.</p>
            </div>
          )}
        </div>
      </Card>
      
      <div className="flex items-center gap-3 p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-xs text-indigo-400/80 font-bold uppercase tracking-widest">
        <Lock className="w-4 h-4" />
        This is a secure, read-only view. Family members cannot modify any application data.
      </div>
    </div>
  );
}
