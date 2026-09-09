import { useEffect, useRef, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useShouldReduceAnimations } from "@/hooks/useReducedMotion";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

interface Nebula {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color1: string;
  color2: string;
  duration: number;
}

export function GalaxyBackground() {
  const reduceAnimations = useShouldReduceAnimations();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Parallax transforms for different layers
  const layer1Y = useTransform(scrollY, [0, 1000], [0, -150]);
  const layer2Y = useTransform(scrollY, [0, 1000], [0, -80]);
  const layer3Y = useTransform(scrollY, [0, 1000], [0, -200]);
  const nebulaRotate = useTransform(scrollY, [0, 2000], [0, 15]);

  // Generate stars - reduced count
  const stars: Star[] = useMemo(() =>
    Array.from({ length: reduceAnimations ? 60 : 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 1,
      opacity: Math.random() * 0.7 + 0.2,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 2,
    })), [reduceAnimations]
  );

  // Distant stars - reduced
  const distantStars: Star[] = useMemo(() =>
    Array.from({ length: reduceAnimations ? 30 : 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      duration: Math.random() * 6 + 5,
      delay: Math.random() * 3,
    })), [reduceAnimations]
  );

  // Nebula clouds - reduced from 3 to 2
  const nebulae: Nebula[] = useMemo(() => [
    {
      id: 1,
      x: 10,
      y: 20,
      width: 600,
      height: 400,
      rotation: -15,
      color1: "195 100% 50%",
      color2: "270 60% 60%",
      duration: 35,
    },
    {
      id: 2,
      x: 60,
      y: 50,
      width: 500,
      height: 350,
      rotation: 20,
      color1: "270 60% 60%",
      color2: "320 80% 55%",
      duration: 40,
    },
  ], []);

  // Shooting stars - reduced from 5 to 2
  const shootingStars = useMemo(() =>
    Array.from({ length: reduceAnimations ? 1 : 3 }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 30,
      duration: Math.random() * 2 + 1.5,
      delay: Math.random() * 15 + i * 5,
    })), [reduceAnimations]
  );

  // Bright star clusters - reduced from 5 to 3
  const clusters = useMemo(() => [
    { x: 15, y: 25, size: 4 },
    { x: 85, y: 15, size: 5 },
    { x: 45, y: 65, size: 4 },
  ], []);

  // If reduced motion, render static version
  if (reduceAnimations) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 -z-10 overflow-hidden bg-background"
      >
        {/* Deep space gradient base */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 50% 0%, hsl(210 15% 12%) 0%, transparent 60%),
              radial-gradient(ellipse at 0% 100%, hsl(270 60% 15% / 0.4) 0%, transparent 50%),
              radial-gradient(ellipse at 100% 100%, hsl(195 100% 20% / 0.3) 0%, transparent 50%),
              hsl(var(--background))
            `,
          }}
        />

        {/* Static nebulae */}
        {nebulae.map((nebula) => (
          <div
            key={nebula.id}
            className="static-nebula"
            style={{
              left: `${nebula.x}%`,
              top: `${nebula.y}%`,
              width: nebula.width,
              height: nebula.height,
              transform: `translate(-50%, -50%) rotate(${nebula.rotation}deg)`,
              background: `
                radial-gradient(ellipse,
                  hsl(${nebula.color1} / 0.12) 0%,
                  hsl(${nebula.color2} / 0.06) 40%,
                  transparent 70%
                )
              `,
              animationDuration: `${nebula.duration}s`,
            }}
          />
        ))}

        {/* Cosmic dust - CSS only */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 20% 30%, hsl(195 100% 70%) 50%, transparent),
              radial-gradient(1px 1px at 40% 70%, hsl(270 60% 70%) 50%, transparent),
              radial-gradient(1px 1px at 70% 40%, hsl(180 100% 70%) 50%, transparent),
              radial-gradient(2px 2px at 90% 20%, hsl(195 100% 80%) 50%, transparent),
              radial-gradient(1px 1px at 10% 80%, hsl(270 60% 80%) 50%, transparent)
            `,
            backgroundSize: "250px 250px",
          }}
        />

        {/* Static stars */}
        {distantStars.map((star) => (
          <div
            key={`distant-${star.id}`}
            className="static-galaxy-star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              backgroundColor: `hsl(210 20% 80% / ${star.opacity})`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}

        {stars.map((star) => (
          <div
            key={`star-${star.id}`}
            className="static-galaxy-star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              backgroundColor: star.id % 5 === 0
                ? `hsl(195 100% 70% / ${star.opacity})`
                : star.id % 7 === 0
                ? `hsl(270 60% 70% / ${star.opacity})`
                : `hsl(0 0% 100% / ${star.opacity})`,
              boxShadow: star.size > 2
                ? `0 0 ${star.size * 2}px hsl(195 100% 70% / 0.2)`
                : 'none',
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}

        {/* Static clusters */}
        {clusters.map((cluster, i) => (
          <div key={`cluster-${i}`} className="absolute" style={{ left: `${cluster.x}%`, top: `${cluster.y}%` }}>
            <div
              className="absolute rounded-full"
              style={{
                width: cluster.size,
                height: cluster.size,
                backgroundColor: "hsl(0 0% 100%)",
                boxShadow: `
                  0 0 ${cluster.size * 2}px hsl(195 100% 70%),
                  0 0 ${cluster.size * 3}px hsl(195 100% 50% / 0.4)
                `,
              }}
            />
          </div>
        ))}

        {/* Static shooting stars */}
        {shootingStars.map((star) => (
          <div
            key={`shooting-${star.id}`}
            className="static-shooting"
            style={{
              width: 100,
              left: `${star.startX}%`,
              top: `${star.startY}%`,
              background: `linear-gradient(90deg, transparent, hsl(195 100% 80%), hsl(0 0% 100%))`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration * 3}s`,
            }}
          />
        ))}

        {/* Galactic core glow - static */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{
            background: `
              radial-gradient(circle,
                hsl(270 60% 50% / 0.06) 0%,
                hsl(195 100% 50% / 0.03) 30%,
                transparent 60%
              )
            `,
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at center, transparent 40%, hsl(var(--background)) 100%)
            `,
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {/* Deep space gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, hsl(210 15% 12%) 0%, transparent 60%),
            radial-gradient(ellipse at 0% 100%, hsl(270 60% 15% / 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 100% 100%, hsl(195 100% 20% / 0.3) 0%, transparent 50%),
            hsl(var(--background))
          `,
        }}
      />

      {/* Nebula clouds - slowest parallax */}
      <motion.div
        className="absolute inset-0"
        style={{ y: layer1Y, rotate: nebulaRotate }}
      >
        {nebulae.map((nebula) => (
          <motion.div
            key={nebula.id}
            className="absolute blur-3xl"
            style={{
              left: `${nebula.x}%`,
              top: `${nebula.y}%`,
              width: nebula.width,
              height: nebula.height,
              transform: `rotate(${nebula.rotation}deg)`,
              background: `
                radial-gradient(ellipse,
                  hsl(${nebula.color1} / 0.12) 0%,
                  hsl(${nebula.color2} / 0.06) 40%,
                  transparent 70%
                )
              `,
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.55, 0.3],
              x: [0, 20, 0],
              y: [0, -15, 0],
            }}
            transition={{
              duration: nebula.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Cosmic dust layer */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{ y: layer2Y }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 20% 30%, hsl(195 100% 70%) 50%, transparent),
              radial-gradient(1px 1px at 40% 70%, hsl(270 60% 70%) 50%, transparent),
              radial-gradient(1px 1px at 70% 40%, hsl(180 100% 70%) 50%, transparent),
              radial-gradient(2px 2px at 90% 20%, hsl(195 100% 80%) 50%, transparent),
              radial-gradient(1px 1px at 10% 80%, hsl(270 60% 80%) 50%, transparent)
            `,
            backgroundSize: "250px 250px",
          }}
        />
      </motion.div>

      {/* Distant stars layer - minimal parallax */}
      <motion.div className="absolute inset-0" style={{ y: layer1Y }}>
        {distantStars.map((star) => (
          <motion.div
            key={`distant-${star.id}`}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              backgroundColor: `hsl(210 20% 80% / ${star.opacity})`,
            }}
            animate={{
              opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
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

      {/* Main stars layer - medium parallax */}
      <motion.div className="absolute inset-0" style={{ y: layer2Y }}>
        {stars.map((star) => (
          <motion.div
            key={`star-${star.id}`}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              backgroundColor: star.id % 5 === 0
                ? `hsl(195 100% 70% / ${star.opacity})`
                : star.id % 7 === 0
                ? `hsl(270 60% 70% / ${star.opacity})`
                : `hsl(0 0% 100% / ${star.opacity})`,
              boxShadow: star.size > 2
                ? `0 0 ${star.size * 2}px hsl(195 100% 70% / 0.2)`
                : 'none',
            }}
            animate={{
              opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3],
              scale: [1, star.size > 2 ? 1.2 : 1.05, 1],
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

      {/* Bright star clusters */}
      <motion.div className="absolute inset-0" style={{ y: layer3Y }}>
        {clusters.map((cluster, i) => (
          <motion.div
            key={`cluster-${i}`}
            className="absolute"
            style={{
              left: `${cluster.x}%`,
              top: `${cluster.y}%`,
            }}
          >
            {/* Central bright star */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: cluster.size,
                height: cluster.size,
                backgroundColor: "hsl(0 0% 100%)",
                boxShadow: `
                  0 0 ${cluster.size * 2}px hsl(195 100% 70%),
                  0 0 ${cluster.size * 4}px hsl(195 100% 50% / 0.4),
                  0 0 ${cluster.size * 6}px hsl(195 100% 50% / 0.2)
                `,
              }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Shooting stars */}
      {shootingStars.map((star) => (
        <motion.div
          key={`shooting-${star.id}`}
          className="absolute h-px"
          style={{
            width: 100,
            left: `${star.startX}%`,
            top: `${star.startY}%`,
            background: `linear-gradient(90deg, transparent, hsl(195 100% 80%), hsl(0 0% 100%))`,
            transformOrigin: "left center",
            transform: "rotate(45deg)",
          }}
          animate={{
            x: [0, 300],
            y: [0, 300],
            opacity: [0, 1, 1, 0],
            scaleX: [0.3, 1, 1, 0.3],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            repeatDelay: 12,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Galactic core glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: `
            radial-gradient(circle,
              hsl(270 60% 50% / 0.08) 0%,
              hsl(195 100% 50% / 0.04) 30%,
              transparent 60%
            )
          `,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Spiral arms hint - disabled on reduced motion already handled */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ y: layer2Y }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 400, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="w-[1000px] h-[1000px] opacity-5"
          style={{
            background: `
              conic-gradient(from 0deg,
                transparent 0deg,
                hsl(195 100% 50% / 0.15) 30deg,
                transparent 60deg,
                transparent 120deg,
                hsl(270 60% 60% / 0.1) 150deg,
                transparent 180deg,
                transparent 240deg,
                hsl(180 100% 50% / 0.08) 270deg,
                transparent 300deg
              )
            `,
            mask: "radial-gradient(circle, black 20%, transparent 70%)",
            WebkitMask: "radial-gradient(circle, black 20%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 40%, hsl(var(--background)) 100%)
          `,
        }}
      />
    </div>
  );
}