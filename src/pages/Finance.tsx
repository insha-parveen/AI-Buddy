import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { GalaxyBackground } from "@/components/GalaxyBackground";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Target,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Bot,
  Send,
  Wallet,
  CreditCard,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Filter,
  Download,
  Trash2,
  Edit,
  X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AppSidebar from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: string;
  description: string | null;
  date: string;
  created_at: string | null;
  user_id: string;
}

interface Budget {
  id?: string;
  category: string;
  limit: number;
  spent: number;
  color: string;
}

const CATEGORIES = [
  { name: "Food & Dining", color: "#FF6B6B", icon: "🍕" },
  { name: "Transportation", color: "#4ECDC4", icon: "🚗" },
  { name: "Shopping", color: "#45B7D1", icon: "🛍️" },
  { name: "Entertainment", color: "#96CEB4", icon: "🎬" },
  { name: "Bills & Utilities", color: "#FFEAA7", icon: "💡" },
  { name: "Healthcare", color: "#DDA0DD", icon: "💊" },
  { name: "Salary", color: "#98D8C8", icon: "💰" },
  { name: "Investment", color: "#F7DC6F", icon: "📈" },
  { name: "Other", color: "#BB8FCE", icon: "📦" },
];

export default function Finance() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const { toast } = useToast();

  // Form states
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    category: "",
    customCategory: "",
    type: "expense",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Budget states
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // Budget edit/add states
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ category: "", limit: "", customName: "" });

  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
  }, []);

  useEffect(() => {
    calculateBudgetSpent();
  }, [transactions, budgets]);

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("finance_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBudgets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("finance_budgets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setBudgets(data.map((b: any) => ({
          id: b.id,
          category: b.category,
          limit: Number(b.budget_limit),
          spent: 0,
          color: b.color,
        })));
      }
    } catch (error) {
      console.error("Error fetching budgets:", error);
    }
  };

  const calculateBudgetSpent = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyExpenses = transactions.filter((t) => {
      const date = new Date(t.date);
      return (
        t.type === "expense" &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });

    setBudgets((prev) =>
      prev.map((budget) => ({
        ...budget,
        spent: monthlyExpenses
          .filter((t) => t.category === budget.category)
          .reduce((sum, t) => sum + t.amount, 0),
      }))
    );
  };

  const handleAddTransaction = async () => {
    const finalCategory = newTransaction.category === "__custom__"
      ? newTransaction.customCategory.trim()
      : newTransaction.category;

    if (!newTransaction.amount || !finalCategory) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("finance_transactions").insert({
        user_id: user.id,
        amount: parseFloat(newTransaction.amount),
        category: finalCategory,
        type: newTransaction.type,
        description: newTransaction.description || null,
        date: newTransaction.date,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction added successfully",
      });

      setNewTransaction({
        amount: "",
        category: "",
        customCategory: "",
        type: "expense",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      setIsAddingTransaction(false);
      fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from("finance_transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction deleted",
      });
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  const getAIAdvice = async () => {
    if (!aiMessage.trim()) return;

    setIsAILoading(true);
    try {
      const financialContext = `
        User's financial summary:
        - Total Income: $${totalIncome.toFixed(2)}
        - Total Expenses: $${totalExpenses.toFixed(2)}
        - Net Balance: $${balance.toFixed(2)}
        - Number of transactions: ${transactions.length}
        - Top expense categories: ${getTopCategories()}
      `;

      const { data, error } = await supabase.functions.invoke("finance-advice", {
        body: {
          message: aiMessage,
          context: financialContext,
        },
      });

      if (error) throw error;
      setAiResponse(data.advice || "I couldn't generate advice at this time.");
    } catch (error) {
      console.error("Error getting AI advice:", error);
      setAiResponse("Sorry, I couldn't process your request. Please try again later.");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleSaveBudget = async () => {
    const finalCategory = budgetForm.category === "__custom__" ? budgetForm.customName.trim() : budgetForm.category;
    if (!finalCategory || !budgetForm.limit) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    const limit = parseFloat(budgetForm.limit);
    if (isNaN(limit) || limit <= 0) {
      toast({ title: "Error", description: "Please enter a valid budget limit", variant: "destructive" });
      return;
    }
    const catInfo = CATEGORIES.find(c => c.name === finalCategory);
    const color = catInfo?.color || "#BB8FCE";

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (editingBudget?.id) {
        await supabase.from("finance_budgets").update({ category: finalCategory, budget_limit: limit, color }).eq("id", editingBudget.id);
        setBudgets(prev => prev.map(b => b.id === editingBudget.id ? { ...b, category: finalCategory, limit, color } : b));
        toast({ title: "Updated", description: "Budget updated successfully" });
      } else {
        if (budgets.find(b => b.category === finalCategory)) {
          toast({ title: "Error", description: "Budget for this category already exists", variant: "destructive" });
          return;
        }
        const { data, error } = await supabase.from("finance_budgets").insert({ user_id: user.id, category: finalCategory, budget_limit: limit, color }).select().single();
        if (error) throw error;
        setBudgets(prev => [...prev, { id: data.id, category: finalCategory, limit, spent: 0, color }]);
        toast({ title: "Added", description: "New budget created" });
      }
    } catch (error) {
      console.error("Error saving budget:", error);
      toast({ title: "Error", description: "Failed to save budget", variant: "destructive" });
    }
    setEditingBudget(null);
    setIsAddingBudget(false);
    setBudgetForm({ category: "", limit: "", customName: "" });
  };

  const handleDeleteBudget = async (category: string) => {
    const budget = budgets.find(b => b.category === category);
    if (budget?.id) {
      await supabase.from("finance_budgets").delete().eq("id", budget.id);
    }
    setBudgets(prev => prev.filter(b => b.category !== category));
    toast({ title: "Deleted", description: "Budget removed" });
  };

  const openEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    const isPreset = CATEGORIES.some(c => c.name === budget.category);
    setBudgetForm({ category: isPreset ? budget.category : "__custom__", limit: budget.limit.toString(), customName: isPreset ? "" : budget.category });
  };

  const openAddBudget = () => {
    setEditingBudget(null);
    setBudgetForm({ category: "", limit: "", customName: "" });
    setIsAddingBudget(true);
  };

  const getTopCategories = () => {
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, amount]) => `${cat}: $${amount.toFixed(2)}`)
      .join(", ");
  };

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    return true;
  });

  // Chart data
  const expensesByCategory = CATEGORIES.map((cat) => ({
    name: cat.name,
    value: transactions
      .filter((t) => t.type === "expense" && t.category === cat.name)
      .reduce((sum, t) => sum + t.amount, 0),
    color: cat.color,
  })).filter((c) => c.value > 0);

  // Monthly trend data
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      month: date.toLocaleString("default", { month: "short" }),
      income: transactions
        .filter((t) => {
          const tDate = new Date(t.date);
          return (
            t.type === "income" &&
            tDate.getMonth() === date.getMonth() &&
            tDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, t) => sum + t.amount, 0),
      expenses: transactions
        .filter((t) => {
          const tDate = new Date(t.date);
          return (
            t.type === "expense" &&
            tDate.getMonth() === date.getMonth() &&
            tDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, t) => sum + t.amount, 0),
    };
  }).reverse();

  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const contentScale = useTransform(scrollY, [0, 200], [1, 0.99]);

  return (
    <div className="flex min-h-screen w-full bg-background relative overflow-hidden">
      {/* Galaxy Background with Parallax */}
      <GalaxyBackground />

      <AppSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-20"
        >
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text mb-1">Finance Manager</h1>
              <p className="text-sm text-muted-foreground">
                Track expenses, manage budgets, and get AI-powered insights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setShowAIChat(!showAIChat)}
                  variant="outline"
                  className="border-primary/50 gap-2"
                >
                  <Bot className="w-4 h-4" />
                  AI Advisor
                </Button>
              </motion.div>
              <Dialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction}>
                <DialogTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="gradient-primary text-white gap-2">
                      <Plus className="w-4 h-4" />
                      Add Transaction
                    </Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="glass-heavy">
                  <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={newTransaction.type}
                          onValueChange={(v) =>
                            setNewTransaction({ ...newTransaction, type: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Amount ($)</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={newTransaction.amount}
                          onChange={(e) =>
                            setNewTransaction({
                              ...newTransaction,
                              amount: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={newTransaction.category}
                        onValueChange={(v) =>
                          setNewTransaction({ ...newTransaction, category: v, customCategory: "" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.name} value={cat.name}>
                              {cat.icon} {cat.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="__custom__">✏️ Custom Category</SelectItem>
                        </SelectContent>
                      </Select>
                      {newTransaction.category === "__custom__" && (
                        <Input
                          className="mt-2"
                          placeholder="Enter custom category name..."
                          value={newTransaction.customCategory}
                          onChange={(e) => setNewTransaction({ ...newTransaction, customCategory: e.target.value })}
                        />
                      )}
                    </div>

                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newTransaction.date}
                        onChange={(e) =>
                          setNewTransaction({
                            ...newTransaction,
                            date: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Description (Optional)</Label>
                      <Textarea
                        placeholder="Add a note..."
                        value={newTransaction.description}
                        onChange={(e) =>
                          setNewTransaction({
                            ...newTransaction,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button
                      onClick={handleAddTransaction}
                      className="w-full gradient-primary text-white"
                    >
                      Add Transaction
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <ThemeToggle />
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
            >
              <Card className="p-6 glass border-border/50 relative overflow-hidden group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-green-500/10">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                    +12%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                <motion.p
                  className="text-3xl font-bold text-green-500"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  ${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </motion.p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="p-6 glass border-border/50 relative overflow-hidden group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-red-500/10">
                    <TrendingDown className="w-6 h-6 text-red-500" />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-500">
                    -8%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                <motion.p
                  className="text-3xl font-bold text-red-500"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                >
                  ${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </motion.p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <Card className="p-6 glass border-border/50 relative overflow-hidden group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Wallet className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Net Balance</p>
                <motion.p
                  className={`text-3xl font-bold ${balance >= 0 ? "text-primary" : "text-red-500"}`}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  ${Math.abs(balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </motion.p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <Card className="p-6 glass border-border/50 relative overflow-hidden group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-secondary/10">
                    <CreditCard className="w-6 h-6 text-secondary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Transactions</p>
                <motion.p
                  className="text-3xl font-bold text-secondary"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.3 }}
                >
                  {transactions.length}
                </motion.p>
              </Card>
            </motion.div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6 bg-card/50 backdrop-blur">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="transactions" className="gap-2">
                <DollarSign className="w-4 h-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="budgets" className="gap-2">
                <Target className="w-4 h-4" />
                Budgets
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <PieChartIcon className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Trend Chart */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="p-6 glass border-border/50 h-[400px]">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Monthly Trend
                    </h3>
                    <ResponsiveContainer width="100%" height="85%">
                      <AreaChart data={last6Months}>
                        <defs>
                          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="income"
                          stroke="#10B981"
                          fill="url(#incomeGradient)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="expenses"
                          stroke="#EF4444"
                          fill="url(#expenseGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>
                </motion.div>

                {/* Expense Categories Pie Chart */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="p-6 glass border-border/50 h-[400px]">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-secondary" />
                      Expenses by Category
                    </h3>
                    {expensesByCategory.length > 0 ? (
                      <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                          <Pie
                            data={expensesByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {expensesByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) =>
                              `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                            }
                            contentStyle={{
                              background: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No expense data yet
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {expensesByCategory.slice(0, 4).map((cat) => (
                        <div
                          key={cat.name}
                          className="flex items-center gap-2 text-xs"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span>{cat.name}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>

                {/* Recent Transactions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-2"
                >
                  <Card className="p-6 glass border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        Recent Transactions
                      </h3>
                      <Button variant="ghost" size="sm">
                        View All
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {transactions.slice(0, 5).map((transaction, index) => {
                          const category = CATEGORIES.find(
                            (c) => c.name === transaction.category
                          );
                          return (
                            <motion.div
                              key={transaction.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center justify-between p-3 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                  style={{
                                    backgroundColor: `${category?.color}20`,
                                  }}
                                >
                                  {category?.icon || "📦"}
                                </div>
                                <div>
                                  <p className="font-medium">{transaction.category}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {transaction.description ||
                                      new Date(transaction.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`font-semibold ${transaction.type === "income"
                                  ? "text-green-500"
                                  : "text-red-500"
                                  }`}
                              >
                                {transaction.type === "income" ? "+" : "-"}$
                                {transaction.amount.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                })}
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                      {transactions.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <PiggyBank className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No transactions yet. Add your first transaction!</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <Card className="p-6 glass border-border/50">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Filter:</span>
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.name} value={cat.name}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="ml-auto gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>

                {/* Transaction List */}
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {filteredTransactions.map((transaction, index) => {
                      const category = CATEGORIES.find(
                        (c) => c.name === transaction.category
                      );
                      return (
                        <motion.div
                          key={transaction.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.02 }}
                          className="flex items-center justify-between p-4 rounded-xl bg-card/50 hover:bg-card/80 transition-all border border-transparent hover:border-primary/20 group"
                        >
                          <div className="flex items-center gap-4">
                            <motion.div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                              style={{ backgroundColor: `${category?.color}20` }}
                              whileHover={{ scale: 1.1, rotate: 10 }}
                            >
                              {category?.icon || "📦"}
                            </motion.div>
                            <div>
                              <p className="font-medium">{transaction.category}</p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.description || "No description"}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(transaction.date).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div
                              className={`text-lg font-semibold flex items-center gap-1 ${transaction.type === "income"
                                ? "text-green-500"
                                : "text-red-500"
                                }`}
                            >
                              {transaction.type === "income" ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4" />
                              )}
                              ${transaction.amount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                              })}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg mb-2">No transactions found</p>
                      <p className="text-sm">
                        {transactions.length === 0
                          ? "Add your first transaction to get started"
                          : "Try adjusting your filters"}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Budgets Tab */}
            <TabsContent value="budgets">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {budgets.map((budget, index) => {
                  const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
                  const isOverBudget = budget.spent > budget.limit;
                  const category = CATEGORIES.find((c) => c.name === budget.category);

                  return (
                    <motion.div
                      key={budget.category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-6 glass border-border/50 relative overflow-hidden">
                        <motion.div
                          className="absolute inset-0 opacity-5"
                          style={{ backgroundColor: budget.color }}
                        />
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                                style={{ backgroundColor: `${budget.color}20` }}
                              >
                                {category?.icon}
                              </div>
                              <div>
                                <h4 className="font-semibold">{budget.category}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Monthly Budget
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditBudget(budget)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteBudget(budget.category)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Spent</span>
                              <span className={isOverBudget ? "text-red-500 font-semibold" : ""}>
                                ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                              </span>
                            </div>
                            <div className="relative">
                              <Progress
                                value={percentage}
                                className={`h-3 ${isOverBudget ? "[&>div]:bg-red-500" : ""}`}
                              />
                              {isOverBudget && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -right-1 -top-1">
                                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">Over!</span>
                                </motion.div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {percentage.toFixed(0)}% used •{" "}
                              {isOverBudget
                                ? `$${(budget.spent - budget.limit).toFixed(2)} over`
                                : `$${(budget.limit - budget.spent).toFixed(2)} remaining`}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card
                    className="p-6 glass border-border/50 border-dashed flex flex-col items-center justify-center h-full min-h-[200px] cursor-pointer hover:border-primary/50 transition-colors group"
                    onClick={openAddBudget}
                  >
                    <motion.div
                      className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                      whileHover={{ rotate: 90 }}
                    >
                      <Plus className="w-6 h-6 text-primary" />
                    </motion.div>
                    <p className="font-medium">Add New Budget</p>
                    <p className="text-sm text-muted-foreground">
                      Set spending limits for categories
                    </p>
                  </Card>
                </motion.div>
              </div>

              {/* Budget Edit/Add Dialog */}
              <Dialog open={!!editingBudget || isAddingBudget} onOpenChange={(open) => { if (!open) { setEditingBudget(null); setIsAddingBudget(false); } }}>
                <DialogContent className="glass-heavy">
                  <DialogHeader>
                    <DialogTitle>{editingBudget ? "Edit Budget" : "Add New Budget"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={budgetForm.category}
                        onValueChange={(v) => setBudgetForm({ ...budgetForm, category: v, customName: v === "__custom__" ? budgetForm.customName : "" })}
                        disabled={!!editingBudget}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.filter(c => c.name !== "Salary" && c.name !== "Investment").map((cat) => (
                            <SelectItem key={cat.name} value={cat.name}>
                              {cat.icon} {cat.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="__custom__">✏️ Custom Category</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {budgetForm.category === "__custom__" && (
                      <div>
                        <Label>Custom Budget Name</Label>
                        <Input
                          placeholder="Enter custom category name"
                          value={budgetForm.customName}
                          onChange={(e) => setBudgetForm({ ...budgetForm, customName: e.target.value })}
                        />
                      </div>
                    )}
                    <div>
                      <Label>Monthly Limit ($)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={budgetForm.limit}
                        onChange={(e) => setBudgetForm({ ...budgetForm, limit: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleSaveBudget} className="w-full gradient-primary text-white">
                      {editingBudget ? "Update Budget" : "Create Budget"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Spending */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6 glass border-border/50 h-[350px]">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Weekly Comparison
                    </h3>
                    <ResponsiveContainer width="100%" height="85%">
                      <BarChart data={last6Months.slice(-4)}>
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </motion.div>

                {/* Savings Rate */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="p-6 glass border-border/50 h-[350px]">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <PiggyBank className="w-5 h-5 text-secondary" />
                      Savings Overview
                    </h3>
                    <div className="flex flex-col items-center justify-center h-[calc(100%-40px)]">
                      <motion.div
                        className="relative w-48 h-48"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                      >
                        <svg className="w-full h-full -rotate-90">
                          <circle
                            cx="96"
                            cy="96"
                            r="80"
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="16"
                          />
                          <motion.circle
                            cx="96"
                            cy="96"
                            r="80"
                            fill="none"
                            stroke="url(#savingsGradient)"
                            strokeWidth="16"
                            strokeLinecap="round"
                            strokeDasharray={`${(totalIncome > 0 ? (balance / totalIncome) * 100 : 0) * 5.02} 502`}
                            initial={{ strokeDasharray: "0 502" }}
                            animate={{
                              strokeDasharray: `${Math.max(0, (totalIncome > 0 ? (balance / totalIncome) * 100 : 0)) * 5.02} 502`,
                            }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                          <defs>
                            <linearGradient id="savingsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="hsl(195, 100%, 50%)" />
                              <stop offset="100%" stopColor="hsl(270, 60%, 60%)" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-bold gradient-text">
                            {totalIncome > 0
                              ? Math.round((balance / totalIncome) * 100)
                              : 0}
                            %
                          </span>
                          <span className="text-sm text-muted-foreground">Savings Rate</span>
                        </div>
                      </motion.div>
                      <div className="mt-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          You're saving ${balance.toFixed(2)} this month
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* AI Advisor Sidebar */}
        <AnimatePresence>
          {showAIChat && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-96 bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Financial Advisor</h3>
                    <p className="text-xs text-muted-foreground">Powered by AI</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowAIChat(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 p-6 overflow-auto">
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-primary/10"
                  >
                    <p className="text-sm">
                      👋 Hi! I'm your AI financial advisor. Ask me anything about your
                      finances, budgeting tips, or investment advice!
                    </p>
                  </motion.div>

                  {aiResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-card border border-border"
                    >
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm whitespace-pre-wrap">{aiResponse}</p>
                      </div>
                    </motion.div>
                  )}

                  {isAILoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <div className="flex gap-1">
                        <motion.div
                          className="w-2 h-2 rounded-full bg-primary"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full bg-primary"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full bg-primary"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                        />
                      </div>
                      <span className="text-sm">Analyzing...</span>
                    </motion.div>
                  )}
                </div>

                {/* Quick Suggestions */}
                <div className="mt-6">
                  <p className="text-xs text-muted-foreground mb-3">Quick questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "How can I save more?",
                      "Analyze my spending",
                      "Investment tips",
                      "Budget advice",
                    ].map((suggestion) => (
                      <motion.button
                        key={suggestion}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setAiMessage(suggestion);
                          getAIAdvice();
                        }}
                        className="px-3 py-1.5 text-xs rounded-full bg-card border border-border hover:border-primary/50 transition-colors"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about your finances..."
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && getAIAdvice()}
                    className="bg-card/50"
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={getAIAdvice}
                      disabled={isAILoading || !aiMessage.trim()}
                      className="gradient-primary text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
