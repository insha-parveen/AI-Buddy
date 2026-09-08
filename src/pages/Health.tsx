import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Activity, BarChart3, Calendar as CalendarIcon,
  Plus, Check, Trash2, Flame, Droplets, Moon,
  Brain, Dumbbell, Apple, Target, TrendingUp,
  Sparkles, Trophy, Zap, Loader2, RefreshCw
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import AppSidebar from "@/components/AppSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FloatingElements } from "@/components/FloatingElements";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { useShouldReduceAnimations } from "@/hooks/useReducedMotion";

interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  streak: number;
  completedDates: string[];
}

interface DailyLog {
  sleep: number;
  water: number;
  exercise: number;
  mood: number;
  calories: number;
}

interface HealthMetric {
  date: string;
  sleep: number;
  water: number;
  exercise: number;
  mood: number;
}

const HABIT_ICONS: Record<string, any> = {
  heart: Heart,
  droplets: Droplets,
  moon: Moon,
  brain: Brain,
  dumbbell: Dumbbell,
  apple: Apple,
  flame: Flame,
  target: Target,
};

const HABIT_COLORS = [
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#f97316" },
  { name: "Cyan", value: "#06b6d4" },
];

const MOOD_EMOJIS = ["😢", "😕", "😐", "🙂", "😄"];

export default function Health() {
  const reduceAnimations = useShouldReduceAnimations();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("heart");
  const [newHabitColor, setNewHabitColor] = useState("#22c55e");
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [dailyLog, setDailyLog] = useState<DailyLog>({
    sleep: 0,
    water: 0,
    exercise: 0,
    mood: 3,
    calories: 0,
  });
  const [weeklyData, setWeeklyData] = useState<HealthMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // AI Insights state
  const [aiInsights, setAiInsights] = useState<string>("");
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Load user and data
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadHabits(user.id);
        loadHealthLogs(user.id);
      }
    };
    loadUser();
  }, []);

  // Load habits from DB
  const loadHabits = async (uid: string) => {
    const { data, error } = await supabase
      .from("health_habits")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: true });
    if (!error && data) {
      setHabits(data.map((h: any) => ({
        id: h.id,
        name: h.name,
        icon: h.icon,
        color: h.color,
        streak: h.streak,
        completedDates: (h.completed_dates as string[]) || [],
      })));
    }
  };

  // Load health logs from DB
  const loadHealthLogs = async (uid: string) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Last 7 days including today

    const { data, error } = await supabase
      .from("health_logs")
      .select("*")
      .eq("user_id", uid)
      .gte("date", sevenDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (data && !error) {
      const metrics: HealthMetric[] = [];
      const grouped = data.reduce((acc: any, log) => {
        if (!acc[log.date]) acc[log.date] = {};
        const logData = log.data as Record<string, number>;
        acc[log.date][log.log_type] = logData.value || 0;
        return acc;
      }, {});

      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const values = grouped[dateStr] || {};

        metrics.push({
          date: d.toLocaleDateString("en-US", { weekday: "short" }),
          sleep: values.sleep || 0,
          water: values.water || 0,
          exercise: values.exercise || 0,
          mood: values.mood || 0,
        });
      }

      setWeeklyData(metrics);

      // Load today's log
      const todayStr = new Date().toISOString().split("T")[0];
      const todayLogs = data.filter(log => log.date === todayStr);
      if (todayLogs.length > 0) {
        const todayData: DailyLog = { sleep: 0, water: 0, exercise: 0, mood: 3, calories: 0 };
        todayLogs.forEach(log => {
          const logData = log.data as Record<string, number>;
          (todayData as any)[log.log_type] = logData.value || 0;
        });
        setDailyLog(todayData);
      }
    }
  };

  // Save daily log to DB
  const saveDailyLog = async (type: string, value: number) => {
    if (!userId) {
      toast.error("Please sign in to track health");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("health_logs")
      .select("id")
      .eq("user_id", userId)
      .eq("date", today)
      .eq("log_type", type)
      .single();

    if (existing) {
      await supabase
        .from("health_logs")
        .update({ data: { value } })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("health_logs")
        .insert({
          user_id: userId,
          date: today,
          log_type: type,
          data: { value },
        });
    }

    setDailyLog(prev => ({ ...prev, [type]: value }));
    const todayWeekday = new Date().toLocaleDateString("en-US", { weekday: "short" });
    setWeeklyData(prev => {
      const newWeeklyData = [...prev];
      const todayIndex = newWeeklyData.findIndex(d => d.date === todayWeekday);
      if (todayIndex >= 0) {
        newWeeklyData[todayIndex] = { ...newWeeklyData[todayIndex], [type]: value };
      }
      return newWeeklyData;
    });
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} logged!`);
  };

  // Add new habit - DB
  const addHabit = async () => {
    if (!newHabitName.trim() || !userId) return;

    const { data, error } = await supabase
      .from("health_habits")
      .insert({
        user_id: userId,
        name: newHabitName,
        icon: newHabitIcon,
        color: newHabitColor,
        streak: 0,
        completed_dates: [],
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create habit");
      return;
    }

    const newHabit: Habit = {
      id: data.id,
      name: data.name,
      icon: data.icon,
      color: data.color,
      streak: 0,
      completedDates: [],
    };

    setHabits([...habits, newHabit]);
    setNewHabitName("");
    setShowAddHabit(false);
    toast.success("Habit created!");
  };

  // Toggle habit completion - DB
  const toggleHabit = async (habitId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDates.includes(today);
    const completedDates = isCompleted
      ? habit.completedDates.filter(d => d !== today)
      : [...habit.completedDates, today];

    // Calculate streak
    let streak = 0;
    const sortedDates = [...completedDates].sort().reverse();
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      if (sortedDates[i] === expectedDate.toISOString().split("T")[0]) {
        streak++;
      } else {
        break;
      }
    }

    await supabase
      .from("health_habits")
      .update({ completed_dates: completedDates, streak })
      .eq("id", habitId);

    setHabits(habits.map(h => h.id === habitId ? { ...h, completedDates, streak } : h));
  };

  // Delete habit - DB
  const deleteHabit = async (habitId: string) => {
    await supabase.from("health_habits").delete().eq("id", habitId);
    setHabits(habits.filter(h => h.id !== habitId));
    toast.success("Habit deleted");
  };

  // Calendar is locked to the current month, aligned with the rest of the page
  // which always shows today's data (daily log, stats, charts).
  const currentMonth = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Stats calculations
  const completedToday = habits.filter(h =>
    h.completedDates.includes(new Date().toISOString().split("T")[0])
  ).length;

  const completionRate = habits.length > 0
    ? Math.round((completedToday / habits.length) * 100)
    : 0;

  const longestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  // Chart colors
  const COLORS = ["#22c55e", "#3b82f6", "#8b5cf6", "#f97316"];

  const moodData = weeklyData.map(d => ({ name: d.date, value: d.mood }));
  const activityData = [
    { name: "Sleep", value: dailyLog.sleep, color: "#8b5cf6" },
    { name: "Water", value: dailyLog.water, color: "#3b82f6" },
    { name: "Exercise", value: dailyLog.exercise, color: "#22c55e" },
  ];

  // Generate AI health insights
  const generateHealthInsights = async () => {
    setIsGeneratingInsights(true);
    setAiInsights("");

    const today = new Date().toISOString().split("T")[0];
    const healthData = {
      habits: habits.map(h => ({
        name: h.name,
        streak: h.streak,
        completedToday: h.completedDates.includes(today),
      })),
      dailyLog,
      weeklyData,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/health-insights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ healthData }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please try again later.");
          setIsGeneratingInsights(false);
          return;
        }
        if (response.status === 402) {
          toast.error("AI credits exhausted. Please add credits.");
          setIsGeneratingInsights(false);
          return;
        }
        throw new Error("Failed to generate insights");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let textBuffer = "";
      let insightsSoFar = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              insightsSoFar += content;
              setAiInsights(insightsSoFar);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      toast.success("Health insights generated!");
    } catch (error) {
      console.error("Error generating insights:", error);
      toast.error("Failed to generate insights. Please try again.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      <FloatingElements />

      {/* Cyber Grid Background - only when animations are not reduced */}
      {!reduceAnimations && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
          {/* Scan Line Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[2px]"
            animate={{ y: [0, 800, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      <AppSidebar />

      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/5 backdrop-blur-sm sticky top-0 z-40">
          <div className="px-8 py-4 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1">
                Health & Wellness
              </h1>
              <p className="text-sm text-muted-foreground">Track habits and monitor your wellness journey</p>
            </motion.div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">🇺🇸 English</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="p-6 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20 backdrop-blur-sm overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <Heart className="w-6 h-6 text-green-400" />
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-5 h-5 text-green-400/60" />
                  </motion.div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Today's Progress</p>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-bold text-green-400">{completedToday}</span>
                  <span className="text-muted-foreground">/{habits.length}</span>
                </div>
                <Progress value={completionRate} className="h-2 bg-green-500/20" />
                <p className="text-xs text-muted-foreground mt-2">{completionRate}% completion rate</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="p-6 bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20 backdrop-blur-sm overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-orange-500/20">
                    <Flame className="w-6 h-6 text-orange-400" />
                  </div>
                  <Trophy className="w-5 h-5 text-orange-400/60" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">Longest Streak</p>
                <p className="text-4xl font-bold text-orange-400 mb-1">{longestStreak}</p>
                <p className="text-xs text-muted-foreground">days in a row 🔥</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="p-6 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20 backdrop-blur-sm overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <Droplets className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Water Intake</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-blue-400">{dailyLog.water}</span>
                  <span className="text-muted-foreground">/ 8 glasses</span>
                </div>
                <Progress value={(dailyLog.water / 8) * 100} className="h-2 bg-blue-500/20 mt-3" />
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20 backdrop-blur-sm overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <Moon className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Sleep Quality</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-purple-400">{dailyLog.sleep}</span>
                  <span className="text-muted-foreground">hours</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {dailyLog.sleep >= 7 ? "Great rest! 😴" : "Need more sleep 💤"}
                </p>
              </Card>
            </motion.div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="habits" className="w-full">
            <TabsList className="mb-6 bg-background/5 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="habits" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                <Heart className="w-4 h-4 mr-2" />
                Habits ({habits.length})
              </TabsTrigger>
              <TabsTrigger value="tracking" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Daily Log
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <Zap className="w-4 h-4 mr-2" />
                AI Insights
              </TabsTrigger>
            </TabsList>

            {/* Habits Tab */}
            <TabsContent value="habits">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Habit List */}
                <div className="lg:col-span-2 space-y-4">
                  <AnimatePresence>
                    {habits.map((habit, index) => {
                      const IconComponent = HABIT_ICONS[habit.icon] || Heart;
                      const isCompletedToday = habit.completedDates.includes(
                        new Date().toISOString().split("T")[0]
                      );

                      return (
                        <motion.div
                          key={habit.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card
                            className={`p-4 backdrop-blur-sm border-border/50 transition-all ${isCompletedToday
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-background/5 hover:bg-background/10"
                              }`}
                          >
                            <div className="flex items-center gap-4">
                              <motion.button
                                onClick={() => toggleHabit(habit.id)}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isCompletedToday
                                  ? "bg-green-500 text-white"
                                  : "border-2 border-dashed"
                                  }`}
                                style={{ borderColor: isCompletedToday ? undefined : habit.color }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {isCompletedToday ? (
                                  <Check className="w-6 h-6" />
                                ) : (
                                  <IconComponent className="w-6 h-6" style={{ color: habit.color }} />
                                )}
                              </motion.button>

                              <div className="flex-1">
                                <h3 className={`font-semibold ${isCompletedToday ? "line-through text-muted-foreground" : ""}`}>
                                  {habit.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Flame className="w-4 h-4 text-orange-400" />
                                  <span className="text-sm text-muted-foreground">
                                    {habit.streak} day streak
                                  </span>
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteHabit(habit.id)}
                                className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {habits.length === 0 && !showAddHabit && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Card className="p-12 backdrop-blur-sm bg-background/5 border-border/50 text-center">
                        <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                        <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
                        <p className="text-muted-foreground mb-6">Start building healthy routines today!</p>
                        <Button
                          onClick={() => setShowAddHabit(true)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Habit
                        </Button>
                      </Card>
                    </motion.div>
                  )}
                </div>

                {/* Add Habit Card */}
                <div>
                  <AnimatePresence mode="wait">
                    {showAddHabit ? (
                      <motion.div
                        key="add-form"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <Card className="p-6 backdrop-blur-sm bg-background/5 border-border/50">
                          <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-green-400" />
                            New Habit
                          </h3>

                          <div className="space-y-4">
                            <div>
                              <label className="text-sm text-muted-foreground mb-2 block">Habit Name</label>
                              <Input
                                value={newHabitName}
                                onChange={(e) => setNewHabitName(e.target.value)}
                                placeholder="e.g., Morning meditation"
                                className="bg-background/5 border-border/50"
                              />
                            </div>

                            <div>
                              <label className="text-sm text-muted-foreground mb-2 block">Icon</label>
                              <div className="grid grid-cols-4 gap-2">
                                {Object.entries(HABIT_ICONS).map(([key, Icon]) => (
                                  <motion.button
                                    key={key}
                                    onClick={() => setNewHabitIcon(key)}
                                    className={`p-3 rounded-xl border transition-all ${newHabitIcon === key
                                      ? "border-green-500 bg-green-500/20"
                                      : "border-border/50 hover:border-border"
                                      }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Icon className="w-5 h-5 mx-auto" style={{ color: newHabitColor }} />
                                  </motion.button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="text-sm text-muted-foreground mb-2 block">Color</label>
                              <div className="grid grid-cols-6 gap-2">
                                {HABIT_COLORS.map((color) => (
                                  <motion.button
                                    key={color.value}
                                    onClick={() => setNewHabitColor(color.value)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${newHabitColor === color.value
                                      ? "border-white scale-110"
                                      : "border-transparent"
                                      }`}
                                    style={{ backgroundColor: color.value }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={addHabit}
                                disabled={!newHabitName.trim()}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Habit
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setShowAddHabit(false)}
                                className="border-border/50"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="add-button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Card
                          className="p-6 backdrop-blur-sm bg-background/5 border-border/50 border-dashed cursor-pointer hover:bg-background/5 transition-all"
                          onClick={() => setShowAddHabit(true)}
                        >
                          <div className="text-center py-8">
                            <motion.div
                              className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
                              whileHover={{ scale: 1.1, rotate: 90 }}
                              transition={{ type: "spring" }}
                            >
                              <Plus className="w-8 h-8 text-green-400" />
                            </motion.div>
                            <p className="text-muted-foreground">Add New Habit</p>
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </TabsContent>

            {/* Daily Log Tab */}
            <TabsContent value="tracking">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="p-6 backdrop-blur-sm bg-background/5 border-border/50">
                    <h3 className="font-semibold mb-4">Activity Calendar</h3>
                    <div className="mb-4 text-center">
                      <span className="font-medium">{currentMonth}</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {weekDays.map(day => (
                        <div key={day} className="text-center text-xs text-muted-foreground font-medium py-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      {days.map(day => {
                        const dateStr = new Date(new Date().getFullYear(), new Date().getMonth(), day)
                          .toISOString().split("T")[0];
                        const habitsCompleted = habits.filter(h => h.completedDates.includes(dateStr)).length;
                        const isToday = new Date().toDateString() ===
                          new Date(new Date().getFullYear(), new Date().getMonth(), day).toDateString();

                        return (
                          <motion.button
                            key={day}
                            className={`aspect-square rounded-lg text-sm font-medium transition-all relative ${isToday
                              ? "bg-green-500 text-white"
                              : habitsCompleted > 0
                                ? "bg-green-500/20 text-green-400"
                                : "hover:bg-background/10"
                              }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {day}
                            {habitsCompleted > 0 && !isToday && (
                              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-400" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </Card>
                </motion.div>

                {/* Quick Log */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="p-6 backdrop-blur-sm bg-background/5 border-border/50">
                    <h3 className="font-semibold mb-6">Quick Log Today</h3>

                    <div className="space-y-6">
                      {/* Sleep */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Moon className="w-5 h-5 text-purple-400" />
                            <span>Sleep</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{dailyLog.sleep}h</span>
                        </div>
                        <div className="flex gap-2">
                          {[4, 5, 6, 7, 8, 9, 10].map(hours => (
                            <motion.button
                              key={hours}
                              onClick={() => saveDailyLog("sleep", hours)}
                              className={`flex-1 py-2 rounded-lg text-sm transition-all ${dailyLog.sleep === hours
                                ? "bg-purple-500 text-white"
                                : "bg-purple-500/10 hover:bg-purple-500/20"
                                }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {hours}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Water */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Droplets className="w-5 h-5 text-blue-400" />
                            <span>Water (glasses)</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{dailyLog.water}/8</span>
                        </div>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(glasses => (
                            <motion.button
                              key={glasses}
                              onClick={() => saveDailyLog("water", glasses)}
                              className={`flex-1 py-2 rounded-lg text-sm transition-all ${dailyLog.water >= glasses
                                ? "bg-blue-500 text-white"
                                : "bg-blue-500/10 hover:bg-blue-500/20"
                                }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {glasses}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Exercise */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Dumbbell className="w-5 h-5 text-green-400" />
                            <span>Exercise (mins)</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{dailyLog.exercise}min</span>
                        </div>
                        <div className="flex gap-2">
                          {[0, 15, 30, 45, 60, 90].map(mins => (
                            <motion.button
                              key={mins}
                              onClick={() => saveDailyLog("exercise", mins)}
                              className={`flex-1 py-2 rounded-lg text-sm transition-all ${dailyLog.exercise === mins
                                ? "bg-green-500 text-white"
                                : "bg-green-500/10 hover:bg-green-500/20"
                                }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {mins}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Mood */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-pink-400" />
                            <span>Mood</span>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-between">
                          {MOOD_EMOJIS.map((emoji, index) => (
                            <motion.button
                              key={index}
                              onClick={() => saveDailyLog("mood", index + 1)}
                              className={`flex-1 py-3 rounded-lg text-2xl transition-all ${dailyLog.mood === index + 1
                                ? "bg-pink-500/30 ring-2 ring-pink-500"
                                : "bg-pink-500/10 hover:bg-pink-500/20"
                                }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {emoji}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Trends */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="p-6 backdrop-blur-sm bg-background/5 border-border/50">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Weekly Activity
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyData}>
                          <defs>
                            <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="exerciseGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" stroke="#888" fontSize={12} />
                          <YAxis stroke="#888" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="sleep"
                            stroke="#8b5cf6"
                            fill="url(#sleepGradient)"
                            name="Sleep (hrs)"
                          />
                          <Area
                            type="monotone"
                            dataKey="exercise"
                            stroke="#22c55e"
                            fill="url(#exerciseGradient)"
                            name="Exercise (mins)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </motion.div>

                {/* Today's Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="p-6 backdrop-blur-sm bg-background/5 border-border/50">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-400" />
                      Today's Summary
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={activityData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {activityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                      {activityData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-muted-foreground">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>

                {/* Mood Tracker */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="p-6 backdrop-blur-sm bg-background/5 border-border/50">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-pink-400" />
                      Mood This Week
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={moodData}>
                          <XAxis dataKey="name" stroke="#888" fontSize={12} />
                          <YAxis stroke="#888" fontSize={12} domain={[0, 5]} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number) => [MOOD_EMOJIS[value - 1] || "😐", "Mood"]}
                          />
                          <Bar
                            dataKey="value"
                            fill="#ec4899"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </motion.div>

                {/* Habit Completion Rate */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="p-6 backdrop-blur-sm bg-background/5 border-border/50">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Habit Streaks
                    </h3>
                    <div className="space-y-4">
                      {habits.length > 0 ? (
                        habits.map((habit) => {
                          const IconComponent = HABIT_ICONS[habit.icon] || Heart;
                          return (
                            <div key={habit.id} className="flex items-center gap-4">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${habit.color}20` }}
                              >
                                <IconComponent className="w-5 h-5" style={{ color: habit.color }} />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">{habit.name}</span>
                                  <span className="text-sm text-muted-foreground">{habit.streak} days</span>
                                </div>
                                <Progress
                                  value={Math.min(habit.streak * 10, 100)}
                                  className="h-2"
                                  style={{ backgroundColor: `${habit.color}20` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Create habits to see streak data</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="insights">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Generate Insights Panel */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-1"
                >
                  <Card className="p-6 backdrop-blur-sm bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-cyan-500/30">
                    <div className="text-center mb-6">
                      <motion.div
                        className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 flex items-center justify-center"
                        animate={{
                          boxShadow: [
                            "0 0 20px rgba(6, 182, 212, 0.3)",
                            "0 0 40px rgba(6, 182, 212, 0.5)",
                            "0 0 20px rgba(6, 182, 212, 0.3)",
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Zap className="w-10 h-10 text-cyan-400" />
                      </motion.div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                        AI Health Coach
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Get personalized insights based on your health data
                      </p>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <Heart className="w-4 h-4 text-green-400" />
                        </div>
                        <span className="text-muted-foreground">
                          {habits.length} habits tracked
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Activity className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-muted-foreground">
                          {weeklyData.length} days of data
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <Brain className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="text-muted-foreground">
                          Current mood: {MOOD_EMOJIS[dailyLog.mood - 1] || "😐"}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={generateHealthInsights}
                      disabled={isGeneratingInsights}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    >
                      {isGeneratingInsights ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Insights
                        </>
                      )}
                    </Button>
                  </Card>
                </motion.div>

                {/* Insights Display */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="lg:col-span-2"
                >
                  <Card className="p-6 backdrop-blur-sm bg-background/5 border-border/50 min-h-[500px]">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Brain className="w-5 h-5 text-cyan-400" />
                        Your Health Insights
                      </h3>
                      {aiInsights && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={generateHealthInsights}
                          disabled={isGeneratingInsights}
                          className="text-muted-foreground hover:text-cyan-400"
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${isGeneratingInsights ? "animate-spin" : ""}`} />
                          Refresh
                        </Button>
                      )}
                    </div>

                    {aiInsights ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="prose prose-sm prose-invert max-w-none"
                      >
                        <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                          {aiInsights.split("\n").map((line, i) => {
                            if (line.startsWith("**") && line.endsWith("**")) {
                              return (
                                <h4 key={i} className="text-lg font-semibold mt-6 mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                  {line.replace(/\*\*/g, "")}
                                </h4>
                              );
                            }
                            if (line.startsWith("- ") || line.startsWith("• ")) {
                              return (
                                <div key={i} className="flex items-start gap-2 my-2">
                                  <span className="text-cyan-400 mt-1">•</span>
                                  <span>{line.slice(2)}</span>
                                </div>
                              );
                            }
                            if (line.match(/^\d+\./)) {
                              return (
                                <div key={i} className="flex items-start gap-2 my-2">
                                  <span className="text-cyan-400 font-medium">{line.split(".")[0]}.</span>
                                  <span>{line.slice(line.indexOf(".") + 1).trim()}</span>
                                </div>
                              );
                            }
                            return line ? <p key={i} className="my-2">{line}</p> : <br key={i} />;
                          })}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[400px] text-center">
                        <motion.div
                          animate={{
                            y: [0, -10, 0],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center mb-6">
                            <Zap className="w-12 h-12 text-cyan-400/50" />
                          </div>
                        </motion.div>
                        <h4 className="text-lg font-medium mb-2">Ready to Analyze</h4>
                        <p className="text-muted-foreground max-w-md">
                          Click "Generate Insights" to get personalized health recommendations based on your tracked habits, daily logs, and weekly trends.
                        </p>
                      </div>
                    )}
                  </Card>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-3"
                >
                  <Card className="p-6 backdrop-blur-sm bg-background/5 border-border/50">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Health Snapshot
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 text-center">
                        <Heart className="w-6 h-6 mx-auto mb-2 text-green-400" />
                        <p className="text-2xl font-bold text-green-400">{completedToday}</p>
                        <p className="text-xs text-muted-foreground">Habits Today</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/5 text-center">
                        <Flame className="w-6 h-6 mx-auto mb-2 text-orange-400" />
                        <p className="text-2xl font-bold text-orange-400">{longestStreak}</p>
                        <p className="text-xs text-muted-foreground">Best Streak</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 text-center">
                        <Moon className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                        <p className="text-2xl font-bold text-purple-400">{dailyLog.sleep}h</p>
                        <p className="text-xs text-muted-foreground">Sleep</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 text-center">
                        <Droplets className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                        <p className="text-2xl font-bold text-blue-400">{dailyLog.water}</p>
                        <p className="text-xs text-muted-foreground">Water (glasses)</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/5 text-center">
                        <Brain className="w-6 h-6 mx-auto mb-2 text-pink-400" />
                        <p className="text-2xl font-bold">{MOOD_EMOJIS[dailyLog.mood - 1] || "😐"}</p>
                        <p className="text-xs text-muted-foreground">Mood</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
