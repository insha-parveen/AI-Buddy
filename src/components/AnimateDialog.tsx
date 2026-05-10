import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wand2, Download, Play, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  imageName: string;
}

const STYLE_PROMPTS: Record<string, string> = {
  "subtle-motion": "subtle atmospheric breeze, gentle ripples, slow organic movement",
  "dramatic": "cinematic dynamic motion, fast camera sweep, high energy movement",
  "zoom-enhance": "smooth zoom in, depth effect, parallax motion",
  "seasonal": "gently falling particles, atmospheric weather effects, slow motion breeze",
};

const ANIMATION_STYLES = [
  { value: "subtle-motion", label: "🌊 Subtle Motion", desc: "Wind, ripples, gentle atmosphere" },
  { value: "dramatic", label: "🌩️ Dramatic", desc: "Cinematic movement, dynamic lighting" },
  { value: "zoom-enhance", label: "🔍 Zoom In", desc: "Smooth zoom with parallax depth" },
  { value: "seasonal", label: "🍂 Environmental", desc: "Falling leaves or particles" },
];

export function AnimateDialog({ open, onOpenChange, imageUrl, imageName }: AnimateDialogProps) {
  const [style, setStyle] = useState("subtle-motion");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const generateAnimation = async () => {
    setGenerating(true);
    setVideoUrl(null);

    try {
      const motionPrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS["subtle-motion"];
      const seed = Math.floor(Math.random() * 1000000);
      const encodedPrompt = encodeURIComponent(motionPrompt);
      const encodedImage = encodeURIComponent(imageUrl);

      const pollinationsUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?model=seedance&image=${encodedImage}&width=1024&height=1024&seed=${seed}&nologo=true`;

      // Use the API key for faster generation and higher limits
      const apiKey = import.meta.env.VITE_POLLINATION_API_KEY;
      const response = await fetch(pollinationsUrl, {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
      });

      if (!response.ok) throw new Error("Failed to generate motion from AI");

      const videoBlob = await response.blob();
      const localUrl = URL.createObjectURL(videoBlob);
      setVideoUrl(localUrl);

      toast({
        title: "Animation Ready!",
        description: "Your AI motion video has been generated."
      });
    } catch (error: any) {
      console.error("Animation error:", error);
      toast({
        title: "Animation Failed",
        description: error.message || "Failed to generate animation.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadVideo = () => {
    if (!videoUrl) return;
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `${imageName}-animation.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 bg-background/95 backdrop-blur-xl border-border/50 overflow-hidden">
        <div className="flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">AI Motion Animation</h3>
            </div>
          </div>

          {/* Preview */}
          <div className="relative bg-background/50 flex items-center justify-center min-h-[400px]">
            <AnimatePresence mode="wait">
              {videoUrl ? (
                <motion.video
                  key="video-player"
                  src={videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="max-h-[60vh] max-w-full rounded-lg shadow-2xl border border-border/20"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
              ) : (
                <motion.img
                  key="static-preview"
                  src={imageUrl}
                  alt="Static Preview"
                  className="max-h-[60vh] max-w-full object-contain rounded-lg border border-border/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </AnimatePresence>

            {generating && (
              <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-50">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-foreground">Creating motion with SeeDance AI...</p>
                <p className="text-xs text-muted-foreground">This involves heavy AI processing and may take 20-40 seconds</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 border-t border-border/50 space-y-3">
            <div className="flex items-center gap-3">
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="flex-1 bg-card/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-border/50">
                  {ANIMATION_STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <div>
                        <span>{s.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">— {s.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={generateAnimation} disabled={generating} className="flex-1 gap-2 h-11">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {generating ? "Animating..." : videoUrl ? "Regenerate" : "Animate Image"}
              </Button>

              {videoUrl && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={downloadVideo}
                  className="w-11 h-11 border-border/50"
                  title="Download MP4"
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
