
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  BookOpen,
  Calendar,
  Clock,
  Home,
  Menu,
  Award,
  Calculator,
  User,
  PanelLeft,
  Edit,
  Image,
  MessageSquare,
  Mail,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  username?: string | null;
  avatar_url?: string | null;
}

const MobileSidebar = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error("Error in profile fetch:", error);
    }
  };

  // Helper function to get initials from email
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BookOpen, label: "Books", path: "/books" },
    { icon: Calendar, label: "Calendar", path: "/calendar" },
    { icon: Clock, label: "Pomodoro", path: "/pomodoro" },
    { icon: Edit, label: "Notes", path: "/notes" },
    { icon: Award, label: "Achievements", path: "/achievements" },
    { icon: Image, label: "Memories", path: "/memories" },
    { icon: Calculator, label: "Calculator", path: "/calculator" },
    { icon: PanelLeft, label: "Timetable Maker", path: "/timetable" },
    { icon: Mail, label: "Contact", path: "/contact" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-cutelist-dark overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg font-bold text-gradient">CuteList</SheetTitle>
        </SheetHeader>
        
        {user && (
          <div className="flex items-center space-x-2 py-4">
            <Avatar className="h-10 w-10 border border-cutelist-primary/30">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt="Profile" />
              ) : (
                <AvatarFallback className="bg-cutelist-primary/20 text-cutelist-primary">
                  {user.email ? getInitials(user.email) : "CL"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {profile?.username || user.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {profile?.username ? user.email : "No username set"}
              </p>
            </div>
          </div>
        )}
        
        <Separator className="my-4" />
        
        <div className="flex flex-col space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className="justify-start"
              asChild
              onClick={() => setOpen(false)}
            >
              <Link to={item.path}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
          
          <Button
            variant="ghost"
            className="justify-start"
            asChild
            onClick={() => setOpen(false)}
          >
            <a href="https://cutt.cx/wanderlust" target="_blank" rel="noopener noreferrer">
              <Sparkles className="mr-2 h-4 w-4" />
              Ask Anything
            </a>
          </Button>
        </div>
        
        <Separator className="my-4" />
        
        <div className="text-xs text-gray-500 px-2">
          <p>© 2025 CuteList</p>
          <p className="mt-1">Made with 💜</p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
