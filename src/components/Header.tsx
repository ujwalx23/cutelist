
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "./Logo";
import MobileSidebar from "./MobileSidebar";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  username?: string | null;
  avatar_url?: string | null;
}

export const Header = () => {
  const { user, logout } = useAuth();
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

  return (
    <header className="border-b border-white/10 backdrop-blur-lg sticky top-0 z-10">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2 md:gap-6">
          <MobileSidebar />
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-bold text-gradient hidden md:inline-block">
              CuteList
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link to="/">Home</Link>
            <Link to="/books">Books</Link>
            <Link to="/calendar">Calendar</Link>
            <Link to="/pomodoro">Pomodoro</Link>
            <Link to="/achievements">Achievements</Link>
          </div>
        </div>

        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center">
              <Avatar className="h-8 w-8 border border-cutelist-primary/30">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt="Profile" />
                ) : (
                  <AvatarFallback className="bg-cutelist-primary/20 text-cutelist-primary">
                    {user.email ? getInitials(user.email) : "CL"}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="ml-2 hidden md:inline-block">{profile?.username || user.email}</span>
            </Link>
            <Button
              variant="outline"
              className="hidden md:inline-flex"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        ) : (
          <Button variant="outline" className="hidden md:inline-flex" asChild>
            <Link to="/profile">Login</Link>
          </Button>
        )}
      </div>
    </header>
  );
};
