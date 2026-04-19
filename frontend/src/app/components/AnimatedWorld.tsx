import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

export function AnimatedWorld() {
  const location = useLocation();
  const [routeChanged, setRouteChanged] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("edupilot-theme") || "dark");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleThemeChange = () => setTheme(localStorage.getItem("edupilot-theme") || "dark");
    window.addEventListener("themechange", handleThemeChange);
    return () => window.removeEventListener("themechange", handleThemeChange);
  }, []);

  useEffect(() => {
    setRouteChanged(true);
    const timer = setTimeout(() => setRouteChanged(false), 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const isLight = theme === "light";

  if (isMobile) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none bg-[#0D0D1A]" style={{ zIndex: 0 }}>
        {/* Mobile-Only Lite Background: Static Image + CSS Opacity Only */}
        <div className="absolute inset-0 z-0 bg-[#0D0D1A]">
          <img 
            src={isLight 
              ? "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=60&w=1200"
              : "https://images.unsplash.com/photo-1705354150474-baef059e2d07?auto=format&fit=crop&q=60&w=1200"
            }
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D1A] via-[#0D0D1A]/40 to-transparent" />
        </div>

        {/* CSS-Only Lite Auroras (No constant JS scaling) */}
        <div className="absolute inset-0 z-10 mix-blend-screen opacity-30">
          <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[60px] animate-pulse" />
          <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Static Stars (No JS mapping on every render) */}
        <div className="absolute inset-0 z-10 opacity-20">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 19) % 100}%`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>
        <style>{`
          .animate-twinkle { animation: twinkle 3s infinite; }
          @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
          .animate-pulse { animation: pulse 8s infinite ease-in-out; }
          @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-[#0D0D1A]" style={{ zIndex: 0 }}>
      {/* High-Fidelity Desktop Background (KEPT AS IS) */}
      <div className="absolute inset-0 z-0 bg-[#0D0D1A] overflow-hidden">
        <motion.video 
          key={theme}
          autoPlay loop muted playsInline 
          animate={{ scale: [1, 1.05, 1], x: ["0%", "1%", "0%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          className="absolute inset-y-0 right-0 w-[120vw] min-h-full object-cover origin-right"
          style={{
            maskImage: "linear-gradient(to left, black 0%, black 50%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to left, black 0%, black 50%, transparent 100%)",
            opacity: isLight ? 1 : 0.8
          }}
          poster={isLight 
            ? "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2000"
            : "https://images.unsplash.com/photo-1705354150474-baef059e2d07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2000"
          }
          src={isLight 
            ? "https://assets.mixkit.co/videos/preview/mixkit-sun-shining-through-the-trees-in-a-forest-28822-large.mp4"
            : "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-buildings-and-roads-at-night-34224-large.mp4"
          }
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-[#0D0D1A] ${isLight ? 'via-[#0D0D1A]/60' : 'via-[#0D0D1A]/10'} to-${isLight ? '[#0D0D1A]/50' : 'transparent'} opacity-90 pointer-events-none`} />
      </div>

      <div className="absolute inset-0 z-10 mix-blend-screen">
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-indigo-600/20 via-slate-600/10 to-blue-800/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-1/3 w-[700px] h-[700px] bg-gradient-to-br from-blue-900/20 via-indigo-900/10 to-slate-800/10 rounded-full blur-[120px]"
        />
      </div>

      <div className="absolute inset-0 z-10">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${(i * 13) % 100}%`,
              top: `${(i * 17) % 100}%`,
              animation: `twinkle ${3 + (i % 3)}s infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0D0D1A] via-[#0D0D1A]/80 to-transparent z-20 pointer-events-none" />
      <style>{`
        @keyframes twinkle { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.8; } }
      `}</style>
    </div>
  );
}
