import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, X, Calendar, TrendingUp, FileText } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface Nudge {
  id: string;
  type: "deadline" | "opportunity" | "action";
  title: string;
  message: string;
  icon: React.ReactNode;
  color: string;
}

const SAMPLE_NUDGES: Nudge[] = [
  {
    id: "1",
    type: "deadline",
    title: "GRE Registration Closing Soon",
    message: "GRE registrations close in 14 days. Here's a prep plan tailored for you.",
    icon: <Calendar className="w-5 h-5" />,
    color: "from-amber-500/20 to-orange-500/20",
  },
  {
    id: "2",
    type: "opportunity",
    title: "New Scholarship Available",
    message: "MIT just opened applications for the AI Research Scholarship. You're a perfect match!",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    id: "3",
    type: "action",
    title: "Complete Your SOP",
    message: "You're 80% done with your Stanford SOP. Finish it today to stay on track!",
    icon: <FileText className="w-5 h-5" />,
    color: "from-indigo-500/20 to-purple-500/20",
  },
];

export function SmartNudge() {
  // Disabled as per user request to only have notifications in the Notification tab.
  return null;
}