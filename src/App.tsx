import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, Suspense, lazy } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeProvider } from "@/components/ThemeProvider";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy-loaded routes for code splitting
const Chat = lazy(() => import("./pages/Chat"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Health = lazy(() => import("./pages/Health"));
const Documents = lazy(() => import("./pages/Documents"));
const Finance = lazy(() => import("./pages/Finance"));
const Learning = lazy(() => import("./pages/Learning"));
const Productivity = lazy(() => import("./pages/Productivity"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Settings = lazy(() => import("./pages/Settings"));

// Loading fallback for lazy routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return session ? <>{children}</> : <Navigate to="/auth" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Chat /></Suspense></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Analytics /></Suspense></ProtectedRoute>} />
            <Route path="/health" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Health /></Suspense></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Documents /></Suspense></ProtectedRoute>} />
            <Route path="/reminders" element={<Navigate to="/productivity" replace />} />
            <Route path="/productivity" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Productivity /></Suspense></ProtectedRoute>} />
            <Route path="/gallery" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Gallery /></Suspense></ProtectedRoute>} />
            <Route path="/learning" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Learning /></Suspense></ProtectedRoute>} />
            <Route path="/finance" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Finance /></Suspense></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Settings /></Suspense></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
