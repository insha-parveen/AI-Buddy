import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Download,
  MessageSquare,
  Network,
  Sparkles,
  File,
  Trash2,
  Loader2,
  Plus,
  CheckCircle,
  Send,
  Bot,
  User,
  Cpu,
  Zap,
  Binary,
  CircuitBoard,
  Maximize,
  Minimize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import AppSidebar from "@/components/AppSidebar";
import { FloatingElements } from "@/components/FloatingElements";
import { MatrixRain } from "@/components/MatrixRain";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import InteractiveMindMap from "@/components/InteractiveMindMap";
import type { MindMapNode } from "@/components/InteractiveMindMap";
import ReactMarkdown from "react-markdown";

interface Document {
  id: string;
  name: string;
  content: string;
  uploadedAt: Date;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function Documents() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [mindMap, setMindMap] = useState<MindMapNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [isZoomedOut, setIsZoomedOut] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load documents from DB on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setDocuments(data.map((d: any) => ({
          id: d.id,
          name: d.name,
          content: d.content,
          uploadedAt: new Date(d.created_at),
        })));
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        // Remove data URL prefix (e.g. "data:application/pdf;base64,")
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const extractTextFromBinaryFile = async (file: File): Promise<string> => {
    const base64 = await readFileAsBase64(file);
    const { data, error } = await supabase.functions.invoke("document-summarize", {
      body: {
        type: "extract",
        fileBase64: base64,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
      },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data.text || "";
  };

  const readFileContent = async (file: File): Promise<string> => {
    const isText = file.type === "text/plain" || file.name.endsWith('.txt') || file.name.endsWith('.md');
    if (isText) {
      return readFileAsText(file);
    }
    // For PDF, DOC, DOCX — extract text via AI edge function
    return extractTextFromBinaryFile(file);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);

    try {
      for (const file of Array.from(files)) {
        const validExtensions = ['.pdf', '.txt', '.doc', '.docx', '.md'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not supported. Please upload PDF, TXT, DOC, or DOCX files.`,
            variant: "destructive",
          });
          continue;
        }

        try {
          const content = await readFileContent(file);

          if (!content || content.trim().length === 0) {
            toast({
              title: "Empty file",
              description: `${file.name} appears to be empty or could not be read.`,
              variant: "destructive",
            });
            continue;
          }

          // Save to DB
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Not authenticated");

          const { data: dbDoc, error: dbError } = await supabase
            .from("user_documents")
            .insert({ user_id: user.id, name: file.name, content: content })
            .select()
            .single();

          if (dbError) throw dbError;

          const newDoc: Document = {
            id: dbDoc.id,
            name: file.name,
            content: content,
            uploadedAt: new Date(dbDoc.created_at),
          };

          setDocuments((prev) => [...prev, newDoc]);

          toast({
            title: "Upload successful",
            description: `${file.name} uploaded successfully!`,
          });
        } catch (fileError) {
          console.error("File read error:", fileError);
          toast({
            title: "Read failed",
            description: `Could not read ${file.name}. Please try a different file.`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      event.target.value = "";
    }
  };

  const handleGenerateSummary = async () => {
    if (!selectedDocument) {
      toast({
        title: "No document selected",
        description: "Please select a document first.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingSummary(true);
    setSummary("");

    try {
      const { data, error } = await supabase.functions.invoke("document-summarize", {
        body: {
          content: selectedDocument.content.substring(0, 10000),
          documentName: selectedDocument.name,
          type: "summary"
        },
      });

      if (error) throw error;

      const generatedSummary = data.summary || "Summary could not be generated.";
      setSummary(generatedSummary);

      // Persist summary to DB
      await supabase
        .from("user_documents")
        .update({ summary: generatedSummary })
        .eq("id", selectedDocument.id);

      toast({
        title: "Summary generated",
        description: "Document summary has been created!",
      });
    } catch (error) {
      console.error("Summary error:", error);
      toast({
        title: "Summary failed",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateMindMap = async () => {
    if (!selectedDocument) {
      toast({
        title: "No document selected",
        description: "Please select a document first.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingMindMap(true);
    setMindMap(null);

    try {
      const { data, error } = await supabase.functions.invoke("document-summarize", {
        body: {
          content: selectedDocument.content.substring(0, 10000),
          documentName: selectedDocument.name,
          type: "mindmap"
        },
      });

      if (error) throw error;

      const generatedMindMap = data.mindMap || null;
      setMindMap(generatedMindMap);

      // Persist mind map to DB
      await supabase
        .from("user_documents")
        .update({ mind_map: generatedMindMap as any })
        .eq("id", selectedDocument.id);

      toast({
        title: "Mind map generated",
        description: "Document mind map has been created!",
      });
    } catch (error) {
      console.error("Mind map error:", error);
      toast({
        title: "Mind map failed",
        description: "Failed to generate mind map. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMindMap(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!selectedDocument) {
      toast({
        title: "No document selected",
        description: "Please select a document first.",
        variant: "destructive",
      });
      return;
    }

    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: chatInput.trim(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsAskingQuestion(true);

    try {
      const { data, error } = await supabase.functions.invoke("document-summarize", {
        body: {
          content: selectedDocument.content.substring(0, 8000),
          documentName: selectedDocument.name,
          type: "qa",
          question: userMessage.content,
          chatHistory: chatMessages.slice(-6)
        },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer || "I couldn't find an answer to your question.",
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Q&A error:", error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAskingQuestion(false);
    }
  };

  const handleDownloadSummary = () => {
    if (!summary || !selectedDocument) {
      toast({
        title: "No summary available",
        description: "Please generate a summary first.",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(0, 191, 255);
    doc.text("Document Summary Report", 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Document: ${selectedDocument.name}`, 20, 35);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 42);

    doc.setDrawColor(0, 191, 255);
    doc.line(20, 48, 190, 48);

    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    const splitText = doc.splitTextToSize(summary, 170);
    doc.text(splitText, 20, 58);

    doc.save(`${selectedDocument.name.replace(/\.[^/.]+$/, "")}_summary.pdf`);

    toast({
      title: "Download started",
      description: "Your summary report is being downloaded.",
    });
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await supabase.from("user_documents").delete().eq("id", docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      if (selectedDocument?.id === docId) {
        setSelectedDocument(null);
        setSummary("");
        setMindMap(null);
        setChatMessages([]);
      }
      toast({
        title: "Document deleted",
        description: "Document has been removed.",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({ title: "Error", description: "Failed to delete document.", variant: "destructive" });
    }
  };




  return (
    <div
      className="flex min-h-screen bg-background relative overflow-hidden transition-all duration-300"
      style={{ zoom: isZoomedOut ? 0.8 : 1 }}
    >
      {/* Matrix Rain Effect */}
      <MatrixRain />
      <FloatingElements />

      {/* Cyber Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Scan Line Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[2px]"
          animate={{ y: [0, 800, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <AppSidebar />

      {/* NEW SIDEBAR FOR DATA FILES */}
      <AnimatePresence>
        {showLeftSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-r border-primary/20 bg-background/5 backdrop-blur-sm flex flex-col relative z-20 shrink-0"
            style={{ overflow: "hidden" }}
          >
            <div className="w-[320px] flex flex-col h-full">
              <div className="p-4 border-b border-border/50 bg-background/10 shrink-0">
                <h2 className="text-lg font-semibold flex items-center gap-3 text-foreground">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  Data Files
                  <Zap className="w-4 h-4 text-primary animate-pulse ml-auto" />
                </h2>
              </div>

              <div className="p-4 shrink-0">
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept=".pdf,.txt,.doc,.docx,.md"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground gap-2 shadow-[0_0_20px_hsl(var(--primary)/0.4)] border-0"
                    disabled={isLoading}
                    asChild
                  >
                    <span>
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      Upload File
                    </span>
                  </Button>
                </label>
              </div>

              <ScrollArea className="flex-1 px-4">
                <div className="space-y-2 pb-4 mt-4 w-full">
                  <AnimatePresence>
                    {documents.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-10"
                      >
                        <motion.div
                          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/20 border border-dashed border-primary/30 flex items-center justify-center"
                          animate={{ borderColor: ["hsl(195 100% 50% / 0.3)", "hsl(270 60% 60% / 0.3)", "hsl(195 100% 50% / 0.3)"] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <File className="w-8 h-8 text-muted-foreground/50" />
                        </motion.div>
                        <p className="text-sm text-muted-foreground font-medium">No files detected</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Initialize data upload</p>
                      </motion.div>
                    ) : (
                      documents.map((doc, index) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 w-full overflow-hidden ${selectedDocument?.id === doc.id
                            ? "bg-primary/20 border border-primary/50 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                            : "bg-muted/10 hover:bg-muted/20 border border-transparent hover:border-primary/30"
                            }`}
                          onClick={async () => {
                            setSelectedDocument(doc);
                            setChatMessages([]);
                            const { data: dbDoc } = await supabase
                              .from("user_documents")
                              .select("summary, mind_map")
                              .eq("id", doc.id)
                              .single();
                            setSummary(dbDoc?.summary || "");
                            setMindMap((dbDoc?.mind_map as unknown as MindMapNode) || null);
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/20 shrink-0 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDocument(doc.id);
                            }}
                            title="Delete File"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                          <div className={`p-1.5 rounded-md shrink-0 ${selectedDocument?.id === doc.id ? "bg-primary/30" : "bg-muted/20"}`}>
                            <FileText className={`w-4 h-4 ${selectedDocument?.id === doc.id ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <span
                            className="text-sm text-foreground flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap block"
                            title={doc.name}
                          >
                            {doc.name}
                          </span>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-hidden relative z-10 flex flex-col">
        {/* Cyber Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 backdrop-blur-md bg-background/5 border-b border-primary/20 shrink-0"
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                title="Toggle Data Files Sidebar"
              >
                <FileText className="w-5 h-5" />
              </Button>
              <motion.div
                className="p-3 rounded-xl bg-primary/10 border border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.3)] hidden sm:block"
                animate={{ boxShadow: ["0 0 20px hsl(195 100% 50% / 0.3)", "0 0 30px hsl(195 100% 50% / 0.5)", "0 0 20px hsl(195 100% 50% / 0.3)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Cpu className="w-6 h-6 text-primary" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Document Neural Interface
                  </span>
                  <Binary className="w-5 h-5 text-primary/60 animate-pulse hidden sm:block" />
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CircuitBoard className="w-4 h-4 hidden sm:block" />
                  AI-Powered Document Analysis System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsZoomedOut(!isZoomedOut)}
                title={isZoomedOut ? "Restore Zoom" : "Zoom Out"}
                className="hidden sm:inline-flex"
              >
                {isZoomedOut ? <Maximize className="w-5 h-5 text-accent" /> : <Minimize className="w-5 h-5 text-muted-foreground" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRightSidebar(!showRightSidebar)}
                title="Toggle Quick Actions Sidebar"
              >
                <Zap className="w-5 h-5" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </motion.header>

        <div className="p-6 flex gap-6 flex-1 overflow-hidden">
          {/* Main Content Area */}
          <motion.div
            className="flex-1 h-full min-w-0"
          >
            <Card className="backdrop-blur-sm bg-card/5 border-primary/20 shadow-[0_0_40px_hsl(var(--primary)/0.1)] h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-secondary to-transparent shrink-0" />

              <CardContent className="p-6 flex-1 overflow-y-auto min-h-0">
                {selectedDocument ? (
                  <div className="space-y-6">
                    {/* Document Info Banner */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                    >
                      <div className="p-3 rounded-lg bg-primary/20 border border-primary/40">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{selectedDocument.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            Active
                          </span>
                          <span>•</span>
                          <span>{selectedDocument.uploadedAt.toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{Math.ceil(selectedDocument.content.length / 1000)}k chars</span>
                        </p>
                      </div>
                    </motion.div>

                    {/* Summary Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-3 text-foreground">
                          <div className="p-2 rounded-lg bg-secondary/10 border border-secondary/30">
                            <Sparkles className="w-5 h-5 text-secondary" />
                          </div>
                          Neural Summary
                        </h3>
                        <Button
                          onClick={handleGenerateSummary}
                          disabled={isGeneratingSummary}
                          size="sm"
                          className="gap-2 bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/30"
                        >
                          {isGeneratingSummary ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                          Generate
                        </Button>
                      </div>

                      {summary ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-xl bg-muted/10 border border-border/50 backdrop-blur-sm"
                        >
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{summary}</p>
                        </motion.div>
                      ) : (
                        <div className="p-8 rounded-xl bg-muted/5 border border-dashed border-secondary/30 text-center">
                          <Sparkles className="w-8 h-8 mx-auto text-secondary/40 mb-3" />
                          <p className="text-sm text-muted-foreground">Initialize neural summary extraction</p>
                        </div>
                      )}
                    </div>

                    {/* Q&A Chat Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-3 text-foreground">
                        <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                        AI Query Interface
                      </h3>

                      <div className="rounded-xl bg-muted/5 border border-primary/20 overflow-hidden backdrop-blur-sm">
                        <ScrollArea className="h-52 p-4">
                          {chatMessages.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-center py-8">
                              <div>
                                <motion.div
                                  animate={{ scale: [1, 1.05, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center"
                                >
                                  <MessageSquare className="w-7 h-7 text-primary/50" />
                                </motion.div>
                                <p className="text-sm text-muted-foreground">Query your document data</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">Ask any question</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {chatMessages.map((msg) => (
                                <motion.div
                                  key={msg.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                  {msg.role === "assistant" && (
                                    <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                                      <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                  )}
                                  <div
                                    className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === "user"
                                      ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                                      : "bg-muted/10 text-foreground border border-border/50"
                                      }`}
                                  >
                                    {msg.role === "assistant" ? (
                                      <div className="prose prose-sm dark:prose-invert max-w-none break-words whitespace-pre-wrap">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                      </div>
                                    ) : (
                                      msg.content
                                    )}
                                  </div>
                                  {msg.role === "user" && (
                                    <div className="w-8 h-8 rounded-lg bg-secondary/20 border border-secondary/40 flex items-center justify-center shrink-0">
                                      <User className="w-4 h-4 text-secondary" />
                                    </div>
                                  )}
                                </motion.div>
                              ))}
                              {isAskingQuestion && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="flex gap-3"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4 text-primary" />
                                  </div>
                                  <div className="bg-muted/10 p-3 rounded-xl border border-border/50">
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                  </div>
                                </motion.div>
                              )}
                              <div ref={chatEndRef} />
                            </div>
                          )}
                        </ScrollArea>

                        <div className="p-4 border-t border-primary/20 bg-background/10 backdrop-blur-sm">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleAskQuestion();
                            }}
                            className="flex gap-3"
                          >
                            <Input
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              placeholder="Enter your query..."
                              disabled={isAskingQuestion}
                              className="flex-1 bg-muted/10 border-primary/20 focus:border-primary/50 placeholder:text-muted-foreground/50"
                            />
                            <Button
                              type="submit"
                              size="icon"
                              disabled={isAskingQuestion || !chatInput.trim()}
                              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 shrink-0"
                            >
                              {isAskingQuestion ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </Button>
                          </form>
                        </div>
                      </div>
                    </div>

                    {/* Mind Map Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-3 text-foreground">
                          <div className="p-2 rounded-lg bg-accent/10 border border-accent/30">
                            <Network className="w-5 h-5 text-accent" />
                          </div>
                          Neural Map
                        </h3>
                        <Button
                          onClick={handleGenerateMindMap}
                          disabled={isGeneratingMindMap}
                          size="sm"
                          className="gap-2 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30"
                        >
                          {isGeneratingMindMap ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Network className="w-4 h-4" />
                          )}
                          Generate
                        </Button>
                      </div>

                      {mindMap ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <InteractiveMindMap root={mindMap} />
                        </motion.div>
                      ) : (
                        <div className="p-8 rounded-xl bg-muted/5 border border-dashed border-accent/30 text-center">
                          <Network className="w-8 h-8 mx-auto text-accent/40 mb-3" />
                          <p className="text-sm text-muted-foreground">Generate document structure visualization</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-20">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                      <motion.div
                        className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30 flex items-center justify-center shadow-[0_0_40px_hsl(var(--primary)/0.2)]"
                        animate={{
                          boxShadow: [
                            "0 0 40px hsl(195 100% 50% / 0.2)",
                            "0 0 60px hsl(270 60% 60% / 0.3)",
                            "0 0 40px hsl(195 100% 50% / 0.2)"
                          ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <FileText className="w-12 h-12 text-primary" />
                      </motion.div>
                      <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Select Data File
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-sm text-sm">
                        Choose a document from the sidebar to initialize neural analysis
                      </p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.txt,.doc,.docx,.md"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button className="gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-[0_0_20px_hsl(var(--primary)/0.4)]" asChild>
                          <span>
                            <Plus className="w-4 h-4" />
                            Upload First Document
                          </span>
                        </Button>
                      </label>
                    </motion.div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions Panel */}
          <AnimatePresence>
            {showRightSidebar && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 340, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="shrink-0 flex flex-col h-full overflow-y-auto pb-6"
                style={{ overflowX: "hidden" }}
              >
                <div className="w-[340px] flex flex-col gap-6 pr-2 h-full">
                  <Card className="backdrop-blur-sm bg-card/5 border-primary/20 shadow-[0_0_40px_hsl(var(--primary)/0.1)] relative overflow-hidden shrink-0">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent" />

                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 rounded-lg bg-accent/10 border border-accent/30">
                          <Zap className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-foreground">Quick Actions</span>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <label className="block">
                        <input
                          type="file"
                          accept=".pdf,.txt,.doc,.docx,.md"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button variant="outline" className="w-full justify-start gap-3 border-primary/20 hover:border-primary/50 hover:bg-primary/10 transition-all" asChild>
                          <span>
                            <Upload className="w-4 h-4 text-primary" />
                            Upload New File
                          </span>
                        </Button>
                      </label>

                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 border-secondary/20 hover:border-secondary/50 hover:bg-secondary/10 transition-all"
                        onClick={handleGenerateSummary}
                        disabled={!selectedDocument || isGeneratingSummary}
                      >
                        {isGeneratingSummary ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-secondary" />
                        )}
                        Generate Summary
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 border-accent/20 hover:border-accent/50 hover:bg-accent/10 transition-all"
                        onClick={handleDownloadSummary}
                        disabled={!summary}
                      >
                        <Download className="w-4 h-4 text-accent" />
                        Download Report
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 border-primary/20 hover:border-primary/50 hover:bg-primary/10 transition-all"
                        onClick={handleGenerateMindMap}
                        disabled={!selectedDocument || isGeneratingMindMap}
                      >
                        {isGeneratingMindMap ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Network className="w-4 h-4 text-primary" />
                        )}
                        Create Neural Map
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Supported Formats Card */}
                  <Card className="backdrop-blur-sm bg-card/5 border-primary/20 shadow-[0_0_40px_hsl(var(--primary)/0.1)] relative overflow-hidden shrink-0">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />

                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <motion.div
                          className="p-3 rounded-xl bg-primary/10 border border-primary/30"
                          animate={{
                            boxShadow: ["0 0 10px hsl(195 100% 50% / 0.2)", "0 0 20px hsl(195 100% 50% / 0.4)", "0 0 10px hsl(195 100% 50% / 0.2)"]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <FileText className="w-6 h-6 text-primary" />
                        </motion.div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Compatible Formats</p>
                          <p className="text-xs text-muted-foreground mt-0.5">PDF • TXT • DOC • DOCX • MD</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* System Status Card */}
                  <Card className="backdrop-blur-sm bg-card/5 border-primary/20 shadow-[0_0_40px_hsl(var(--primary)/0.1)] relative overflow-hidden shrink-0">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent" />

                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <motion.div
                          className="p-3 rounded-xl bg-accent/10 border border-accent/30"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Cpu className="w-6 h-6 text-accent" />
                        </motion.div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                            System Status
                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                          </p>
                          <p className="text-xs text-accent mt-0.5">Neural network online</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
