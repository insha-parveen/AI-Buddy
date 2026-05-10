import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate floating particles
  const particles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.5 + 0.2,
  }));

  // Generate glowing orbs
  const orbs: Orb[] = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10,
    size: Math.random() * 100 + 50,
    duration: Math.random() * 10 + 20,
  }));

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      {/* Animated mesh gradient */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 80%, hsl(var(--primary) / 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 80%, hsl(var(--primary) / 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.15) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Glowing orbs */}
      {orbs.map((orb) => (
        <motion.div
          key={`orb-${orb.id}`}
          className="absolute rounded-full blur-3xl"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, hsl(var(--${orb.id % 2 === 0 ? 'primary' : 'accent'}) / 0.3) 0%, transparent 70%)`,
          }}
          animate={{
            x: [0, 30, -20, 15, 0],
            y: [0, -25, 20, -15, 0],
            scale: [1, 1.2, 0.9, 1.1, 1],
            opacity: [0.3, 0.5, 0.2, 0.4, 0.3],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating particles */}
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
            boxShadow: `0 0 ${particle.size * 2}px hsl(var(--primary) / 0.5)`,
          }}
          animate={{
            y: [0, -100, -200],
            x: [0, Math.sin(particle.id) * 50, Math.sin(particle.id) * -30],
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

      {/* Animated lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`line-${i}`}
          className="absolute h-px opacity-20"
          style={{
            left: 0,
            right: 0,
            top: `${15 + i * 12}%`,
            background: `linear-gradient(90deg, transparent, hsl(var(--primary) / 0.5), transparent)`,
          }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scaleX: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Pulse rings */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute rounded-full border border-primary/20"
          style={{
            left: "50%",
            top: "50%",
            width: 200 + i * 150,
            height: 200 + i * 150,
            marginLeft: -(100 + i * 75),
            marginTop: -(100 + i * 75),
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 6 + i * 2,
            repeat: Infinity,
            delay: i * 1,
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
