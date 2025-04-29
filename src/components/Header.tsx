
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  Home, 
  Book, 
  Calendar, 
  Calculator, 
  Clock, 
  FileText,
  Menu,
  Trophy,
  Heart
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

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

  const getInitials = (email: string) => {
    return email ? email.substring(0, 2).toUpperCase() : "CL";
  };

  const NavLinks = () => (
    <>
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
      <Link to="/achievements" className="text-sm flex items-center font-medium hover:text-primary">
        <Trophy className="h-4 w-4 mr-1" />
        <span className="hidden md:inline">Achievements</span>
      </Link>
      <Link to="/memories" className="text-sm flex items-center font-medium hover:text-primary">
        <Heart className="h-4 w-4 mr-1" />
        <span className="hidden md:inline">Memories</span>
      </Link>
      <Link to="/kindlove" className="text-sm font-medium hover:text-primary">
        KindLove
      </Link>
      <Link to="/contact" className="text-sm font-medium hover:text-primary">
        Contact
      </Link>
    </>
  );

  const MobileNavigation = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-cutelist-dark/95 backdrop-blur-lg border-r border-white/10">
        <div className="flex flex-col space-y-6 mt-8">
          <Link to="/" className="flex items-center space-x-2 px-2 py-2 hover:bg-white/5 rounded-md">
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link to="/books" className="flex items-center space-x-2 px-2 py-2 hover:bg-white/5 rounded-md">
            <Book className="h-5 w-5" />
            <span>Books</span>
          </Link>
          <Link to="/calendar" className="flex items-center space-x-2 px-2 py-2 hover:bg-white/5 rounded-md">
            <Calendar className="h-5 w-5" />
            <span>Calendar</span>
          </Link>
          <Link to="/calculator" className="flex items-center space-x-2 px-2 py-2 hover:bg-white/5 rounded-md">
            <Calculator className="h-5 w-5" />
            <span>Calculator</span>
          </Link>
          <Link to="/pomodoro" className="flex items-center space-x-2 px-2 py-2 hover:bg-white/5 rounded-md">
            <Clock className="h-5 w-5" />
            <span>Pomodoro</span>
          </Link>
          <Link to="/notes" className="flex items-center space-x-2 px-2 py-2 hover:bg-white/5 rounded-md">
            <FileText className="h-5 w-5" />
            <span>Notes</span>
          </Link>
          <Link to="/achievements" className="flex items-center space-x-2 px-2 py-2 hover:bg-white/5 rounded-md">
            <Trophy className="h-5 w-5" />
            <span>Achievements</span>
          </Link>
          <Link to="/memories" className="flex items-center space-x-2 px-2 py-2 hover:bg-white/5 rounded-md">
            <Heart className="h-5 w-5" />
            <span>Memories</span>
          </Link>
          <Link to="/kindlove" className="flex items-center space-x-2 px-2 py-2 hover:bg-white/5 rounded-md">
            <span>KindLove</span>
          </Link>
          <Link to="/contact" className="flex items-center space-x-2 px-2 py-2 hover:bg-white/5 rounded-md">
            <span>Contact</span>
          </Link>

          {user ? (
            <>
              <Link to="/profile" className="flex items-center space-x-2 px-2 py-2 hover:bg-white/5 rounded-md">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              <Button 
                variant="ghost" 
                className="justify-start px-2" 
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button 
              className="mt-4" 
              onClick={() => setShowAuthModal(true)}
            >
              Sign In
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
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
            
            {isMobile ? (
              <div className="flex items-center gap-2">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full overflow-hidden">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-cutelist-primary/20 text-xs">
                            {getInitials(user.email || "")}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link to="/profile">
                        <DropdownMenuItem>
                          Profile
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    size="sm" 
                    className="ml-2" 
                    onClick={() => setShowAuthModal(true)}
                  >
                    Sign in
                  </Button>
                )}
                <MobileNavigation />
              </div>
            ) : (
              <nav className="hidden md:flex items-center space-x-4">
                <NavLinks />
                
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full overflow-hidden">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-cutelist-primary/20 text-xs">
                            {getInitials(user.email || "")}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link to="/profile">
                        <DropdownMenuItem>
                          Profile
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
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
            )}
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
