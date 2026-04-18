import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowRight, Globe2, Sparkles, Target, TrendingUp, DollarSign, FileText, Award, Users, Zap, Check, Menu, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Footer } from "../components/Footer";
import { BackToTop } from "../components/BackToTop";

export function Hero() {
  const navigate = useNavigate();
  const [mobileNav, setMobileNav] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setMobileNav(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Glassmorphism Navbar */}
      <nav className="relative z-20 backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe2 className="w-7 h-7 md:w-8 md:h-8 text-indigo-400" />
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              EduPilot
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button className="text-white/70 hover:text-white transition" onClick={() => scrollToSection('features')}>Features</button>
            <button className="text-white/70 hover:text-white transition" onClick={() => scrollToSection('universities')}>Universities</button>
            <button className="text-white/70 hover:text-white transition" onClick={() => scrollToSection('pricing')}>Pricing</button>
            <Button variant="outline" className="border-white/20 hover:bg-white/10" onClick={() => navigate('/auth')}>Get Started</Button>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-white/10 transition text-white/70" onClick={() => setMobileNav(!mobileNav)}>
            {mobileNav ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileNav && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileNav(false)} />
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="absolute top-full left-0 right-0 z-40 bg-[#0D0D1A]/95 backdrop-blur-2xl border-b border-white/10 overflow-hidden md:hidden"
              >
                <div className="px-4 py-4 space-y-1">
                  {[
                    { label: "Features", action: () => scrollToSection('features') },
                    { label: "Universities", action: () => scrollToSection('universities') },
                    { label: "Pricing", action: () => scrollToSection('pricing') },
                  ].map((item, i) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="w-full text-left px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
                      onClick={item.action}
                    >
                      {item.label}
                    </motion.button>
                  ))}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="pt-2">
                    <Button className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" onClick={() => { navigate('/auth'); setMobileNav(false); }}>Get Started</Button>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-16 md:pt-32 pb-12 md:pb-20 flex items-center justify-between">
        <div className="flex-1 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/5 border border-white/10 mb-4 md:mb-6">
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-400" />
              <span className="text-xs md:text-sm text-white/70">AI-Powered Study Abroad Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Your Journey to
              </span>
              <br />
              <span className="text-white">World-Class Education</span>
            </h1>

            <p className="text-base md:text-xl text-white/60 mb-6 md:mb-8 leading-relaxed max-w-xl">
              Navigate admissions, calculate ROI, secure loans, and chat with your AI mentor—all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-6 md:px-8"
                onClick={() => navigate('/auth')}
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 hover:bg-white/10"
                onClick={() => navigate('/dashboard')}
              >
                See Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 md:gap-12 mt-8 md:mt-12">
              {[
                { value: "2,500+", label: "Universities" },
                { value: "50+", label: "Countries" },
                { value: "98%", label: "Success Rate" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs md:text-sm text-white/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="flex-1 hidden lg:block" />
      </div>

      {/* Floating Cards Preview */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pb-12 md:pb-20">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {[
            { title: "AI Career Navigator", desc: "Chat with your personal AI mentor", icon: "🤖" },
            { title: "Smart Admissions", desc: "Know your chances before you apply", icon: "🎯" },
            { title: "Financial Planning", desc: "ROI calculator & loan eligibility", icon: "💰" },
          ].map((feature, i) => (
            <div key={i} className="p-5 md:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition group">
              <div className="text-3xl md:text-4xl mb-3 md:mb-4">{feature.icon}</div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-1 md:mb-2">{feature.title}</h3>
              <p className="text-xs md:text-sm text-white/60">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4">
            Powerful Features for Your Success
          </h2>
          <p className="text-base md:text-xl text-white/60">
            Everything you need to plan, apply, and succeed
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {[
            { icon: Target, title: "Admission Probability", desc: "Get data-driven predictions of your admission chances at top universities worldwide", color: "from-blue-500 to-cyan-500" },
            { icon: TrendingUp, title: "ROI Calculator", desc: "Compare lifetime earnings across countries and make informed financial decisions", color: "from-green-500 to-emerald-500" },
            { icon: DollarSign, title: "Loan Eligibility", desc: "Check your education loan eligibility and explore funding options instantly", color: "from-yellow-500 to-orange-500" },
            { icon: FileText, title: "AI Essay Coach", desc: "Get instant feedback on your Statement of Purpose with AI-powered analysis", color: "from-purple-500 to-pink-500" },
            { icon: Users, title: "AI Career Navigator", desc: "Chat with your personal AI mentor for personalized guidance and insights", color: "from-indigo-500 to-purple-500" },
            { icon: Zap, title: "Smart Nudges", desc: "Receive timely reminders and actionable insights to stay on track", color: "from-pink-500 to-rose-500" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <Card className="p-6 md:p-8 bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20 transition h-full">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 md:mb-6`}>
                  <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">{feature.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{feature.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Universities Section */}
      <div id="universities" className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4">Top Universities Worldwide</h2>
          <p className="text-base md:text-xl text-white/60">Access insights for 2,500+ universities across 50+ countries</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {[
            { name: "MIT", location: "USA", ranking: "#1", students: "11,934", acceptance: "3.2%" },
            { name: "Stanford", location: "USA", ranking: "#3", students: "17,249", acceptance: "3.9%" },
            { name: "Oxford", location: "UK", ranking: "#2", students: "24,515", acceptance: "17.5%" },
            { name: "ETH Zurich", location: "Switzerland", ranking: "#6", students: "23,420", acceptance: "8%" },
            { name: "Cambridge", location: "UK", ranking: "#4", students: "24,450", acceptance: "21%" },
            { name: "Harvard", location: "USA", ranking: "#5", students: "23,731", acceptance: "3.4%" },
            { name: "Caltech", location: "USA", ranking: "#7", students: "2,397", acceptance: "3.9%" },
            { name: "Imperial", location: "UK", ranking: "#8", students: "20,109", acceptance: "14.3%" },
          ].map((uni, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="p-4 md:p-6 bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20 transition">
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div>
                    <h3 className="text-sm md:text-lg font-bold text-white">{uni.name}</h3>
                    <p className="text-xs md:text-sm text-white/60">{uni.location}</p>
                  </div>
                  <div className="text-indigo-400 font-bold text-sm md:text-lg">{uni.ranking}</div>
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-white/50">Students</span>
                    <span className="text-white">{uni.students}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-white/50">Acceptance</span>
                    <span className="text-white">{uni.acceptance}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4">Simple, Transparent Pricing</h2>
          <p className="text-base md:text-xl text-white/60">Choose the plan that fits your journey</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
          {[
            {
              name: "Free", price: "$0", desc: "Perfect for exploring",
              features: ["AI Career Navigator (5 queries/day)", "University Search", "Basic ROI Calculator", "Admission Probability (3 universities)", "Community Support"],
              cta: "Get Started", popular: false,
            },
            {
              name: "Pro", price: "$29", desc: "For serious applicants",
              features: ["Unlimited AI Career Navigator", "Advanced ROI Calculator", "Unlimited Admission Probability", "AI Essay Coach (10 essays/month)", "Loan Eligibility Checker", "Priority Email Support", "Document Checklist & Reminders"],
              cta: "Start Free Trial", popular: true,
            },
            {
              name: "Premium", price: "$99", desc: "Complete guidance package",
              features: ["Everything in Pro", "Unlimited AI Essay Coach", "1-on-1 Mentor Calls (2/month)", "Application Review Service", "Visa Guidance", "Scholarship Matching", "WhatsApp Support", "Post-Admission Support"],
              cta: "Contact Sales", popular: false,
            },
          ].map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <Card className={`p-6 md:p-8 bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20 transition h-full relative ${plan.popular ? "ring-2 ring-purple-500/50" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold text-white">
                    MOST POPULAR
                  </div>
                )}
                <div className="text-center mb-6 md:mb-8">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-white/60 text-xs md:text-sm mb-3 md:mb-4">{plan.desc}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl md:text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/50">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 md:gap-3">
                      <Check className="w-4 h-4 md:w-5 md:h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-white/70 text-xs md:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.popular ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" : "bg-white/10 hover:bg-white/20"}`}
                  onClick={() => navigate('/auth')}
                >
                  {plan.cta}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <Card className="p-8 md:p-16 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border-white/10 text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4">Ready to Start Your Journey?</h2>
            <p className="text-base md:text-xl text-white/60 mb-6 md:mb-8 max-w-2xl mx-auto">
              Join thousands of students who've achieved their study abroad dreams with EduPilot
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-8" onClick={() => navigate('/auth')}>
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 hover:bg-white/10" onClick={() => scrollToSection('pricing')}>View Pricing</Button>
            </div>
          </Card>
        </motion.div>
      </div>

      <BackToTop />
      <Footer />
    </div>
  );
}
