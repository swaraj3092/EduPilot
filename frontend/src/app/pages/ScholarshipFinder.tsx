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
      <nav className="relative z-10 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-white/70 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Award className="w-8 h-8 text-yellow-400" />
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Scholarship Finder
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
            AI-powered · Real data
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Filter Panel */}
        <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Find Scholarships for Your Profile</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">Country</label>
              <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white">
                {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#0D0D1A]">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">Field of Study</label>
              <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white">
                {FIELDS.map(f => <option key={f} value={f} className="bg-[#0D0D1A]">{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">Degree Level</label>
              <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white">
                {LEVELS.map(l => <option key={l} value={l} className="bg-[#0D0D1A]">{l}</option>)}
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
            <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border-yellow-500/20">
              <div className="text-sm text-white/60 mb-1">Total Found</div>
              <div className="text-4xl font-bold text-white">{filteredScholarships.length}</div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border-green-500/20">
              <div className="text-sm text-white/60 mb-1">High Match (90+)</div>
              <div className="text-4xl font-bold text-white">{filteredScholarships.filter(s => s.matchScore >= 90).length}</div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border-blue-500/20">
              <div className="text-sm text-white/60 mb-1">Avg Match Score</div>
              <div className="text-4xl font-bold text-white">
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
                  <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20 transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{scholarship.name}</h3>
                          {isUrgent && <span className="px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold">URGENT</span>}
                        </div>
                        <p className="text-white/60">{scholarship.provider}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white/50 mb-1">Match Score</div>
                        <div className="flex items-center gap-2">
                          <Progress value={scholarship.matchScore} className="h-2 w-24" />
                          <span className="text-2xl font-bold text-white">{scholarship.matchScore}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <div>
                          <div className="text-xs text-white/50">Amount</div>
                          <div className="text-sm font-semibold text-white">{scholarship.amount}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="text-xs text-white/50">Country</div>
                          <div className="text-sm font-semibold text-white">{scholarship.country}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-yellow-400" />
                        <div>
                          <div className="text-xs text-white/50">Deadline</div>
                          <div className={`text-sm font-semibold ${isUrgent ? 'text-red-400' : 'text-white'}`}>
                            {new Date(scholarship.deadline).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-white/50 mb-1">Days Left</div>
                        <div className={`text-sm font-bold ${daysLeft < 0 ? 'text-gray-400' : isUrgent ? 'text-red-400' : 'text-green-400'}`}>
                          {daysLeft < 0 ? 'Expired' : `${daysLeft} days`}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-white/50 mb-2">Eligible Fields</div>
                      <div className="flex flex-wrap gap-2">
                        {scholarship.fieldOfStudy.map((field, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs">{field}</span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-white/50 mb-2">Eligibility Requirements</div>
                      <div className="flex flex-wrap gap-2">
                        {scholarship.eligibility.map((req, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs">{req}</span>
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
                      <Button variant="outline" className="border-white/20 hover:bg-white/10">
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