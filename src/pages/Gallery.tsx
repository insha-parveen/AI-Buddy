import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { MilkyWayBackground } from "@/components/MilkyWayBackground";
import { ProductivityVisuals } from "@/components/ProductivityVisuals";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  ImageIcon,
  Download,
  Trash2,
  Search,
  Loader2,
  Sparkles,
  Calendar,
  X,
  ZoomIn,
  Grid3X3,
  LayoutGrid,
  Wand2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AnimateDialog } from "@/components/AnimateDialog";

interface GalleryImage {
  name: string;
  url: string;
  created_at: string;
}

import { useShouldReduceAnimations } from "@/hooks/useReducedMotion";

export default function Gallery() {
  const reduceAnimations = useShouldReduceAnimations();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [compactGrid, setCompactGrid] = useState(false);
  const [animateImage, setAnimateImage] = useState<GalleryImage | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.storage
        .from("generated-images")
        .list(user.id, {
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) throw error;

      const imageList: GalleryImage[] = (data || [])
        .filter((file) => file.name !== ".emptyFolderPlaceholder")
        .map((file) => {
          const { data: urlData } = supabase.storage
            .from("generated-images")
            .getPublicUrl(`${user.id}/${file.name}`);
          return {
            name: file.name,
            url: urlData.publicUrl,
            created_at: file.created_at || new Date().toISOString(),
          };
        });

      setImages(imageList);
    } catch (error) {
      console.error("Error loading gallery:", error);
      toast({
        title: "Error",
        description: "Failed to load gallery images.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (image: GalleryImage) => {
    const link = document.createElement("a");
    link.href = image.url;
    link.download = image.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteImage = async (image: GalleryImage) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.storage
        .from("generated-images")
        .remove([`${user.id}/${image.name}`]);

      if (error) throw error;

      setImages((prev) => prev.filter((img) => img.name !== image.name));
      setSelectedImage(null);
      toast({
        title: "Deleted",
        description: "Image removed from gallery.",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "Failed to delete image.",
        variant: "destructive",
      });
    }
  };

  const filteredImages = images.filter((img) =>
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background relative overflow-hidden">
        {reduceAnimations ? (
          <MilkyWayBackground />
        ) : (
          <>
            <MilkyWayBackground />
            <ProductivityVisuals />
          </>
        )}
        <AppSidebar />

        <main className="flex-1 relative z-10 flex flex-col">
          {/* Header */}
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">AI Image Gallery</h1>
                  <p className="text-sm text-muted-foreground">
                    {images.length} generated image{images.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCompactGrid(!compactGrid)}
                  className="bg-card/50 border-border/50"
                >
                  {compactGrid ? (
                    <LayoutGrid className="w-4 h-4" />
                  ) : (
                    <Grid3X3 className="w-4 h-4" />
                  )}
                </Button>
                <ThemeToggle />
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search images..."
                className="pl-10 bg-card/50 border-border/50 backdrop-blur-sm"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Gallery Content */}
          <ScrollArea className="flex-1 px-6 pb-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading your gallery...</p>
              </div>
            ) : filteredImages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 gap-4"
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {searchQuery ? "No matching images" : "No images yet"}
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  {searchQuery
                    ? "Try a different search term."
                    : "Generate images in the AI Chat to see them here."}
                </p>
              </motion.div>
            ) : (
              <div
                className={`grid gap-4 ${
                  compactGrid
                    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                }`}
              >
                <AnimatePresence>
                  {filteredImages.map((image, index) => (
                    <motion.div
                      key={image.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <Card className="group relative overflow-hidden bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                        <div
                          className={`relative cursor-pointer ${
                            compactGrid ? "aspect-square" : "aspect-[4/3]"
                          }`}
                          onClick={() => setSelectedImage(image)}
                        >
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                            <div className="flex items-center gap-2 w-full">
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedImage(image);
                                }}
                              >
                                <ZoomIn className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadImage(image);
                                }}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 bg-primary/80 text-primary-foreground backdrop-blur-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAnimateImage(image);
                                }}
                                title="Animate with AI"
                              >
                                <Wand2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 bg-destructive/80 text-destructive-foreground backdrop-blur-sm ml-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteImage(image);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {!compactGrid && (
                          <div className="p-3">
                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" />
                              {formatDate(image.created_at)}
                            </p>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>

          {/* Lightbox Dialog */}
          <Dialog
            open={!!selectedImage}
            onOpenChange={() => setSelectedImage(null)}
          >
            <DialogContent className="max-w-4xl p-0 bg-background/95 backdrop-blur-xl border-border/50 overflow-hidden">
              {selectedImage && (
                <div className="flex flex-col">
                  <div className="relative">
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.name}
                      className="w-full max-h-[75vh] object-contain bg-background/50"
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between border-t border-border/50">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedImage.created_at)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedImage(null);
                          setAnimateImage(selectedImage);
                        }}
                        className="gap-2"
                      >
                        <Wand2 className="w-4 h-4" />
                        Animate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadImage(selectedImage)}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteImage(selectedImage)}
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Animate Dialog */}
          {animateImage && (
            <AnimateDialog
              open={!!animateImage}
              onOpenChange={() => setAnimateImage(null)}
              imageUrl={animateImage.url}
              imageName={animateImage.name}
            />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
