import { useEffect, useRef, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  // Parallax transforms for different layers
  const layer1Y = useTransform(scrollY, [0, 1000], [0, -150]);
  const layer2Y = useTransform(scrollY, [0, 1000], [0, -80]);
  const layer3Y = useTransform(scrollY, [0, 1000], [0, -200]);
  const nebulaRotate = useTransform(scrollY, [0, 2000], [0, 15]);

  // Generate stars with useMemo to prevent regeneration on each render
  const stars: Star[] = useMemo(() => 
    Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    })), []
  );

  // Distant stars (smaller, less movement)
  const distantStars: Star[] = useMemo(() =>
    Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      duration: Math.random() * 5 + 4,
      delay: Math.random() * 3,
    })), []
  );

  // Nebula clouds
  const nebulae: Nebula[] = useMemo(() => [
    {
      id: 1,
      x: 10,
      y: 20,
      width: 600,
      height: 400,
      rotation: -15,
      color1: "195 100% 50%", // Primary cyan
      color2: "270 60% 60%", // Secondary purple
      duration: 25,
    },
    {
      id: 2,
      x: 60,
      y: 50,
      width: 500,
      height: 350,
      rotation: 20,
      color1: "270 60% 60%", // Purple
      color2: "320 80% 55%", // Pink
      duration: 30,
    },
    {
      id: 3,
      x: 30,
      y: 70,
      width: 450,
      height: 300,
      rotation: 5,
      color1: "180 100% 50%", // Accent cyan
      color2: "195 100% 50%", // Primary
      duration: 20,
    },
  ], []);

  // Shooting stars
  const shootingStars = useMemo(() => 
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 30,
      duration: Math.random() * 2 + 1,
      delay: Math.random() * 10 + i * 3,
    })), []
  );

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
                  hsl(${nebula.color1} / 0.15) 0%, 
                  hsl(${nebula.color2} / 0.08) 40%,
                  transparent 70%
                )
              `,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.7, 0.4],
              x: [0, 30, 0],
              y: [0, -20, 0],
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
        className="absolute inset-0 opacity-30"
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
                ? `0 0 ${star.size * 3}px hsl(195 100% 70% / 0.3)` 
                : 'none',
            }}
            animate={{
              opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3],
              scale: [1, star.size > 2 ? 1.3 : 1.1, 1],
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
        {[
          { x: 15, y: 25, size: 4 },
          { x: 85, y: 15, size: 5 },
          { x: 45, y: 65, size: 4 },
          { x: 75, y: 80, size: 3 },
          { x: 25, y: 85, size: 4 },
        ].map((cluster, i) => (
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
                  0 0 ${cluster.size * 4}px hsl(195 100% 50% / 0.5),
                  0 0 ${cluster.size * 8}px hsl(195 100% 50% / 0.3)
                `,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Star rays */}
            <motion.div
              className="absolute"
              style={{
                width: cluster.size * 20,
                height: 1,
                left: -cluster.size * 10,
                top: cluster.size / 2,
                background: `linear-gradient(90deg, transparent, hsl(195 100% 70% / 0.4), transparent)`,
              }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute"
              style={{
                width: 1,
                height: cluster.size * 20,
                left: cluster.size / 2,
                top: -cluster.size * 10,
                background: `linear-gradient(180deg, transparent, hsl(195 100% 70% / 0.4), transparent)`,
              }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
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
            repeatDelay: 8,
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
              hsl(270 60% 50% / 0.1) 0%, 
              hsl(195 100% 50% / 0.05) 30%,
              transparent 60%
            )
          `,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Spiral arms hint */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ y: layer2Y }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 300, repeat: Infinity, ease: "linear" }}
      >
        <div 
          className="w-[1000px] h-[1000px] opacity-10"
          style={{
            background: `
              conic-gradient(from 0deg, 
                transparent 0deg, 
                hsl(195 100% 50% / 0.2) 30deg, 
                transparent 60deg,
                transparent 120deg,
                hsl(270 60% 60% / 0.15) 150deg,
                transparent 180deg,
                transparent 240deg,
                hsl(180 100% 50% / 0.1) 270deg,
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
