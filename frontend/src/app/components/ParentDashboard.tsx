import { motion } from "motion/react";
import { Shield, Heart, Share2, Target, Calendar, CheckCircle2, TrendingUp, DollarSign } from "lucide-react";
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
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20 text-xs font-bold text-rose-400 uppercase tracking-widest">
            <Heart className="w-3 h-3" />
            Family Trust View
          </div>
          <h2 className="text-3xl font-black text-foreground italic tracking-tight">Parent Portal</h2>
          <p className="text-muted-foreground">A transparent, read-only view for your family to stay updated on your journey.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Access
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-card border-border shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
            <Target className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-foreground">Applications</h4>
          <p className="text-2xl font-black text-primary mt-1">{apps.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Universities Tracked</p>
        </Card>
        
        <Card className="p-6 bg-card border-border shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-foreground">Overall Progress</h4>
          <p className="text-2xl font-black text-primary mt-1">{overallProgress}%</p>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Journey Completed</p>
        </Card>

        <Card className="p-6 bg-card border-border shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-foreground">Financial Readiness</h4>
          <p className="text-2xl font-black text-primary mt-1">Verified</p>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Poonawalla Fincorp Eligible</p>
        </Card>
      </div>

      <Card className="p-8 bg-card border-border shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Shield className="w-32 h-32" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Live Application Milestones
        </h3>
        
        <div className="space-y-6">
          {apps.length > 0 ? apps.map((app: any, i: number) => (
            <div key={app.id} className="relative pl-8 border-l border-border pb-6 last:pb-0">
               <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2 border-card ${app.status === 'submitted' ? 'bg-green-500' : 'bg-muted'}`} />
               <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-foreground">{app.university}</h4>
                    <p className="text-xs text-muted-foreground">{app.program}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${app.status === 'submitted' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-muted text-muted-foreground'}`}>
                    {app.status === 'submitted' ? 'Milestone Reached' : 'In Progress'}
                  </span>
               </div>
            </div>
          )) : (
            <p className="text-center text-muted-foreground py-10">No active milestones yet.</p>
          )}
        </div>
      </Card>
      
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50 text-xs text-muted-foreground">
        <Shield className="w-4 h-4 text-primary" />
        This is a read-only view. Parents cannot edit or delete any data.
      </div>
    </div>
  );
}
