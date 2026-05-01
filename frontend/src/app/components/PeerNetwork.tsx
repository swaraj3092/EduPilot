import { motion } from "motion/react";
import { Users, UserCheck, MessageSquare, Globe, Target, Star, Shield, ArrowRight, UserPlus, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";

const ALUMNI = [
  { name: "Rahul S.", uni: "Stanford University", course: "MS in CS", year: "Class of 2024", tags: ["SOP Help", "Visa Expert"], color: "indigo" },
  { name: "Priya M.", uni: "Technical Univ Munich", course: "M.Eng Robotics", year: "Class of 2023", tags: ["German Visa", "Job Search"], color: "emerald" },
  { name: "Anish K.", uni: "University of Toronto", course: "Data Science", year: "Class of 2025", tags: ["Funding", "Part-time"], color: "blue" },
  { name: "Sneha P.", uni: "Imperial College London", course: "Biotechnology", year: "Class of 2024", tags: ["Research", "SOP"], color: "pink" },
];

const SQUADS = [
  { name: "GRE Warriors", members: 42, focus: "Verbal & Quant", icon: Zap, status: "Active" },
  { name: "SOP Review Squad", members: 128, focus: "Peer Review", icon: Shield, status: "High Energy" },
  { name: "Visa Interview prep", members: 89, focus: "Mock Drills", icon: Target, status: "Crucial" },
];

export function PeerNetwork() {
  const handleConnect = (name: string) => {
    toast.success(`Connection request sent to ${name}!`);
  };

  const handleJoinSquad = (name: string) => {
    toast.success(`Welcome to the ${name}!`);
  };

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-12">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest mb-4">
          <Users className="w-3 h-3" />
          Collaborative Hub
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-foreground italic tracking-tight">Peer Network</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Connect with alumni who have already walked the path and join squads to accelerate your journey.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alumni Mentors */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            Elite Alumni Mentors
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {ALUMNI.map((alumni, i) => (
              <motion.div
                key={alumni.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 bg-card/40 border-border/40 hover:border-primary/30 transition-all group relative overflow-hidden">
                  <div className={`absolute -top-10 -right-10 w-24 h-24 bg-${alumni.color}-500/10 blur-3xl rounded-full group-hover:scale-150 transition-transform`} />
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-xl font-bold text-primary">
                      {alumni.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-foreground">{alumni.name}</h4>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{alumni.year}</span>
                      </div>
                      <p className="text-xs text-primary font-bold mt-1">{alumni.uni}</p>
                      <p className="text-[10px] text-muted-foreground mb-3">{alumni.course}</p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {alumni.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-muted border border-border/50 text-[9px] font-bold text-muted-foreground uppercase tracking-tight">{tag}</span>
                        ))}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full h-8 text-[10px] font-bold uppercase tracking-widest border-border/40 hover:bg-primary hover:text-primary-foreground transition-all"
                        onClick={() => handleConnect(alumni.name)}
                      >
                        <UserPlus className="w-3 h-3 mr-2" />
                        Request Mentorship
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Study Squads Sidebar */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary fill-primary/20" />
            Study Squads
          </h3>
          <div className="space-y-4">
            {SQUADS.map((squad, i) => (
              <motion.div
                key={squad.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <Card className="p-4 bg-gradient-to-br from-indigo-500/5 to-transparent border-border/40 hover:border-indigo-500/30 cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <squad.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{squad.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">{squad.members} members</span>
                        <span className="text-[10px] font-black text-indigo-400 uppercase italic">{squad.status}</span>
                      </div>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => handleJoinSquad(squad.name)}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
            <Button variant="outline" className="w-full border-dashed border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Study Squad
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
