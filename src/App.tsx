
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
import { useState } from "react";

const App = () => {
  // Create a client inside the component
  const [queryClient] = useState(() => new QueryClient());
  
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
