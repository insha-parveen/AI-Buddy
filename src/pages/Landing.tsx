import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  MessageSquare, 
  Brain, 
  Heart, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe, 
  MessageCircle, 
  Bot,
  ArrowRight,
  Play,
  Star,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MilkyWayBackground } from "@/components/MilkyWayBackground";
import { ProductivityVisuals } from "@/components/ProductivityVisuals";
import { HeroIllustration } from "@/components/HeroIllustration";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { TechStack } from "@/components/TechStack";
import { useRef } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.9]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.97]);

  const features = [
    {
      icon: MessageSquare,
      title: "Multilingual AI Chat",
      description: "Converse in English, Hindi, Arabic, and 50+ languages with seamless voice and text support",
      color: "text-primary"
    },
    {
      icon: Brain,
      title: "Learning Assistant",
      description: "Create smart notes, flashcards, and AI-generated quizzes to accelerate your learning",
      color: "text-secondary"
    },
    {
      icon: Heart,
      title: "Health Tracker",
      description: "Monitor daily habits, get personalized wellness tips, and stay on top of your health goals",
      color: "text-green-500"
    },
    {
      icon: TrendingUp,
      title: "Finance Manager",
      description: "Track expenses effortlessly, manage budgets, and receive AI-powered financial insights",
      color: "text-yellow-500"
    },
    {
      icon: Shield,
      title: "Document Assistant",
      description: "Upload PDFs and documents for instant AI summarization, Q&A, and key insights extraction",
      color: "text-primary"
    },
    {
      icon: Zap,
      title: "Smart Reminders",
      description: "Never miss important tasks with intelligent, context-aware reminder management",
      color: "text-primary"
    }
  ];

  const techFeatures = [
    { icon: Globe, title: "OpenAI GPT-5", subtitle: "Latest AI Model" },
    { icon: MessageCircle, title: "Voice AI", subtitle: "Speech Recognition" },
    { icon: Shield, title: "Secure", subtitle: "End-to-End Encryption" },
    { icon: Zap, title: "Real-time", subtitle: "Instant Responses" }
  ];

  const stats = [
    { value: "50+", label: "Languages Supported", icon: Globe },
    { value: "99.9%", label: "Uptime Guarantee", icon: CheckCircle2 },
    { value: "< 1s", label: "Response Time", icon: Zap },
    { value: "5★", label: "User Rating", icon: Star },
  ];

  

  return (
    <div ref={containerRef} className="min-h-screen bg-background relative overflow-hidden">
      <MilkyWayBackground />
      <ProductivityVisuals />
      
      {/* Floating Header */}
      <motion.header 
        style={{ opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:block">AI Assistant</span>
          </motion.div>

          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThemeToggle />
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="border border-primary/30 hover:bg-primary/10"
            >
              Login
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              className="gradient-primary text-white hidden sm:flex"
            >
              Get Started
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        style={{ scale: heroScale }}
        className="relative z-10 pt-32 pb-20 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <motion.div
            initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, ease: "easeOut" }}
              >
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-medium">Powered by GPT-5 Technology</span>
              </motion.div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="gradient-text">Your Intelligent</span>
                <br />
                <span className="text-foreground">AI Companion</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                Experience the future of productivity with our AI-powered assistant. 
                Learn faster, stay healthy, manage finances, and accomplish more.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    onClick={() => navigate("/auth")}
                    className="gradient-primary text-white text-lg px-8 py-6 glow-primary group"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary/50 text-lg px-8 py-6 glass group"
                  >
                    <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                    Watch Demo
                  </Button>
                </motion.div>
              </div>

              {/* Trust indicators */}
              <motion.div 
                className="flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Free forever plan</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right side - Hero Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="relative"
            >
              <HeroIllustration />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="glass-heavy rounded-3xl p-8 border border-border/50"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="inline-flex p-3 rounded-xl bg-primary/10 mb-3"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <stat.icon className="w-6 h-6 text-primary" />
                  </motion.div>
                  <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-secondary/30 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Zap className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">Powerful Features</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Everything You Need,{" "}
              <span className="gradient-text">All in One Place</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From intelligent conversations to personal productivity management, 
              our AI adapts to your unique needs and grows with you.
            </p>
          </motion.div>

          <FeatureShowcase features={features} />
        </div>
      </section>

      {/* Technology Section */}
      <section className="relative z-10 py-20 px-4 bg-gradient-to-b from-transparent via-card/30 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Built with <span className="gradient-text">Cutting-Edge AI</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Powered by the latest advances in artificial intelligence and security
            </p>
          </motion.div>

          <TechStack items={techFeatures} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative glass-heavy rounded-3xl p-12 text-center border border-border/50 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
            <motion.div
              className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.5, 0.3, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            />

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                viewport={{ once: true }}
                className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-6"
              >
                <Bot className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to <span className="gradient-text">Get Started?</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already transforming their productivity with AI
              </p>
              
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="gradient-primary text-white px-12 py-6 text-lg glow-primary"
                >
                  Start Your AI Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 border-t border-border/50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">AI Assistant</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 AI Assistant. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
