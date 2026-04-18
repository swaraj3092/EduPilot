import { useLocation, Outlet } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedWorld } from "./AnimatedWorld";

export function Layout() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen bg-[#0D0D1A]">
      {/* 3D Animated World Background */}
      <AnimatedWorld />

      {/* Page Content */}
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}
