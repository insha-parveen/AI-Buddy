import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  MessageSquare, 
  FileText, 
  BookOpen, 
  DollarSign, 
  Heart, 
  Image, 
  BarChart3,
  Menu,
  X,
  LogOut,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FloatingElements } from "@/components/FloatingElements";

interface LayoutProps {
  children: ReactNode;
}

const modules = [
  { name: "Chat", icon: MessageSquare, path: "/chat", gradient: "from-purple-500 to-pink-500" },
  { name: "Documents", icon: FileText, path: "/documents", gradient: "from-blue-500 to-cyan-500" },
  { name: "Learning", icon: BookOpen, path: "/learning", gradient: "from-green-500 to-emerald-500" },
  { name: "Finance", icon: DollarSign, path: "/finance", gradient: "from-yellow-500 to-orange-500" },
  { name: "Health", icon: Heart, path: "/health", gradient: "from-red-500 to-pink-500" },
  { name: "Images", icon: Image, path: "/images", gradient: "from-indigo-500 to-purple-500" },
  { name: "Analytics", icon: BarChart3, path: "/analytics", gradient: "from-cyan-500 to-blue-500" },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Floating 3D Elements */}
      <FloatingElements />
      
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed left-0 top-0 h-screen w-64 glass border-r border-border/50 z-40 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <motion.h1
                  className="text-2xl font-bold gradient-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  AI Assistant
                </motion.h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <nav className="space-y-2">
                {modules.map((module, index) => {
                  const isActive = location.pathname === module.path;
                  return (
                    <motion.div
                      key={module.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className="w-full justify-start group relative overflow-hidden"
                        onClick={() => navigate(module.path)}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${module.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                        <module.icon className="mr-2 h-4 w-4" />
                        {module.name}
                      </Button>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="pt-6 mt-6 border-t border-border/50 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate("/profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:pl-64" : ""}`}>
        {/* Header */}
        <header className="glass-heavy border-b border-border/50 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
              >
                Home
              </Button>
            </div>

            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">Online</span>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
