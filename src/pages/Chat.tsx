import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Bot,
  User,
  Loader2,
  Plus,
  MessageSquare,
  Paperclip,
  Mic,
  Smile,
  Clock,
  FileText,
  BarChart3,
  BookOpen,
  Heart,
  Wallet,
  ChevronDown,
  Copy,
  Settings,
  ArrowRight,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Menu,
  X,
  Image as ImageIcon,
  Sparkles,
  Download,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { CyberParticles } from "@/components/CyberParticles";
import { useShouldReduceAnimations } from "@/hooks/useReducedMotion";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  imageUrl?: string;
  isImageGeneration?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const suggestionChips = [
  { label: "Learning tips", color: "bg-success/20 text-success border-success/30" },
  { label: "Health advice", color: "bg-accent/20 text-accent border-accent/30" },
  { label: "Budget planning", color: "bg-primary/20 text-primary border-primary/30" },
];

const aiModules = [
  {
    name: "Learning",
    description: "Create flashcards, take notes, generate quizzes",
    status: "Available",
    icon: BookOpen,
    color: "text-secondary",
    route: "/dashboard"
  },
  {
    name: "Health",
    description: "Track habits, wellness tips, health reminders",
    status: "Available",
    icon: Heart,
    color: "text-success",
    route: "/health"
  },
  {
    name: "Finance",
    description: "Budget tracking, expense analysis, AI advice",
    status: "Available",
    icon: Wallet,
    color: "text-primary",
    route: "/analytics"
  },
];

const quickActions = [
  { label: "Set reminder", icon: Clock, route: "/reminders" },
  { label: "Upload doc", icon: FileText, route: "/documents" },
  { label: "Analytics", icon: BarChart3, route: "/analytics" },
];

const languages = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Spanish", flag: "🇪🇸" },
  { value: "fr", label: "French", flag: "🇫🇷" },
  { value: "de", label: "German", flag: "🇩🇪" },
  { value: "hi", label: "Hindi", flag: "🇮🇳" },
  { value: "zh", label: "Chinese", flag: "🇨🇳" },
];

export default function Chat() {
  const reduceAnimations = useShouldReduceAnimations();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isRecording, setIsRecording] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [showModules, setShowModules] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [imageGenerating, setImageGenerating] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setConversations(data);
    }
  };

  const createNewConversation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: conversation, error } = await supabase
      .from("chat_conversations")
      .insert({ user_id: user.id, title: "New Chat" })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }

    setConversationId(conversation.id);
    setMessages([]);
    await loadConversations();
    return conversation;
  };

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();

    try {
      const { error } = await supabase
        .from("chat_conversations")
        .delete()
        .eq("id", convId);

      if (error) throw error;

      if (conversationId === convId) {
        setConversationId(null);
        setMessages([]);
      }

      setConversations(prev => prev.filter(c => c.id !== convId));
      toast({
        title: "Chat deleted",
        description: "The conversation has been removed.",
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation.",
        variant: "destructive",
      });
    }
  };

  const parseMessageContent = (content: string): { text: string; imageUrl?: string; isImageGeneration?: boolean } => {
    try {
      if (content.startsWith("[IMG_MSG]")) {
        const json = JSON.parse(content.slice(9));
        return { text: json.text, imageUrl: json.imageUrl, isImageGeneration: true };
      }
    } catch { }
    return { text: content };
  };

  const selectConversation = async (convId: string) => {
    setConversationId(convId);

    const { data: msgs, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (!error && msgs) {
      setMessages(msgs.map(msg => {
        const parsed = parseMessageContent(msg.content);
        return {
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: parsed.text,
          created_at: msg.created_at || new Date().toISOString(),
          imageUrl: parsed.imageUrl,
          isImageGeneration: parsed.isImageGeneration,
        };
      }));
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard",
    });
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = selectedLanguage === 'en' ? 'en-US' : selectedLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      toast({
        title: "Error",
        description: "Voice recognition failed. Please try again.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const generateImage = async () => {
    if (!imagePrompt.trim() || imageGenerating) return;

    setImageGenerating(true);
    setShowImageDialog(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Session Expired",
        description: "Please log in again to generate images.",
        variant: "destructive",
      });
      setImageGenerating(false);
      return;
    }

    // Ensure conversation exists
    let activeConvId = conversationId;
    if (!activeConvId) {
      const { data: conversation, error } = await supabase
        .from("chat_conversations")
        .insert({ user_id: user.id, title: `🎨 ${imagePrompt.slice(0, 40)}` })
        .select()
        .single();

      if (error || !conversation) { setImageGenerating(false); return; }
      activeConvId = conversation.id;
      setConversationId(activeConvId);
      await loadConversations();
    }

    // Add user message for the image request
    const userContent = `🎨 Generate image: "${imagePrompt}"`;
    const userImageRequest: Message = {
      id: Math.random().toString(),
      role: "user",
      content: userContent,
      created_at: new Date().toISOString(),
      isImageGeneration: true,
    };
    setMessages((prev) => [...prev, userImageRequest]);

    // Save user message to DB
    const userDbContent = `[IMG_MSG]${JSON.stringify({ text: userContent })}`;
    await supabase.from("chat_messages").insert({
      conversation_id: activeConvId,
      role: "user",
      content: userDbContent,
    });

    try {
      const seed = Math.floor(Math.random() * 1000000);
      const encodedPrompt = encodeURIComponent(imagePrompt);
      const pollinationsUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?model=flux&width=1024&height=1024&seed=${seed}&nologo=true`;

      // Fetch the image to store securely in bucket using official API with auth
      const apiKey = import.meta.env.VITE_POLLINATION_API_KEY;
      const imageResponse = await fetch(pollinationsUrl, {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
      });

      if (!imageResponse.ok) throw new Error("Failed to fetch image from AI");
      const imageBlob = await imageResponse.blob();

      // We define the display URL first. Even if the upload to storage fails,
      // we can show the image using the direct pollinations URL in this session.
      let storedImageUrl = pollinationsUrl;
      let uploadSuccess = false;

      try {
        const fileName = `${user.id}/${Date.now()}-${imagePrompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, "_")}.png`;
        const { error: uploadError } = await supabase.storage
          .from("generated-images")
          .upload(fileName, imageBlob, {
            contentType: 'image/png',
            upsert: true,
          });

        if (uploadError) {
          console.warn("Storage upload failed (likely RLS):", uploadError.message);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("generated-images")
            .getPublicUrl(fileName);
          storedImageUrl = publicUrlData.publicUrl;
          uploadSuccess = true;
        }
      } catch (storageError) {
        console.warn("Non-critical storage error:", storageError);
      }

      const assistantText = `Here's your generated image for: "${imagePrompt}"`;

      const assistantMessage: Message = {
        id: Math.random().toString(),
        role: "assistant",
        content: assistantText,
        created_at: new Date().toISOString(),
        imageUrl: storedImageUrl,
        isImageGeneration: true,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message with image URL to DB
      const assistantDbContent = `[IMG_MSG]${JSON.stringify({ text: assistantText, imageUrl: storedImageUrl })}`;
      await supabase.from("chat_messages").insert({
        conversation_id: activeConvId,
        role: "assistant",
        content: assistantDbContent,
      });

      if (uploadSuccess) {
        toast({
          title: "Image Generated!",
          description: "Your AI image has been created and saved to the gallery.",
        });
      } else {
        toast({
          title: "Image Generated (Not Saved)",
          description: "The image was created, but couldn't be saved to your gallery due to database permissions (RLS).",
          variant: "default",
        });
      }


    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Image Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImageGenerating(false);
      setImagePrompt("");
    }
  };

  const downloadImage = (imageUrl: string, prompt: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `ai-generated-${prompt.slice(0, 20).replace(/\s+/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    // Create conversation if none exists synchronously before using the ID
    let activeConvId = conversationId;
    if (!activeConvId) {
      const conv = await createNewConversation();
      if (conv) activeConvId = conv.id;
    }

    const tempUserMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      if (activeConvId) {
        await supabase.from("chat_messages").insert({
          conversation_id: activeConvId,
          role: "user",
          content: userMessage,
        });
      }

      const { data, error } = await supabase.functions.invoke("chat-ai", {
        body: { message: userMessage, conversationId: activeConvId, language: selectedLanguage },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: Math.random().toString(),
        role: "assistant",
        content: data.response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (activeConvId) {
        await supabase.from("chat_messages").insert({
          conversation_id: activeConvId,
          role: "assistant",
          content: data.response,
        });

        // Update conversation title with the first user message
        const { data: existingMsgs } = await supabase
          .from("chat_messages")
          .select("id")
          .eq("conversation_id", activeConvId)
          .limit(1);

        if (existingMsgs && existingMsgs.length === 1) {
          await supabase
            .from("chat_conversations")
            .update({ title: userMessage.slice(0, 50) })
            .eq("id", activeConvId);
          await loadConversations();
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background relative overflow-hidden">
        <CyberParticles />

        {/* Only show static grid on reduced motion */}
        {reduceAnimations && (
          <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(var(--primary) / 0.05) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(var(--primary) / 0.05) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
              }}
            />
          </div>
        )}

        {/* App Sidebar with Toggle */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ x: -256, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -256, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="relative z-20"
            >
              <AppSidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar Toggle Button (always visible) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed left-2 top-2 z-30"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSidebar(!showSidebar)}
            className="bg-background/80 backdrop-blur-sm border-border/50 shadow-lg"
          >
            {showSidebar ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </motion.div>

        <main className="flex-1 flex relative z-10">
          {/* Chat History Panel */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 288, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="border-r border-border/50 bg-background/40 backdrop-blur-xl flex flex-col overflow-hidden"
              >
                <div className="p-4 border-b border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-foreground">Chat History</h2>
                  </div>
                </div>

                <div className="p-4">
                  <Button
                    onClick={createNewConversation}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Chat
                  </Button>
                </div>

                <ScrollArea className="flex-1 px-4">
                  {conversations.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No conversations yet</p>
                      <p className="text-xs mt-1">Start a new chat to begin</p>
                    </div>
                  ) : (
                    <div className="space-y-2 pb-4">
                      {conversations.map((conv) => (
                        <motion.div
                          key={conv.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => selectConversation(conv.id)}
                          className={`p-3 rounded-lg cursor-pointer transition-all border relative group ${conversationId === conv.id
                            ? "bg-primary/20 border-primary/50"
                            : "bg-card/20 border-border/30 hover:bg-card/40"
                            }`}
                        >
                          <div className="pr-8">
                            <p className="text-sm font-medium truncate">{conv.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(conv.updated_at || conv.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => handleDeleteConversation(e, conv.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border/50 bg-background/40 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(!showHistory)}
                  className="h-9 w-9"
                >
                  {showHistory ? (
                    <PanelLeftClose className="w-5 h-5" />
                  ) : (
                    <PanelLeftOpen className="w-5 h-5" />
                  )}
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-foreground">AI Chat Assistant</h1>
                  <p className="text-sm text-muted-foreground">Multilingual support • Voice enabled</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-36 bg-card/50 border-border/50">
                    <SelectValue>
                      {languages.find(l => l.value === selectedLanguage)?.flag} {languages.find(l => l.value === selectedLanguage)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.flag} {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowModules(!showModules)}
                  className="h-9 w-9"
                >
                  {showModules ? (
                    <PanelRightClose className="w-5 h-5" />
                  ) : (
                    <PanelRightOpen className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                <AnimatePresence>
                  {messages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative"
                    >
                      {/* Welcome Message */}
                      <div className="flex gap-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-50 hover:opacity-100"
                          onClick={() => copyMessage("Hello! I'm your AI assistant. I can help you with learning, health tracking, finance management, and much more. How can I assist you today?")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Card className="flex-1 p-4 bg-card/20 backdrop-blur border-border/50">
                          <p className="text-foreground">
                            Hello! I'm your AI assistant. I can help you with learning, health tracking, finance management, and much more. How can I assist you today?
                          </p>

                          {/* Suggestion Chips */}
                          <div className="flex flex-wrap gap-2 mt-4">
                            {suggestionChips.map((chip) => (
                              <button
                                key={chip.label}
                                onClick={() => handleSuggestionClick(chip.label)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all hover:scale-105 ${chip.color}`}
                              >
                                {chip.label}
                              </button>
                            ))}
                          </div>

                          <p className="text-xs text-muted-foreground mt-4">AI Assistant • Just now</p>
                        </Card>
                      </div>
                    </motion.div>
                  )}

                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-50 hover:opacity-100 flex-shrink-0"
                            onClick={() => copyMessage(message.content)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          {message.imageUrl && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-50 hover:opacity-100 flex-shrink-0"
                              onClick={() => downloadImage(message.imageUrl!, message.content)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}

                      <Card
                        className={`max-w-[80%] p-4 ${message.role === "user"
                          ? message.isImageGeneration
                            ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground border-primary/50"
                            : "bg-primary text-primary-foreground border-primary/50"
                          : "bg-card/20 backdrop-blur border-border/50"
                          }`}
                      >
                        {message.isImageGeneration && message.role === "user" && (
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-medium">Image Generation</span>
                          </div>
                        )}
                        <div className="prose prose-sm dark:prose-invert max-w-none break-words whitespace-pre-wrap">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>

                        {/* Display generated image */}
                        {message.imageUrl && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-4 rounded-lg overflow-hidden border border-border/50"
                          >
                            <img
                              src={message.imageUrl}
                              alt="AI Generated"
                              className="w-full h-auto max-h-96 object-contain bg-background/50"
                            />
                          </motion.div>
                        )}

                        <p className="text-xs opacity-60 mt-2">
                          {message.role === "assistant" ? "AI Assistant" : "You"} • {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </Card>

                      {message.role === "user" && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.isImageGeneration
                          ? "bg-gradient-to-br from-primary via-secondary to-accent"
                          : "bg-gradient-to-br from-accent to-primary"
                          }`}>
                          {message.isImageGeneration ? (
                            <ImageIcon className="w-4 h-4 text-white" />
                          ) : (
                            <User className="w-5 h-5 text-accent-foreground" />
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-4"
                    >
                      <Button variant="ghost" size="icon" className="opacity-0">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Card className="bg-card/20 backdrop-blur border-border/50 p-4">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">AI is thinking...</span>
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {imageGenerating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-4"
                    >
                      <Button variant="ghost" size="icon" className="opacity-0">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Card className="bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur border-primary/30 p-4">
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-5 h-5 text-primary" />
                          </motion.div>
                          <span className="text-sm text-foreground">Creating your image with AI magic...</span>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-border/50 bg-background/40 backdrop-blur-xl">
              <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="bg-card/50 border-border/50"
                    onClick={() => navigate("/documents")}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>

                  {/* Image Generation Button */}
                  <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/50 hover:border-primary transition-all group"
                        disabled={imageGenerating}
                      >
                        <ImageIcon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                          AI Image Generation
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            Describe the image you want to create
                          </label>
                          <Input
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            placeholder="A beautiful sunset over mountains with purple and orange sky..."
                            className="bg-card/50 border-border/50"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                generateImage();
                              }
                            }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-muted-foreground">Try:</span>
                          {["A futuristic city at night", "A cute robot playing guitar", "Abstract colorful waves"].map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => setImagePrompt(suggestion)}
                              className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                        <Button
                          onClick={generateImage}
                          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                          disabled={!imagePrompt.trim() || imageGenerating}
                        >
                          {imageGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate Image
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="flex-1 relative">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={`Ask me anything... (${languages.find(l => l.value === selectedLanguage)?.label})`}
                      className="pr-10 bg-card/50 border-border/50"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    >
                      <Smile className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={`transition-all ${isRecording ? "bg-red-500 text-white border-red-500 animate-pulse" : "bg-card/50 border-border/50"}`}
                    onClick={handleVoiceInput}
                  >
                    <Mic className="w-4 h-4" />
                  </Button>

                  <Button
                    type="submit"
                    size="icon"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={loading || !input.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Quick actions:</span>
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-card/50 border-border/50 gap-2"
                      onClick={() => navigate(action.route)}
                    >
                      <action.icon className="w-3 h-3" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </form>
            </div>
          </div>

          {/* AI Modules Panel */}
          <AnimatePresence>
            {showModules && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="border-l border-border/50 bg-background/80 backdrop-blur-xl flex flex-col overflow-hidden"
              >
                <div className="p-4 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-foreground">AI Modules</h2>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {aiModules.map((module, index) => (
                      <motion.div
                        key={module.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className="p-4 bg-card/50 border-border/30 hover:bg-card/80 hover:border-primary/50 transition-all cursor-pointer group"
                          onClick={() => navigate(module.route)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <motion.div
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <module.icon className={`w-5 h-5 ${module.color}`} />
                              </motion.div>
                              <div>
                                <h3 className="font-medium text-foreground">{module.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
                              </div>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-success mt-1" />
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-success">{module.status}</span>
                            <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="text-sm text-success">AI Online</span>
                    </div>
                    <span className="text-xs text-muted-foreground">99.9% uptime</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </SidebarProvider>
  );
}
