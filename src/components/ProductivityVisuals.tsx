import { motion } from "framer-motion";
import { 
  ListTodo, Clock, Target, Zap, CheckCircle2, 
  Timer, Brain, Sparkles, Star, Flame, Rocket,
  Calendar, TrendingUp, Award, Coffee
} from "lucide-react";

const floatingIcons = [
  { Icon: ListTodo, x: 5, y: 15, size: 24, color: "text-primary", delay: 0 },
  { Icon: Clock, x: 90, y: 20, size: 28, color: "text-accent", delay: 0.5 },
  { Icon: Target, x: 15, y: 75, size: 26, color: "text-secondary", delay: 1 },
  { Icon: Zap, x: 85, y: 80, size: 22, color: "text-yellow-400", delay: 1.5 },
  { Icon: CheckCircle2, x: 8, y: 45, size: 20, color: "text-green-400", delay: 2 },
  { Icon: Timer, x: 92, y: 50, size: 24, color: "text-primary", delay: 2.5 },
  { Icon: Brain, x: 50, y: 8, size: 28, color: "text-purple-400", delay: 3 },
  { Icon: Sparkles, x: 75, y: 12, size: 20, color: "text-cyan-400", delay: 3.5 },
  { Icon: Star, x: 25, y: 88, size: 22, color: "text-yellow-300", delay: 4 },
  { Icon: Flame, x: 70, y: 85, size: 26, color: "text-orange-400", delay: 4.5 },
  { Icon: Rocket, x: 35, y: 5, size: 24, color: "text-pink-400", delay: 5 },
  { Icon: Calendar, x: 60, y: 92, size: 22, color: "text-blue-400", delay: 5.5 },
  { Icon: TrendingUp, x: 3, y: 60, size: 20, color: "text-emerald-400", delay: 6 },
  { Icon: Award, x: 95, y: 35, size: 24, color: "text-amber-400", delay: 6.5 },
  { Icon: Coffee, x: 45, y: 95, size: 20, color: "text-orange-300", delay: 7 },
];

const orbConfigs = [
  { x: 20, y: 30, size: 300, color1: "hsl(195 100% 50% / 0.15)", color2: "hsl(270 60% 60% / 0.08)", duration: 20 },
  { x: 75, y: 60, size: 400, color1: "hsl(270 60% 60% / 0.12)", color2: "hsl(180 100% 50% / 0.06)", duration: 25 },
  { x: 50, y: 85, size: 350, color1: "hsl(180 100% 50% / 0.1)", color2: "hsl(195 100% 50% / 0.05)", duration: 22 },
  { x: 10, y: 70, size: 250, color1: "hsl(320 80% 55% / 0.1)", color2: "hsl(270 60% 60% / 0.05)", duration: 18 },
  { x: 85, y: 20, size: 280, color1: "hsl(45 100% 50% / 0.08)", color2: "hsl(195 100% 50% / 0.04)", duration: 23 },
];

export function ProductivityVisuals() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 will-change-auto">
      {/* Animated gradient orbs */}
      {orbConfigs.map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color1} 0%, ${orb.color2} 50%, transparent 70%)`,
            filter: "blur(60px)",
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            x: [0, 60, -40, 50, -20, 0],
            y: [0, -50, 35, -30, 20, 0],
            scale: [1, 1.25, 0.85, 1.2, 0.9, 1],
            opacity: [0.5, 0.8, 0.3, 0.7, 0.4, 0.5],
          }}
          transition={{
            duration: orb.duration + 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating productivity icons */}
      {floatingIcons.map(({ Icon, x, y, size, color, delay }, i) => (
        <motion.div
          key={`icon-${i}`}
          className={`absolute ${color}`}
          style={{
            left: `${x}%`,
            top: `${y}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.15, 0.4, 0.1, 0.35, 0.15],
            scale: [0.85, 1.15, 0.8, 1.1, 0.85],
            y: [0, -30, 10, -20, 0],
            x: [0, 15, -15, 10, 0],
            rotate: [0, 12, -12, 8, 0],
          }}
          transition={{
            duration: 14 + i * 0.8,
            delay: delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon size={size} strokeWidth={1.5} />
        </motion.div>
      ))}

      {/* Animated lines/connections */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <motion.path
          d="M 0,200 Q 200,100 400,200 T 800,200"
          fill="none"
          stroke="url(#gradient1)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M 100,400 Q 300,300 500,400 T 900,400"
          fill="none"
          stroke="url(#gradient2)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.4, 0] }}
          transition={{ duration: 10, delay: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(195 100% 50%)" />
            <stop offset="50%" stopColor="hsl(270 60% 60%)" />
            <stop offset="100%" stopColor="hsl(180 100% 50%)" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(270 60% 60%)" />
            <stop offset="50%" stopColor="hsl(320 80% 55%)" />
            <stop offset="100%" stopColor="hsl(195 100% 50%)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Pulsing rings */}
      {[
        { x: 15, y: 25, size: 80, delay: 0 },
        { x: 80, y: 70, size: 100, delay: 2 },
        { x: 50, y: 50, size: 120, delay: 4 },
      ].map((ring, i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute rounded-full border border-primary/20"
          style={{
            left: `${ring.x}%`,
            top: `${ring.y}%`,
            width: ring.size,
            height: ring.size,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            scale: [1, 2.5, 1],
            opacity: [0.4, 0, 0.4],
          }}
          transition={{
            duration: 8,
            delay: ring.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Sparkle particles */}
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-1 h-1 rounded-full bg-primary/60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 2, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            delay: Math.random() * 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
