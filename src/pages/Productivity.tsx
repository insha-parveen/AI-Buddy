import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListTodo, Clock, Target, Zap, Plus, Check, Trash2,
  Play, Pause, RotateCcw, Calendar, TrendingUp, Star,
  Timer, CheckCircle2, Circle, AlertCircle, Flame,
  ArrowUp, ArrowRight, ArrowDown, Brain, Sparkles,
  Bell as BellIcon, ChevronRight, BellRing, BellOff, Volume2, VolumeX
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/use-notifications";
import { useSoundAlert } from "@/hooks/use-sound-alert";
import AppSidebar from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MilkyWayBackground } from "@/components/MilkyWayBackground";
import { ProductivityVisuals } from "@/components/ProductivityVisuals";

// Types
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'completed';
  dueDate?: Date;
  category: string;
  createdAt: Date;
}

interface Reminder {
  id: string;
  title: string;
  description?: string;
  datetime: Date;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  notified?: boolean;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: Date;
  progress: number;
  milestones: string[];
  completedMilestones: number;
}

type Priority = 'high' | 'medium' | 'low';
type Recurring = 'none' | 'daily' | 'weekly' | 'monthly';

// Priority icons and colors
const PRIORITY_CONFIG = {
  high: { icon: ArrowUp, color: 'text-red-500', bg: 'bg-red-500/20', label: 'High' },
  medium: { icon: ArrowRight, color: 'text-yellow-500', bg: 'bg-yellow-500/20', label: 'Medium' },
  low: { icon: ArrowDown, color: 'text-green-500', bg: 'bg-green-500/20', label: 'Low' },
};

const CATEGORIES = ['Work', 'Personal', 'Health', 'Learning', 'Finance', 'Other'];

export default function Productivity() {
  const { toast } = useToast();
  const { permission, isSupported, requestPermission, sendNotification } = useNotifications();
  const { playSound } = useSoundAlert();
  const [activeTab, setActiveTab] = useState("tasks");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const notifiedRemindersRef = useRef<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<{ title: string; description: string; priority: Priority; category: string }>({ title: '', description: '', priority: 'medium', category: 'Work' });
  
  // Reminders state
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState<{ title: string; description: string; datetime: string; recurring: Recurring }>({ title: '', description: '', datetime: '', recurring: 'none' });
  
  // Goals state
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', milestones: '' });
  
  // Pomodoro state
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'break'>('work');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  // Stats
  const [dailyStats, setDailyStats] = useState({ tasksCompleted: 0, focusMinutes: 0, streak: 0 });

  // Load user and data from DB
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadTasks(user.id);
        loadReminders(user.id);
        loadGoals(user.id);
      }
    };
    loadUser();
  }, []);

  const loadTasks = async (uid: string) => {
    const { data, error } = await supabase
      .from("productivity_tasks")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setTasks(data.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description || undefined,
        priority: t.priority as Priority,
        status: t.status as Task['status'],
        dueDate: t.due_date ? new Date(t.due_date) : undefined,
        category: t.category,
        createdAt: new Date(t.created_at),
      })));
    }
  };

  const loadReminders = async (uid: string) => {
    const { data, error } = await supabase
      .from("productivity_reminders")
      .select("*")
      .eq("user_id", uid)
      .order("datetime", { ascending: true });
    if (!error && data) {
      setReminders(data.map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description || undefined,
        datetime: new Date(r.datetime),
        recurring: r.recurring as Recurring,
        isActive: r.is_active,
      })));
    }
  };

  const loadGoals = async (uid: string) => {
    const { data, error } = await supabase
      .from("productivity_goals")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setGoals(data.map((g: any) => ({
        id: g.id,
        title: g.title,
        description: g.description || undefined,
        targetDate: g.target_date ? new Date(g.target_date) : undefined,
        progress: Number(g.progress),
        milestones: (g.milestones as string[]) || [],
        completedMilestones: g.completed_milestones,
      })));
    }
  };

  // Pomodoro timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(prev => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      if (pomodoroMode === 'work') {
        setCompletedPomodoros(prev => prev + 1);
        setPomodoroMode('break');
        setPomodoroTime(5 * 60);
        if (soundEnabled) playSound('chime');
        toast({ title: "🎉 Pomodoro Complete!", description: "Time for a 5-minute break!" });
      } else {
        setPomodoroMode('work');
        setPomodoroTime(25 * 60);
        if (soundEnabled) playSound('alarm');
        toast({ title: "⏰ Break Over!", description: "Ready for another focused session?" });
      }
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, pomodoroTime, pomodoroMode, toast, soundEnabled, playSound]);

  // Reminder notification checker
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      reminders.forEach(reminder => {
        if (!reminder.isActive) return;
        if (notifiedRemindersRef.current.has(reminder.id)) return;
        
        const reminderTime = new Date(reminder.datetime);
        const timeDiff = reminderTime.getTime() - now.getTime();
        
        if (timeDiff <= 30000 && timeDiff > -60000) {
          notifiedRemindersRef.current.add(reminder.id);
          
          if (soundEnabled) {
            playSound('bell');
          }
          
          if (permission === 'granted') {
            sendNotification(`🔔 ${reminder.title}`, {
              body: reminder.description || 'Time for your reminder!',
              tag: reminder.id,
              requireInteraction: true,
            });
          }
          
          toast({
            title: "⏰ Reminder",
            description: reminder.title,
          });
          
          if (reminder.recurring !== 'none') {
            const nextDate = new Date(reminderTime);
            switch (reminder.recurring) {
              case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
              case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
              case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            }
            
            // Update in DB
            supabase
              .from("productivity_reminders")
              .update({ datetime: nextDate.toISOString() })
              .eq("id", reminder.id)
              .then(() => {
                setReminders(prev => prev.map(r => 
                  r.id === reminder.id 
                    ? { ...r, datetime: nextDate }
                    : r
                ));
              });
            
            setTimeout(() => {
              notifiedRemindersRef.current.delete(reminder.id);
            }, 120000);
          }
        }
      });
    };
    
    const interval = setInterval(checkReminders, 5000);
    checkReminders();
    
    return () => clearInterval(interval);
  }, [reminders, permission, sendNotification, toast, soundEnabled, playSound]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Add task - DB
  const addTask = useCallback(async () => {
    if (!newTask.title.trim() || !userId) return;
    
    const { data, error } = await supabase
      .from("productivity_tasks")
      .insert({
        user_id: userId,
        title: newTask.title,
        description: newTask.description || null,
        priority: newTask.priority,
        status: 'todo',
        category: newTask.category,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to add task", variant: "destructive" });
      return;
    }

    const task: Task = {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      priority: data.priority as Priority,
      status: data.status as Task['status'],
      category: data.category,
      createdAt: new Date(data.created_at),
    };
    
    setTasks(prev => [task, ...prev]);
    setNewTask({ title: '', description: '', priority: 'medium', category: 'Work' });
    toast({ title: "Task Added", description: "New task created successfully!" });
  }, [newTask, userId, toast]);

  // Toggle task status - DB
  const toggleTaskStatus = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    
    const { error } = await supabase
      .from("productivity_tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (!error) {
      if (newStatus === 'completed') {
        setDailyStats(s => ({ ...s, tasksCompleted: s.tasksCompleted + 1 }));
      }
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    }
  };

  // Delete task - DB
  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from("productivity_tasks")
      .delete()
      .eq("id", taskId);

    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast({ title: "Task Deleted", description: "Task removed successfully." });
    }
  };

  // Add reminder - DB
  const addReminder = useCallback(async () => {
    if (!newReminder.title.trim() || !newReminder.datetime || !userId) return;
    
    const { data, error } = await supabase
      .from("productivity_reminders")
      .insert({
        user_id: userId,
        title: newReminder.title,
        description: newReminder.description || null,
        datetime: new Date(newReminder.datetime).toISOString(),
        recurring: newReminder.recurring,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to add reminder", variant: "destructive" });
      return;
    }

    const reminder: Reminder = {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      datetime: new Date(data.datetime),
      recurring: data.recurring as Recurring,
      isActive: data.is_active,
    };
    
    setReminders(prev => [reminder, ...prev]);
    setNewReminder({ title: '', description: '', datetime: '', recurring: 'none' });
    toast({ title: "Reminder Set", description: "You'll be notified at the scheduled time!" });
  }, [newReminder, userId, toast]);

  // Add goal - DB
  const addGoal = useCallback(async () => {
    if (!newGoal.title.trim() || !userId) return;
    
    const milestones = newGoal.milestones.split('\n').filter(m => m.trim());
    
    const { data, error } = await supabase
      .from("productivity_goals")
      .insert({
        user_id: userId,
        title: newGoal.title,
        description: newGoal.description || null,
        milestones: milestones,
        completed_milestones: 0,
        progress: 0,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to add goal", variant: "destructive" });
      return;
    }

    const goal: Goal = {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      progress: 0,
      milestones: (data.milestones as string[]) || [],
      completedMilestones: 0,
    };
    
    setGoals(prev => [goal, ...prev]);
    setNewGoal({ title: '', description: '', milestones: '' });
    toast({ title: "Goal Created", description: "Start working towards your goal!" });
  }, [newGoal, userId, toast]);

  // Update goal progress - DB
  const updateGoalProgress = async (goalId: string, increment: boolean) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newCompleted = increment 
      ? Math.min(goal.completedMilestones + 1, goal.milestones.length)
      : Math.max(goal.completedMilestones - 1, 0);
    const newProgress = goal.milestones.length > 0 ? (newCompleted / goal.milestones.length) * 100 : 0;

    const { error } = await supabase
      .from("productivity_goals")
      .update({ completed_milestones: newCompleted, progress: newProgress })
      .eq("id", goalId);

    if (!error) {
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, completedMilestones: newCompleted, progress: newProgress } : g));
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 100 } }
  };

  const cardHoverVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.02, transition: { type: "spring" as const, stiffness: 400 } }
  };

  // Calculate stats
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;

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
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm"
              >
                <Zap className="w-6 h-6 text-primary" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Productivity Hub
                </h1>
                <p className="text-sm text-muted-foreground">Manage tasks, set reminders, achieve goals</p>
              </div>
            </motion.div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) {
                    playSound('notification');
                  }
                  toast({ 
                    title: soundEnabled ? "Sound Alerts Off" : "Sound Alerts On 🔊", 
                    description: soundEnabled ? "Reminder sounds muted" : "You'll hear sounds when reminders trigger" 
                  });
                }}
                className="relative"
              >
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-primary" />
                ) : (
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="w-5 h-5" />
                {reminders.filter(r => r.isActive).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] flex items-center justify-center text-primary-foreground">
                    {reminders.filter(r => r.isActive).length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          {/* Quick Stats */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: 'Tasks To Do', value: todoTasks, icon: ListTodo, color: 'text-primary' },
              { label: 'Completed', value: completedTasks, icon: CheckCircle2, color: 'text-green-500' },
              { label: 'High Priority', value: highPriorityTasks, icon: AlertCircle, color: 'text-red-500' },
              { label: 'Pomodoros', value: completedPomodoros, icon: Flame, color: 'text-orange-500' },
            ].map((stat, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="bg-white/5 dark:bg-white/5 backdrop-blur-2xl border border-white/10 hover:border-primary/40 hover:bg-white/10 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_hsl(195_100%_50%/0.15)]">
                  <CardContent className="p-4 flex items-center gap-4">
                    <motion.div 
                      className={`p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 ${stat.color}`}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                    >
                      <stat.icon className="w-5 h-5" />
                    </motion.div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/5 dark:bg-white/5 backdrop-blur-2xl border border-white/10 mb-6">
              <TabsTrigger value="tasks" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <ListTodo className="w-4 h-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="reminders" className="gap-2 data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
                <Clock className="w-4 h-4" />
                Reminders
              </TabsTrigger>
              <TabsTrigger value="goals" className="gap-2 data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary">
                <Target className="w-4 h-4" />
                Goals
              </TabsTrigger>
              <TabsTrigger value="pomodoro" className="gap-2 data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-500">
                <Timer className="w-4 h-4" />
                Focus
              </TabsTrigger>
            </TabsList>

            {/* Tasks Tab */}
            <TabsContent value="tasks">
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                {/* Add Task Form */}
                <motion.div variants={itemVariants}>
                  <Card className="bg-white/5 dark:bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex gap-3">
                        <Input
                          placeholder="What needs to be done?"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          className="flex-1 bg-white/5 border-white/10 focus:border-primary/50 backdrop-blur-sm"
                          onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        />
                        <Button onClick={addTask} className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2 shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
                          <Plus className="w-4 h-4" />
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Select value={newTask.priority} onValueChange={(v: Priority) => setNewTask({ ...newTask, priority: v })}>
                          <SelectTrigger className="w-[140px] bg-white/5 border-white/10 backdrop-blur-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">🔴 High</SelectItem>
                            <SelectItem value="medium">🟡 Medium</SelectItem>
                            <SelectItem value="low">🟢 Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={newTask.category} onValueChange={(v) => setNewTask({ ...newTask, category: v })}>
                          <SelectTrigger className="w-[140px] bg-white/5 border-white/10 backdrop-blur-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Description (optional)"
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          className="flex-1 bg-white/5 border-white/10 backdrop-blur-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Task List */}
                <AnimatePresence>
                  {tasks.map(task => {
                    const priorityConfig = PRIORITY_CONFIG[task.priority];
                    const PriorityIcon = priorityConfig.icon;
                    return (
                      <motion.div
                        key={task.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: -100 }}
                        whileHover="hover"
                      >
                        <motion.div variants={cardHoverVariants}>
                          <Card className={`bg-white/5 dark:bg-white/5 backdrop-blur-2xl border border-white/10 hover:border-primary/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.08)] ${task.status === 'completed' ? 'opacity-60' : ''}`}>
                            <CardContent className="p-4 flex items-center gap-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleTaskStatus(task.id)}
                                className="shrink-0"
                              >
                                {task.status === 'completed' ? (
                                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                                ) : (
                                  <Circle className="w-6 h-6 text-muted-foreground" />
                                )}
                              </Button>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </p>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge variant="outline" className={`${priorityConfig.bg} ${priorityConfig.color} border-0 gap-1`}>
                                  <PriorityIcon className="w-3 h-3" />
                                  {priorityConfig.label}
                                </Badge>
                                <Badge variant="outline" className="bg-white/5 border-white/10">{task.category}</Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteTask(task.id)}
                                  className="text-muted-foreground hover:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {tasks.length === 0 && (
                  <motion.div variants={itemVariants} className="text-center py-12">
                    <ListTodo className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No tasks yet. Add your first task above!</p>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            {/* Reminders Tab */}
            <TabsContent value="reminders">
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                {/* Notification Permission */}
                {isSupported && permission !== 'granted' && (
                  <motion.div variants={itemVariants}>
                    <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 backdrop-blur-2xl">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BellRing className="w-5 h-5 text-primary" />
                          <p className="text-sm">Enable browser notifications for reminders</p>
                        </div>
                        <Button onClick={requestPermission} size="sm" className="bg-primary text-primary-foreground">
                          Enable
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Add Reminder Form */}
                <motion.div variants={itemVariants}>
                  <Card className="bg-white/5 dark:bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                    <CardContent className="p-6 space-y-4">
                      <Input
                        placeholder="Reminder title"
                        value={newReminder.title}
                        onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                        className="bg-white/5 border-white/10 focus:border-accent/50 backdrop-blur-sm"
                      />
                      <div className="flex gap-3">
                        <Input
                          type="datetime-local"
                          value={newReminder.datetime}
                          onChange={(e) => setNewReminder({ ...newReminder, datetime: e.target.value })}
                          className="flex-1 bg-white/5 border-white/10 backdrop-blur-sm"
                        />
                        <Select value={newReminder.recurring} onValueChange={(v: Recurring) => setNewReminder({ ...newReminder, recurring: v })}>
                          <SelectTrigger className="w-[140px] bg-white/5 border-white/10 backdrop-blur-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">One-time</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={addReminder} className="bg-gradient-to-r from-accent to-secondary text-primary-foreground gap-2 shadow-[0_0_20px_hsl(var(--accent)/0.3)]">
                          <Plus className="w-4 h-4" />
                          Set
                        </Button>
                      </div>
                      <Input
                        placeholder="Description (optional)"
                        value={newReminder.description}
                        onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                        className="bg-white/5 border-white/10 backdrop-blur-sm"
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Reminders List */}
                <AnimatePresence>
                  {reminders.map(reminder => (
                    <motion.div
                      key={reminder.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -100 }}
                    >
                      <Card className={`bg-white/5 dark:bg-white/5 backdrop-blur-2xl border ${reminder.isActive ? 'border-accent/30' : 'border-white/10 opacity-50'} transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.08)]`}>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${reminder.isActive ? 'bg-accent/20 text-accent' : 'bg-white/10 text-muted-foreground'}`}>
                            <BellIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{reminder.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(reminder.datetime).toLocaleString()}
                              {reminder.recurring !== 'none' && (
                                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-xs">
                                  {reminder.recurring}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                const newActive = !reminder.isActive;
                                await supabase.from("productivity_reminders").update({ is_active: newActive }).eq("id", reminder.id);
                                setReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, isActive: newActive } : r));
                              }}
                            >
                              {reminder.isActive ? <BellRing className="w-4 h-4 text-accent" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                await supabase.from("productivity_reminders").delete().eq("id", reminder.id);
                                setReminders(prev => prev.filter(r => r.id !== reminder.id));
                              }}
                              className="text-muted-foreground hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {reminders.length === 0 && (
                  <motion.div variants={itemVariants} className="text-center py-12">
                    <Clock className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No reminders set. Create one above!</p>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            {/* Goals Tab */}
            <TabsContent value="goals">
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                {/* Add Goal Form */}
                <motion.div variants={itemVariants}>
                  <Card className="bg-white/5 dark:bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                    <CardContent className="p-6 space-y-4">
                      <Input
                        placeholder="Goal title"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                        className="bg-white/5 border-white/10 focus:border-secondary/50 backdrop-blur-sm"
                      />
                      <Input
                        placeholder="Description (optional)"
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                        className="bg-white/5 border-white/10 backdrop-blur-sm"
                      />
                      <Textarea
                        placeholder="Milestones (one per line)"
                        value={newGoal.milestones}
                        onChange={(e) => setNewGoal({ ...newGoal, milestones: e.target.value })}
                        className="bg-white/5 border-white/10 backdrop-blur-sm"
                        rows={3}
                      />
                      <Button onClick={addGoal} className="bg-gradient-to-r from-secondary to-primary text-primary-foreground gap-2 shadow-[0_0_20px_hsl(var(--secondary)/0.3)]">
                        <Plus className="w-4 h-4" />
                        Create Goal
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Goals List */}
                <AnimatePresence>
                  {goals.map(goal => (
                    <motion.div
                      key={goal.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -100 }}
                    >
                      <Card className="bg-white/5 dark:bg-white/5 backdrop-blur-2xl border border-white/10 hover:border-secondary/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{goal.title}</h3>
                              {goal.description && (
                                <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
                                {Math.round(goal.progress)}%
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={async () => {
                                  await supabase.from("productivity_goals").delete().eq("id", goal.id);
                                  setGoals(prev => prev.filter(g => g.id !== goal.id));
                                  toast({ title: "Goal Deleted" });
                                }}
                                className="text-muted-foreground hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <Progress value={goal.progress} className="h-2 mb-4 bg-white/10" />
                          {goal.milestones.length > 0 && (
                            <div className="space-y-2">
                              {goal.milestones.map((milestone, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-sm">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => updateGoalProgress(goal.id, idx >= goal.completedMilestones)}
                                  >
                                    {idx < goal.completedMilestones ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </Button>
                                  <span className={idx < goal.completedMilestones ? 'line-through text-muted-foreground' : ''}>
                                    {milestone}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {goals.length === 0 && (
                  <motion.div variants={itemVariants} className="text-center py-12">
                    <Target className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No goals yet. Set your first goal above!</p>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            {/* Pomodoro Tab */}
            <TabsContent value="pomodoro">
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-lg mx-auto space-y-8">
                <motion.div variants={itemVariants} className="text-center">
                  <Card className="bg-white/5 dark:bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-8">
                    <div className="mb-6">
                      <Badge variant="outline" className={`${pomodoroMode === 'work' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' : 'bg-green-500/20 text-green-500 border-green-500/30'} text-sm`}>
                        {pomodoroMode === 'work' ? '🎯 Focus Time' : '☕ Break Time'}
                      </Badge>
                    </div>
                    <motion.div
                      className="text-7xl font-mono font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-8"
                      key={pomodoroTime}
                      initial={{ scale: 1.05 }}
                      animate={{ scale: 1 }}
                    >
                      {formatTime(pomodoroTime)}
                    </motion.div>
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={() => setIsRunning(!isRunning)}
                        size="lg"
                        className={`gap-2 ${isRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gradient-to-r from-primary to-accent'} text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/0.4)]`}
                      >
                        {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        {isRunning ? 'Pause' : 'Start'}
                      </Button>
                      <Button
                        onClick={() => {
                          setIsRunning(false);
                          setPomodoroTime(pomodoroMode === 'work' ? 25 * 60 : 5 * 60);
                        }}
                        variant="outline"
                        size="lg"
                        className="gap-2 border-white/10 bg-white/5"
                      >
                        <RotateCcw className="w-5 h-5" />
                        Reset
                      </Button>
                    </div>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="bg-white/5 dark:bg-white/5 backdrop-blur-2xl border border-white/10 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Flame className="w-6 h-6 text-orange-500" />
                        <div>
                          <p className="font-medium">Completed Pomodoros</p>
                          <p className="text-sm text-muted-foreground">Today's focused sessions</p>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-orange-500">{completedPomodoros}</p>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
