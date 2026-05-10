import { motion } from "framer-motion";

export function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Floating 3D Cubes - more visible */}
      <motion.div
        className="absolute w-20 h-20 top-20 left-[10%]"
        style={{
          transform: "rotateX(45deg) rotateZ(45deg)",
          transformStyle: "preserve-3d",
        }}
        animate={{
          y: [0, -30, 0],
          rotateZ: [45, 90, 45],
        }}
        transition={{
          duration: 8,
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
          y: [0, 40, 0],
          rotateZ: [45, 135, 45],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-secondary/25 to-accent/15 backdrop-blur-sm border border-secondary/30 rounded-lg shadow-[0_0_20px_hsl(var(--secondary)/0.2)]" />
      </motion.div>

      <motion.div
        className="absolute w-24 h-24 bottom-20 left-[20%]"
        style={{
          transform: "rotateX(45deg) rotateZ(45deg)",
          transformStyle: "preserve-3d",
        }}
        animate={{
          y: [0, -20, 0],
          rotateZ: [45, -45, 45],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-accent/25 to-primary/15 backdrop-blur-sm border border-accent/30 rounded-lg shadow-[0_0_20px_hsl(var(--accent)/0.2)]" />
      </motion.div>

      {/* Additional floating cube */}
      <motion.div
        className="absolute w-14 h-14 top-[30%] right-[30%]"
        style={{
          transform: "rotateX(45deg) rotateZ(45deg)",
          transformStyle: "preserve-3d",
        }}
        animate={{
          y: [0, 25, 0],
          rotateZ: [45, 180, 45],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/15 backdrop-blur-sm border border-primary/25 rounded-lg shadow-[0_0_15px_hsl(var(--primary)/0.15)]" />
      </motion.div>

      {/* Floating Circles - more visible */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 60 + (i * 20),
            height: 60 + (i * 20),
            top: `${10 + (i * 10)}%`,
            left: `${5 + (i * 12)}%`,
            background: `radial-gradient(circle, ${
              i % 3 === 0
                ? "hsl(195 100% 50% / 0.15)"
                : i % 3 === 1
                ? "hsl(270 60% 60% / 0.15)"
                : "hsl(180 100% 50% / 0.12)"
            }, transparent)`,
          }}
          animate={{
            y: [0, -20 - (i * 5), 0],
            x: [0, 15 + (i * 3), 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Glowing orbs */}
      <motion.div
        className="absolute w-32 h-32 top-[40%] left-[60%] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(195 100% 50% / 0.1), transparent 70%)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
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
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  );
}
