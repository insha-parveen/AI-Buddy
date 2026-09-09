import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useShouldReduceAnimations } from "@/hooks/useReducedMotion";

interface RainDrop {
  id: number;
  x: number;
  delay: number;
  duration: number;
  characters: string[];
}

export function MatrixRain() {
  const reduceAnimations = useShouldReduceAnimations();
  const [drops, setDrops] = useState<RainDrop[]>([]);

  useEffect(() => {
    const generateDrops = () => {
      const newDrops: RainDrop[] = [];
      // Significantly reduce columns on reduced motion
      const columns = Math.floor(window.innerWidth / (reduceAnimations ? 80 : 40));
      const maxColumns = reduceAnimations ? 12 : 30;

      for (let i = 0; i < Math.min(columns, maxColumns); i++) {
        const chars: string[] = [];
        // Fewer characters per drop
        const charCount = Math.floor(Math.random() * (reduceAnimations ? 4 : 6)) + 3;

        for (let j = 0; j < charCount; j++) {
          chars.push(Math.random() > 0.5 ? "1" : "0");
        }

        newDrops.push({
          id: i,
          x: i * (reduceAnimations ? 80 : 40) + Math.random() * 15,
          delay: Math.random() * (reduceAnimations ? 8 : 5),
          duration: (reduceAnimations ? 6 : 4) + Math.random() * (reduceAnimations ? 8 : 6),
          characters: chars,
        });
      }

      setDrops(newDrops);
    };

    generateDrops();

    const handleResize = () => generateDrops();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [reduceAnimations]);

  // Static version - use CSS animations
  if (reduceAnimations) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {drops.map((drop) => (
          <div
            key={drop.id}
            className="static-matrix-column"
            style={{ left: drop.x, animationDelay: `${drop.delay}s`, animationDuration: `${drop.duration}s` }}
          >
            {drop.characters.map((char, index) => (
              <span
                key={index}
                className={`static-matrix-char ${index === 0 ? 'head' : ''}`}
                style={{
                  color: index === 0
                    ? "hsl(195 100% 70%)"
                    : index < 3
                      ? "hsl(195 100% 50% / 0.5)"
                      : "hsl(195 100% 50% / 0.2)",
                  textShadow: index === 0
                    ? "0 0 8px hsl(195 100% 50% / 0.6)"
                    : "none",
                }}
              >
                {char}
              </span>
            ))}
          </div>
        ))}

        {/* Additional slower drops for depth - reduced */}
        {drops.slice(0, Math.floor(drops.length / 4)).map((drop, idx) => (
          <div
            key={`slow-${drop.id}`}
            className="static-matrix-column static-matrix-column-slow"
            style={{ left: drop.x + 20, animationDelay: `${drop.delay + 3}s`, animationDuration: `${drop.duration * 1.5}s` }}
          >
            {drop.characters.slice(0, 3).map((char, index) => (
              <span
                key={index}
                className="static-matrix-char"
                style={{ fontSize: "10px", color: "hsl(195 100% 50% / 0.15)" }}
              >
                {char}
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {drops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute flex flex-col items-center"
          style={{ left: drop.x }}
          initial={{ y: -150 }}
          animate={{ y: "110vh" }}
          transition={{
            duration: drop.duration,
            delay: drop.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {drop.characters.map((char, index) => (
            <motion.span
              key={index}
              className="text-xs font-mono leading-tight"
              style={{
                color: index === 0
                  ? "hsl(195 100% 70%)"
                  : index < 3
                    ? "hsl(195 100% 50% / 0.5)"
                    : "hsl(195 100% 50% / 0.2)",
                textShadow: index === 0
                  ? "0 0 8px hsl(195 100% 50% / 0.6)"
                  : "none",
              }}
              animate={{
                opacity: index === 0 ? [0.7, 1, 0.7] : [0.25, 0.45, 0.25],
              }}
              transition={{
                duration: 0.6 + Math.random() * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
      ))}

      {/* Additional slower drops for depth - reduced */}
      {drops.slice(0, Math.floor(drops.length / 3)).map((drop, idx) => (
        <motion.div
          key={`slow-${drop.id}`}
          className="absolute flex flex-col items-center opacity-25"
          style={{ left: drop.x + 15 }}
          initial={{ y: -100 }}
          animate={{ y: "110vh" }}
          transition={{
            duration: drop.duration * 1.5,
            delay: drop.delay + 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {drop.characters.slice(0, 4).map((char, index) => (
            <span
              key={index}
              className="text-[10px] font-mono leading-tight text-primary/15"
            >
              {char}
            </span>
          ))}
        </motion.div>
      ))}
    </div>
  );
}