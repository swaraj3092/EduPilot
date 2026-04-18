import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

export function AnimatedWorld() {
  const location = useLocation();
  const [routeChanged, setRouteChanged] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("edupilot-theme") || "dark");

  useEffect(() => {
    const handleThemeChange = () => setTheme(localStorage.getItem("edupilot-theme") || "dark");
    window.addEventListener("themechange", handleThemeChange);
    return () => window.removeEventListener("themechange", handleThemeChange);
  }, []);

  // Route change subtle effect
  useEffect(() => {
    setRouteChanged(true);
    const timer = setTimeout(() => setRouteChanged(false), 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const isLight = theme === "light";

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-[#0D0D1A]" style={{ zIndex: 0 }}>
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0 bg-[#0D0D1A] overflow-hidden">
        {/* We use motion.video so even if the video CDN is blocked by the preview environment and falls back to the poster image, it still slowly pans like a real drone shot! */}
        <motion.video 
          key={theme}
          autoPlay 
          loop 
          muted 
          playsInline 
          animate={{ scale: [1, 1.05, 1], x: ["0%", "1%", "0%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          className="absolute inset-y-0 right-0 w-[120vw] min-h-full object-cover origin-right"
          style={{
            // Fades from fully opaque (black) on the right side to fully transparent on the left side
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
        
        {/* Soft edge blend at the very bottom and top - darkens light videos to keep white text readable! */}
        <div className={`absolute inset-0 bg-gradient-to-t from-[#0D0D1A] ${isLight ? 'via-[#0D0D1A]/60' : 'via-[#0D0D1A]/10'} to-${isLight ? '[#0D0D1A]/50' : 'transparent'} opacity-90 pointer-events-none`} />
      </div>

      {/* Optimized Aurora Background - 2 Layers Only - highly transparent to not block video */}
      <div className="absolute inset-0 z-10 mix-blend-screen">
        {/* Primary Aurora */}
        <motion.div
          animate={{
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-indigo-600/20 via-slate-600/10 to-blue-800/10 rounded-full blur-[120px]"
        />
        
        {/* Secondary Aurora */}
        <motion.div
          animate={{
            opacity: [0.05, 0.15, 0.05],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-1/3 w-[700px] h-[700px] bg-gradient-to-br from-blue-900/20 via-indigo-900/10 to-slate-800/10 rounded-full blur-[120px]"
        />
      </div>

      {/* Simple Particle Stars - Reduced to 30 */}
      <div className="absolute inset-0 z-10">
        {Array.from({ length: 30 }).map((_, i) => {
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const duration = 3 + Math.random() * 2;
          
          return (
            <div
              key={`star-${i}`}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                animation: `twinkle ${duration}s infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          );
        })}
      </div>

      {/* Ground Plane Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0D0D1A] via-[#0D0D1A]/80 to-transparent z-20 pointer-events-none" />

      {/* CSS Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
