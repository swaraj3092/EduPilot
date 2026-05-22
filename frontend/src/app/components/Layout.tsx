import { useLocation, Outlet } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedWorld } from "./AnimatedWorld";
import { Toaster } from "@components/ui/sonner";

export function Layout() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen bg-transparent text-foreground">
      {/* 3D Animated World Background */}
      <AnimatedWorld />

      {/* Page Content */}
      <div className="relative z-10">
        <Outlet />
      </div>
      <Toaster theme="dark" position="top-right" />
    </div>
  );
}
