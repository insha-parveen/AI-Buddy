import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface TechStackProps {
  items: {
    icon: LucideIcon;
    title: string;
    subtitle: string;
  }[];
}

export function TechStack({ items }: TechStackProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
      {items.map((tech, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: index * 0.1,
            type: "spring",
            stiffness: 100,
          }}
          viewport={{ once: true }}
          whileHover={{ y: -8 }}
          className="group"
        >
          <div className="relative text-center p-6 rounded-2xl glass border border-border/50 hover:border-primary/50 transition-all duration-300">
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />

            {/* Icon container */}
            <motion.div
              className="relative inline-flex p-5 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 border border-border/50 mb-4 overflow-hidden"
              whileHover={{ scale: 1.05 }}
            >
              {/* Animated shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
                animate={{
                  translateX: ["−100%", "200%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              />
              <tech.icon className="w-10 h-10 text-primary relative z-10" strokeWidth={1.5} />
            </motion.div>

            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
              {tech.title}
            </h3>
            <p className="text-sm text-muted-foreground">{tech.subtitle}</p>

            {/* Bottom accent line */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"
              initial={{ width: 0 }}
              whileHover={{ width: "60%" }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
