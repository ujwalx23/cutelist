
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
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <main className="flex-1 container flex flex-col items-center justify-center py-12">
          <div className="w-full max-w-4xl px-4">
            <div className="flex flex-col items-center">
              <h1 className="text-4xl font-bold text-center mb-2 text-gradient">Welcome to CuteList</h1>
              <p className="text-center text-gray-400 mb-8">Manage your tasks in the cutest way possible</p>
              {!user ? (
                <div className="text-center mb-8">
                  <p className="mb-4 text-gray-300">Sign in to manage tasks. New? Create an account!p>
                 
                  <Button onClick={() => setShowAuthModal(true)} className="px-6">
                    Create Account💫
                  </Button>
                </div>
              ) : (
                <TaskContainer />
              )}
            </div>
          </div>
        </main>
        <footer className="py-6 text-center text-gray-500 text-sm">
          <p>CuteList - Your adorable task manager</p>
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
