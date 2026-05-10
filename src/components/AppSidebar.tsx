import { BarChart3, FileText, GraduationCap, Heart, TrendingUp, MessageSquare, Settings, User, Bot, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

const mainNavItems = [
  { title: "Dashboard", icon: BarChart3, path: "/dashboard" },
  { title: "AI Chat", icon: MessageSquare, path: "/chat" },
  { title: "AI Gallery", icon: ImageIcon, path: "/gallery" },
  { title: "Documents", icon: FileText, path: "/documents" },
  { title: "Analytics", icon: BarChart3, path: "/analytics" },
  { title: "Productivity", icon: TrendingUp, path: "/productivity" },
];

const personalModules = [
  { title: "Learning", icon: GraduationCap, path: "/learning" },
  { title: "Health", icon: Heart, path: "/health" },
  { title: "Finance", icon: TrendingUp, path: "/finance" },
];

const NavItem = ({ item, isCollapsed }: { item: any, isCollapsed: boolean }) => {
  const content = (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-sidebar-foreground hover:bg-sidebar-accent",
          isCollapsed && "justify-center px-2"
        )
      }
    >
      <item.icon className="w-5 h-5 shrink-0" />
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="whitespace-nowrap overflow-hidden"
          >
            {item.title}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
};

export default function AppSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { toggle, isCollapsed } = useSidebarState();
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single();
        if (data) {
          setProfile(data);
        } else {
          // Fallback to email prefix if profile not found
          setProfile({ full_name: user.email?.split('@')[0] || 'User', avatar_url: null });
        }
      }
    };

    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
    <motion.div
      className="relative z-50 h-screen bg-sidebar-background border-r border-sidebar-border flex flex-col shrink-0"
      animate={{ width: isCollapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {/* Header */}
      <div className={cn("p-4 pt-14 border-b border-sidebar-border", isCollapsed && "px-3")}>
        <div className={cn("flex items-center gap-3 mb-2", isCollapsed && "justify-center")}>
          <Bot className="w-8 h-8 text-primary shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <h1 className="font-bold text-primary whitespace-nowrap">Fully Fledged AI</h1>
                <h2 className="font-bold text-primary whitespace-nowrap">Assistant Bot</h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-muted-foreground"
            >
              AI Assistant v2.1
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="absolute top-16 -right-3 z-50 w-6 h-6 rounded-full bg-sidebar-background border border-sidebar-border shadow-sm hover:bg-sidebar-accent"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </Button>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-1 mb-6">
          {mainNavItems.map((item) => (
            <NavItem key={item.path} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>

        <div className="mb-2">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"
              >
                Personal Modules
              </motion.p>
            )}
          </AnimatePresence>
          <nav className="space-y-1">
            {personalModules.map((item) => (
              <NavItem key={item.path} item={item} isCollapsed={isCollapsed} />
            ))}
          </nav>
        </div>

        <div className="mt-6">
          <NavItem item={{ title: "Settings", icon: Settings, path: "/settings" }} isCollapsed={isCollapsed} />
        </div>
      </div>

      {/* User Profile */}
      <div className={cn("p-4 border-t border-sidebar-border", isCollapsed && "px-2")}>
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <Avatar className="shrink-0">
            <AvatarFallback className="bg-primary text-white">
              {profile?.full_name?.[0]?.toUpperCase() || profile?.avatar_url?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-sm font-medium truncate">{profile?.full_name || 'Loading...'}</p>
                <p className="text-xs text-muted-foreground">Premium Member</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="shrink-0"
            >
              <User className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
