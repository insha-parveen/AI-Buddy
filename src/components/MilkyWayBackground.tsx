import { useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useShouldReduceAnimations } from "@/hooks/useReducedMotion";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
}

interface Nebula {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color1: string;
  color2: string;
  rotation: number;
  duration: number;
}

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  duration: number;
  delay: number;
  color: string;
  length: number;
}

export function MilkyWayBackground() {
  const reduceAnimations = useShouldReduceAnimations();
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate milky way star clusters - reduced from 200 to 60 on mobile/reduced motion
  const stars: Star[] = useMemo(() =>
    Array.from({ length: reduceAnimations ? 60 : 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.1,
      duration: Math.random() * 5 + 3,
      delay: Math.random() * 4,
      color: [
        '#ffffff', '#ffd700', '#87ceeb', '#ff6b9d',
        '#00ff87', '#60efff', '#a855f7', '#f43f5e'
      ][Math.floor(Math.random() * 8)],
    })), [reduceAnimations]
  );

  // Aurora waves configuration - reduced from 4 to 2
  const auroraWaves = useMemo(() => [
    { id: 1, colors: ['#00ff87', '#60efff', '#00d4ff'], top: 15, height: 350, blur: 100, duration: 25 },
    { id: 2, colors: ['#a855f7', '#ec4899', '#f43f5e'], top: 55, height: 300, blur: 90, duration: 30 },
  ], []);

  // Nebulae - reduced from 4 to 2
  const nebulae: Nebula[] = useMemo(() => [
    { id: 1, x: 10, y: 20, width: 600, height: 300, color1: '#a855f7', color2: '#06b6d4', rotation: -15, duration: 40 },
    { id: 2, x: 60, y: 40, width: 500, height: 250, color1: '#ec4899', color2: '#8b5cf6', rotation: 10, duration: 35 },
  ], []);

  // Shooting stars - reduced from 6 to 2
  const shootingStars: ShootingStar[] = useMemo(() =>
    Array.from({ length: reduceAnimations ? 2 : 4 }, (_, i) => ({
      id: i,
      startX: Math.random() * 80 + 10,
      startY: Math.random() * 30,
      duration: Math.random() * 1.5 + 1.5,
      delay: Math.random() * 20 + i * 5,
      color: ['#00ff87', '#60efff', '#a855f7', '#f43f5e'][i],
      length: Math.random() * 100 + 80,
    })), [reduceAnimations]
  );

  // Milky way band stars - reduced from 150 to 50
  const milkyWayStars: Star[] = useMemo(() =>
    Array.from({ length: reduceAnimations ? 30 : 80 }, (_, i) => {
      const bandY = 40 + (Math.random() - 0.5) * 30;
      return {
        id: i + 200,
        x: Math.random() * 100,
        y: bandY + Math.sin(i * 0.1) * 10,
        size: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.6 + 0.2,
        duration: Math.random() * 5 + 3,
        delay: Math.random() * 3,
        color: ['#ffffff', '#ffd700', '#87ceeb', '#e0e7ff'][Math.floor(Math.random() * 4)],
      };
    }), [reduceAnimations]
  );

  // Constellation stars - only render when not reduced
  const constellationStars = useMemo(() =>
    reduceAnimations ? [] : [
      { x: 15, y: 12, size: 5, color: '#60efff' },
      { x: 85, y: 20, size: 6, color: '#00ff87' },
      { x: 45, y: 35, size: 5, color: '#a855f7' },
      { x: 25, y: 55, size: 4, color: '#f43f5e' },
      { x: 70, y: 65, size: 5, color: '#fbbf24' },
    ], [reduceAnimations]
  );

  // Cosmic dust - reduced from 30 to 10
  const dustParticles = useMemo(() =>
    Array.from({ length: reduceAnimations ? 5 : 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      color: ['#a855f7', '#60efff', '#00ff87', '#f43f5e'][i % 4],
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
    })), [reduceAnimations]
  );

  // If reduced motion, render static version
  if (reduceAnimations) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 -z-10 overflow-hidden bg-background"
      >
        {/* Static gradient base */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 30%, hsl(260 70% 6%) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 70%, hsl(200 70% 5%) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, hsl(270 50% 4%) 0%, transparent 70%),
              hsl(var(--background))
            `,
          }}
        />

        {/* Static stars using CSS animation instead of Framer Motion */}
        <div className="absolute inset-0">
          {stars.slice(0, 40).map((star) => (
            <div
              key={star.id}
              className="static-star"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
                backgroundColor: star.color,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
                opacity: star.opacity,
              }}
            />
          ))}

          {/* Milky way band */}
          <div className="static-aurora" style={{
            top: '30%',
            height: '40%',
            background: `
              linear-gradient(90deg,
                transparent 0%,
                hsl(260 40% 15% / 0.3) 20%,
                hsl(280 50% 20% / 0.5) 40%,
                hsl(260 60% 25% / 0.6) 50%,
                hsl(280 50% 20% / 0.5) 60%,
                hsl(260 40% 15% / 0.3) 80%,
                transparent 100%
              )
            `,
          }} />
        </div>

        {/* Vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent 30%, hsl(var(--background)) 100%)`,
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 overflow-hidden bg-background will-change-auto"
    >
      {/* Deep space gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, hsl(260 70% 6%) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, hsl(200 70% 5%) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, hsl(270 50% 4%) 0%, transparent 70%),
            hsl(var(--background))
          `,
        }}
      />

      {/* Milky Way band - galactic core */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute w-[200%] h-[40%] left-[-50%] top-[30%]"
          style={{
            background: `
              linear-gradient(90deg,
                transparent 0%,
                hsl(260 40% 15% / 0.3) 20%,
                hsl(280 50% 20% / 0.5) 40%,
                hsl(260 60% 25% / 0.6) 50%,
                hsl(280 50% 20% / 0.5) 60%,
                hsl(260 40% 15% / 0.3) 80%,
                transparent 100%
              )
            `,
            filter: 'blur(80px)',
            transform: 'rotate(-10deg)',
          }}
          animate={{
            x: ['-10%', '10%', '-10%'],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Nebulae layer */}
      <div className="absolute inset-0">
        {nebulae.map((nebula) => (
          <motion.div
            key={nebula.id}
            className="absolute rounded-full"
            style={{
              left: `${nebula.x}%`,
              top: `${nebula.y}%`,
              width: nebula.width,
              height: nebula.height,
              background: `radial-gradient(ellipse, ${nebula.color1}15 0%, ${nebula.color2}08 50%, transparent 70%)`,
              filter: 'blur(50px)',
              transform: `rotate(${nebula.rotation}deg)`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 20, 0],
              y: [0, -15, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: nebula.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Aurora waves */}
      <div className="absolute inset-0">
        {auroraWaves.map((wave, idx) => (
          <motion.div
            key={wave.id}
            className="absolute w-[200%] left-[-50%]"
            style={{
              top: `${wave.top}%`,
              height: wave.height,
              filter: `blur(${wave.blur}px)`,
              background: `linear-gradient(90deg,
                transparent 0%,
                ${wave.colors[0]}35 25%,
                ${wave.colors[1]}50 50%,
                ${wave.colors[2]}35 75%,
                transparent 100%
              )`,
            }}
            animate={{
              x: ['-20%', '20%', '-20%'],
              scaleY: [1, 1.2, 0.9, 1.1, 1],
              opacity: [0.2, 0.4, 0.3, 0.35, 0.2],
            }}
            transition={{
              duration: wave.duration,
              delay: idx * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Main stars layer */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              backgroundColor: star.color,
              boxShadow: star.size > 2 ? `0 0 ${star.size * 3}px ${star.color}40` : 'none',
            }}
            animate={{
              opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.4],
              scale: [1, star.size > 2 ? 1.2 : 1.05, 1],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Milky way band dense stars */}
      <div className="absolute inset-0">
        {milkyWayStars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              backgroundColor: star.color,
              boxShadow: `0 0 ${star.size * 2}px ${star.color}30`,
            }}
            animate={{
              opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Bright constellation stars */}
      {constellationStars.map((star, i) => (
        <motion.div
          key={`constellation-${i}`}
          className="absolute"
          style={{ left: `${star.x}%`, top: `${star.y}%` }}
        >
          <motion.div
            className="rounded-full"
            style={{
              width: star.size,
              height: star.size,
              backgroundColor: '#ffffff',
              boxShadow: `
                0 0 ${star.size * 3}px ${star.color},
                0 0 ${star.size * 6}px ${star.color}60,
                0 0 ${star.size * 8}px ${star.color}30
              `,
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 3 + i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      ))}

      {/* Shooting stars */}
      {shootingStars.map((star) => (
        <motion.div
          key={`shooting-${star.id}`}
          className="absolute"
          style={{
            width: star.length,
            height: 2,
            left: `${star.startX}%`,
            top: `${star.startY}%`,
            background: `linear-gradient(90deg, transparent, ${star.color}80, ${star.color}, #ffffff)`,
            transformOrigin: 'left center',
            transform: 'rotate(40deg)',
            borderRadius: '2px',
          }}
          animate={{
            x: [0, 500],
            y: [0, 350],
            opacity: [0, 1, 1, 0],
            scaleX: [0.3, 1, 1, 0.3],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            repeatDelay: 15,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Floating cosmic dust particles */}
      {dustParticles.map((dust) => (
        <motion.div
          key={`dust-${dust.id}`}
          className="absolute rounded-full"
          style={{
            left: `${dust.x}%`,
            top: `${dust.y}%`,
            width: dust.size,
            height: dust.size,
            backgroundColor: dust.color,
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: dust.duration,
            repeat: Infinity,
            delay: dust.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Central aurora glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full pointer-events-none"
        style={{
          background: `
            radial-gradient(circle,
              hsl(260 60% 40% / 0.05) 0%,
              hsl(200 80% 40% / 0.03) 30%,
              hsl(280 60% 30% / 0.02) 50%,
              transparent 70%
            )
          `,
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, hsl(var(--background)) 100%)`,
        }}
      />
    </div>
  );
}