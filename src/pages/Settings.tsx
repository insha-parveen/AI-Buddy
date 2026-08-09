import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, LogOut, Bell, Shield, Palette,
  Volume2, VolumeX, Globe, Monitor, Smartphone,
  Mail, Key, ChevronRight, Settings as SettingsIcon,
  Save, Send, Loader2, FileText, Edit2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AppSidebar from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MilkyWayBackground } from "@/components/MilkyWayBackground";
import { ProductivityVisuals } from "@/components/ProductivityVisuals";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [language, setLanguage] = useState("en");
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setEditName(user?.user_metadata?.full_name || user?.email?.split('@')[0] || "");
      setLoading(false);

      // Load saved preferences from the profiles table
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("preferences")
          .eq("id", user.id)
          .single();

        const prefs = data?.preferences as any;
        if (prefs) {
          if (typeof prefs.notifications === "boolean") setNotifications(prefs.notifications);
          if (typeof prefs.soundAlerts === "boolean") setSoundAlerts(prefs.soundAlerts);
          if (typeof prefs.language === "string") setLanguage(prefs.language);
          if (typeof prefs.emailNotifications === "boolean") setEmailNotifications(prefs.emailNotifications);
        }
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Error", description: "Failed to logout", variant: "destructive" });
    } else {
      toast({ title: "Logged out", description: "You have been successfully logged out." });
      navigate("/auth");
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Not authenticated");

      const preferences = {
        notifications,
        soundAlerts,
        language,
        emailNotifications,
      };

      const { error } = await supabase
        .from("profiles")
        .upsert({ id: currentUser.id, preferences });

      if (error) throw error;

      toast({ title: "Settings Saved", description: "Your preferences have been updated successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to save settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: editName }
      });
      if (error) throw error;

      // Also update profiles table
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        await supabase.from("profiles").upsert({ id: currentUser.id, full_name: editName });
        setUser(currentUser);
      }
      setEditProfileOpen(false);
      toast({ title: "Profile Updated", description: "Your profile has been updated successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to update profile.", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match or are empty", variant: "destructive" });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;

      setChangePasswordOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Success", description: "Password updated successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to update password.", variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSendReport = async () => {
    setSendingReport(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("send-report");

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "✅ Report Sent!",
        description: `Your analysis report has been sent to ${user?.email}`,
      });
    } catch (err: any) {
      console.error("Send report error:", err);
      let message = err?.message || "Failed to send report.";

      // Handle Supabase function error specifically
      if (err?.context?.status) {
        message = `Function error (Status ${err.context.status}): ${message}`;
      }

      if (message.includes("RESEND_API_KEY")) {
        message = "RESEND_API_KEY is not configured in Supabase Edge Function secrets. Please check SETUP_INSTRUCTIONS.md.";
      }
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSendingReport(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      <MilkyWayBackground />
      <ProductivityVisuals />
      <AppSidebar />

      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-white/10 bg-background/10 backdrop-blur-2xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
        >
          <div className="px-8 py-4 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm">
                <SettingsIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
              </div>
            </motion.div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="destructive" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Profile Section */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Profile
                  </CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20 border-2 border-primary/30">
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</h3>
                      <p className="text-sm text-muted-foreground">{user?.email || 'loading...'}</p>
                      <Badge variant="secondary" className="mt-2 bg-primary/20 text-primary">Premium Member</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 gap-2" onClick={() => setEditProfileOpen(true)}>
                      <Edit2 className="w-3 h-3" />
                      Edit Profile
                    </Button>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        Email
                      </Label>
                      <Input id="email" value={user?.email || ''} disabled className="bg-white/5 border-white/10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-muted-foreground" />
                        Password
                      </Label>
                      <Input id="password" type="password" value="••••••••" disabled className="bg-white/5 border-white/10" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Analysis Report Section */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Analysis Report
                  </CardTitle>
                  <CardDescription>
                    Receive a comprehensive AI-generated report of your health, finance, and learning goals via email.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl mb-1">💰</div>
                        <p className="text-xs text-muted-foreground">Finance Summary</p>
                      </div>
                      <div>
                        <div className="text-2xl mb-1">🏃</div>
                        <p className="text-xs text-muted-foreground">Health Insights</p>
                      </div>
                      <div>
                        <div className="text-2xl mb-1">🎯</div>
                        <p className="text-xs text-muted-foreground">Goal Progress</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    The report will be sent to <strong className="text-foreground">{user?.email}</strong> with AI-powered insights and personalized recommendations.
                  </p>
                  <Button
                    onClick={handleSendReport}
                    disabled={sendingReport}
                    className="w-full gap-2"
                  >
                    {sendingReport ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating & Sending Report...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Analysis Report to Email
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notifications Section */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Configure how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive notifications in browser</p>
                      </div>
                    </div>
                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      {soundAlerts ? <Volume2 className="w-5 h-5 text-muted-foreground" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
                      <div>
                        <p className="font-medium">Sound Alerts</p>
                        <p className="text-sm text-muted-foreground">Play sounds for reminders</p>
                      </div>
                    </div>
                    <Switch checked={soundAlerts} onCheckedChange={setSoundAlerts} />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Get updates via email</p>
                      </div>
                    </div>
                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Appearance Section */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    Appearance
                  </CardTitle>
                  <CardDescription>Customize how the app looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Language</p>
                        <p className="text-sm text-muted-foreground">Select your preferred language</p>
                      </div>
                    </div>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                        <SelectItem value="fr">🇫🇷 French</SelectItem>
                        <SelectItem value="de">🇩🇪 German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Theme</p>
                        <p className="text-sm text-muted-foreground">Choose light or dark mode</p>
                      </div>
                    </div>
                    <ThemeToggle />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Security Section */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Security
                  </CardTitle>
                  <CardDescription>Manage your security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-between border-white/20 hover:bg-white/10"
                    onClick={() => setChangePasswordOpen(true)}
                  >
                    <span className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Change Password
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  <Button variant="outline" className="w-full justify-between border-white/20 hover:bg-white/10">
                    <span className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Two-Factor Authentication
                    </span>
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-0">Coming Soon</Badge>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleSaveSettings} disabled={saving} className="flex-1 gap-2">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </Button>

              <Button variant="destructive" onClick={handleLogout} className="flex-1 gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </motion.div>
          </motion.div>
        </main>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-2xl border border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Edit Profile
            </DialogTitle>
            <DialogDescription>Update your display name below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your name"
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled className="bg-white/5 border-white/10 opacity-60" />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfileOpen(false)} className="border-white/20">Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={savingProfile} className="gap-2">
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-2xl border border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Change Password
            </DialogTitle>
            <DialogDescription>Enter your new password below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePasswordOpen(false)} className="border-white/20">Cancel</Button>
            <Button onClick={handleUpdatePassword} disabled={changingPassword} className="gap-2">
              {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
