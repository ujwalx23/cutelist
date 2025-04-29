
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import KindLove from "./pages/KindLove";
import Books from "./pages/Books";
import CalendarPage from "./pages/Calendar";
import Calculator from "./pages/Calculator";
import Pomodoro from "./pages/Pomodoro";
import Notes from "./pages/Notes";
import Profile from "./pages/Profile";
import Achievements from "./pages/Achievements";
import Memories from "./pages/Memories";
import { useState, useEffect } from "react";

const App = () => {
  // Create a client inside the component
  const [queryClient] = useState(() => new QueryClient());
  
  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch(error => {
            console.log('ServiceWorker registration failed: ', error);
          });
      });
    }
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
              <Route path="/kindlove" element={<KindLove />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/memories" element={<Memories />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
