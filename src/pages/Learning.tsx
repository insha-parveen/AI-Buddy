import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  FileText,
  Plus,
  Sparkles,
  Bot,
  Send,
  Trash2,
  Edit2,
  Save,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  GraduationCap,
  Target,
  Clock,
  CheckCircle,
  Star,
  Zap,
  Layers,
  Network,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AppSidebar from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GalaxyBackground } from "@/components/GalaxyBackground";
import InteractiveMindMap from "@/components/InteractiveMindMap";
import type { MindMapNode } from "@/components/InteractiveMindMap";
import ReactMarkdown from "react-markdown";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
}

interface FlashcardDeck {
  id: string;
  title: string;
  cards: Flashcard[];
  createdAt: Date;
}

interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface LearningGoal {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  status: string;
  target_date: string | null;
}

export default function Learning() {
  const [activeTab, setActiveTab] = useState("flashcards");
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Flashcard states
  const [currentDeck, setCurrentDeck] = useState<FlashcardDeck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generateTopic, setGenerateTopic] = useState("");
  const [generateContent, setGenerateContent] = useState("");

  // Note states
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [showGenerateNoteDialog, setShowGenerateNoteDialog] = useState(false);
  const [generateNoteTopic, setGenerateNoteTopic] = useState("");

  // Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Goal states
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", description: "", targetDate: "" });

  // Mind map states
  const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null);
  const [mindMapTopic, setMindMapTopic] = useState("");
  const [mindMapContext, setMindMapContext] = useState("");
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);
  const [showMindMapDialog, setShowMindMapDialog] = useState(false);

  useEffect(() => {
    loadGoals();
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load flashcard decks from DB
      const { data: deckData } = await supabase
        .from("flashcard_decks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (deckData) {
        setDecks(deckData.map((d: any) => ({
          id: d.id,
          title: d.title,
          cards: (d.cards as Flashcard[]) || [],
          createdAt: new Date(d.created_at),
        })));
      }

      // Load notes from DB
      const { data: noteData } = await supabase
        .from("learning_notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (noteData) {
        setNotes(noteData.map((n: any) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          summary: n.summary || undefined,
          createdAt: new Date(n.created_at),
          updatedAt: new Date(n.updated_at),
        })));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // saveDecks and saveNotes are no longer needed - DB operations handled individually

  const loadGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("learning_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error("Error loading goals:", error);
    }
  };

  const generateFlashcards = async () => {
    if (!generateTopic || !generateContent) {
      toast({ title: "Error", description: "Please provide both topic and content", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("learning-assistant", {
        body: { action: "generate_flashcards", topic: generateTopic, content: generateContent },
      });

      if (error) throw error;

      const cards: Flashcard[] = (data.result || []).map((card: any, index: number) => ({
        id: `card-${Date.now()}-${index}`,
        front: card.front,
        back: card.back,
        mastered: false,
      }));

      const newDeck: FlashcardDeck = {
        id: `deck-${Date.now()}`,
        title: generateTopic,
        cards,
        createdAt: new Date(),
      };

      // Save to DB
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: dbDeck } = await supabase.from("flashcard_decks").insert({ user_id: user.id, title: generateTopic, cards: cards as any }).select().single();
        if (dbDeck) newDeck.id = dbDeck.id;
      }

      setDecks([newDeck, ...decks]);
      setShowGenerateDialog(false);
      setGenerateTopic("");
      setGenerateContent("");
      setCurrentDeck(newDeck);
      toast({ title: "Success", description: `Generated ${cards.length} flashcards!` });
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast({ title: "Error", description: "Failed to generate flashcards", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const generateNote = async () => {
    if (!generateNoteTopic) {
      toast({ title: "Error", description: "Please provide a topic", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("learning-assistant", {
        body: { action: "generate_note", topic: generateNoteTopic },
      });

      if (error) throw error;

      const newNote: Note = {
        id: `note-${Date.now()}`,
        title: generateNoteTopic,
        content: data.result || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: dbNote } = await supabase.from("learning_notes").insert({ user_id: user.id, title: generateNoteTopic, content: data.result || "" }).select().single();
        if (dbNote) newNote.id = dbNote.id;
      }

      setNotes([newNote, ...notes]);
      setShowGenerateNoteDialog(false);
      setGenerateNoteTopic("");
      setCurrentNote(newNote);
      toast({ title: "Success", description: "Note generated!" });
    } catch (error) {
      console.error("Error generating note:", error);
      toast({ title: "Error", description: "Failed to generate note", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const summarizeNote = async (note: Note) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("learning-assistant", {
        body: { action: "summarize_note", noteContent: note.content },
      });

      if (error) throw error;

      const updatedNote = { ...note, summary: data.result, updatedAt: new Date() };
      const updatedNotes = notes.map((n) => (n.id === note.id ? updatedNote : n));
      setNotes(updatedNotes);
      // Persist summary to DB
      await supabase.from("learning_notes").update({ summary: data.result }).eq("id", note.id);
      setCurrentNote(updatedNote);
      toast({ title: "Success", description: "Summary generated!" });
    } catch (error) {
      console.error("Error summarizing note:", error);
      toast({ title: "Error", description: "Failed to summarize note", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("learning-assistant", {
        body: { action: "chat", question: chatInput },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = { role: "assistant", content: data.result || "I couldn't generate a response." };
      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = { role: "assistant", content: "Sorry, I encountered an error. Please try again." };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.title) {
      toast({ title: "Error", description: "Please provide a goal title", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("learning_goals").insert({
        user_id: user.id,
        title: newGoal.title,
        description: newGoal.description || null,
        target_date: newGoal.targetDate || null,
        progress: 0,
        status: "active",
      });

      if (error) throw error;

      setNewGoal({ title: "", description: "", targetDate: "" });
      setShowGoalDialog(false);
      loadGoals();
      toast({ title: "Success", description: "Goal added!" });
    } catch (error) {
      console.error("Error adding goal:", error);
      toast({ title: "Error", description: "Failed to add goal", variant: "destructive" });
    }
  };

  const updateGoalProgress = async (goalId: string, progress: number) => {
    try {
      const { error } = await supabase
        .from("learning_goals")
        .update({ progress, status: progress >= 100 ? "completed" : "active" })
        .eq("id", goalId);

      if (error) throw error;
      loadGoals();
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase.from("learning_goals").delete().eq("id", goalId);
      if (error) throw error;
      loadGoals();
      toast({ title: "Success", description: "Goal deleted" });
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const addManualNote = async () => {
    if (!newNoteTitle) {
      toast({ title: "Error", description: "Please provide a title", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: dbNote, error } = await supabase
        .from("learning_notes")
        .insert({ user_id: user.id, title: newNoteTitle, content: newNoteContent })
        .select()
        .single();

      if (error) throw error;

      const newNote: Note = {
        id: dbNote.id,
        title: dbNote.title,
        content: dbNote.content,
        createdAt: new Date(dbNote.created_at),
        updatedAt: new Date(dbNote.updated_at),
      };

      setNotes([newNote, ...notes]);
      setShowNoteDialog(false);
      setNewNoteTitle("");
      setNewNoteContent("");
      setCurrentNote(newNote);
      toast({ title: "Success", description: "Note created!" });
    } catch (error) {
      console.error("Error creating note:", error);
      toast({ title: "Error", description: "Failed to create note", variant: "destructive" });
    }
  };

  const updateNote = async (note: Note) => {
    try {
      const { error } = await supabase
        .from("learning_notes")
        .update({ title: note.title, content: note.content, summary: note.summary || null })
        .eq("id", note.id);

      if (error) throw error;

      const updatedNotes = notes.map((n) => (n.id === note.id ? { ...note, updatedAt: new Date() } : n));
      setNotes(updatedNotes);
      setCurrentNote(note);
      setIsEditingNote(false);
      toast({ title: "Success", description: "Note updated!" });
    } catch (error) {
      console.error("Error updating note:", error);
      toast({ title: "Error", description: "Failed to update note", variant: "destructive" });
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase.from("learning_notes").delete().eq("id", noteId);
      if (error) throw error;
      setNotes(notes.filter((n) => n.id !== noteId));
      if (currentNote?.id === noteId) setCurrentNote(null);
      toast({ title: "Success", description: "Note deleted" });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({ title: "Error", description: "Failed to delete note", variant: "destructive" });
    }
  };

  const deleteDeck = async (deckId: string) => {
    try {
      const { error } = await supabase.from("flashcard_decks").delete().eq("id", deckId);
      if (error) throw error;
      setDecks(decks.filter((d) => d.id !== deckId));
      if (currentDeck?.id === deckId) setCurrentDeck(null);
      toast({ title: "Success", description: "Deck deleted" });
    } catch (error) {
      console.error("Error deleting deck:", error);
      toast({ title: "Error", description: "Failed to delete deck", variant: "destructive" });
    }
  };

  const nextCard = () => {
    if (currentDeck && currentCardIndex < currentDeck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const toggleMastered = async () => {
    if (!currentDeck) return;
    const updatedCards = currentDeck.cards.map((card, index) =>
      index === currentCardIndex ? { ...card, mastered: !card.mastered } : card
    );
    const updatedDeck = { ...currentDeck, cards: updatedCards };
    setCurrentDeck(updatedDeck);
    setDecks(decks.map((d) => (d.id === currentDeck.id ? updatedDeck : d)));
    // Persist to DB
    await supabase.from("flashcard_decks").update({ cards: updatedCards as any }).eq("id", currentDeck.id);
  };

  const masteredCount = currentDeck?.cards.filter((c) => c.mastered).length || 0;
  const totalCards = currentDeck?.cards.length || 0;

  const generateMindMap = async () => {
    if (!mindMapTopic) {
      toast({ title: "Error", description: "Please provide a topic", variant: "destructive" });
      return;
    }
    setIsGeneratingMindMap(true);
    try {
      const { data, error } = await supabase.functions.invoke("learning-assistant", {
        body: { action: "generate_mindmap", topic: mindMapTopic, content: mindMapContext },
      });
      if (error) throw error;
      setMindMapData(data.result || null);
      setShowMindMapDialog(false);
      setMindMapTopic("");
      setMindMapContext("");
      toast({ title: "Success", description: "Mind map generated!" });
    } catch (error) {
      console.error("Error generating mind map:", error);
      toast({ title: "Error", description: "Failed to generate mind map", variant: "destructive" });
    } finally {
      setIsGeneratingMindMap(false);
    }
  };

  return (
    <div className="flex min-h-screen relative">
      <GalaxyBackground />
      <AppSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-20"
        >
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text mb-1">Learning Hub</h1>
              <p className="text-sm text-muted-foreground">
                AI-powered flashcards, notes, and learning assistant
              </p>
            </div>
            <ThemeToggle />
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="glass p-1">
              <TabsTrigger value="flashcards" className="gap-2">
                <Layers className="w-4 h-4" />
                Flashcards
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2">
                <FileText className="w-4 h-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="assistant" className="gap-2">
                <Bot className="w-4 h-4" />
                Assistant
              </TabsTrigger>
              <TabsTrigger value="goals" className="gap-2">
                <Target className="w-4 h-4" />
                Goals
              </TabsTrigger>
              <TabsTrigger value="mindmap" className="gap-2">
                <Network className="w-4 h-4" />
                Mind Map
              </TabsTrigger>
            </TabsList>

            {/* Flashcards Tab */}
            <TabsContent value="flashcards" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Flashcard Decks</h2>
                <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
                  <DialogTrigger asChild>
                    <Button className="gradient-primary text-white gap-2">
                      <Sparkles className="w-4 h-4" />
                      Generate with AI
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-heavy max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        Generate Flashcards with AI
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Topic / Deck Name</Label>
                        <Input
                          placeholder="e.g., JavaScript Fundamentals"
                          value={generateTopic}
                          onChange={(e) => setGenerateTopic(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Content to Learn</Label>
                        <Textarea
                          placeholder="Paste your study material, notes, or any content you want to create flashcards from..."
                          value={generateContent}
                          onChange={(e) => setGenerateContent(e.target.value)}
                          rows={8}
                        />
                      </div>
                      <Button
                        onClick={generateFlashcards}
                        className="w-full gradient-primary text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Generating...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Generate Flashcards
                          </span>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Deck List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Decks ({decks.length})</h3>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3 pr-4">
                      {decks.map((deck) => (
                        <motion.div
                          key={deck.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ x: 5 }}
                        >
                          <Card
                            className={`p-4 cursor-pointer transition-all ${currentDeck?.id === deck.id
                              ? "border-primary bg-primary/10"
                              : "glass hover:border-primary/50"
                              }`}
                            onClick={() => {
                              setCurrentDeck(deck);
                              setCurrentCardIndex(0);
                              setIsFlipped(false);
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">{deck.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {deck.cards.length} cards • {deck.cards.filter((c) => c.mastered).length} mastered
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteDeck(deck.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                      {decks.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No flashcard decks yet</p>
                          <p className="text-sm">Generate your first deck with AI!</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Flashcard Viewer */}
                <div className="lg:col-span-2">
                  {currentDeck ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{currentDeck.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Card {currentCardIndex + 1} of {totalCards} • {masteredCount} mastered
                          </p>
                        </div>
                        <Progress value={(masteredCount / totalCards) * 100} className="w-32" />
                      </div>

                      <div
                        className="relative h-80 cursor-pointer perspective-1000"
                        onClick={() => setIsFlipped(!isFlipped)}
                      >
                        <motion.div
                          className="absolute inset-0"
                          initial={false}
                          animate={{ rotateY: isFlipped ? 180 : 0 }}
                          transition={{ duration: 0.6, type: "spring" }}
                          style={{ transformStyle: "preserve-3d" }}
                        >
                          {/* Front */}
                          <Card
                            className="absolute inset-0 glass-heavy p-8 flex flex-col items-center justify-center text-center backface-hidden"
                            style={{ backfaceVisibility: "hidden" }}
                          >
                            <Lightbulb className="w-8 h-8 text-primary mb-4" />
                            <p className="text-xl font-medium">{currentDeck.cards[currentCardIndex]?.front}</p>
                            <p className="text-sm text-muted-foreground mt-4">Click to reveal answer</p>
                          </Card>

                          {/* Back */}
                          <Card
                            className="absolute inset-0 glass-heavy p-8 flex flex-col items-center justify-center text-center"
                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                          >
                            <CheckCircle className="w-8 h-8 text-green-500 mb-4" />
                            <p className="text-xl">{currentDeck.cards[currentCardIndex]?.back}</p>
                          </Card>
                        </motion.div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Button variant="outline" onClick={prevCard} disabled={currentCardIndex === 0}>
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>

                        <div className="flex gap-2">
                          <Button
                            variant={currentDeck.cards[currentCardIndex]?.mastered ? "default" : "outline"}
                            onClick={toggleMastered}
                            className={currentDeck.cards[currentCardIndex]?.mastered ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            <Star className="w-4 h-4 mr-2" />
                            {currentDeck.cards[currentCardIndex]?.mastered ? "Mastered!" : "Mark as Mastered"}
                          </Button>
                          <Button variant="outline" onClick={() => setIsFlipped(false)}>
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </div>

                        <Button
                          variant="outline"
                          onClick={nextCard}
                          disabled={currentCardIndex === totalCards - 1}
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Card className="glass h-80 flex items-center justify-center">
                      <div className="text-center">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">Select a deck to start studying</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Notes</h2>
                <div className="flex gap-2">
                  <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Note
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-heavy max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Note</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>Title</Label>
                          <Input
                            placeholder="Note title..."
                            value={newNoteTitle}
                            onChange={(e) => setNewNoteTitle(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Content</Label>
                          <Textarea
                            placeholder="Write your notes here..."
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                            rows={10}
                          />
                        </div>
                        <Button onClick={addManualNote} className="w-full gradient-primary text-white">
                          Create Note
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showGenerateNoteDialog} onOpenChange={setShowGenerateNoteDialog}>
                    <DialogTrigger asChild>
                      <Button className="gradient-primary text-white gap-2">
                        <Sparkles className="w-4 h-4" />
                        Generate with AI
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-heavy">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Brain className="w-5 h-5 text-primary" />
                          Generate Notes with AI
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>Topic</Label>
                          <Input
                            placeholder="e.g., Introduction to Machine Learning"
                            value={generateNoteTopic}
                            onChange={(e) => setGenerateNoteTopic(e.target.value)}
                          />
                        </div>
                        <Button
                          onClick={generateNote}
                          className="w-full gradient-primary text-white"
                          disabled={isLoading}
                        >
                          {isLoading ? "Generating..." : "Generate Notes"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Notes List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">All Notes ({notes.length})</h3>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3 pr-4">
                      {notes.map((note) => (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ x: 5 }}
                        >
                          <Card
                            className={`p-4 cursor-pointer transition-all ${currentNote?.id === note.id
                              ? "border-primary bg-primary/10"
                              : "glass hover:border-primary/50"
                              }`}
                            onClick={() => {
                              setCurrentNote(note);
                              setIsEditingNote(false);
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{note.title}</h4>
                                <p className="text-sm text-muted-foreground truncate">
                                  {note.content.substring(0, 50)}...
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNote(note.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                      {notes.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No notes yet</p>
                          <p className="text-sm">Create or generate your first note!</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Note Viewer */}
                <div className="lg:col-span-2">
                  {currentNote ? (
                    <Card className="glass-heavy p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        {isEditingNote ? (
                          <Input
                            value={currentNote.title}
                            onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                            className="text-xl font-semibold"
                          />
                        ) : (
                          <h3 className="text-xl font-semibold">{currentNote.title}</h3>
                        )}
                        <div className="flex gap-2">
                          {isEditingNote ? (
                            <>
                              <Button variant="outline" size="sm" onClick={() => setIsEditingNote(false)}>
                                <X className="w-4 h-4" />
                              </Button>
                              <Button size="sm" onClick={() => updateNote(currentNote)}>
                                <Save className="w-4 h-4 mr-2" />
                                Save
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="outline" size="sm" onClick={() => setIsEditingNote(true)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => summarizeNote(currentNote)}
                                disabled={isLoading}
                              >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Summarize
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {currentNote.summary && (
                        <Card className="p-4 bg-primary/10 border-primary/30">
                          <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            AI Summary
                          </h4>
                          <p className="text-sm whitespace-pre-wrap">{currentNote.summary}</p>
                        </Card>
                      )}

                      <ScrollArea className="h-[400px]">
                        {isEditingNote ? (
                          <Textarea
                            value={currentNote.content}
                            onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                            rows={20}
                            className="w-full"
                          />
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                            {currentNote.content}
                          </div>
                        )}
                      </ScrollArea>
                    </Card>
                  ) : (
                    <Card className="glass h-80 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">Select a note to view</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Assistant Tab */}
            <TabsContent value="assistant" className="space-y-6">
              <Card className="glass-heavy h-[600px] flex flex-col">
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Learning Assistant</h3>
                    <p className="text-sm text-muted-foreground">Ask me anything about your studies!</p>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {chatMessages.length === 0 && (
                      <div className="text-center py-12">
                        <GraduationCap className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
                        <h4 className="font-medium mb-2">Your Personal Learning Assistant</h4>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          I can help explain concepts, answer questions, quiz you on topics, or provide study guidance. Just ask!
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center mt-6">
                          {[
                            "Explain quantum computing simply",
                            "What are the key principles of OOP?",
                            "Help me understand calculus derivatives",
                          ].map((suggestion) => (
                            <Button
                              key={suggestion}
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setChatInput(suggestion);
                              }}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {chatMessages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-2xl ${msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "glass"
                            }`}
                        >
                          {msg.role === "assistant" ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none break-words whitespace-pre-wrap">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="glass p-4 rounded-2xl">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask a question..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChatMessage()}
                    />
                    <Button onClick={sendChatMessage} disabled={isChatLoading || !chatInput.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Goals Tab */}
            <TabsContent value="goals" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Learning Goals</h2>
                <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                  <DialogTrigger asChild>
                    <Button className="gradient-primary text-white gap-2">
                      <Plus className="w-4 h-4" />
                      Add Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-heavy">
                    <DialogHeader>
                      <DialogTitle>Create Learning Goal</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Goal Title</Label>
                        <Input
                          placeholder="e.g., Complete React course"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Description (optional)</Label>
                        <Textarea
                          placeholder="Details about your goal..."
                          value={newGoal.description}
                          onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Target Date (optional)</Label>
                        <Input
                          type="date"
                          value={newGoal.targetDate}
                          onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                        />
                      </div>
                      <Button onClick={addGoal} className="w-full gradient-primary text-white">
                        Create Goal
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{goal.title}</h4>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>

                      {goal.target_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span className={goal.status === "completed" ? "text-green-500" : ""}>
                            {goal.progress}%
                          </span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>

                      <div className="flex gap-2">
                        {[25, 50, 75, 100].map((value) => (
                          <Button
                            key={value}
                            variant={goal.progress >= value ? "default" : "outline"}
                            size="sm"
                            className="flex-1"
                            onClick={() => updateGoalProgress(goal.id, value)}
                          >
                            {value}%
                          </Button>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                ))}

                {goals.length === 0 && (
                  <div className="col-span-full">
                    <Card className="glass p-12 text-center">
                      <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Learning Goals Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Set your learning goals to track your progress!
                      </p>
                      <Button onClick={() => setShowGoalDialog(true)} className="gradient-primary text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Goal
                      </Button>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Mind Map Tab */}
            <TabsContent value="mindmap" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Topic Mind Maps</h2>
                <Dialog open={showMindMapDialog} onOpenChange={setShowMindMapDialog}>
                  <DialogTrigger asChild>
                    <Button className="gradient-primary text-white gap-2">
                      <Network className="w-4 h-4" />
                      Generate Mind Map
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-heavy max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Network className="w-5 h-5 text-primary" />
                        Generate Mind Map with AI
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Topic</Label>
                        <Input
                          placeholder="e.g., Machine Learning Fundamentals"
                          value={mindMapTopic}
                          onChange={(e) => setMindMapTopic(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Additional Context (optional)</Label>
                        <Textarea
                          placeholder="Paste notes or content to make the mind map more specific..."
                          value={mindMapContext}
                          onChange={(e) => setMindMapContext(e.target.value)}
                          rows={6}
                        />
                      </div>
                      <Button
                        onClick={generateMindMap}
                        className="w-full gradient-primary text-white"
                        disabled={isGeneratingMindMap}
                      >
                        {isGeneratingMindMap ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Generate Mind Map
                          </span>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {mindMapData ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <InteractiveMindMap root={mindMapData} />
                </motion.div>
              ) : (
                <Card className="glass p-12 text-center">
                  <Network className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Mind Map Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate an interactive mind map for any topic to visualize concepts and relationships.
                  </p>
                  <Button onClick={() => setShowMindMapDialog(true)} className="gradient-primary text-white gap-2">
                    <Network className="w-4 h-4" />
                    Create Your First Mind Map
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
