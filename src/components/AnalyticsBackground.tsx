import { motion } from "framer-motion";
import { useShouldReduceAnimations } from "@/hooks/useReducedMotion";

const dataNodes = [
  { x: 10, y: 15, size: 6, delay: 0 },
  { x: 25, y: 35, size: 8, delay: 0.5 },
  { x: 45, y: 10, size: 5, delay: 1 },
  { x: 70, y: 25, size: 7, delay: 1.5 },
  { x: 85, y: 45, size: 6, delay: 2 },
  { x: 15, y: 65, size: 8, delay: 2.5 },
  { x: 55, y: 70, size: 5, delay: 3 },
  { x: 90, y: 75, size: 7, delay: 3.5 },
];

const gridLines = Array.from({ length: 8 }, (_, i) => ({
  isHorizontal: i < 4,
  position: ((i % 4) + 1) * 20 + 5,
  delay: i * 0.4,
}));

const pulseOrbs = [
  { x: 20, y: 20, color: "hsl(195 100% 50%)", size: 200 },
  { x: 80, y: 30, color: "hsl(270 60% 60%)", size: 250 },
  { x: 50, y: 75, color: "hsl(180 100% 50%)", size: 220 },
];

export function AnalyticsBackground() {
  const reduceAnimations = useShouldReduceAnimations();

  if (reduceAnimations) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Deep gradient base */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 20%, hsl(195 100% 50% / 0.04) 0%, transparent 50%), " +
              "radial-gradient(ellipse at 80% 80%, hsl(270 60% 60% / 0.04) 0%, transparent 50%), " +
              "radial-gradient(ellipse at 50% 50%, hsl(180 100% 50% / 0.02) 0%, transparent 60%)",
          }}
        />

        {/* Static orbs */}
        {pulseOrbs.map((orb, i) => (
          <div
            key={`orb-${i}`}
            className="static-analytics-orb"
            style={{
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle, ${orb.color.replace(")", " / 0.08)")} 0%, transparent 70%)`,
              animationDelay: `${i * 6}s`,
            }}
          />
        ))}

        {/* Static grid */}
        <svg className="absolute inset-0 w-full h-full">
          {gridLines.map((line, i) => (
            <line
              key={`grid-${i}`}
              x1={line.isHorizontal ? "0%" : `${line.position}%`}
              y1={line.isHorizontal ? `${line.position}%` : "0%"}
              x2={line.isHorizontal ? "100%" : `${line.position}%`}
              y2={line.isHorizontal ? `${line.position}%` : "100%"}
              stroke="hsl(195 100% 50% / 0.03)"
              strokeWidth="1"
              className="static-grid-line"
              style={{ animationDelay: `${line.delay}s` }}
            />
          ))}
        </svg>

        {/* Static nodes - reduced from 10 to 5 */}
        {dataNodes.slice(0, 5).map((node, i) => (
          <div
            key={`node-${i}`}
            className="static-node"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: node.size,
              height: node.size,
              background: i % 3 === 0
                ? "hsl(195 100% 50%)"
                : i % 3 === 1
                  ? "hsl(270 60% 60%)"
                  : "hsl(180 100% 50%)",
              boxShadow: `0 0 ${node.size * 2}px ${
                i % 3 === 0
                  ? "hsl(195 100% 50% / 0.3)"
                  : i % 3 === 1
                    ? "hsl(270 60% 60% / 0.3)"
                    : "hsl(180 100% 50% / 0.3)"
              }`,
              animationDelay: `${node.delay}s`,
            }}
          />
        ))}

        {/* Static scanning line */}
        <div
          className="static-scan"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, hsl(195 100% 50% / 0.2) 20%, hsl(195 100% 50% / 0.4) 50%, hsl(195 100% 50% / 0.2) 80%, transparent 100%)",
            boxShadow: "0 0 15px hsl(195 100% 50% / 0.15)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 20%, hsl(195 100% 50% / 0.06) 0%, transparent 50%), " +
            "radial-gradient(ellipse at 80% 80%, hsl(270 60% 60% / 0.06) 0%, transparent 50%), " +
            "radial-gradient(ellipse at 50% 50%, hsl(180 100% 50% / 0.03) 0%, transparent 60%)",
        }}
      />

      {/* Animated glow orbs - reduced from 5 to 3 */}
      {pulseOrbs.map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color.replace(")", " / 0.12)")} 0%, transparent 70%)`,
            filter: "blur(50px)",
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            x: [0, 30, -20, 15, 0],
            y: [0, -25, 15, -10, 0],
            scale: [1, 1.2, 0.85, 1.1, 1],
            opacity: [0.35, 0.6, 0.25, 0.5, 0.35],
          }}
          transition={{
            duration: 22 + i * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Cyber grid - reduced from 12 to 8 lines */}
      <svg className="absolute inset-0 w-full h-full">
        {gridLines.map((line, i) => (
          <motion.line
            key={`grid-${i}`}
            x1={line.isHorizontal ? "0%" : `${line.position}%`}
            y1={line.isHorizontal ? `${line.position}%` : "0%"}
            x2={line.isHorizontal ? "100%" : `${line.position}%`}
            y2={line.isHorizontal ? `${line.position}%` : "100%"}
            stroke="hsl(195 100% 50% / 0.03)"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.06, 0.02, 0.04, 0] }}
            transition={{
              duration: 10,
              delay: line.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>

      {/* Data flow paths - reduced from 3 to 2 */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="analyticsGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(195 100% 50%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(195 100% 50%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(270 60% 60%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="analyticsGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(180 100% 50%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(180 100% 50%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(320 80% 55%)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.path
          d="M 0,150 C 200,80 400,220 600,120 S 1000,200 1400,100"
          fill="none"
          stroke="url(#analyticsGrad1)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M 0,350 C 150,280 350,420 550,300 S 850,380 1200,280 1400,350"
          fill="none"
          stroke="url(#analyticsGrad2)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 0] }}
          transition={{ duration: 18, delay: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Bar chart silhouette - reduced from 5 to 3 bars */}
        {[
          { x: 70, h: 60 },
          { x: 100, h: 90 },
          { x: 130, h: 55 },
        ].map((bar, i) => (
          <motion.rect
            key={`bar-${i}`}
            x={`${bar.x}`}
            y={`${700 - bar.h}`}
            width="10"
            rx="2"
            fill="hsl(195 100% 50% / 0.05)"
            initial={{ height: 0 }}
            animate={{ height: [0, bar.h, bar.h * 0.8, bar.h, 0] }}
            transition={{
              duration: 12,
              delay: i * 0.6 + 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>

      {/* Glowing data nodes - reduced from 10 to 6 */}
      {dataNodes.slice(0, 6).map((node, i) => (
        <motion.div
          key={`node-${i}`}
          className="absolute"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
          }}
        >
          <motion.div
            className="rounded-full"
            style={{
              width: node.size,
              height: node.size,
              background: i % 3 === 0
                ? "hsl(195 100% 50%)"
                : i % 3 === 1
                  ? "hsl(270 60% 60%)"
                  : "hsl(180 100% 50%)",
              boxShadow: `0 0 ${node.size * 2}px ${
                i % 3 === 0
                  ? "hsl(195 100% 50% / 0.3)"
                  : i % 3 === 1
                    ? "hsl(270 60% 60% / 0.3)"
                    : "hsl(180 100% 50% / 0.3)"
              }`,
            }}
            animate={{
              opacity: [0.15, 0.5, 0.15],
              scale: [1, 1.6, 1],
            }}
            transition={{
              duration: 5 + i * 0.5,
              delay: node.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      ))}

      {/* Scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(195 100% 50% / 0.25) 20%, hsl(195 100% 50% / 0.5) 50%, hsl(195 100% 50% / 0.25) 80%, transparent 100%)",
          boxShadow: "0 0 15px hsl(195 100% 50% / 0.15)",
        }}
        animate={{
          top: ["0%", "100%", "0%"],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Floating hex patterns - reduced from 8 to 3 */}
      {Array.from({ length: 3 }, (_, i) => (
        <motion.div
          key={`hex-${i}`}
          className="absolute border border-primary/08 rotate-45"
          style={{
            left: `${20 + i * 25}%`,
            top: `${20 + (i % 2) * 40}%`,
            width: 30 + i * 8,
            height: 30 + i * 8,
            borderRadius: "4px",
          }}
          animate={{
            rotate: [45, 135, 225, 315, 405],
            opacity: [0.03, 0.1, 0.03],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 18 + i * 3,
            delay: i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}