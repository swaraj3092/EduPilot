import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, X, Check, Calendar, Award, FileText, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "deadline" | "scholarship" | "application" | "update";
  icon: any;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  useEffect(() => {
    try {
      const savedApps = localStorage.getItem("edupilot-apps");
      const savedProfile = JSON.parse(localStorage.getItem("edupilot-profile") || "{}");
      
      let items: Notification[] = [
        {
          id: "xp-welcome",
          title: "Welcome Bonus Claimed!",
          message: "You've earned 1,000 XP for completing your onboarding. Explore missions to level up!",
          time: "1h ago",
          read: false,
          type: "update",
          icon: Award
        },
        {
          id: "scholarship-new",
          title: "New Matching Scholarship",
          message: "A new $5,000 scholarship for Computer Science students in Germany was recently posted.",
          time: "3h ago",
          read: true,
          type: "scholarship",
          icon: Award
        }
      ];

      if (savedApps) {
        const apps = JSON.parse(savedApps);
        apps.forEach((app: any) => {
          const daysLeft = Math.ceil((new Date(app.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          if (daysLeft >= 0 && daysLeft <= 90 && app.status !== "submitted") {
            items.push({
              id: `deadline-${app.id}`,
              title: `Urgent: ${app.university}`,
              message: `Deadline in ${daysLeft} days! Finalize your SOP now.`,
              time: "Action Required",
              read: false,
              type: "deadline",
              icon: Calendar
            });
          }
        });
      }

      // Quest special notifications
      if (savedProfile.xp > 0) {
        items.unshift({
          id: "quest-engagement",
          title: "Quest Mastery",
          message: `Your current progress is synced! You have ${savedProfile.xp} XP points.`,
          time: "Just now",
          read: false,
          type: "update",
          icon: Award
        });
      }

      setNotifications(items);
    } catch(e) {
      console.error("Failed to sync notifications", e);
    }
  }, [isOpen]);


  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "deadline": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "scholarship": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "application": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "update": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      default: return "text-white/60 bg-white/5 border-white/10";
    }
  };

  return (
    <>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-foreground/10 transition"
      >
        <Bell className="w-5 h-5 text-foreground/70 hover:text-foreground" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-xs font-bold text-white"
          >
            {unreadCount}
          </motion.div>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-[140]"
            />

            {/* Panel */}
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                transition={{ type: "spring", damping: 25 }}
                className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-card border-l border-border z-[150] overflow-hidden flex flex-col shadow-2xl"
              >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Notifications</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-foreground/10 transition"
                  >
                    <X className="w-5 h-5 text-foreground/70" />
                  </button>
                </div>
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={markAllAsRead}
                    className="w-full border-white/20 hover:bg-white/10"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark all as read
                  </Button>
                )}
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Bell className="w-12 h-12 text-foreground/20 mb-3" />
                    <p className="text-foreground/50">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification, i) => {
                    const Icon = notification.icon;
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card
                          className={`p-4 cursor-pointer transition ${
                            notification.read
                              ? "bg-white/5 border-white/10"
                              : "bg-indigo-500/10 border-indigo-500/20"
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 ${getTypeColor(notification.type)}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                                  {notification.title}
                                </h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="p-1 rounded-full hover:bg-foreground/10 transition flex-shrink-0"
                                >
                                  <X className="w-3 h-3 text-foreground/50" />
                                </button>
                              </div>
                              <p className="text-xs text-foreground/60 mb-2 line-clamp-2">
                                {notification.message}
                              </p>
                              <span className="text-xs text-foreground/40">
                                {notification.time}
                              </span>
                            </div>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-indigo-400 rounded-full absolute top-4 right-4" />
                          )}
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}