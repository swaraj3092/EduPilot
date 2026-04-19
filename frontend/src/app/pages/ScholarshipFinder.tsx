import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowLeft, Search, Filter, DollarSign, Calendar, Award, ExternalLink, Bell, Loader2, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { findScholarships, Scholarship } from "@services";

const COUNTRIES = ["USA", "UK", "Canada", "Australia", "Germany", "Singapore", "Europe", "India"];
const FIELDS = ["Computer Science", "Engineering", "Business", "Data Science", "Biotechnology", "Medicine", "Arts", "Economics"];
const LEVELS = ["Masters", "PhD", "Bachelors"];

export function ScholarshipFinder() {
  const navigate = useNavigate();

  // Load from Settings Profile if available
  const savedProfile = localStorage.getItem("edupilot-profile");
  const profile = savedProfile ? JSON.parse(savedProfile) : {};

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCountry, setSelectedCountry] = useState(profile.country ? (profile.country === 'india' ? 'India' : (profile.country === 'uk' ? 'UK' : 'USA')) : "USA");
  const [selectedField, setSelectedField] = useState(profile.field || "Computer Science");
  const [selectedLevel, setSelectedLevel] = useState(profile.level ? (profile.level === 'bachelor' ? 'Bachelors' : (profile.level === 'phd' ? 'PhD' : 'Masters')) : "Masters");

  const loadScholarships = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await findScholarships({
        country: selectedCountry,
        field_of_study: selectedField,
        level: selectedLevel,
        nationality: "Indian",
      });
      setScholarships(result.scholarships || []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load scholarships");
    } finally {
      setLoading(false);
    }
  }, [selectedCountry, selectedField, selectedLevel]);

  // Removed useEffect so it doesn't auto-search on mount
  // User must manually click 'Find Scholarships'

  const filteredScholarships = scholarships.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    return Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header */}
      <nav className="relative z-10 backdrop-blur-xl bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Award className="w-8 h-8 text-yellow-500" />
              <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent italic">
                Scholarship Finder
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
            AI-powered · Real-time
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Filter Panel */}
        <Card className="p-6 bg-card backdrop-blur-xl border-border mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Find Scholarships for Your Profile</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">Country</label>
              <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground font-medium">
                {COUNTRIES.map(c => <option key={c} value={c} className="bg-card text-foreground">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">Field of Study</label>
              <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground font-medium">
                {FIELDS.map(f => <option key={f} value={f} className="bg-card text-foreground">{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">Degree Level</label>
              <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground font-medium">
                {LEVELS.map(l => <option key={l} value={l} className="bg-card text-foreground">{l}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={loadScholarships} disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                {loading ? "Searching..." : "Find Scholarships"}
              </Button>
            </div>
          </div>
          {scholarships.length > 0 && (
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input placeholder="Filter results..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white" />
            </div>
          )}
        </Card>

        {/* Stats */}
        {scholarships.length > 0 && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border-yellow-500/20 shadow-sm">
              <div className="text-sm text-muted-foreground font-medium mb-1">Total Found</div>
              <div className="text-4xl font-bold text-foreground">{filteredScholarships.length}</div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border-green-500/20 shadow-sm">
              <div className="text-sm text-muted-foreground font-medium mb-1">High Match (90+)</div>
              <div className="text-4xl font-bold text-foreground">{filteredScholarships.filter(s => s.matchScore >= 90).length}</div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border-blue-500/20 shadow-sm">
              <div className="text-sm text-muted-foreground font-medium mb-1">Avg Match Score</div>
              <div className="text-4xl font-bold text-foreground">
                {filteredScholarships.length > 0 ? Math.round(filteredScholarships.reduce((a, s) => a + s.matchScore, 0) / filteredScholarships.length) : 0}%
              </div>
            </Card>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
            <p className="text-white/60 text-lg">Scanning real-world scholarship databases...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <Card className="p-8 bg-red-500/10 border-red-500/20 text-center">
            <p className="text-red-400 mb-4">⚠️ {error}</p>
            <Button onClick={loadScholarships} variant="outline" className="border-red-500/40">Retry</Button>
          </Card>
        )}

        {/* Scholarship Cards */}
        {!loading && !error && filteredScholarships.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{filteredScholarships.length} Scholarships Found</h2>
              <span className="text-sm text-white/60">Sorted by match score · AI-generated real data</span>
            </div>
            {[...filteredScholarships].sort((a, b) => b.matchScore - a.matchScore).map((scholarship, i) => {
              const daysLeft = getDaysUntilDeadline(scholarship.deadline);
              const isUrgent = daysLeft < 30 && daysLeft > 0;
              return (
                <motion.div key={scholarship.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-6 bg-card backdrop-blur-xl border-border hover:border-primary/20 transition shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-foreground">{scholarship.name}</h3>
                          {isUrgent && <span className="px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-500 text-[10px] font-black italic tracking-tighter">URGENT</span>}
                        </div>
                        <p className="text-muted-foreground font-medium">{scholarship.provider}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Match Score</div>
                        <div className="flex items-center gap-2">
                          <Progress value={scholarship.matchScore} className="h-2 w-24" />
                          <span className="text-2xl font-black text-foreground">{scholarship.matchScore}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <div>
                          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Amount</div>
                          <div className="text-sm font-bold text-foreground">{scholarship.amount}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Country</div>
                          <div className="text-sm font-bold text-foreground">{scholarship.country}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-yellow-400" />
                        <div>
                          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Deadline</div>
                          <div className={`text-sm font-bold ${isUrgent ? 'text-red-500' : 'text-foreground'}`}>
                            {new Date(scholarship.deadline).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Days Left</div>
                        <div className={`text-sm font-black ${daysLeft < 0 ? 'text-gray-400' : isUrgent ? 'text-red-500' : 'text-green-600'}`}>
                          {daysLeft < 0 ? 'Expired' : `${daysLeft} days`}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-2">Eligible Fields</div>
                      <div className="flex flex-wrap gap-2">
                        {scholarship.fieldOfStudy.map((field, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-tight">{field}</span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-2">Eligibility Requirements</div>
                      <div className="flex flex-wrap gap-2">
                        {scholarship.eligibility.map((req, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-lg bg-muted border border-border text-muted-foreground text-[10px] font-medium">{req}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                        onClick={() => scholarship.link && scholarship.link !== "#" && window.open(scholarship.link, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Apply Now
                      </Button>
                      <Button variant="outline" className="border-border hover:bg-muted font-bold text-muted-foreground">
                        <Bell className="w-4 h-4 mr-2" />
                        Set Alert
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}