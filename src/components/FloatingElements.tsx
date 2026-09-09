import { motion } from "framer-motion";
import { useShouldReduceAnimations } from "@/hooks/useReducedMotion";

export function FloatingElements() {
  const reduceAnimations = useShouldReduceAnimations();

  // Static version with CSS animations
  if (reduceAnimations) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Floating 3D Cubes - reduced from 4 to 2 */}
        <div
          className="static-float-cube w-20 h-20 top-20 left-[10%]"
          style={{
            transform: "rotateX(45deg) rotateZ(45deg)",
            transformStyle: "preserve-3d",
            animationDuration: "12s",
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/10 backdrop-blur-sm border border-primary/25 rounded-lg shadow-[0_0_15px_hsl(var(--primary)/0.15)]" />
        </div>

        <div
          className="static-float-cube w-16 h-16 top-[60%] right-[15%]"
          style={{
            transform: "rotateX(45deg) rotateZ(45deg)",
            transformStyle: "preserve-3d",
            animationDuration: "15s",
            animationDelay: "3s",
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-accent/10 backdrop-blur-sm border border-secondary/25 rounded-lg shadow-[0_0_15px_hsl(var(--secondary)/0.15)]" />
        </div>

        {/* Floating Circles - reduced from 8 to 4 */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="static-float-circle"
            style={{
              width: 60 + (i * 30),
              height: 60 + (i * 30),
              top: `${15 + (i * 20)}%`,
              left: `${8 + (i * 22)}%`,
              background: `radial-gradient(circle, ${
                i % 3 === 0
                  ? "hsl(195 100% 50% / 0.12)"
                  : i % 3 === 1
                    ? "hsl(270 60% 60% / 0.12)"
                    : "hsl(180 100% 50% / 0.1)"
              }, transparent)`,
              animationDuration: `${10 + i * 2}s`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}

        {/* Glowing orbs - reduced from 2 to 1 */}
        <div
          className="static-float-orb w-32 h-32 top-[40%] left-[60%]"
          style={{
            background: "radial-gradient(circle, hsl(195 100% 50% / 0.08), transparent 70%)",
            animationDuration: "6s",
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Floating 3D Cubes - reduced from 4 to 2 */}
      <motion.div
        className="absolute w-20 h-20 top-20 left-[10%]"
        style={{
          transform: "rotateX(45deg) rotateZ(45deg)",
          transformStyle: "preserve-3d",
        }}
        animate={{
          y: [0, -25, 0],
          rotateZ: [45, 90, 45],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-primary/25 to-secondary/15 backdrop-blur-sm border border-primary/30 rounded-lg shadow-[0_0_20px_hsl(var(--primary)/0.2)]" />
      </motion.div>

      <motion.div
        className="absolute w-16 h-16 top-[60%] right-[15%]"
        style={{
          transform: "rotateX(45deg) rotateZ(45deg)",
          transformStyle: "preserve-3d",
        }}
        animate={{
          y: [0, 35, 0],
          rotateZ: [45, 135, 45],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-secondary/25 to-accent/15 backdrop-blur-sm border border-secondary/30 rounded-lg shadow-[0_0_20px_hsl(var(--secondary)/0.2)]" />
      </motion.div>

      {/* Floating Circles - reduced from 8 to 4 */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 60 + (i * 30),
            height: 60 + (i * 30),
            top: `${15 + (i * 20)}%`,
            left: `${8 + (i * 22)}%`,
            background: `radial-gradient(circle, ${
              i % 3 === 0
                ? "hsl(195 100% 50% / 0.15)"
                : i % 3 === 1
                  ? "hsl(270 60% 60% / 0.15)"
                  : "hsl(180 100% 50% / 0.12)"
            }, transparent)`,
          }}
          animate={{
            y: [0, -15 - (i * 3), 0],
            x: [0, 10 + (i * 2), 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8 + i * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Glowing orbs - reduced from 2 to 1 */}
      <motion.div
        className="absolute w-32 h-32 top-[40%] left-[60%] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(195 100% 50% / 0.1), transparent 70%)",
        }}
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-40 h-40 top-[70%] left-[40%] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(270 60% 60% / 0.1), transparent 70%)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.6, 0.35],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  );
}