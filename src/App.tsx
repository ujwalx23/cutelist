
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Books from "./pages/Books";
import CalendarPage from "./pages/Calendar";
import Calculator from "./pages/Calculator";
import Pomodoro from "./pages/Pomodoro";
import Notes from "./pages/Notes";
import Profile from "./pages/Profile";
import Achievements from "./pages/Achievements";
import Memories from "./pages/Memories";
import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { registerServiceWorker, updateServiceWorkerAuth } from "@/utils/offlineSync";

const App = () => {
  // Create a client inside the component
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Enable offline caching for all queries
        cacheTime: 1000 * 60 * 60 * 24, // 24 hours
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false
      },
    },
  }));
  
  // Register service worker for PWA
  useEffect(() => {
    const setupServiceWorker = async () => {
      const registration = await registerServiceWorker();
      if (registration) {
        // Update auth token when available
        await updateServiceWorkerAuth();
      }
    };
    
    setupServiceWorker();
  }, []);
  
  const openChatbot = () => {
    window.open("https://cdn.botpress.cloud/webchat/v2.4/shareable.html?configUrl=https://files.bpcontent.cloud/2025/04/30/11/20250430112856-NCNEDXT4.json", "_blank");
  };

  // Add event listener for online/offline status
  useEffect(() => {
    const updateNetworkStatus = () => {
      if (navigator.onLine) {
        // Update auth token when back online
        updateServiceWorkerAuth();
      }
    };
    
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/books" element={<Books />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/pomodoro" element={<Pomodoro />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/memories" element={<Memories />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Chatbot button that appears on all pages */}
            <div className="fixed bottom-6 right-6 z-50">
              <Button 
                onClick={openChatbot}
                className="rounded-full bg-cutelist-primary hover:bg-cutelist-secondary w-12 h-12 flex items-center justify-center shadow-lg"
                aria-label="Chat with us"
              >
                <MessageCircle className="h-6 w-6" />
              </Button>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
