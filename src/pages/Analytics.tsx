import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, TrendingUp, Clock, Flame, RefreshCw, Activity, Zap, Target, Brain, Users, LineChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppSidebar from "@/components/AppSidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart as RechartsLineChart, Line, Legend, RadialBarChart, RadialBar } from "recharts";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MilkyWayBackground } from "@/components/MilkyWayBackground";
import { AnalyticsBackground } from "@/components/AnalyticsBackground";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7');
  const [realStats, setRealStats] = useState({
    totalInteractions: 0,
    conversations: 0,
    healthLogs: 0,
    transactions: 0,
    learningGoals: 0,
    goalProgress: 0,
  });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [usageData, setUsageData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
    const since = daysAgo.toISOString();

    const [convRes, msgRes, healthRes, finRes, learnRes, learnAllRes] = await Promise.all([
      supabase.from("chat_conversations").select("id, created_at"),
      supabase.from("chat_messages").select("id, created_at"),
      supabase.from("health_logs").select("id, date, log_type"),
      supabase.from("finance_transactions").select("id, date, amount, type"),
      supabase.from("learning_goals").select("id, progress, status"),
      supabase.from("learning_goals").select("id, progress"),
    ]);

    const conversations = convRes.data || [];
    const messages = msgRes.data || [];
    const healthLogs = healthRes.data || [];
    const transactions = finRes.data || [];
    const goals = learnRes.data || [];
    const allGoals = learnAllRes.data || [];

    const totalInteractions = messages.length + healthLogs.length + transactions.length;
    const avgProgress = allGoals.length > 0 
      ? Math.round(allGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / allGoals.length)
      : 0;

    setRealStats({
      totalInteractions,
      conversations: conversations.length,
      healthLogs: healthLogs.length,
      transactions: transactions.length,
      learningGoals: goals.length,
      goalProgress: avgProgress,
    });

    // Build usage distribution
    const total = Math.max(messages.length + healthLogs.length + transactions.length + goals.length, 1);
    setUsageData([
      { name: 'Chat', value: Math.round((messages.length / total) * 100) || 0, color: 'hsl(280 70% 60%)' },
      { name: 'Health', value: Math.round((healthLogs.length / total) * 100) || 0, color: 'hsl(142 76% 45%)' },
      { name: 'Finance', value: Math.round((transactions.length / total) * 100) || 0, color: 'hsl(45 100% 50%)' },
      { name: 'Learning', value: Math.round((goals.length / total) * 100) || 0, color: 'hsl(188 100% 42%)' },
    ]);

    // Build weekly data from last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekly: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      weekly.push({
        day: dayName,
        chat: messages.filter(m => m.created_at?.startsWith(dayStr)).length,
        health: healthLogs.filter(h => h.date?.startsWith(dayStr)).length,
        finance: transactions.filter(t => t.date?.startsWith(dayStr)).length,
      });
    }
    setWeeklyData(weekly);
    setLoading(false);
  };

  const goalProgress = [
    { name: 'Learning Goals', value: realStats.goalProgress, fill: 'hsl(188 100% 42%)' },
    { name: 'Health Tracking', value: realStats.healthLogs > 0 ? Math.min(100, realStats.healthLogs * 10) : 0, fill: 'hsl(142 76% 45%)' },
    { name: 'Finance Management', value: realStats.transactions > 0 ? Math.min(100, realStats.transactions * 5) : 0, fill: 'hsl(45 100% 50%)' },
  ];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      <MilkyWayBackground />
      <AnalyticsBackground />
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
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm"
              >
                <Activity className="w-6 h-6 text-primary" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">Comprehensive insights into your AI assistant usage</p>
              </div>
            </motion.div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          {/* Time Range Filter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-3 mb-8"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Time Range:</span>
            </div>
            <div className="flex gap-2">
              {['7', '30', '90', '365'].map((range) => (
                <Button 
                  key={range}
                  size="sm" 
                  variant={timeRange === range ? "default" : "outline"}
                  onClick={() => setTimeRange(range)}
                  className={timeRange === range ? "" : "border-white/20 bg-white/5 hover:bg-white/10"}
                >
                  {range === '365' ? '1 Year' : `${range} Days`}
                </Button>
              ))}
            </div>
            <Button size="sm" variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 ml-auto">
              Export Data
            </Button>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {[
              { label: 'Total Interactions', value: realStats.totalInteractions.toLocaleString(), icon: Zap, color: 'text-primary', badge: `${realStats.conversations} chats`, badgeColor: 'bg-primary/20 text-primary', change: `${realStats.conversations} conversations` },
              { label: 'Learning Goals', value: String(realStats.learningGoals), icon: TrendingUp, color: 'text-green-500', badge: `${realStats.goalProgress}% avg`, badgeColor: 'bg-green-500/20 text-green-400', change: `Avg progress: ${realStats.goalProgress}%` },
              { label: 'Health Logs', value: String(realStats.healthLogs), icon: Clock, color: 'text-secondary', badge: `${realStats.healthLogs} entries`, badgeColor: 'bg-secondary/20 text-secondary', change: 'Total health entries' },
              { label: 'Finance Records', value: String(realStats.transactions), icon: Flame, color: 'text-amber-500', badge: `${realStats.transactions} txns`, badgeColor: 'bg-amber-500/20 text-amber-400', change: 'Total transactions recorded' },
            ].map((stat, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="p-6 bg-white/5 backdrop-blur-2xl border border-white/10 hover:border-primary/40 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_hsl(195_100%_50%/0.15)]">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-xl bg-white/10 ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className={`${stat.badgeColor} border-0`}>
                      {stat.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="p-6 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-primary">Weekly Activity</h3>
                    <p className="text-xs text-muted-foreground">Your activity patterns over the past week</p>
                  </div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
                      <defs>
                        <linearGradient id="colorLearning" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(188 100% 42%)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(188 100% 42%)" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(280 70% 60%)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(280 70% 60%)" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Area type="monotone" dataKey="learning" stroke="hsl(188 100% 42%)" fillOpacity={1} fill="url(#colorLearning)" />
                      <Area type="monotone" dataKey="health" stroke="hsl(280 70% 60%)" fillOpacity={1} fill="url(#colorHealth)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="p-6 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-primary">Usage Categories</h3>
                    <p className="text-xs text-muted-foreground">Distribution of your AI assistant usage</p>
                  </div>
                </div>
                <div className="h-[300px] flex items-center">
                  <div className="w-1/2">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={usageData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {usageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 space-y-2">
                    {usageData.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-muted-foreground flex-1">{item.name}</span>
                        <span className="text-sm font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Additional Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card className="p-6 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <div className="flex items-center gap-2 mb-6">
                  <LineChart className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-primary">Monthly Trend</h3>
                    <p className="text-xs text-muted-foreground">Productivity over time</p>
                  </div>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line type="monotone" dataKey="chat" stroke="hsl(188 100% 42%)" strokeWidth={2} dot={{ fill: 'hsl(188 100% 42%)' }} />
                      <Line type="monotone" dataKey="health" stroke="hsl(280 70% 60%)" strokeWidth={2} dot={{ fill: 'hsl(280 70% 60%)' }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <Card className="p-6 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <div className="flex items-center gap-2 mb-6">
                  <Brain className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-primary">AI Feature Usage</h3>
                    <p className="text-xs text-muted-foreground">Interactions by feature</p>
                  </div>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={70} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="value" fill="hsl(188 100% 42%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <Card className="p-6 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <div className="flex items-center gap-2 mb-6">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-primary">Goal Progress</h3>
                    <p className="text-xs text-muted-foreground">Achievement status</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {goalProgress.map((goal, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{goal.name}</span>
                        <span className="font-medium">{goal.value}%</span>
                      </div>
                      <Progress value={goal.value} className="h-2" />
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall Completion</span>
                    <span className="text-2xl font-bold text-primary">60%</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
