import { useEffect, useRef, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface AuroraWave {
  id: number;
  colors: string[];
  duration: number;
  delay: number;
  height: number;
  top: number;
  blur: number;
}

interface FloatingStar {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
}

export function AuroraBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  // Parallax transforms
  const auroraY = useTransform(scrollY, [0, 1000], [0, -100]);
  const starsY = useTransform(scrollY, [0, 1000], [0, -50]);

  // Generate aurora waves with multiple colors
  const auroraWaves: AuroraWave[] = useMemo(() => [
    {
      id: 1,
      colors: ["#00ff87", "#60efff", "#00d4ff"],
      duration: 15,
      delay: 0,
      height: 400,
      top: 10,
      blur: 120,
    },
    {
      id: 2,
      colors: ["#ff00aa", "#ff6b6b", "#ffa500"],
      duration: 18,
      delay: 2,
      height: 350,
      top: 25,
      blur: 100,
    },
    {
      id: 3,
      colors: ["#7c3aed", "#a855f7", "#ec4899"],
      duration: 20,
      delay: 4,
      height: 300,
      top: 40,
      blur: 80,
    },
    {
      id: 4,
      colors: ["#06b6d4", "#22d3ee", "#67e8f9"],
      duration: 12,
      delay: 1,
      height: 280,
      top: 55,
      blur: 90,
    },
    {
      id: 5,
      colors: ["#f43f5e", "#fb7185", "#fda4af"],
      duration: 16,
      delay: 3,
      height: 250,
      top: 70,
      blur: 70,
    },
  ], []);

  // Generate floating stars
  const stars: FloatingStar[] = useMemo(() => 
    Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 3,
      color: ['#ffffff', '#00ff87', '#60efff', '#ff00aa', '#7c3aed'][Math.floor(Math.random() * 5)],
    })), []
  );

  // Shooting stars
  const shootingStars = useMemo(() => 
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      startX: Math.random() * 80 + 10,
      startY: Math.random() * 20,
      duration: Math.random() * 1.5 + 1,
      delay: Math.random() * 12 + i * 4,
      color: ['#00ff87', '#60efff', '#ff00aa', '#7c3aed'][i],
    })), []
  );

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {/* Deep space base gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, hsl(280 60% 8%) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, hsl(200 60% 8%) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, hsl(260 40% 6%) 0%, transparent 70%),
            hsl(var(--background))
          `,
        }}
      />

      {/* Aurora waves layer */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: auroraY }}
      >
        {auroraWaves.map((wave) => (
          <motion.div
            key={wave.id}
            className="absolute w-[200%] left-[-50%]"
            style={{
              top: `${wave.top}%`,
              height: wave.height,
              filter: `blur(${wave.blur}px)`,
              background: `linear-gradient(90deg, 
                transparent 0%, 
                ${wave.colors[0]}40 20%, 
                ${wave.colors[1]}50 50%, 
                ${wave.colors[2]}40 80%, 
                transparent 100%
              )`,
              opacity: 0.4,
            }}
            animate={{
              x: ["-25%", "25%", "-25%"],
              scaleY: [1, 1.3, 0.8, 1.2, 1],
              opacity: [0.3, 0.5, 0.4, 0.6, 0.3],
            }}
            transition={{
              duration: wave.duration,
              delay: wave.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Nebula clouds */}
      <motion.div className="absolute inset-0" style={{ y: auroraY }}>
        {[
          { x: 15, y: 15, size: 500, color1: "#00ff87", color2: "#60efff", duration: 20 },
          { x: 75, y: 30, size: 450, color1: "#ff00aa", color2: "#7c3aed", duration: 25 },
          { x: 40, y: 60, size: 400, color1: "#06b6d4", color2: "#22d3ee", duration: 22 },
          { x: 85, y: 75, size: 350, color1: "#f43f5e", color2: "#fb7185", duration: 18 },
        ].map((nebula, i) => (
          <motion.div
            key={`nebula-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${nebula.x}%`,
              top: `${nebula.y}%`,
              width: nebula.size,
              height: nebula.size,
              background: `radial-gradient(circle, ${nebula.color1}15 0%, ${nebula.color2}08 40%, transparent 70%)`,
              filter: "blur(60px)",
            }}
            animate={{
              scale: [1, 1.2, 0.9, 1.1, 1],
              x: [0, 50, -30, 20, 0],
              y: [0, -30, 20, -10, 0],
            }}
            transition={{
              duration: nebula.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Stars layer */}
      <motion.div className="absolute inset-0" style={{ y: starsY }}>
        {stars.map((star) => (
          <motion.div
            key={`star-${star.id}`}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              backgroundColor: star.color,
              boxShadow: star.size > 2 ? `0 0 ${star.size * 4}px ${star.color}60` : 'none',
            }}
            animate={{
              opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3],
              scale: [1, star.size > 2 ? 1.4 : 1.1, 1],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Bright pulsing stars */}
      {[
        { x: 20, y: 15, size: 4, color: "#00ff87" },
        { x: 80, y: 25, size: 5, color: "#60efff" },
        { x: 50, y: 45, size: 4, color: "#ff00aa" },
        { x: 15, y: 70, size: 3, color: "#7c3aed" },
        { x: 85, y: 80, size: 4, color: "#f43f5e" },
      ].map((star, i) => (
        <motion.div
          key={`bright-${i}`}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
          }}
        >
          <motion.div
            className="rounded-full"
            style={{
              width: star.size,
              height: star.size,
              backgroundColor: "#ffffff",
              boxShadow: `
                0 0 ${star.size * 2}px ${star.color},
                0 0 ${star.size * 4}px ${star.color}80,
                0 0 ${star.size * 8}px ${star.color}40
              `,
            }}
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Star rays */}
          <motion.div
            className="absolute"
            style={{
              width: star.size * 25,
              height: 1,
              left: -star.size * 12.5,
              top: star.size / 2,
              background: `linear-gradient(90deg, transparent, ${star.color}60, transparent)`,
            }}
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute"
            style={{
              width: 1,
              height: star.size * 25,
              left: star.size / 2,
              top: -star.size * 12.5,
              background: `linear-gradient(180deg, transparent, ${star.color}60, transparent)`,
            }}
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </motion.div>
      ))}

      {/* Shooting stars */}
      {shootingStars.map((star) => (
        <motion.div
          key={`shooting-${star.id}`}
          className="absolute h-px"
          style={{
            width: 120,
            left: `${star.startX}%`,
            top: `${star.startY}%`,
            background: `linear-gradient(90deg, transparent, ${star.color}, #ffffff)`,
            transformOrigin: "left center",
            transform: "rotate(35deg)",
          }}
          animate={{
            x: [0, 400],
            y: [0, 300],
            opacity: [0, 1, 1, 0],
            scaleX: [0.2, 1, 1, 0.2],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            repeatDelay: 10,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Central glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
        style={{
          background: `
            radial-gradient(circle, 
              hsl(280 60% 50% / 0.08) 0%, 
              hsl(200 100% 50% / 0.05) 30%,
              transparent 60%
            )
          `,
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 12,
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
