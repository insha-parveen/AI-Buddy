import { useRef } from "react";
import { motion } from "framer-motion";
import { useShouldReduceAnimations } from "@/hooks/useReducedMotion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface Orb {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
}

export const CyberParticles = () => {
  const reduceAnimations = useShouldReduceAnimations();
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate floating particles - reduced from 50 to 15
  const particles: Particle[] = Array.from({ length: reduceAnimations ? 8 : 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1.5,
    duration: Math.random() * 12 + 18,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.4 + 0.15,
  }));

  // Generate glowing orbs - reduced from 5 to 2
  const orbs: Orb[] = Array.from({ length: reduceAnimations ? 1 : 3 }, (_, i) => ({
    id: i,
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10,
    size: Math.random() * 80 + 60,
    duration: Math.random() * 12 + 25,
  }));

  // Static version for reduced motion
  if (reduceAnimations) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />

        {/* Static orbs */}
        {orbs.map((orb) => (
          <div
            key={`orb-${orb.id}`}
            className="static-cyber-orb"
            style={{
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle, hsl(var(--${orb.id % 2 === 0 ? 'primary' : 'accent'}) / 0.2) 0%, transparent 70%)`,
              animationDuration: `${orb.duration}s`,
            }}
          />
        ))}

        {/* Static particles */}
        {particles.map((particle) => (
          <div
            key={`particle-${particle.id}`}
            className="static-cyber-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: `hsl(var(--${particle.id % 3 === 0 ? 'primary' : particle.id % 3 === 1 ? 'accent' : 'secondary'}) / ${particle.opacity})`,
              boxShadow: `0 0 ${particle.size * 1.5}px hsl(var(--primary) / 0.3)`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
              ["--dx" as string]: `${(Math.random() - 0.5) * 100}px`,
            } as React.CSSProperties}
          />
        ))}

        {/* Static lines - reduced from 8 to 4 */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`line-${i}`}
            className="static-cyber-line"
            style={{
              top: `${20 + i * 20}%`,
              background: `linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), transparent)`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${6 + i * 2}s`,
            }}
          />
        ))}

        {/* Static rings - reduced from 3 to 2 */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={`ring-${i}`}
            className="static-cyber-ring"
            style={{
              left: "50%",
              top: "50%",
              width: 200 + i * 150,
              height: 200 + i * 150,
              marginLeft: -(100 + i * 75),
              marginTop: -(100 + i * 75),
              animationDelay: `${i * 3}s`,
              animationDuration: `${10 + i * 3}s`,
            }}
          />
        ))}

        {/* Corner glow effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-primary/15 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-accent/15 to-transparent blur-3xl" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      {/* Animated mesh gradient - simplified */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.12) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 80%, hsl(var(--primary) / 0.12) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.12) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 80%, hsl(var(--primary) / 0.12) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.12) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Glowing orbs - reduced from 5 to 3 */}
      {orbs.map((orb) => (
        <motion.div
          key={`orb-${orb.id}`}
          className="absolute rounded-full blur-3xl"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, hsl(var(--${orb.id % 2 === 0 ? 'primary' : 'accent'}) / 0.25) 0%, transparent 70%)`,
          }}
          animate={{
            x: [0, 20, -15, 10, 0],
            y: [0, -15, 12, -8, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
            opacity: [0.25, 0.4, 0.18, 0.3, 0.25],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating particles - reduced from 50 to 20 */}
      {particles.map((particle) => (
        <motion.div
          key={`particle-${particle.id}`}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: `hsl(var(--${particle.id % 3 === 0 ? 'primary' : particle.id % 3 === 1 ? 'accent' : 'secondary'}) / ${particle.opacity})`,
            boxShadow: `0 0 ${particle.size * 1.5}px hsl(var(--primary) / 0.4)`,
          }}
          animate={{
            y: [0, -80, -150],
            x: [0, Math.sin(particle.id) * 30, Math.sin(particle.id) * -20],
            opacity: [0, particle.opacity, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Animated lines - reduced from 8 to 4 */}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={`line-${i}`}
          className="absolute h-px opacity-15"
          style={{
            left: 0,
            right: 0,
            top: `${20 + i * 20}%`,
            background: `linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4), transparent)`,
          }}
          animate={{
            opacity: [0.08, 0.25, 0.08],
            scaleX: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 6 + i * 1.5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Pulse rings - reduced from 3 to 2 */}
      {Array.from({ length: 2 }).map((_, i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute rounded-full border border-primary/15"
          style={{
            left: "50%",
            top: "50%",
            width: 200 + i * 150,
            height: 200 + i * 150,
            marginLeft: -(100 + i * 75),
            marginTop: -(100 + i * 75),
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.08, 0.2, 0.08],
          }}
          transition={{
            duration: 8 + i * 3,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Corner glow effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-primary/20 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-accent/20 to-transparent blur-3xl" />
    </div>
  );
};