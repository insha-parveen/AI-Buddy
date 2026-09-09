import { motion } from "framer-motion";
import { Bot, Sparkles, Zap, Brain, Heart, MessageSquare } from "lucide-react";
import { useShouldReduceAnimations } from "@/hooks/useReducedMotion";

export function HeroIllustration() {
  const reduceAnimations = useShouldReduceAnimations();

  const orbitIcons = [
    { Icon: Brain, delay: 0, color: "from-primary to-cyan-400" },
    { Icon: Heart, delay: 0.5, color: "from-pink-500 to-rose-400" },
    { Icon: MessageSquare, delay: 1, color: "from-secondary to-purple-400" },
    { Icon: Zap, delay: 1.5, color: "from-yellow-400 to-orange-400" },
  ];

  // Static version with CSS animations
  if (reduceAnimations) {
    return (
      <div className="relative w-full max-w-lg mx-auto aspect-square">
        {/* Outer glow rings - reduced to 1 */}
        <div
          className="static-hero-ring absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(195 100% 50% / 0.1) 0%, transparent 70%)",
            animationDuration: "6s",
          }}
        />

        {/* Rotating orbit ring */}
        <div
          className="static-hero-orbit absolute inset-8 rounded-full border-dashed border-primary/20"
        />

        {/* Second orbit ring */}
        <div
          className="static-hero-orbit static-hero-orbit-reverse absolute inset-16 rounded-full border border-secondary/20"
        />

        {/* Orbiting icons */}
        {orbitIcons.map(({ Icon, delay, color }, index) => (
          <div
            key={index}
            className="static-hero-icon-orbit absolute inset-0"
            style={{ animationDelay: `${delay * 5}s` }}
          >
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}
              style={{ marginTop: "10%" }}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        ))}

        {/* Central AI bot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="static-hero-bot relative">
            {/* Glow behind bot */}
            <div
              className="static-hero-glow absolute inset-0 -m-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-2xl"
              style={{ animationDuration: "4s" }}
            />

            {/* Main bot container */}
            <div
              className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-1 shadow-2xl"
              style={{
                boxShadow: "0 0 50px hsl(195 100% 50% / 0.35), 0 0 80px hsl(270 60% 60% / 0.25)",
              }}
            >
              <div className="w-full h-full rounded-3xl bg-background/90 backdrop-blur-xl flex items-center justify-center">
                <Bot className="w-16 h-16 text-primary" strokeWidth={1.5} />
              </div>
            </div>

            {/* Sparkles around bot - reduced to 1 */}
            <div
              className="static-hero-sparkle absolute -top-4 -right-4"
              style={{ animationDuration: "4s" }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>

            <div
              className="static-hero-sparkle absolute -bottom-2 -left-4"
              style={{ animationDuration: "5s", animationDelay: "1s", animationDirection: "reverse" }}
            >
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Floating particles - reduced from 12 to 5 */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              background: i % 2 === 0 ? "hsl(195 100% 50%)" : "hsl(270 60% 60%)",
              opacity: 0.3,
              animation: `floatParticle 4s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square">
      {/* Outer glow rings - reduced from 1 to 1 (simplified) */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(195 100% 50% / 0.1) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.5, 0.25],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Rotating orbit ring */}
      <motion.div
        className="absolute inset-8 rounded-full border-2 border-dashed border-primary/20"
        animate={{ rotate: 360 }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Second orbit ring */}
      <motion.div
        className="absolute inset-16 rounded-full border border-secondary/20"
        animate={{ rotate: -360 }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Orbiting icons */}
      {orbitIcons.map(({ Icon, delay, color }, index) => (
        <motion.div
          key={index}
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            delay: delay * 5,
          }}
        >
          <motion.div
            className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}
            style={{ marginTop: "10%" }}
            animate={{
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: delay,
            }}
          >
            <Icon className="w-5 h-5 text-white" />
          </motion.div>
        </motion.div>
      ))}

      {/* Central AI bot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Glow behind bot */}
          <motion.div
            className="absolute inset-0 -m-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Main bot container */}
          <motion.div
            className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-1 shadow-2xl"
            style={{
              boxShadow: "0 0 50px hsl(195 100% 50% / 0.35), 0 0 80px hsl(270 60% 60% / 0.25)",
            }}
            whileHover={{ scale: 1.08, rotate: 3 }}
          >
            <div className="w-full h-full rounded-3xl bg-background/90 backdrop-blur-xl flex items-center justify-center">
              <Bot className="w-16 h-16 text-primary" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* Sparkles around bot - reduced from 2 to 1 */}
          <motion.div
            className="absolute -top-4 -right-4"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>

          <motion.div
            className="absolute -bottom-2 -left-4"
            animate={{
              rotate: [0, -360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <Sparkles className="w-5 h-5 text-primary" />
          </motion.div>
        </motion.div>
      </div>

      {/* Floating particles - reduced from 12 to 6 */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            background: i % 2 === 0 ? "hsl(195 100% 50%)" : "hsl(270 60% 60%)",
          }}
          animate={{
            y: [0, -15 - Math.random() * 15, 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
            opacity: [0.25, 0.65, 0.25],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 3.5 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}