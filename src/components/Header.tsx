
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Home, Book, Calendar, Calculator, Clock, FileText } from "lucide-react";

export function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/cd11890b-c610-464d-b694-2b59ee09a21d.png"
                alt="CuteList Logo"
                className="h-8 w-8"
              />
              <span className="hidden font-bold sm:inline-block">
                CuteList
              </span>
            </Link>
            
            <nav className="flex items-center space-x-4">
              <Link to="/" className="text-sm flex items-center font-medium hover:text-primary">
                <Home className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Home</span>
              </Link>
              <Link to="/books" className="text-sm flex items-center font-medium hover:text-primary">
                <Book className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Books</span>
              </Link>
              <Link to="/calendar" className="text-sm flex items-center font-medium hover:text-primary">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Calendar</span>
              </Link>
              <Link to="/calculator" className="text-sm flex items-center font-medium hover:text-primary">
                <Calculator className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Calculator</span>
              </Link>
              <Link to="/pomodoro" className="text-sm flex items-center font-medium hover:text-primary">
                <Clock className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Pomodoro</span>
              </Link>
              <Link to="/notes" className="text-sm flex items-center font-medium hover:text-primary">
                <FileText className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Notes</span>
              </Link>
              <Link to="/kindlove" className="text-sm font-medium hover:text-primary">
                KindLove
              </Link>
              <Link to="/contact" className="text-sm font-medium hover:text-primary">
                Contact
              </Link>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleSignOut}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setShowAuthModal(true)}>
                  Sign in
                </Button>
              )}
            </nav>
          </div>
        </div>
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
}
