import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowLeft, User, Bell, Lock, Palette, Globe, Save } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Switch } from "@components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
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
      field: profileData.field || "",
      profile_picture: profileData.profile_picture || null,
      referral_code: profileData.referral_code || ""
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
      const refCode = profile.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const payload = {
        user_id: authUser.id,
        full_name: profile.name,
        phone: profile.phone,
        target_country: profile.country,
        target_field: profile.field,
        degree_level: profile.level,
        profile_picture: profile.profile_picture,
        referral_code: refCode
      };

      // 1. Save to Database
      await updateProfile(payload);
      
      const completeProfile = { 
        ...profile, 
        profile_picture: payload.profile_picture, // Ensure we use the latest one
        referral_code: refCode,
        full_name: profile.name // Standardize keys
      };
      
      setProfile(completeProfile);

      // 2. Local Storage Sync (Using the local variable to avoid stale state)
      localStorage.setItem("edupilot-profile", JSON.stringify(completeProfile));
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
      // Fallback: save to local storage anyway
      localStorage.setItem("edupilot-profile", JSON.stringify(profile));
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
      <nav className="relative z-10 backdrop-blur-xl bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent italic tracking-tight">
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
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="profile" className="data-[state=active]:bg-card data-[state=active]:text-primary font-bold">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-card data-[state=active]:text-primary font-bold">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-card data-[state=active]:text-primary font-bold">
              <Lock className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-card data-[state=active]:text-primary font-bold">
              <Palette className="w-4 h-4 mr-2" />
              Theme
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-8 bg-card backdrop-blur-xl border-border shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-border">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 p-1 shadow-2xl overflow-hidden">
                    <div className="w-full h-full rounded-[22px] bg-card flex items-center justify-center overflow-hidden">
                      {profile.profile_picture ? (
                        <img src={profile.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-4xl font-black text-muted-foreground/30 italic">{profile.name?.charAt(0) || "U"}</div>
                      )}
                    </div>
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                    <Input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfile({ ...profile, profile_picture: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <div className="text-white text-xs font-bold uppercase tracking-widest">Change Photo</div>
                  </label>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-black text-foreground italic tracking-tight mb-1">{profile.name || "Elevated User"}</h3>
                  <p className="text-sm text-muted-foreground font-medium mb-4">{profile.email}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                    Verified Navigator
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-6">Profile Information</h3>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-foreground/60 mb-2 block">Full Name</label>
                    <Input
                      placeholder="John Doe"
                      value={profile.name}
                      onChange={e => setProfile({...profile, name: e.target.value})}
                      className="bg-card border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block font-medium">Email Address</label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={profile.email}
                      onChange={e => setProfile({...profile, email: e.target.value})}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block font-medium">Phone Number</label>
                    <Input
                      placeholder="+1 (555) 000-0000"
                      value={profile.phone}
                      onChange={e => setProfile({...profile, phone: e.target.value})}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block font-medium">Country</label>
                    <select 
                      value={profile.country}
                      onChange={e => setProfile({...profile, country: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground font-medium"
                    >
                      <option value="india" className="bg-card">India</option>
                      <option value="usa" className="bg-card">USA</option>
                      <option value="uk" className="bg-card">UK</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Current Education Level</label>
                  <select 
                    value={profile.level}
                    onChange={e => setProfile({...profile, level: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground font-medium"
                  >
                    <option value="bachelor" className="bg-card">Bachelor's Degree</option>
                    <option value="master" className="bg-card">Master's Degree</option>
                    <option value="phd" className="bg-card">PhD</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Field of Study</label>
                  <Input
                    placeholder="Computer Science"
                    value={profile.field}
                    onChange={e => setProfile({...profile, field: e.target.value})}
                    className="bg-input border-border text-foreground"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="p-8 bg-card backdrop-blur-xl border-border shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-6">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
                  { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
                  { key: "deadlines", label: "Deadline Reminders", desc: "Get reminded about application deadlines" },
                  { key: "scholarships", label: "Scholarship Alerts", desc: "Notify me about new scholarship opportunities" },
                  { key: "updates", label: "Product Updates", desc: "News about new features and improvements" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                    <div>
                      <div className="font-bold text-foreground mb-1">{item.label}</div>
                      <div className="text-xs text-muted-foreground font-medium">{item.desc}</div>
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
            <Card className="p-8 bg-card backdrop-blur-xl border-border shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-6">Privacy & Security</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Current Password</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <Button 
                  onClick={handleUpdatePassword}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all font-semibold"
                >
                  {passwordStatus}
                </Button>
                <div className="border-t border-border pt-6 mt-6">
                  <h4 className="text-foreground font-bold mb-4 uppercase text-[10px] tracking-widest">Data Privacy</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                      <div>
                        <div className="font-bold text-foreground mb-1">Profile Visibility</div>
                        <div className="text-xs text-muted-foreground font-medium">Make profile visible to other users</div>
                      </div>
                      <Switch 
                        checked={privacy.visibility}
                        onCheckedChange={(checked) => setPrivacy({...privacy, visibility: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                      <div>
                        <div className="font-bold text-foreground mb-1">Data Sharing</div>
                        <div className="text-xs text-muted-foreground font-medium">Share anonymized data for research</div>
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
            <Card className="p-8 bg-card backdrop-blur-xl border-border shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-6">Appearance Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-3 block font-medium">Theme</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setPendingTheme("dark");
                        localStorage.setItem("edupilot-theme", "dark");
                        window.dispatchEvent(new Event("themechange"));
                      }}
                      className={`p-6 rounded-xl border-2 transition ${
                        pendingTheme === "dark"
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-border/50"
                      }`}
                    >
                      <div className="w-full h-20 bg-[#0D0D1A] rounded-lg mb-3 border border-white/10" />
                      <div className="text-foreground font-semibold">Dark Mode</div>
                      <div className="text-xs text-foreground/60 mt-1">Midnight Theme</div>
                    </button>
                    <button
                      onClick={() => {
                        setPendingTheme("light");
                        localStorage.setItem("edupilot-theme", "light");
                        window.dispatchEvent(new Event("themechange"));
                      }}
                      className={`p-6 rounded-xl border-2 transition ${
                        pendingTheme === "light"
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-border/50"
                      }`}
                    >
                      <div className="w-full h-20 bg-white rounded-lg mb-3 border border-gray-200" />
                      <div className="text-foreground font-semibold">Light Mode</div>
                      <div className="text-xs text-foreground/60 mt-1">Morning Clarity</div>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-foreground/60 mb-3 block">Language Dashboard Translation</label>
                  <select 
                    className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground"
                    value={pendingLang}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setPendingLang(newLang);
                      
                      // 1. Set Google Translate Cookie immediately
                      document.cookie = `googtrans=/en/${newLang}; path=/`;
                      document.cookie = `googtrans=/en/${newLang}; path=/; domain=.vercel.app`; // For deployment
                      
                      // 2. Refresh to apply (Google Translate often requires a soft refresh)
                      localStorage.setItem("edupilot-lang", newLang);
                      window.location.reload();
                    }}
                  >
                    <option value="en" className="bg-card">English</option>
                    <option value="es" className="bg-card">Español (Spanish)</option>
                    <option value="fr" className="bg-card">Français (French)</option>
                    <option value="de" className="bg-card">Deutsch (German)</option>
                    <option value="hi" className="bg-card">हिन्दी (Hindi)</option>
                    <option value="zh-CN" className="bg-card">中文 (Chinese)</option>
                    <option value="ja" className="bg-card">日本語 (Japanese)</option>
                  </select>
                  <div className="text-xs text-foreground/50 mt-2">
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