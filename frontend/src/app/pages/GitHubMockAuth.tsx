import { motion } from "motion/react";
import { Github, Lock, ArrowRight, Info } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";

export function GitHubMockAuth() {
  const [screen, setScreen] = useState<"username" | "loading">("username");
  const [username, setUsername] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setScreen("loading");
    
    const mockUser = {
      name: username.charAt(0).toUpperCase() + username.slice(1),
      email: username + "@github.com",
      isLoggedIn: true,
      provider: "github",
      picture: "https://github.com/" + username + ".png"
    };

    setTimeout(() => {
      if (window.opener) {
        window.opener.postMessage({ type: "GITHUB_AUTH_SUCCESS", user: mockUser }, "*");
        window.close();
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-[340px] flex flex-col items-center">
        {/* GitHub Logo */}
        <Github className="w-12 h-12 text-white mb-6" />
        
        <h1 className="text-2xl font-light mb-4">Sign in to GitHub</h1>

        <div className="w-full bg-[#161b22] border border-[#30363d] rounded-md p-5 shadow-xl">
          <form className="space-y-4" onSubmit={handleLogin}>
            {screen === "loading" ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-6 h-6 border-2 border-[#30363d] border-t-white rounded-full animate-spin mb-4" />
                <p className="text-sm text-[#8b949e]">Authorizing EduPilot...</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm block">Username or email address</label>
                  <input
                    autoFocus
                    required
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] outline-none transition text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm block">Password</label>
                    <a href="#" className="text-xs text-[#58a6ff] hover:underline">Forgot password?</a>
                  </div>
                  <input
                    required
                    type="password"
                    className="w-full px-3 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] outline-none transition text-sm"
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-[#238636] hover:bg-[#2eaa42] text-white font-semibold py-2 rounded-md h-auto text-sm"
                >
                  Sign in
                </Button>
              </>
            )}
          </form>
        </div>

        <div className="mt-4 p-4 border border-[#30363d] rounded-md w-full text-center text-sm">
          <p>New to GitHub? <a href="#" className="text-[#58a6ff] hover:underline">Create an account</a>.</p>
        </div>

        <div className="flex gap-4 mt-8 text-xs text-[#8b949e]">
          <a href="#" className="hover:text-[#58a6ff]">Terms</a>
          <a href="#" className="hover:text-[#58a6ff]">Privacy</a>
          <a href="#" className="hover:text-[#58a6ff]">Docs</a>
          <a href="#" className="hover:text-[#58a6ff]">Contact GitHub</a>
        </div>
      </div>
    </div>
  );
}
