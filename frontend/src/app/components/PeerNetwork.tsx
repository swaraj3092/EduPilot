import { motion } from "motion/react";
import { Users, UserCheck, MessageSquare, Globe, Target, Star, Shield, ArrowRight, UserPlus, Zap, Crown, Award } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";

const ALUMNI = [
  { name: "Rahul S.", uni: "Stanford University", course: "MS in CS", year: "Class of 2024", tags: ["SOP Help", "Visa Expert"], color: "from-indigo-500 to-blue-500" },
  { name: "Priya M.", uni: "Technical Univ Munich", course: "M.Eng Robotics", year: "Class of 2023", tags: ["German Visa", "Job Search"], color: "from-emerald-500 to-teal-500" },
  { name: "Anish K.", uni: "University of Toronto", course: "Data Science", year: "Class of 2025", tags: ["Funding", "Part-time"], color: "from-blue-500 to-cyan-500" },
  { name: "Sneha P.", uni: "Imperial College London", course: "Biotechnology", year: "Class of 2024", tags: ["Research", "SOP"], color: "from-pink-500 to-rose-500" },
];

const SQUADS = [
  { name: "GRE Warriors", members: 42, focus: "Verbal & Quant", icon: Zap, status: "Active", color: "text-orange-400" },
  { name: "SOP Review Squad", members: 128, focus: "Peer Review", icon: Shield, status: "High Energy", color: "text-indigo-400" },
  { name: "Visa Interview prep", members: 89, focus: "Mock Drills", icon: Target, status: "Crucial", color: "text-red-400" },
];

export function PeerNetwork() {
  const handleConnect = (name: string) => {
    toast.success(`Encrypted connection request sent to ${name}!`);
  };

  const handleJoinSquad = (name: string) => {
    toast.success(`Protocol initiated. You have joined the ${name}.`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-16 text-foreground">
      {/* Header Section */}
      <div className="text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-muted rounded-full border border-border text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6"
        >
          <Users className="w-3.5 h-3.5" />
          Neural Collaboration Grid
        </motion.div>
        <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/50 leading-none mb-6">
          Peer Network
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto font-bold uppercase text-[10px] tracking-widest leading-loose">
          Synchronize with elite alumni from target universities and join strategic squads to accelerate your global admission protocol.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20">
        {/* Alumni Mentors */}
        <div className="lg:col-span-8 space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-foreground/60 flex items-center gap-4">
              <Crown className="w-5 h-5 text-yellow-500" />
              Verified Alumni Mentors
            </h3>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent ml-8" />
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 gap-8"
          >
            {ALUMNI.map((alumni) => (
              <motion.div key={alumni.name} variants={itemVariants}>
                <Card className="p-8 bg-card border-border hover:border-indigo-500/50 transition-all duration-500 group relative overflow-hidden h-full flex flex-col rounded-[32px] shadow-2xl">
                  <div className={`absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br ${alumni.color} opacity-[0.03] group-hover:opacity-[0.08] blur-[80px] rounded-full transition-all duration-700 group-hover:scale-150`} />
                  
                  <div className="relative z-10 flex-1">
                    <div className="flex items-start gap-5 mb-8">
                      <div className={`w-16 h-16 rounded-[24px] bg-gradient-to-br ${alumni.color} p-[1px]`}>
                        <div className="w-full h-full rounded-[23px] bg-card flex items-center justify-center text-2xl font-black text-foreground">
                          {alumni.name.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-lg font-black text-foreground uppercase tracking-tight italic">{alumni.name}</h4>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">{alumni.year}</span>
                        </div>
                        <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-widest">{alumni.uni}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight mt-1">{alumni.course}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-10">
                      {alumni.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-muted border border-border text-[9px] font-black text-foreground/50 uppercase tracking-widest group-hover:border-indigo-500/30 group-hover:text-foreground transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full h-14 bg-muted hover:bg-indigo-600 border border-border hover:border-indigo-500 text-foreground font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all duration-500 group/btn"
                    onClick={() => handleConnect(alumni.name)}
                  >
                    <UserPlus className="w-4 h-4 mr-3 group-hover/btn:scale-110 transition-transform" />
                    Request Mentorship
                  </Button>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Study Squads Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-foreground/60">
              Active Squads
            </h3>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="space-y-6">
            {SQUADS.map((squad, i) => (
              <motion.div
                key={squad.name}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <Card className="p-6 bg-muted/50 border-border/50 hover:border-indigo-500/30 cursor-pointer group transition-all duration-500 rounded-[28px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-indigo-400 border border-border/50 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-all duration-500">
                      <squad.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-foreground group-hover:text-indigo-400 transition-colors uppercase tracking-widest">{squad.name}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">{squad.members} Active Users</span>
                        <span className={`text-[9px] font-black ${squad.color} uppercase italic tracking-tighter`}>{squad.status}</span>
                      </div>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-10 w-10 text-foreground/10 group-hover:text-foreground group-hover:bg-white/10 rounded-xl transition-all"
                      onClick={() => handleJoinSquad(squad.name)}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full h-14 border-dashed border-border bg-transparent text-muted-foreground hover:border-indigo-500/50 hover:text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px] rounded-[24px] transition-all group"
            >
              <UserPlus className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
              Initialize New Squad
            </Button>
          </div>

          <Card className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-[32px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                <Award className="w-5 h-5 text-foreground" />
              </div>
              <h4 className="text-sm font-black text-foreground uppercase tracking-widest mb-2 italic">Earn Recognition</h4>
              <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-widest leading-relaxed">
                Top contributors in the Peer Network earn exclusive badges and premium SOP audit tokens.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
