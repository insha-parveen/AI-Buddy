import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureShowcaseProps {
  features: {
    icon: LucideIcon;
    title: string;
    description: string;
    color: string;
  }[];
}

export function FeatureShowcase({ features }: FeatureShowcaseProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: index * 0.1,
          }}
          viewport={{ once: true, margin: "-50px" }}
          whileHover={{ 
            y: -12,
            transition: { duration: 0.3 },
          }}
          className="group relative"
        >
          {/* Hover glow effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
          />

          <div className="relative glass-heavy p-8 rounded-2xl border border-border/50 h-full overflow-hidden group-hover:border-primary/50 transition-all duration-300">
            {/* Background gradient on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />

            {/* Animated corner accent */}
            <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
              <motion.div
                className="absolute top-0 right-0 w-40 h-1 bg-gradient-to-l from-primary to-transparent origin-right"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
              />
              <motion.div
                className="absolute top-0 right-0 w-1 h-40 bg-gradient-to-b from-primary to-transparent origin-top"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
              />
            </div>

            <div className="relative z-10">
              {/* Icon with animation */}
              <motion.div
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-secondary blur-lg opacity-50"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.2,
                  }}
                />
                <feature.icon className="w-7 h-7 text-white relative z-10" />
              </motion.div>

              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Animated underline */}
              <motion.div
                className="mt-4 h-0.5 bg-gradient-to-r from-primary to-secondary origin-left"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 0.3 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
