import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ChevronRight, User, MapPin, DollarSign, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { updateProfile } from "../../lib/api";

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem("edupilot-user") || "{}");
    const savedProfile = JSON.parse(localStorage.getItem("edupilot-profile") || "{}");
    return {
      name: savedProfile.full_name || savedUser.name || "",
      role: savedProfile.degree_level || "",
      destination: savedProfile.target_country || "",
      field: savedProfile.target_field || "",
      budget: "",
    };
  });

  const handleNext = async () => {
    if (step === 3) {
      setIsLoading(true);
      try {
        const authUser = JSON.parse(localStorage.getItem("edupilot-user") || "{}");
        
        // Save to real database
        await updateProfile({
          user_id: authUser.id,
          full_name: formData.name,
          target_country: formData.destination,
          target_field: formData.field,
          degree_level: formData.role,
        });

        // Update local cache
        const profile = {
          name: formData.name,
          email: authUser.email,
          country: formData.destination.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim(), 
          level: formData.role,
          field: formData.field 
        };
        localStorage.setItem('edupilot-profile', JSON.stringify(profile));
        
        navigate('/dashboard');
      } catch (err) {
        alert("Failed to save profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-start md:items-center justify-center p-4 md:p-6 pb-32 md:pb-32">
      <div className="relative z-10 w-full max-w-5xl py-2 md:py-4">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/50">Step {step} of 3</span>
            <span className="text-xs text-white/50">{Math.round((step / 3) * 100)}% Complete</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              initial={{ width: "33%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Bento Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Step 1 Card */}
          <motion.div
            className={`p-6 rounded-3xl backdrop-blur-xl transition-all ${
              step === 1
                ? "col-span-3 bg-white/10 border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20"
                : "col-span-1 bg-white/5 border border-white/10 opacity-50"
            }`}
            layout
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Who are you?</h3>
                <p className="text-sm text-white/60">Tell us about yourself</p>
              </div>
            </div>

            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <Label className="text-white/80 mb-2 block">Full Name</Label>
                  <Input
                    placeholder="John Doe"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-white/80 mb-2 block">I am a...</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {["High School Student", "Undergraduate", "Graduate", "Working Professional"].map((role) => (
                      <button
                        key={role}
                        onClick={() => setFormData({ ...formData, role })}
                        className={`p-3 md:p-4 rounded-xl border transition ${
                          formData.role === role
                            ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/50"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <span className="text-white text-xs md:text-sm">{role}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Step 2 Card */}
          <motion.div
            className={`p-6 rounded-3xl backdrop-blur-xl transition-all ${
              step === 2
                ? "col-span-3 bg-white/10 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20"
                : "col-span-1 bg-white/5 border border-white/10 opacity-50"
            }`}
            layout
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Where do you want to study?</h3>
                <p className="text-sm text-white/60">Choose your dream destinations</p>
              </div>
            </div>

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <Label className="text-white/80 mb-2 block">Preferred Countries</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {["USA 🇺🇸", "UK 🇬🇧", "Canada 🇨🇦", "Australia 🇦🇺", "Germany 🇩🇪", "Singapore 🇸🇬"].map((country) => (
                      <button
                        key={country}
                        onClick={() => setFormData({ ...formData, destination: country })}
                        className={`p-4 rounded-xl border transition ${
                          formData.destination === country
                            ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <span className="text-white text-sm">{country}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-white/80 mb-2 block">Field of Study</Label>
                  <Input
                    placeholder="e.g., Computer Science, Business, Medicine"
                    value={formData.field}
                    onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Step 3 Card */}
          <motion.div
            className={`p-6 rounded-3xl backdrop-blur-xl transition-all ${
              step === 3
                ? "col-span-3 bg-white/10 border-2 border-pink-500/50 shadow-lg shadow-pink-500/20"
                : "col-span-1 bg-white/5 border border-white/10 opacity-50"
            }`}
            layout
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">What's your budget?</h3>
                <p className="text-sm text-white/60">Help us find the best options</p>
              </div>
            </div>

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <Label className="text-white/80 mb-2 block">Annual Budget (USD)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {["< $20,000", "$20,000 - $40,000", "$40,000 - $60,000", "> $60,000"].map((budget) => (
                      <button
                        key={budget}
                        onClick={() => setFormData({ ...formData, budget })}
                        className={`p-3 md:p-4 rounded-xl border transition ${
                          formData.budget === budget
                            ? "bg-gradient-to-r from-pink-500/20 to-indigo-500/20 border-pink-500/50"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <span className="text-white text-xs md:text-sm">{budget}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-yellow-400 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">AI-Powered Recommendations</h4>
                      <p className="text-sm text-white/60">
                        Based on your profile, we'll match you with universities that fit your budget and goals, 
                        plus show you scholarship opportunities.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Navigation Footer (Fixed at bottom for easy access) */}
        <div className="fixed bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-[#06060F] via-[#06060F]/90 to-transparent backdrop-blur-sm z-50">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-white/70 hover:text-white"
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
            >
              {step > 1 ? "Back" : "← Home"}
            </Button>

            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 h-12 md:h-14 text-lg font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)]"
              onClick={handleNext}
              disabled={
                isLoading ||
                (step === 1 && (!formData.name || !formData.role)) ||
                (step === 2 && !formData.destination) ||
                (step === 3 && !formData.budget)
              }
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <>
                  {step === 3 ? "Complete Setup" : "Next Step"}
                  <ChevronRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}