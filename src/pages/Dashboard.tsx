import { motion } from "framer-motion";
import { MessageSquare, FileText, Bell, Heart, TrendingUp, Plus, Activity, Brain, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import { Bell as BellIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MilkyWayBackground } from "@/components/MilkyWayBackground";
import { ProductivityVisuals } from "@/components/ProductivityVisuals";
import { useShouldReduceAnimations } from "@/hooks/useReducedMotion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const reduceAnimations = useShouldReduceAnimations();
  const navigate = useNavigate();
  const [dbStats, setDbStats] = useState({ conversations: 0, healthHabits: 0, transactions: 0, learningGoals: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [convRes, healthRes, finRes, learnRes] = await Promise.all([
        supabase.from("chat_conversations").select("id", { count: "exact", head: true }),
        supabase.from("health_logs").select("id", { count: "exact", head: true }),
        supabase.from("finance_transactions").select("id", { count: "exact", head: true }),
        supabase.from("learning_goals").select("id", { count: "exact", head: true }),
      ]);

      setDbStats({
        conversations: convRes.count || 0,
        healthHabits: healthRes.count || 0,
        transactions: finRes.count || 0,
        learningGoals: learnRes.count || 0,
      });
    };
    fetchStats();
  }, []);

  const stats = [
    {
      title: "Total Conversations",
      value: String(dbStats.conversations),
      subtitle: "AI chat sessions",
      icon: MessageSquare,
      color: "text-primary",
      dotColor: "bg-primary",
      gradient: "from-primary/20 to-accent/10"
    },
    {
      title: "Learning Goals",
      value: String(dbStats.learningGoals),
      subtitle: "Goals tracked",
      icon: FileText,
      color: "text-secondary",
      dotColor: "bg-secondary",
      gradient: "from-secondary/20 to-primary/10"
    },
    {
      title: "Transactions",
      value: String(dbStats.transactions),
      subtitle: "Finance records",
      icon: Bell,
      color: "text-accent",
      dotColor: "bg-accent",
      gradient: "from-accent/20 to-primary/10"
    },
    {
      title: "Health Logs",
      value: String(dbStats.healthHabits),
      subtitle: "Being tracked",
      icon: Heart,
      color: "text-secondary",
      dotColor: "bg-secondary",
      gradient: "from-secondary/20 to-accent/10"
    }
  ];

  const quickActions = [
    {
      title: "Start AI Chat",
      subtitle: "Begin a conversation with your AI assistant",
      icon: MessageSquare,
      color: "text-primary",
      path: "/chat"
    },
    {
      title: "Upload Document",
      subtitle: "Get AI summaries and ask questions",
      icon: FileText,
      color: "text-secondary",
      path: "/documents"
    },
    {
      title: "Create Reminder",
      subtitle: "Set up tasks and notifications",
      icon: Bell,
      color: "text-accent",
      path: "/reminders"
    }
  ];

  const modules = [
    {
      title: "Learning",
      description: "Create flashcards, take notes, generate quizzes",
      status: `${dbStats.learningGoals} goals`,
      statusColor: "text-primary",
      icon: Brain,
      iconColor: "text-primary",
      stats: `${dbStats.learningGoals} goals`,
      path: "/learning"
    },
    {
      title: "Health",
      description: "Track habits, wellness tips, health reminders",
      status: `${dbStats.healthHabits} logs`,
      statusColor: "text-accent",
      icon: Heart,
      iconColor: "text-accent",
      stats: `${dbStats.healthHabits} logs`,
      path: "/health"
    },
    {
      title: "Finance",
      description: "Budget tracking, expense analysis, AI advice",
      status: `${dbStats.transactions} transactions`,
      statusColor: "text-secondary",
      icon: TrendingUp,
      iconColor: "text-secondary",
      stats: `${dbStats.transactions} transactions`,
      path: "/finance"
    }
  ];

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  const cardHoverVariants = {
    rest: { scale: 1, rotateX: 0, rotateY: 0 },
    hover: { 
      scale: 1.02, 
      rotateX: -2, 
      rotateY: 2,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    }
  };

  const glowVariants = {
    rest: { opacity: 0 },
    hover: { opacity: 1 }
  };

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      {reduceAnimations ? (
        <MilkyWayBackground />
      ) : (
        <>
          <MilkyWayBackground />
          <ProductivityVisuals />
        </>
      )}

      <AppSidebar />
      
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header with Glass Effect */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border-b border-border/50 bg-background/30 backdrop-blur-xl sticky top-0 z-50"
        >
          <div className="px-8 py-4 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm"
                >
                  <Sparkles className="w-6 h-6 text-primary" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground">Welcome back! Here's your AI assistant overview.</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3"
            >
              <Select defaultValue="english">
                <SelectTrigger className="w-[140px] bg-card/50 backdrop-blur-sm border-border/50">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent className="bg-card/90 backdrop-blur-xl border-border/50">
                  <SelectItem value="english">🇺🇸 English</SelectItem>
                  <SelectItem value="hindi">🇮🇳 Hindi</SelectItem>
                  <SelectItem value="arabic">🇸🇦 Arabic</SelectItem>
                </SelectContent>
              </Select>
              <ThemeToggle />
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="icon" className="relative">
                  <BellIcon className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8">
          {/* Stats Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial="rest"
                whileHover="hover"
                style={{ perspective: 1000 }}
              >
                <motion.div variants={cardHoverVariants}>
                  <Card className={`p-6 relative overflow-hidden group
                    bg-card/40 backdrop-blur-xl border-border/30
                    hover:border-primary/50 transition-all duration-500
                    shadow-lg hover:shadow-primary/20 hover:shadow-2xl
                  `}>
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
                    
                    {/* Animated Glow */}
                    <motion.div 
                      variants={glowVariants}
                      className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>

                    <div className="relative z-10">
                      <div className="absolute top-0 right-0">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            delay: index * 0.5 
                          }}
                        >
                          <stat.icon className={`w-8 h-8 ${stat.color} drop-shadow-lg`} />
                        </motion.div>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">{stat.title}</p>
                        <motion.p 
                          className={`text-4xl font-bold ${stat.color}`}
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, delay: 0.3 + index * 0.1 }}
                        >
                          {stat.value}
                        </motion.p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                        <motion.div 
                          className={`w-2 h-2 rounded-full ${stat.dotColor}`}
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.03,
                  rotateY: 5,
                  transition: { type: "spring", stiffness: 400 }
                }}
                whileTap={{ scale: 0.98 }}
                style={{ perspective: 1000 }}
              >
                <Card 
                  className={`p-6 cursor-pointer group relative overflow-hidden
                    bg-card/40 backdrop-blur-xl border-border/30
                    hover:border-primary/50 transition-all duration-500
                    shadow-lg hover:shadow-primary/20 hover:shadow-2xl
                  `}
                  onClick={() => navigate(action.path)}
                >
                  {/* Animated Border Glow */}
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-[-1px] bg-gradient-to-r from-primary via-accent to-secondary rounded-lg animate-spin-slow opacity-50" style={{ animationDuration: '3s' }} />
                    <div className="absolute inset-[1px] bg-card/90 rounded-lg" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <motion.div 
                        className={`p-3 rounded-xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm ${action.color} border border-border/30`}
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <action.icon className="w-6 h-6" />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        className="text-primary"
                      >
                        <Plus className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    </div>
                    <h3 className="font-semibold mb-2 text-foreground">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.subtitle}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* AI Assistant Modules */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 360]
                }}
                transition={{ 
                  scale: { duration: 2, repeat: Infinity },
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" }
                }}
                className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm"
              >
                <Activity className="w-6 h-6 text-primary" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  AI Assistant Modules
                </h2>
                <p className="text-sm text-muted-foreground">Specialized AI tools for different aspects of your life</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {modules.map((module, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.02,
                  y: -5,
                  transition: { type: "spring", stiffness: 400 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`p-6 cursor-pointer group relative overflow-hidden h-full
                    bg-card/40 backdrop-blur-xl border-border/30
                    hover:border-primary/50 transition-all duration-500
                    shadow-lg hover:shadow-primary/20 hover:shadow-2xl
                  `}
                  onClick={() => navigate(module.path)}
                >
                  {/* Holographic Scan Line */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-[200%] -translate-y-full group-hover:translate-y-0 transition-transform duration-1000" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <motion.div 
                        className={`p-3 rounded-xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm ${module.iconColor} border border-border/30`}
                        whileHover={{ 
                          rotate: [0, -15, 15, 0],
                          scale: 1.1
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <module.icon className="w-6 h-6" />
                      </motion.div>
                      <motion.span 
                        className={`text-xs font-medium px-3 py-1 rounded-full bg-card/50 backdrop-blur-sm border border-border/30 ${module.statusColor}`}
                        whileHover={{ scale: 1.05 }}
                      >
                        {module.status}
                      </motion.span>
                    </div>
                    <h3 className="font-semibold mb-2 text-foreground">{module.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${module.statusColor}`}>{module.stats}</span>
                      <motion.div
                        animate={{ 
                          x: [0, 5, 0],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Activity className={`w-4 h-4 ${module.iconColor}`} />
                      </motion.div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
