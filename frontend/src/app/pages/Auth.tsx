import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Globe2, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Github, Chrome as Google } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { loginUser, registerUser, resetPassword } from "@services";

export function Auth() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (authMode === "signup") {
        const referrer = localStorage.getItem("edupilot-referrer");
        await registerUser({ email, password, referrer_code: referrer || undefined });
        const res = await loginUser({ email, password });
        try {
          localStorage.setItem("edupilot-user", JSON.stringify(res.user));
        } catch(e) {
          localStorage.clear(); // Extreme fallback
          localStorage.setItem("edupilot-user", JSON.stringify(res.user));
        }
        navigate("/onboarding");
      } else if (authMode === "login") {
        const res = await loginUser({ email, password });
        try {
          localStorage.setItem("edupilot-user", JSON.stringify(res.user));
          if (res.profile) {
            localStorage.setItem("edupilot-profile", JSON.stringify(res.profile));
          }
        } catch(e) {
          console.warn("Storage full, clearing cache to make room");
          localStorage.removeItem("edupilot-chat-history");
          localStorage.removeItem("edupilot-discovered-matches");
          try {
            localStorage.setItem("edupilot-user", JSON.stringify(res.user));
            if (res.profile) {
              localStorage.setItem("edupilot-profile", JSON.stringify(res.profile));
            }
          } catch(e2) {
            console.warn("Profile still too large! Stripping profile_picture...");
            if (res.profile) {
              const strippedProfile = { ...res.profile, profile_picture: null };
              localStorage.setItem("edupilot-profile", JSON.stringify(strippedProfile));
            }
          }
        }
        navigate("/dashboard");
      } else if (authMode === "reset") {
        await resetPassword({ email, password });
        setSuccess("Password reset successfully! You can now login.");
        setAuthMode("login");
      }
    } catch (err: any) {
      console.error("Auth Error (hidden from UI):", err?.message || err);
      setError("Authentication failed. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "GOOGLE_AUTH_SUCCESS" || event.data.type === "GITHUB_AUTH_SUCCESS") {
        const user = event.data.user;
        
        const saveSession = (profileObj: any) => {
          try {
            localStorage.setItem("edupilot-user", JSON.stringify(user));
            localStorage.setItem("edupilot-profile", JSON.stringify(profileObj));
          } catch(e) {
            console.warn("Storage full, clearing cache to make room");
            localStorage.removeItem("edupilot-chat-history");
            localStorage.removeItem("edupilot-discovered-matches");
            try {
              localStorage.setItem("edupilot-user", JSON.stringify(user));
              localStorage.setItem("edupilot-profile", JSON.stringify(profileObj));
            } catch (e2) {
              console.warn("Profile still too large! Stripping profile_picture...");
              const strippedProfile = { ...profileObj, profile_picture: null };
              localStorage.setItem("edupilot-profile", JSON.stringify(strippedProfile));
            }
          }
        };

        // If social login returns a profile, use it; otherwise fallback
        if (event.data.profile) {
          saveSession(event.data.profile);
        } else {
          const profile = {
            full_name: user.name,
            email: user.email,
            phone: "+91 98765 43210",
            country: "india",
            level: "master",
            field: "Computer Science",
            xp: 0,
            streak: 1
          };
          saveSession(profile);
        }
        
        navigate("/dashboard");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  const handleGoogleLogin = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    window.open(
      "/auth/google-mock",
      "GoogleSignin",
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-background" />
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            className="flex items-center gap-2 mb-2"
            whileHover={{ scale: 1.05 }}
          >
            <Globe2 className="w-8 h-8 md:w-10 md:h-10 text-indigo-400" />
            <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              EduPilot
            </span>
          </motion.div>
          <p className="text-muted-foreground text-center">Your AI-Powered Study Abroad Journey Starts Here</p>
        </div>

        <Card className="p-8 bg-card/60 backdrop-blur-2xl border-border shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50 group-hover:opacity-100 transition-opacity" />
          
          <Tabs defaultValue="login" className="mb-6" onValueChange={(v) => setAuthMode(v as any)}>
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 mb-8 border border-border/50">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Login</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Signup</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={authMode}
                initial={{ opacity: 0, x: authMode === "login" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: authMode === "login" ? 20 : -20 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleAuth} className="space-y-4">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center"
                    >
                      {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-xs text-center"
                    >
                      {success}
                    </motion.div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30">
                        <Mail className="w-4 h-4" />
                      </div>
                      <Input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="pl-10 bg-input border-border text-foreground focus:border-primary/50 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-white/70">
                        {authMode === "reset" ? "New Password" : "Password"}
                      </label>
                      {authMode === "login" ? (
                        <button type="button" onClick={() => setAuthMode("reset")} className="text-xs text-primary hover:text-primary/70">Forgot?</button>
                      ) : authMode === "reset" ? (
                        <button type="button" onClick={() => setAuthMode("login")} className="text-xs text-primary hover:text-primary/70">Back to Login</button>
                      ) : null}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-input border-border text-foreground focus:border-primary/50 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white/50"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 py-6 text-lg font-bold shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Please wait...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {authMode === "login" ? "Login" : authMode === "signup" ? "Create Account" : "Reset Password"}
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </form>
              </motion.div>
            </AnimatePresence>
          </Tabs>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
              <span className="bg-card px-3 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={handleGoogleLogin}
              className="border-border hover:bg-muted text-foreground gap-2 py-6 font-bold"
            >
              <Google className="w-5 h-5 text-red-500" />
              Google
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                const width = 500;
                const height = 650;
                const left = window.screenX + (window.outerWidth - width) / 2;
                const top = window.screenY + (window.outerHeight - height) / 2;
                window.open("/auth/github-mock", "GithubSignin", `width=${width},height=${height},left=${left},top=${top}`);
              }}
              className="border-border hover:bg-muted text-foreground gap-2 py-6 font-bold"
            >
              <Github className="w-5 h-5" />
              GitHub
            </Button>
          </div>

          <p className="mt-8 text-center text-xs text-white/30 leading-relaxed">
            By continuing, you agree to EduPilot's <br />
            <a href="#" className="underline hover:text-white/50">Terms of Service</a> and <a href="#" className="underline hover:text-white/50">Privacy Policy</a>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
