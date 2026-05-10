import { motion } from "framer-motion";

export const SunsetBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(210,20%,8%)] via-[hsl(220,25%,12%)] to-[hsl(200,15%,10%)]" />

      {/* Warm sunset glow at horizon */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[60%]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(15,60%,15%)] via-[hsl(25,40%,12%)] to-transparent" />
      </motion.div>

      {/* Warm orange/amber accent glow */}
      <motion.div
        className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[120%] h-[40%] rounded-[50%] bg-[radial-gradient(ellipse,hsl(20,70%,20%)_0%,hsl(15,50%,12%)_40%,transparent_70%)]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.8, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />

      {/* Subtle rose tint top-right */}
      <motion.div
        className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,hsl(350,40%,15%)_0%,transparent_60%)]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Perspective grid floor */}
      <div className="absolute bottom-0 left-0 right-0 h-[45%]" style={{ perspective: "500px" }}>
        <motion.div
          className="absolute inset-0 origin-bottom"
          style={{ transform: "rotateX(60deg)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          {/* Horizontal grid lines */}
          <div className="absolute inset-0">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute left-0 right-0 border-t border-[hsl(15,40%,25%)]"
                style={{
                  top: `${(i + 1) * 8}%`,
                  opacity: 0.3 + i * 0.05,
                }}
              />
            ))}
          </div>
          {/* Vertical grid lines */}
          <div className="absolute inset-0">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute top-0 bottom-0 border-l border-[hsl(15,40%,25%)]"
                style={{
                  left: `${(i + 1) * 6.25}%`,
                  opacity: 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Mountain / terrain silhouette using SVG */}
      <motion.svg
        viewBox="0 0 1440 200"
        className="absolute bottom-[15%] left-0 w-full h-auto"
        preserveAspectRatio="none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
      >
        <path
          d="M0,200 L0,120 Q100,60 200,100 Q300,140 400,80 Q500,20 600,90 Q700,130 800,60 Q900,10 1000,70 Q1100,120 1200,50 Q1300,80 1440,100 L1440,200 Z"
          fill="hsl(15, 30%, 10%)"
        />
        <path
          d="M0,200 L0,150 Q150,100 300,130 Q450,160 600,120 Q750,80 900,130 Q1050,160 1200,110 Q1350,130 1440,140 L1440,200 Z"
          fill="hsl(15, 25%, 8%)"
        />
      </motion.svg>

      {/* Animated glow pulse at horizon center */}
      <motion.div
        className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-[radial-gradient(ellipse,hsl(25,80%,25%)_0%,transparent_60%)]"
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle stars / particles in upper area */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute w-[2px] h-[2px] rounded-full bg-white/40"
          style={{
            top: `${Math.random() * 40}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};
