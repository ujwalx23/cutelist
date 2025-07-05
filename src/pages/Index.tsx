
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { TaskContainer } from "@/components/TaskContainer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { useState } from "react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark overflow-hidden">
        {/* Animated background elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-cutelist-primary/10 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-cutelist-accent/10 rounded-full animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-cutelist-heart/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-40 right-1/3 w-8 h-8 bg-cutelist-light/10 rounded-full animate-bounce-subtle" style={{ animationDelay: '0.5s' }}></div>
        </div>
        
        <Header />
        <main className="flex-1 container flex flex-col items-center justify-center py-12 relative z-10">
          <div className="w-full max-w-4xl px-4">
            <div className="flex flex-col items-center">
              <div className="text-center mb-8 animate-fade-in">
                <h1 className="text-4xl md:text-6xl font-bold text-center mb-4 text-gradient animate-scale-in">
                  Welcome to CuteList
                </h1>
                <p className="text-center text-gray-400 text-lg md:text-xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  Manage your tasks in the cutest way possible ✨
                </p>
              </div>
              
              {!user ? (
                <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  <div className="glass-card p-8 rounded-xl max-w-md mx-auto hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="mb-6">
                      <div className="text-6xl mb-4 animate-bounce-subtle">🌟</div>
                      <h3 className="text-xl font-semibold text-cutelist-primary mb-2">Get Started</h3>
                      <p className="mb-6 text-gray-300">Sign in to manage tasks. New? Create an account!</p>
                    </div>
                    
                    <Button 
                      onClick={() => setShowAuthModal(true)} 
                      className="px-8 py-3 text-lg bg-gradient-to-r from-cutelist-primary to-cutelist-heart hover:from-cutelist-secondary hover:to-cutelist-primary transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      Create Account 💫
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <TaskContainer />
                </div>
              )}
            </div>
          </div>
        </main>
        
        <footer className="py-6 text-center text-gray-500 text-sm relative z-10 animate-fade-in" style={{ animationDelay: '1s' }}>
          <div className="flex items-center justify-center gap-2">
            <span className="animate-pulse">💖</span>
            <p>CuteList - Your adorable task manager</p>
            <span className="animate-pulse">💖</span>
          </div>
        </footer>
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </ThemeProvider>
  );
};

export default Index;
