import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Home, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { MilkyWayBackground } from "@/components/MilkyWayBackground";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      <MilkyWayBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center px-6"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_40px_hsl(var(--primary)/0.3)]"
        >
          <Compass className="w-12 h-12 text-white" />
        </motion.div>

        <h1 className="text-8xl md:text-9xl font-bold mb-4 gradient-text">404</h1>
        <p className="text-2xl font-semibold text-foreground mb-2">Oops! Page not found</p>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/")}
            className="gradient-primary text-white gap-2"
          >
            <Home className="w-5 h-5" />
            Return Home
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="gap-2 border-primary/50"
          >
            <Bot className="w-5 h-5" />
            Go to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
