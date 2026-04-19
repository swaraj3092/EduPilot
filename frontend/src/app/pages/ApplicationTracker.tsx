import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Plus, Calendar, Upload, CheckCircle2, Clock,
  AlertCircle, FileText, GraduationCap, Trash2, Loader2, Sparkles, AlertTriangle,
  TrendingUp, Award, DollarSign
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Progress } from "@components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { generateApplicationTracker, AppTrackerResponse } from "@services";

type ApplicationStatus = "not-started" | "in-progress" | "submitted" | "decision";

interface Application {
  id: string;
  university: string;
  program: string;
  deadline: string;
  status: ApplicationStatus;
  documents: {
    name: string;
    uploaded: boolean;
  }[];
  notes: string;
}

const STATUS_CONFIG = {
  "not-started": { label: "Not Started", color: "bg-gray-500", icon: Clock },
  "in-progress": { label: "In Progress", color: "bg-yellow-500", icon: AlertCircle },
  "submitted": { label: "Submitted", color: "bg-blue-500", icon: Upload },
  "decision": { label: "Decision", color: "bg-green-500", icon: CheckCircle2 },
};

export function ApplicationTracker() {
  const navigate = useNavigate();

  // Load from local storage or start empty
  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem("edupilot-apps");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // Persist applications to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("edupilot-apps", JSON.stringify(applications));
  }, [applications]);

  const [isAdding, setIsAdding] = useState(false);
  const [newUni, setNewUni] = useState("");
  const [newProgram, setNewProgram] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const calculateProgress = (docs: Application["documents"]) => {
    if (docs.length === 0) return 0;
    const uploaded = docs.filter(d => d.uploaded).length;
    return Math.round((uploaded / docs.length) * 100);
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    const deadline = new Date(dateStr);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const toggleDocument = (appId: string, docIndex: number) => {
    setApplications(apps => apps.map(app => {
      if (app.id !== appId) return app;
      const newDocs = [...app.documents];
      newDocs[docIndex] = { ...newDocs[docIndex], uploaded: !newDocs[docIndex].uploaded };
      
      // Auto-update status based on progress
      const progress = calculateProgress(newDocs);
      let newStatus = app.status;
      if (progress > 0 && app.status === "not-started") newStatus = "in-progress";
      
      return { ...app, documents: newDocs, status: newStatus };
    }));
  };

  const updateStatus = (appId: string, newStatus: ApplicationStatus) => {
    setApplications(apps => apps.map(app => 
      app.id === appId ? { ...app, status: newStatus } : app
    ));
  };

  const deleteApplication = (appId: string) => {
    setApplications(apps => apps.filter(app => app.id !== appId));
    setDeleteConfirm(null);
  };

  const handleAddSubmit = async () => {
    if (!newUni || !newProgram) return;
    setAddLoading(true);
    setAddError(null);
    try {
      const response = await generateApplicationTracker({ university: newUni, program: newProgram });
      const newApp: Application = {
        id: Date.now().toString(),
        university: newUni,
        program: newProgram,
        deadline: response.tracker.deadline || "2025-12-01",
        status: "not-started",
        documents: response.tracker.documents || [],
        notes: response.tracker.notes || ""
      };
      setApplications(prev => [newApp, ...prev]);
      setIsAdding(false);
      setNewUni("");
      setNewProgram("");
    } catch (err: any) {
      setAddError(err?.message || "Failed to generate tracker. Please try again.");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      {/* Header */}
      <nav className="relative z-10 backdrop-blur-xl bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">Application Tracker</h1>
              <p className="text-sm text-muted-foreground font-medium">Manage your university applications · AI Generated Checklists</p>
            </div>
          </div>
          
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add Application</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background/95 backdrop-blur-2xl border border-border text-foreground">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Smart Doc Assistant
                </DialogTitle>
                <p className="text-muted-foreground text-sm mt-2">
                  Our AI will scan the {newUni || 'University'} database to fetch the exact 2026/27 requirements and auto-fill your tracker checklist.
                </p>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">University Name</label>
                  <Input 
                    placeholder="e.g. MIT, IIT Bombay" 
                    value={newUni}
                    onChange={(e) => setNewUni(e.target.value)}
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Program Name</label>
                  <Input 
                    placeholder="e.g. MS in Computer Science" 
                    value={newProgram}
                    onChange={(e) => setNewProgram(e.target.value)}
                    className="bg-input border-border text-foreground"
                  />
                </div>
                
                {addError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{addError}</span>
                  </div>
                )}
                
                <Button 
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 mt-4"
                  onClick={handleAddSubmit}
                  disabled={!newUni || !newProgram || addLoading}
                >
                  {addLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gathering University Data...</>
                  ) : (
                    "Generate Application Profile"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-card backdrop-blur-xl border-border shadow-sm">
            <div className="text-muted-foreground text-sm mb-1">Total Apps</div>
            <div className="text-3xl font-bold text-foreground">{applications.length}</div>
          </Card>
          <Card className="p-6 bg-card backdrop-blur-xl border-border shadow-sm">
            <div className="text-muted-foreground text-sm mb-1">In Progress</div>
            <div className="text-3xl font-bold text-yellow-500">
              {applications.filter(a => a.status === "in-progress").length}
            </div>
          </Card>
          <Card className="p-6 bg-card backdrop-blur-xl border-border shadow-sm">
            <div className="text-muted-foreground text-sm mb-1">Submitted</div>
            <div className="text-3xl font-bold text-blue-500">
              {applications.filter(a => a.status === "submitted").length}
            </div>
          </Card>
          <Card className="p-6 bg-green-500/10 backdrop-blur-xl border-green-500/20 shadow-sm shadow-green-500/5">
            <div className="text-green-600 text-sm mb-1">Decisions</div>
            <div className="text-3xl font-bold text-green-500">
              {applications.filter(a => a.status === "decision").length}
            </div>
          </Card>
        </div>

        {/* Empty State */}
        {applications.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
              <GraduationCap className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Applications Yet</h2>
            <p className="text-white/60 max-w-md mx-auto mb-8">
              Start tracking your university applications. Add a university and our AI will automatically fetch the deadline and required documents for your program!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left mt-12">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2 text-indigo-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Trending Now</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Singapore Hub</h4>
                <p className="text-[10px] text-white/50 leading-relaxed">35% increase in STEM applications to NUS and NTU for 2026/27.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                  <Award className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Scholarship Alert</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">DAAD Germany</h4>
                <p className="text-[10px] text-white/50 leading-relaxed">New merit-based grants for Indian postgraduates announced today.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2 text-orange-400">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Finance Trend</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Interest Rate Drop</h4>
                <p className="text-[10px] text-white/50 leading-relaxed">Average education loan rates for US-bound students fell to 8.9%.</p>
              </div>
            </div>

            <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white mt-10 shadow-lg shadow-indigo-500/20" onClick={() => setIsAdding(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Application
            </Button>
          </div>
        )}

        {/* Applications List */}
        <div className="space-y-6">
          <AnimatePresence>
            {applications.map((app) => {
              const progress = calculateProgress(app.documents);
              const daysLeft = getDaysUntil(app.deadline);
              const isUrgent = daysLeft >= 0 && daysLeft <= 14 && app.status !== "submitted" && app.status !== "decision";
              const StatusIcon = STATUS_CONFIG[app.status].icon;

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`p-6 backdrop-blur-xl border shadow-sm ${
                    isUrgent ? 'bg-red-500/5 border-red-500/20 shadow-red-500/5' : 'bg-card border-border'
                  }`}>
                    <div className="flex flex-col lg:flex-row gap-6">
                      
                      {/* Left Column: Info & Status */}
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-2xl font-bold text-foreground">{app.university}</h3>
                              {isUrgent && (
                                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/30">
                                  Urgent
                                </span>
                              )}
                            </div>
                            <p className="text-indigo-300 font-medium">{app.program}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={app.status}
                              onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                              className={`text-sm px-3 py-1.5 rounded-lg border appearance-none outline-none font-medium cursor-pointer ${
                                app.status === "not-started" ? "bg-gray-500/20 text-gray-300 border-gray-500/30" :
                                app.status === "in-progress" ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" :
                                app.status === "submitted" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
                                "bg-green-500/20 text-green-400 border-green-500/30"
                              }`}
                            >
                              <option value="not-started" className="bg-card text-foreground">Not Started</option>
                              <option value="in-progress" className="bg-card text-foreground">In Progress</option>
                              <option value="submitted" className="bg-card text-foreground">Submitted</option>
                              <option value="decision" className="bg-card text-foreground">Decision</option>
                            </select>

                            {deleteConfirm === app.id ? (
                              <div className="flex items-center gap-2 ml-2">
                                <Button size="sm" variant="destructive" onClick={() => deleteApplication(app.id)}>
                                  Confirm
                                </Button>
                                <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setDeleteConfirm(null)}>
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-muted-foreground/40 hover:text-red-400 hover:bg-red-400/10 ml-2"
                                onClick={() => setDeleteConfirm(app.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2 text-foreground/80">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>Deadline: <strong className="text-foreground">{new Date(app.deadline).toLocaleDateString()}</strong></span>
                          </div>
                          <div className={`flex items-center gap-2 ${
                            daysLeft < 0 ? 'text-gray-400' :
                            daysLeft <= 14 ? 'text-red-400 font-bold' : 
                            'text-green-400'
                          }`}>
                            <Clock className="w-4 h-4" />
                            <span>
                              {daysLeft < 0 ? 'Passed' :
                               daysLeft === 0 ? 'Today' :
                               `${daysLeft} days left`}
                            </span>
                          </div>
                        </div>

                        {app.notes && (
                          <div className="p-3 bg-muted rounded-lg border border-border text-sm text-muted-foreground italic">
                            <strong>AI Note: </strong> {app.notes}
                          </div>
                        )}
                        
                        <div className="pt-2">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Application Progress</span>
                            <span className="text-foreground font-bold">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>

                      {/* Right Column: Document Checklist */}
                      <div className="flex-1 lg:pl-6 lg:border-l border-border/50">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Required Documents
                            </h4>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 text-[10px] bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20"
                              onClick={() => {
                                // Simulate AI Auto-fill
                                setApplications(apps => apps.map(a => {
                                  if (a.id !== app.id) return a;
                                  return {
                                    ...a,
                                    documents: a.documents.map(d => ({ ...d, uploaded: true }))
                                  };
                                }));
                              }}
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              Magic Prep
                            </Button>
                          </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {app.documents.map((doc, idx) => (
                            <div 
                              key={idx}
                              onClick={() => toggleDocument(app.id, idx)}
                              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                                doc.uploaded 
                                  ? 'bg-green-500/10 border-green-500/20 shadow-sm shadow-green-500/5' 
                                  : 'bg-muted/30 border-border hover:border-primary/30 hover:bg-muted font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                  doc.uploaded ? 'border-green-400 bg-green-400/20 text-green-400 font-bold' : 'border-border text-transparent'
                                }`}>
                                  <CheckCircle2 className="w-3 h-3" />
                                </div>
                                <span className={`text-sm ${doc.uploaded ? 'text-muted-foreground line-through opacity-60' : 'text-foreground'}`}>
                                  {doc.name}
                                </span>
                              </div>
                              <span className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground/60 uppercase text-[10px] tracking-tight">
                                {doc.uploaded ? 'Ready' : 'Pending'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      
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