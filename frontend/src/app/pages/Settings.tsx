import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowLeft, User, Bell, Lock, Palette, Globe, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserProfile, updateProfile, resetPassword as resetUserPassword } from "@services";

export function Settings() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("edupilot-notifications");
    return saved ? JSON.parse(saved) : {
      email: true,
      push: true,
      deadlines: true,
      scholarships: false,
      updates: true,
    };
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("edupilot-profile");
    const authUser = JSON.parse(localStorage.getItem("edupilot-user") || "{}");
    const profileData = saved ? JSON.parse(saved) : {};
    
    return {
      name: profileData.full_name || profileData.name || authUser.name || "",
      email: profileData.email || authUser.email || "",
      phone: profileData.phone || "",
      country: profileData.country || "india",
      level: profileData.level || "master",
      field: profileData.field || ""
    };
  });

  const [privacy, setPrivacy] = useState(() => {
    const saved = localStorage.getItem("edupilot-privacy");
    return saved ? JSON.parse(saved) : {
      visibility: true,
      dataSharing: false,
    };
  });

  const [pendingTheme, setPendingTheme] = useState(() => localStorage.getItem("edupilot-theme") || "dark");
  const [pendingLang, setPendingLang] = useState(() => localStorage.getItem("edupilot-lang") || "en");

  const [saveStatus, setSaveStatus] = useState("Save Changes");
  const [passwordStatus, setPasswordStatus] = useState("Update Password");

  const handleSaveChanges = async () => {
    setIsLoading(true);
    setSaveStatus("Saving...");
    
    try {
      const authUser = JSON.parse(localStorage.getItem("edupilot-user") || "{}");
      
      // 1. Save to Database
      await updateProfile({
        user_id: authUser.id,
        full_name: profile.name,
        phone: profile.phone,
        target_country: profile.country,
        target_field: profile.field,
        degree_level: profile.level
      });

      // 2. Local Storage Sync
      localStorage.setItem("edupilot-profile", JSON.stringify(profile));
      localStorage.setItem("edupilot-notifications", JSON.stringify(notifications));
      localStorage.setItem("edupilot-privacy", JSON.stringify(privacy));
      localStorage.setItem("edupilot-theme", pendingTheme);
      localStorage.setItem("edupilot-lang", pendingLang);

      window.dispatchEvent(new Event("themechange"));

      if (notifications.push && Notification.permission !== "granted") {
        Notification.requestPermission();
      }

      if (pendingLang !== (localStorage.getItem("edupilot-lang") || "en")) {
        window.location.reload();
      } else {
        setSaveStatus("Saved Successfully!");
        setTimeout(() => setSaveStatus("Save Changes"), 2000);
      }
    } catch (err) {
      console.error("Database sync failed", err);
      // Even if DB fails, local storage (theme/lang) is updated
      setSaveStatus("Saved Locally!");
      setTimeout(() => setSaveStatus("Save Changes"), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    setPasswordStatus("Updating...");
    try {
      const authUser = JSON.parse(localStorage.getItem("edupilot-user") || "{}");
      await resetUserPassword({ email: authUser.email, password: newPassword });
      
      setPasswordStatus("Updated Successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      setTimeout(() => setPasswordStatus("Update Password"), 3000);
    } catch (err) {
      alert("Failed to update password.");
      setPasswordStatus("Update Password");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header */}
      <nav className="relative z-10 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-white/70 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
            <Button 
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all active:scale-95 w-[160px]"
            onClick={handleSaveChanges}
          >
            {saveStatus === "Save Changes" ? <Save className="w-4 h-4 mr-2" /> : <div className="w-2 h-2" />}
            {saveStatus}
          </Button>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white/10">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white/10">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-white/10">
              <Lock className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-white/10">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">Profile Information</h3>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Full Name</label>
                    <Input
                      placeholder="John Doe"
                      value={profile.name}
                      onChange={e => setProfile({...profile, name: e.target.value})}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Email</label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={profile.email}
                      onChange={e => setProfile({...profile, email: e.target.value})}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Phone Number</label>
                    <Input
                      placeholder="+1 (555) 000-0000"
                      value={profile.phone}
                      onChange={e => setProfile({...profile, phone: e.target.value})}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Country</label>
                    <select 
                      value={profile.country}
                      onChange={e => setProfile({...profile, country: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white"
                    >
                      <option value="india" className="bg-[#0D0D1A]">India</option>
                      <option value="usa" className="bg-[#0D0D1A]">USA</option>
                      <option value="uk" className="bg-[#0D0D1A]">UK</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Current Education Level</label>
                  <select 
                    value={profile.level}
                    onChange={e => setProfile({...profile, level: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white"
                  >
                    <option value="bachelor" className="bg-[#0D0D1A]">Bachelor's Degree</option>
                    <option value="master" className="bg-[#0D0D1A]">Master's Degree</option>
                    <option value="phd" className="bg-[#0D0D1A]">PhD</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Field of Study</label>
                  <Input
                    placeholder="Computer Science"
                    value={profile.field}
                    onChange={e => setProfile({...profile, field: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">Notification Preferences</h3>
              <div className="space-y-6">
                {[
                  { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
                  { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
                  { key: "deadlines", label: "Deadline Reminders", desc: "Get reminded about application deadlines" },
                  { key: "scholarships", label: "Scholarship Alerts", desc: "Notify me about new scholarship opportunities" },
                  { key: "updates", label: "Product Updates", desc: "News about new features and improvements" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <div className="font-semibold text-white mb-1">{item.label}</div>
                      <div className="text-sm text-white/60">{item.desc}</div>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">Privacy & Security</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Current Password</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <Button 
                  onClick={handleUpdatePassword}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all font-semibold"
                >
                  {passwordStatus}
                </Button>
                <div className="border-t border-white/10 pt-6 mt-6">
                  <h4 className="text-white font-semibold mb-4">Data Privacy</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                      <div>
                        <div className="font-semibold text-white mb-1">Profile Visibility</div>
                        <div className="text-sm text-white/60">Make profile visible to other users</div>
                      </div>
                      <Switch 
                        checked={privacy.visibility}
                        onCheckedChange={(checked) => setPrivacy({...privacy, visibility: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                      <div>
                        <div className="font-semibold text-white mb-1">Data Sharing</div>
                        <div className="text-sm text-white/60">Share anonymized data for research</div>
                      </div>
                      <Switch 
                        checked={privacy.dataSharing}
                        onCheckedChange={(checked) => setPrivacy({...privacy, dataSharing: checked})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">Appearance Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-white/60 mb-3 block">Theme</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPendingTheme("dark")}
                      className={`p-6 rounded-xl border-2 transition ${
                        pendingTheme === "dark"
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="w-full h-20 bg-[#0D0D1A] rounded-lg mb-3 border border-white/10" />
                      <div className="text-white font-semibold">Dark Mode</div>
                      <div className="text-xs text-white/60 mt-1">Current theme</div>
                    </button>
                    <button
                      onClick={() => setPendingTheme("light")}
                      className={`p-6 rounded-xl border-2 transition ${
                        pendingTheme === "light"
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="w-full h-20 bg-white rounded-lg mb-3 border border-gray-200" />
                      <div className="text-white font-semibold">Morning Nature</div>
                      <div className="text-xs text-white/60 mt-1">Natural daylight background</div>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-3 block">Language Dashboard Translation</label>
                  <select 
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white"
                    value={pendingLang}
                    onChange={(e) => setPendingLang(e.target.value)}
                  >
                    <option value="en" className="bg-[#0D0D1A]">English</option>
                    <option value="es" className="bg-[#0D0D1A]">Español (Spanish)</option>
                    <option value="fr" className="bg-[#0D0D1A]">Français (French)</option>
                    <option value="de" className="bg-[#0D0D1A]">Deutsch (German)</option>
                    <option value="hi" className="bg-[#0D0D1A]">हिन्दी (Hindi)</option>
                    <option value="zh-CN" className="bg-[#0D0D1A]">中文 (Chinese)</option>
                    <option value="ja" className="bg-[#0D0D1A]">日本語 (Japanese)</option>
                  </select>
                  <div className="text-xs text-white/50 mt-2">
                    Applies live translation to the entire project interface instantly.
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}