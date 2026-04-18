import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowLeft, TrendingUp, DollarSign, Loader2, RefreshCw, Info } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getROIData, ROIData } from "@/lib/api";

const COUNTRIES = ["USA", "UK", "Canada", "Australia", "Germany", "Singapore", "India"];
const FIELDS = ["Computer Science", "AI / Machine Learning", "Data Science", "Electrical Engineering", "Business", "Biotechnology"];

function generateROIChart(roiData: ROIData, years: number) {
  const data = [];
  const totalCost = (roiData.tuition_per_year_usd + roiData.living_cost_per_year_usd) * 2;
  let cumulativeSalary = 0;

  for (let year = 0; year <= years; year++) {
    const cumulativeCost = totalCost;
    if (year >= 2) {
      const yearsWorking = year - 2;
      const salary = roiData.average_starting_salary_usd * Math.pow(1 + roiData.average_salary_growth_rate, yearsWorking);
      cumulativeSalary += salary;
    }
    data.push({
      year: `Y${year}`,
      "Total Cost": Math.round(totalCost),
      "Cumulative Salary": Math.round(cumulativeSalary),
      "Net ROI": Math.round(cumulativeSalary - totalCost),
    });
  }
  return data;
}

export function ROICalculator() {
  const navigate = useNavigate();

  // Load from Settings Profile
  const savedProfile = localStorage.getItem("edupilot-profile");
  const profile = savedProfile ? JSON.parse(savedProfile) : {};

  const [selectedCountry, setSelectedCountry] = useState(profile.country ? (profile.country === 'india' ? 'India' : (profile.country === 'uk' ? 'UK' : 'USA')) : "USA");
  const [selectedField, setSelectedField] = useState(profile.field || "Computer Science");
  const [timeHorizon, setTimeHorizon] = useState([10]);
  const [roiData, setRoiData] = useState<ROIData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadROI = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getROIData({ country: selectedCountry, field: selectedField, level: "Masters" });
      setRoiData(result);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load ROI data");
    } finally {
      setLoading(false);
    }
  }, [selectedCountry, selectedField]);

  useEffect(() => {
    loadROI();
  }, []);

  const chartData = roiData ? generateROIChart(roiData, timeHorizon[0]) : [];
  const lastPoint = chartData[chartData.length - 1];
  const breakEvenYear = chartData.findIndex(d => d["Net ROI"] >= 0);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 p-6">
        <Button variant="ghost" className="text-white/70 hover:text-white" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">ROI Calculator</h1>
          <p className="text-base md:text-xl text-white/60 mb-8">
            Real 2025 financial data — tuition, salaries, and growth rates from current market
          </p>
        </motion.div>

        {/* Country + Field Selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Country</label>
                <div className="grid grid-cols-3 gap-2">
                  {COUNTRIES.map(c => (
                    <button key={c} onClick={() => setSelectedCountry(c)}
                      className={`p-3 rounded-xl border text-sm transition font-medium ${selectedCountry === c
                        ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 text-white"
                        : "bg-white/5 border-white/10 hover:border-white/20 text-white/70"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 block">Field of Study</label>
                <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white">
                  {FIELDS.map(f => <option key={f} value={f} className="bg-[#0D0D1A]">{f}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={loadROI} disabled={loading} className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  {loading ? "Fetching..." : "Get Real Data"}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 text-green-400 animate-spin" />
            <p className="text-white/60 text-lg">Fetching 2025 salary & tuition data...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <Card className="p-8 bg-red-500/10 border-red-500/20 text-center mb-8">
            <p className="text-red-400 mb-4">⚠️ {error}</p>
            <Button onClick={loadROI} variant="outline">Retry</Button>
          </Card>
        )}

        {/* Data Display */}
        {roiData && !loading && (
          <>
            {/* Key Facts from AI */}
            {roiData.key_facts?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
                <Card className="p-6 bg-indigo-500/5 backdrop-blur-sm border-indigo-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-semibold text-white">Key Market Facts · {selectedCountry} {selectedField} 2025</span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    {roiData.key_facts.map((fact, i) => (
                      <div key={i} className="text-sm text-white/70 flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">•</span>{fact}
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 md:gap-6 mb-8">
              {[
                { label: "Annual Tuition", value: `$${(roiData.tuition_per_year_usd / 1000).toFixed(0)}K`, icon: DollarSign, color: "from-red-500/10 to-orange-500/10 border-red-500/20", iconColor: "text-red-400" },
                { label: "Annual Living Cost", value: `$${(roiData.living_cost_per_year_usd / 1000).toFixed(0)}K`, icon: DollarSign, color: "from-orange-500/10 to-yellow-500/10 border-orange-500/20", iconColor: "text-orange-400" },
                { label: "Avg Starting Salary", value: `$${(roiData.average_starting_salary_usd / 1000).toFixed(0)}K`, icon: TrendingUp, color: "from-green-500/10 to-emerald-500/10 border-green-500/20", iconColor: "text-green-400" },
                { label: "Break-Even Year", value: breakEvenYear >= 0 ? `Year ${breakEvenYear}` : "10Y+", icon: TrendingUp, color: "from-purple-500/10 to-pink-500/10 border-purple-500/20", iconColor: "text-purple-400" },
              ].map(({ label, value, icon: Icon, color, iconColor }, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                  <Card className={`p-6 bg-gradient-to-br ${color} backdrop-blur-sm`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                      </div>
                      <div>
                        <div className="text-sm text-white/60">{label}</div>
                        <div className="text-2xl font-bold text-white">{value}</div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="p-8 bg-white/5 backdrop-blur-sm border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Financial Time Machine</h3>
                    <p className="text-sm text-white/60">
                      {timeHorizon[0]}-year projection · {selectedField} in {selectedCountry} · Avg {(roiData.average_salary_growth_rate * 100).toFixed(0)}% annual salary growth
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/50 mb-1">Net ROI at Year {timeHorizon[0]}</div>
                    <div className={`text-2xl font-bold ${lastPoint?.["Net ROI"] >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {lastPoint ? `${lastPoint["Net ROI"] >= 0 ? "+" : ""}$${(lastPoint["Net ROI"] / 1000).toFixed(0)}K` : "—"}
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.6)' }} stroke="rgba(255,255,255,0.2)" />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.6)' }} stroke="rgba(255,255,255,0.2)"
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(20,20,35,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                      formatter={(v: any) => `$${(v / 1000).toFixed(1)}K`} />
                    <Legend wrapperStyle={{ color: '#fff' }} />
                    <Line type="monotone" dataKey="Total Cost" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 3 }} isAnimationActive={false} />
                    <Line type="monotone" dataKey="Cumulative Salary" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 3 }} isAnimationActive={false} />
                    <Line type="monotone" dataKey="Net ROI" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 3 }} strokeDasharray="5 5" isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-8">
                  <Label className="text-white/80 mb-4 block">Drag to adjust time horizon: {timeHorizon[0]} years</Label>
                  <Slider value={timeHorizon} onValueChange={setTimeHorizon} min={3} max={10} step={1} className="w-full" />
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-8">
              <Card className="p-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm border-amber-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Need Funding?</h3>
                    <p className="text-white/70">Get instant loan approval up to $100,000 with competitive rates from Poonawalla Fincorp</p>
                  </div>
                  <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8"
                    onClick={() => navigate('/loan-eligibility')}>
                    Check Eligibility
                  </Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}