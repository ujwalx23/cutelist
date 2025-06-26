
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Menu, 
  Home, 
  BookOpen, 
  Calendar, 
  Calculator, 
  Timer, 
  StickyNote, 
  Mail, 
  Trophy, 
  Heart,
  LogOut,
  User
} from "lucide-react";
import { Logo } from "./Logo";
import { AuthModal } from "./auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Books", href: "/books", icon: BookOpen },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Calculator", href: "/calculator", icon: Calculator },
    { name: "Pomodoro", href: "/pomodoro", icon: Timer },
    { name: "Notes", href: "/notes", icon: StickyNote },
    { name: "Contact", href: "/contact", icon: Mail },
    { name: "Achievements", href: "/achievements", icon: Trophy },
    { name: "Memories", href: "/memories", icon: Heart },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const NavLink = ({ item, mobile = false }: { item: typeof navigation[0], mobile?: boolean }) => {
    const Icon = item.icon;
    const isActive = isActivePath(item.href);
    
    return (
      <Link
        to={item.href}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? "bg-cutelist-primary text-white"
            : "text-gray-300 hover:text-white hover:bg-gray-700"
        } ${mobile ? "w-full" : ""}`}
        onClick={() => mobile && setIsMobileMenuOpen(false)}
      >
        <Icon className="h-4 w-4" />
        {mobile && <span>{item.name}</span>}
      </Link>
    );
  };

  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-bold text-xl text-gradient">Cutelist</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile">
                <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-cutelist-primary transition-all">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-cutelist-primary text-white text-xs">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              
              {/* Desktop Sign Out */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2 text-gray-300 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-cutelist-primary hover:bg-cutelist-secondary hidden md:flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Sign In
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-gray-900 border-gray-800">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-2 pb-4 border-b border-gray-700">
                  <Logo />
                  <span className="font-bold text-lg text-gradient">Cutelist</span>
                </div>
                
                <nav className="flex flex-col gap-2">
                  {navigation.map((item) => (
                    <NavLink key={item.name} item={item} mobile />
                  ))}
                </nav>

                <div className="pt-4 border-t border-gray-700 mt-auto">
                  {user ? (
                    <div className="space-y-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 w-full"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-2 w-full justify-start px-3 py-2 text-gray-300 hover:text-white"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="bg-cutelist-primary hover:bg-cutelist-secondary w-full flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </header>
  );
}
