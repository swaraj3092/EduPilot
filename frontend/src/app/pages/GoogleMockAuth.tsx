import { motion } from "motion/react";
import { Globe2, User, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";

export function GoogleMockAuth() {
  const [screen, setScreen] = useState<"choose" | "email" | "password" | "loading">("choose");
  const [email, setEmail] = useState("");
  const [savedAccounts, setSavedAccounts] = useState<any[]>([]);

  useEffect(() => {
    // Check if there was a previous session to make it "real"
    const prevProfile = localStorage.getItem("edupilot-profile");
    if (prevProfile) {
      setSavedAccounts([JSON.parse(prevProfile)]);
    } else {
      setSavedAccounts([
        { name: "Rahul Sharma", email: "rahul.sharma@gmail.com", picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul" }
      ]);
    }
  }, []);

  const handleChoose = (acc: any) => {
    setEmail(acc.email);
    setScreen("password");
  };

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setScreen("password");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setScreen("loading");
    
    // Determine name from email or account
    const name = savedAccounts.find(a => a.email === email)?.name || 
                 email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

    const mockUser = {
      name: name,
      email: email,
      isLoggedIn: true,
      provider: "google",
      picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + email
    };

    setTimeout(() => {
      if (window.opener) {
        window.opener.postMessage({ type: "GOOGLE_AUTH_SUCCESS", user: mockUser }, "*");
        window.close();
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white text-[#202124] flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-[450px] border border-[#dadce0] rounded-lg p-6 md:p-10 flex flex-col items-center">
        {/* Google Logo */}
        <div className="flex items-center gap-1 mb-3">
          <svg viewBox="0 0 24 24" width="24" height="24" className="mr-1">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="text-xl font-medium">Google</span>
        </div>

        {screen === "loading" ? (
          <div className="flex flex-col items-center py-10">
            <div className="w-8 h-8 border-4 border-[#f3f3f3] border-t-[#4285F4] rounded-full animate-spin mb-4" />
            <p className="text-sm">Signing you in...</p>
          </div>
        ) : screen === "choose" ? (
          <div className="w-full">
            <h1 className="text-2xl font-normal mb-2 text-center">Choose an account</h1>
            <p className="text-sm mb-6 text-center">to continue to <span className="font-medium text-[#1a73e8]">EduPilot</span></p>
            
            <div className="border-t border-[#dadce0] w-full mb-4">
              {savedAccounts.map((acc, i) => (
                <button
                  key={i}
                  onClick={() => handleChoose(acc)}
                  className="w-full flex items-center justify-between p-3 border-b border-[#dadce0] hover:bg-[#f8f9fa] transition"
                >
                  <div className="flex items-center gap-3">
                    <img src={acc.picture} className="w-8 h-8 rounded-full" alt="" />
                    <div className="text-left">
                      <div className="text-sm font-medium">{acc.name}</div>
                      <div className="text-xs text-[#5f6368]">{acc.email}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#5f6368]" />
                </button>
              ))}
              <button
                onClick={() => setScreen("email")}
                className="w-full flex items-center gap-3 p-3 border-b border-[#dadce0] hover:bg-[#f8f9fa] transition"
              >
                <div className="w-8 h-8 rounded-full bg-white border border-[#dadce0] flex items-center justify-center">
                  <User className="w-4 h-4 text-[#5f6368]" />
                </div>
                <div className="text-sm font-medium">Use another account</div>
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-normal mb-2 text-center">Sign in</h1>
            <p className="text-sm mb-8">to continue to <span className="font-medium text-[#1a73e8]">EduPilot</span></p>

            <form className="w-full space-y-4" onSubmit={screen === "email" ? handleEmail : handleLogin}>
              {screen === "email" ? (
                <div className="space-y-1">
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email or phone"
                    className="w-full px-4 py-3 rounded border border-[#dadce0] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] outline-none transition"
                  />
                  <button type="button" className="text-sm font-medium text-[#1a73e8] hover:bg-[#f8f9fa] px-1 py-1 rounded">Forgot email?</button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-4 p-1 px-2 border border-[#dadce0] rounded-full w-fit max-w-full">
                    <div className="w-5 h-5 rounded-full bg-[#1a73e8] flex items-center justify-center text-[10px] text-white overflow-hidden">
                      <img src={savedAccounts.find(a => a.email === email)?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`} alt="" />
                    </div>
                    <span className="text-sm truncate max-w-[200px]">{email}</span>
                  </div>
                  <input
                    autoFocus
                    required
                    type="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded border border-[#dadce0] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] outline-none transition"
                  />
                  <div className="flex items-center gap-2 py-2">
                    <input type="checkbox" id="show-pass" className="w-4 h-4" />
                    <label htmlFor="show-pass" className="text-sm">Show password</label>
                  </div>
                </div>
              )}

              <p className="text-sm text-[#5f6368] py-4">
                Not your computer? Use a Private window to sign in. <a href="#" className="text-[#1a73e8] font-medium">Learn more</a>
              </p>

              <div className="flex items-center justify-between pt-4">
                <button 
                type="button" 
                className="text-sm font-medium text-[#1a73e8] hover:bg-[#f8f9fa] px-2 py-2 rounded"
                onClick={() => setScreen("choose")}
                >
                  Back
                </button>
                <Button 
                  type="submit"
                  className="bg-[#1a73e8] hover:bg-[#185abc] text-white px-6 py-2 rounded h-auto"
                >
                  Next
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
      
      <div className="fixed bottom-4 text-xs text-[#5f6368] flex gap-4">
        <select className="bg-transparent border-none outline-none cursor-pointer">
          <option>English (United States)</option>
        </select>
        <div className="flex gap-4">
          <a href="#" className="hover:bg-[#f8f9fa] p-1">Help</a>
          <a href="#" className="hover:bg-[#f8f9fa] p-1">Privacy</a>
          <a href="#" className="hover:bg-[#f8f9fa] p-1">Terms</a>
        </div>
      </div>
    </div>
  );
}
