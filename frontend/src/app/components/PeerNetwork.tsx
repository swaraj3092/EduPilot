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
    <div className="max-w-6xl mx-auto py-4 space-y-12 text-foreground">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">
          <Users className="w-3 h-3" />
          Collaborative Hub
        </div>
        <h2 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">Peer Network</h2>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto font-medium text-xs sm:text-sm">Connect with alumni who have already walked the path and join squads to accelerate your journey.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        {/* Alumni Mentors */}
        <div className="lg:col-span-2 space-y-8">
          <h3 className="text-xl font-black uppercase tracking-[0.2em] text-white/90 flex items-center gap-3">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            Elite Alumni Mentors
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {ALUMNI.map((alumni, i) => (
              <motion.div
                key={alumni.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 bg-white/[0.03] border-white/10 hover:border-indigo-500/40 transition-all group relative overflow-hidden h-full flex flex-col justify-between">
                  <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${alumni.color}-500/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700`} />
                  <div className="relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-black text-indigo-400 shadow-inner">
                        {alumni.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-white truncate">{alumni.name}</h4>
                          <span className="text-[9px] font-black text-white/40 uppercase whitespace-nowrap">{alumni.year}</span>
                        </div>
                        <p className="text-[10px] text-white/40 font-medium truncate mb-4 italic">{alumni.course}</p>
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {alumni.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[8px] font-black text-white/60 uppercase tracking-widest">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full h-10 text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 border-white/10 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all relative z-10"
                    onClick={() => handleConnect(alumni.name)}
                  >
                    <UserPlus className="w-3 h-3 mr-2" />
                    Request Mentorship
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Study Squads Sidebar */}
        <div className="space-y-8">
          <h3 className="text-xl font-black uppercase tracking-[0.2em] text-white/90 flex items-center gap-3">
            <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500/20" />
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
                <Card className="p-5 bg-white/[0.02] border-white/5 hover:border-white/20 cursor-pointer group transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400 border border-white/5 group-hover:scale-110 transition-transform">
                      <squad.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-white/90 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{squad.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-white/30 font-bold">{squad.members} members</span>
                        <span className="text-[10px] font-black text-indigo-400 uppercase italic tracking-tighter">{squad.status}</span>
                      </div>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-white/20 hover:text-white hover:bg-white/10"
                      onClick={() => handleJoinSquad(squad.name)}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
            <Button variant="outline" className="w-full h-12 border-dashed border-white/10 bg-transparent text-white/40 hover:border-white/40 hover:text-white font-bold uppercase tracking-widest text-[10px]">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Study Squad
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
