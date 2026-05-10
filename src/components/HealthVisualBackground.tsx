import { useEffect, useState, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface HealthIcon {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  type: "heart" | "droplet" | "pill" | "apple" | "dna" | "pulse" | "brain" | "leaf";
  rotation: number;
  opacity: number;
}

interface FloatingOrb {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
}

interface PopBubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

const HealthIconSVG = ({ type, size, color }: { type: string; size: number; color: string }) => {
  const icons: Record<string, JSX.Element> = {
    heart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    droplet: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
    pill: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <rect x="3" y="10.5" width="18" height="3" rx="1.5" transform="rotate(-45 12 12)" />
        <line x1="12" y1="7.5" x2="16.5" y2="12" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
    apple: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
        <path d="M12 2C10.5 2 9.5 3.5 9.5 5C8 5 4 6 4 12C4 18 7 22 12 22C17 22 20 18 20 12C20 6 16 5 14.5 5C14.5 3.5 13.5 2 12 2Z" />
        <path d="M12 2C12 4 14 4 14 4" fill="none" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
    dna: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M2 15c6.667-6 13.333 0 20-6" />
        <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
        <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
        <path d="M17 6l-2.5-2.5" />
        <path d="M14 8l-3-3" />
        <path d="M7 18l2.5 2.5" />
        <path d="M3.5 14.5l.5.5" />
        <path d="M20 9l.5.5" />
        <path d="M6.5 12.5l1 1" />
        <path d="M16.5 10.5l1 1" />
      </svg>
    ),
    pulse: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    brain: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" opacity="0.9">
        <path d="M12 5c-2-2-5-2-7 0s-2 5 0 7c1 1 2 1.5 3 1.5v8.5c0 .5.5 1 1 1h6c.5 0 1-.5 1-1v-8.5c1 0 2-.5 3-1.5c2-2 2-5 0-7s-5-2-7 0" />
      </svg>
    ),
    leaf: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" fill="none" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
  };

  return icons[type] || icons.heart;
};

export function HealthVisualBackground() {
  const { scrollY } = useScroll();
  const layer1Y = useTransform(scrollY, [0, 1000], [0, -150]);
  const layer2Y = useTransform(scrollY, [0, 1000], [0, -75]);

  // Generate raining health icons
  const healthIcons: HealthIcon[] = useMemo(() => 
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 12 + Math.random() * 10,
      size: 16 + Math.random() * 20,
      type: ["heart", "droplet", "pill", "apple", "dna", "pulse", "brain", "leaf"][
        Math.floor(Math.random() * 8)
      ] as HealthIcon["type"],
      rotation: Math.random() * 360,
      opacity: 0.15 + Math.random() * 0.25,
    })), []
  );

  // Generate floating orbs with health colors
  const floatingOrbs: FloatingOrb[] = useMemo(() => [
    { id: 1, x: 15, y: 20, size: 400, color: "#22c55e", duration: 20 },
    { id: 2, x: 75, y: 60, size: 350, color: "#3b82f6", duration: 25 },
    { id: 3, x: 50, y: 80, size: 300, color: "#ec4899", duration: 18 },
    { id: 4, x: 85, y: 30, size: 280, color: "#8b5cf6", duration: 22 },
    { id: 5, x: 25, y: 65, size: 320, color: "#06b6d4", duration: 24 },
  ], []);

  // Generate pop bubbles
  const popBubbles: PopBubble[] = useMemo(() => 
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 8 + Math.random() * 24,
      color: ["#22c55e", "#3b82f6", "#ec4899", "#8b5cf6", "#f97316", "#06b6d4"][
        Math.floor(Math.random() * 6)
      ],
      delay: Math.random() * 8,
    })), []
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Base gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, hsl(142 40% 8%) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, hsl(220 60% 8%) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, hsl(280 40% 6%) 0%, transparent 70%),
            hsl(var(--background))
          `,
        }}
      />

      {/* Floating health orbs */}
      <motion.div className="absolute inset-0" style={{ y: layer1Y }}>
        {floatingOrbs.map((orb) => (
          <motion.div
            key={`orb-${orb.id}`}
            className="absolute rounded-full"
            style={{
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle, ${orb.color}20 0%, ${orb.color}08 40%, transparent 70%)`,
              filter: "blur(60px)",
            }}
            animate={{
              scale: [1, 1.3, 0.9, 1.2, 1],
              x: [0, 60, -40, 30, 0],
              y: [0, -40, 30, -20, 0],
              opacity: [0.4, 0.7, 0.5, 0.8, 0.4],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Raining health icons */}
      <motion.div className="absolute inset-0" style={{ y: layer2Y }}>
        {healthIcons.map((icon) => (
          <motion.div
            key={`icon-${icon.id}`}
            className="absolute"
            style={{
              left: `${icon.x}%`,
              opacity: icon.opacity,
            }}
            initial={{ y: -100, rotate: icon.rotation }}
            animate={{
              y: "110vh",
              rotate: icon.rotation + 360,
            }}
            transition={{
              duration: icon.duration,
              delay: icon.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [icon.opacity, icon.opacity * 1.5, icon.opacity],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <HealthIconSVG
                type={icon.type}
                size={icon.size}
                color={
                  icon.type === "heart" ? "#ef4444" :
                  icon.type === "droplet" ? "#3b82f6" :
                  icon.type === "pill" ? "#f97316" :
                  icon.type === "apple" ? "#22c55e" :
                  icon.type === "dna" ? "#8b5cf6" :
                  icon.type === "pulse" ? "#ec4899" :
                  icon.type === "brain" ? "#f472b6" :
                  "#10b981"
                }
              />
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Pop bubbles */}
      {popBubbles.map((bubble) => (
        <motion.div
          key={`bubble-${bubble.id}`}
          className="absolute rounded-full"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: bubble.size,
            height: bubble.size,
            backgroundColor: bubble.color,
            boxShadow: `0 0 ${bubble.size}px ${bubble.color}60`,
          }}
          animate={{
            scale: [0, 1.2, 1, 1.3, 0],
            opacity: [0, 0.6, 0.5, 0.7, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            delay: bubble.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Pulse rings */}
      {[
        { x: 20, y: 30, color: "#22c55e", delay: 0 },
        { x: 70, y: 20, color: "#3b82f6", delay: 2 },
        { x: 50, y: 70, color: "#ec4899", delay: 4 },
        { x: 85, y: 55, color: "#8b5cf6", delay: 1 },
      ].map((ring, i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute rounded-full border-2"
          style={{
            left: `${ring.x}%`,
            top: `${ring.y}%`,
            width: 100,
            height: 100,
            marginLeft: -50,
            marginTop: -50,
            borderColor: ring.color,
          }}
          animate={{
            scale: [0.5, 2.5, 0.5],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 6,
            delay: ring.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Heartbeat line */}
      <motion.div
        className="absolute left-0 right-0 top-1/2 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, #22c55e40, #ec489940, #3b82f640, transparent)",
        }}
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scaleY: [1, 3, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating DNA strands */}
      {[0, 1].map((strand) => (
        <motion.div
          key={`strand-${strand}`}
          className="absolute w-12 opacity-20"
          style={{
            left: strand === 0 ? "10%" : "88%",
            top: "20%",
            height: "60%",
          }}
          animate={{
            y: [0, -30, 0],
            rotateY: [0, 180, 360],
          }}
          transition={{
            duration: 15 + strand * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-full flex justify-between items-center"
              style={{ top: `${i * 12.5}%` }}
              animate={{
                rotateZ: [0, strand === 0 ? 360 : -360],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.2,
              }}
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: i % 2 === 0 ? "#22c55e" : "#3b82f6" }}
              />
              <div 
                className="h-0.5 flex-1 mx-1"
                style={{ backgroundColor: "#8b5cf640" }}
              />
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: i % 2 === 0 ? "#3b82f6" : "#22c55e" }}
              />
            </motion.div>
          ))}
        </motion.div>
      ))}

      {/* Central health glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: `
            radial-gradient(circle, 
              hsl(142 60% 50% / 0.06) 0%, 
              hsl(220 100% 50% / 0.04) 30%,
              hsl(330 80% 50% / 0.03) 50%,
              transparent 70%
            )
          `,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, hsl(var(--background)) 100%)`,
        }}
      />
    </div>
  );
}
