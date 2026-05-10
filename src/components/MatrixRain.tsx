import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface RainDrop {
  id: number;
  x: number;
  delay: number;
  duration: number;
  characters: string[];
}

export function MatrixRain() {
  const [drops, setDrops] = useState<RainDrop[]>([]);

  useEffect(() => {
    const generateDrops = () => {
      const newDrops: RainDrop[] = [];
      const columns = Math.floor(window.innerWidth / 30);
      
      for (let i = 0; i < columns; i++) {
        const chars: string[] = [];
        const charCount = Math.floor(Math.random() * 8) + 5;
        
        for (let j = 0; j < charCount; j++) {
          chars.push(Math.random() > 0.5 ? "1" : "0");
        }
        
        newDrops.push({
          id: i,
          x: i * 30 + Math.random() * 10,
          delay: Math.random() * 5,
          duration: 4 + Math.random() * 6,
          characters: chars,
        });
      }
      
      setDrops(newDrops);
    };

    generateDrops();
    
    const handleResize = () => generateDrops();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {drops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute flex flex-col items-center"
          style={{ left: drop.x }}
          initial={{ y: -200 }}
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
                  ? "hsl(195 100% 50% / 0.6)" 
                  : "hsl(195 100% 50% / 0.2)",
                textShadow: index === 0 
                  ? "0 0 10px hsl(195 100% 50% / 0.8)" 
                  : "none",
              }}
              animate={{
                opacity: index === 0 ? [0.8, 1, 0.8] : [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 0.5 + Math.random() * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
      ))}
      
      {/* Additional slower drops for depth */}
      {drops.slice(0, Math.floor(drops.length / 3)).map((drop, idx) => (
        <motion.div
          key={`slow-${drop.id}`}
          className="absolute flex flex-col items-center opacity-30"
          style={{ left: drop.x + 15 }}
          initial={{ y: -150 }}
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
              className="text-[10px] font-mono leading-tight text-primary/20"
            >
              {char}
            </span>
          ))}
        </motion.div>
      ))}
    </div>
  );
}
