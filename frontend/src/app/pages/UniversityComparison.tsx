import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, X, Check, TrendingUp, DollarSign, Users, Award, MapPin, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { compareUniversities, UniversityData } from "@services";

const POPULAR_UNIVERSITIES = [
  "MIT", "Stanford", "Harvard", "Carnegie Mellon", "UC Berkeley",
  "Oxford", "Cambridge", "ETH Zurich", "NUS Singapore", "University of Toronto",
  "Imperial College London", "Caltech", "Georgia Tech", "University of Michigan",
  "IIT Bombay", "IIT Delhi", "IIT Madras", "IISc Bangalore", "BITS Pilani",
  "NIT Trichy", "NIT Surathkal", "KIIT University", "ITER (SOA University)", "VIT Vellore"
];

const FIELDS = ["Computer Science", "AI / Machine Learning", "Data Science", "Electrical Engineering", "Business", "Robotics"];

export function UniversityComparison() {
  const navigate = useNavigate();
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [selectedField, setSelectedField] = useState("Computer Science");
  const [universities, setUniversities] = useState<UniversityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("edupilot-profile");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserProfile(parsed);
      if (parsed.field) setSelectedField(parsed.field);
    }
  }, []);

  const loadComparison = useCallback(async () => {
    if (selectedNames.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const result = await compareUniversities({ names: selectedNames, field: selectedField });
      setUniversities(result.universities || []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load university data");
    } finally {
      setLoading(false);
    }
  }, [selectedNames, selectedField]);

  const addUniversity = (name: string) => {
    if (selectedNames.length < 4 && !selectedNames.includes(name)) {
      setSelectedNames([...selectedNames, name]);
    }
  };

  const removeUniversity = (name: string) => {
    setSelectedNames(selectedNames.filter(n => n !== name));
    setUniversities(universities.filter(u => u.name !== name));
  };

  // Personalized Suggestions
  const getSuggestions = () => {
    let list = [...POPULAR_UNIVERSITIES];
    // If user has a specific country, prioritize it
    if (userProfile?.country) {
      // Very simple mock logic: if country is USA, put USA schools first
      list.sort((a, b) => {
        const aIsMatch = a.includes("IIT") || a.includes("BITS") || a.includes("NIT") ? "India" : "USA";
        const bIsMatch = b.includes("IIT") || b.includes("BITS") || b.includes("NIT") ? "India" : "USA";
        if (aIsMatch === userProfile.country && bIsMatch !== userProfile.country) return -1;
        if (bIsMatch === userProfile.country && aIsMatch !== userProfile.country) return 1;
        return 0;
      });
    }
    return list.filter(u => !selectedNames.includes(u) && u.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const availableUniversities = getSuggestions();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <nav className="relative z-10 backdrop-blur-xl bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                University Comparison
              </h1>
              <p className="text-sm text-muted-foreground font-medium">AI-powered real data · Compare up to 4 universities</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)}
              className="px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm font-medium">
              {FIELDS.map(f => <option key={f} value={f} className="bg-card text-foreground">{f}</option>)}
            </select>
            <Button onClick={loadComparison} disabled={loading || selectedNames.length < 2}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
              <span className="ml-2 hidden sm:inline">
                {loading ? "Fetching..." : universities.length > 0 ? "Update Data" : "Compare Now"}
              </span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Personalized Welcome */}
        {!loading && universities.length === 0 && (
          <div className="text-center mb-10 py-12 border-b border-border/50">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {userProfile?.name?.split(' ')[0] || 'Student'}!
            </h2>
            <p className="text-muted-foreground font-medium italic">
              Based on your interest in **{selectedField}**, pick at least 2 universities below to see 
              the latest **2026/27** data and ROI analysis.
            </p>
          </div>
        )}
        {selectedNames.length < 4 && (
          <Card className="p-6 bg-card backdrop-blur-xl border-border mb-8 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <Plus className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Add University to Compare</h3>
              <span className="text-sm text-muted-foreground font-medium">{selectedNames.length}/4 selected</span>
            </div>
            <Input placeholder="Search universities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4 bg-input border-border text-foreground" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableUniversities.slice(0, 8).map((name) => (
                <button key={name} onClick={() => { addUniversity(name); setSearchQuery(""); }}
                  className="p-3 rounded-xl bg-muted border border-border hover:border-primary/50 hover:bg-card transition text-left shadow-sm">
                  <div className="text-foreground font-bold text-sm">{name}</div>
                </button>
              ))}
              
              {searchQuery && !availableUniversities.some(u => u.toLowerCase() === searchQuery.toLowerCase()) && (
                <button onClick={() => { addUniversity(searchQuery); setSearchQuery(""); }}
                  className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/20 transition text-left">
                  <div className="text-indigo-300 font-semibold text-sm">Add "{searchQuery}"</div>
                </button>
              )}
            </div>
            {selectedNames.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                {selectedNames.map(name => (
                  <div key={name} className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                    <span className="text-primary font-bold text-sm">{name}</span>
                    <button onClick={() => removeUniversity(name)} className="text-primary hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
            <p className="text-white/60 text-lg">Fetching real university data from AI...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <Card className="p-8 bg-red-500/10 border-red-500/20 text-center">
            <p className="text-red-400 mb-4">⚠️ {error}</p>
            <Button onClick={loadComparison} variant="outline">Retry</Button>
          </Card>
        )}

        {/* Comparison Table */}
        {!loading && !error && universities.length > 0 && (
          <div className="overflow-x-auto">
            <div className="grid gap-6 min-w-[600px]" style={{ gridTemplateColumns: `200px repeat(${universities.length}, 1fr)` }}>
              {/* Labels column */}
              <div className="space-y-4">
                <div className="h-32" />
                {[
                  { label: "Location", icon: MapPin },
                  { label: "World Ranking", icon: Award },
                  { label: "Annual Tuition", icon: DollarSign },
                  { label: "Acceptance Rate", icon: Users },
                  { label: "Avg Starting Salary", icon: TrendingUp },
                  { label: "Est. 5-Year ROI", icon: TrendingUp },
                  { label: "Total Students", icon: Users },
                  { label: "Program Duration", icon: Award },
                ].map((cat) => (
                  <Card key={cat.label} className="p-4 bg-muted/50 backdrop-blur-xl border-border h-20 flex items-center shadow-sm">
                    <div className="flex items-center gap-3">
                      <cat.icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">{cat.label}</span>
                    </div>
                  </Card>
                ))}
                <Card className="p-4 bg-muted/50 backdrop-blur-xl border-border min-h-32 flex items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">Key Highlights</span>
                  </div>
                </Card>
              </div>

              {/* University columns */}
              {universities.map((uni, idx) => (
                <motion.div key={uni.id ?? idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }} className="space-y-4">
                  <Card className="p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 backdrop-blur-xl border-primary/20 h-32 relative shadow-md">
                    <button onClick={() => removeUniversity(uni.name)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-foreground/5 hover:bg-red-500/20 flex items-center justify-center transition">
                      <X className="w-3 h-3 text-foreground/40 hover:text-red-500" />
                    </button>
                    <h3 className="text-xl font-bold text-foreground mb-1">{uni.name}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{uni.location}</p>
                  </Card>
                  {[uni.location, uni.ranking, uni.tuition, uni.acceptance, uni.avgSalary, uni.roi, uni.students, uni.programDuration].map((val, vi) => (
                    <Card key={vi} className="p-4 bg-card backdrop-blur-xl border-border h-20 flex items-center justify-center shadow-sm">
                      <span className={`font-bold text-center ${vi === 1 ? 'text-primary text-2xl' : vi === 4 || vi === 5 ? 'text-green-600' : 'text-foreground'}`}>{val}</span>
                    </Card>
                  ))}
                  <Card className="p-4 bg-card backdrop-blur-xl border-border min-h-32 shadow-sm">
                    <ul className="space-y-2">
                      {(uni.highlights || []).map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground font-medium">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}