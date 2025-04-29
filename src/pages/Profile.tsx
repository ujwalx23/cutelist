
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CheckCircle2, Book, Calendar as CalendarIcon, ClipboardCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ProfileData {
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
}

interface UserStats {
  completedTasks: number;
  totalTasks: number;
  quotes: number;
  memories: number;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    username: "",
    bio: "",
    avatar_url: "",
  });

  // Fetch user statistics
  const { data: userStats = { completedTasks: 0, totalTasks: 0, quotes: 0, memories: 0 }, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: async () => {
      if (!user) return { completedTasks: 0, totalTasks: 0, quotes: 0, memories: 0 };
      
      try {
        // Fetch completed tasks count
        const { data: todosData, error: todosError } = await supabase
          .from("todos")
          .select("*", { count: "exact" })
          .eq("user_id", user.id);
          
        if (todosError) throw todosError;
        
        const completedTasks = todosData ? todosData.filter(todo => todo.is_complete).length : 0;
        const totalTasks = todosData ? todosData.length : 0;
        
        // Fetch quotes count
        const { count: quotesCount, error: quotesError } = await supabase
          .from("quotes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
          
        if (quotesError) throw quotesError;
        
        return {
          completedTasks,
          totalTasks,
          quotes: quotesCount || 0,
          memories: 0, // Placeholder as memories table doesn't exist yet
        };
      } catch (error) {
        console.error("Error fetching user stats:", error);
        return { completedTasks: 0, totalTasks: 0, quotes: 0, memories: 0 };
      }
    },
    enabled: !!user
  });

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("username, bio, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (profileData) {
          setProfile({
            username: profileData.username || "",
            bio: profileData.bio || "",
            avatar_url: profileData.avatar_url || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const updateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: profile.username,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user?.id}/avatar.${fileExt}`;

    setLoading(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      
      setProfile({
        ...profile,
        avatar_url: data.publicUrl,
      });

      toast({
        title: "Avatar uploaded!",
        description: "Your avatar has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload avatar.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (email: string) => {
    return email ? email.substring(0, 2).toUpperCase() : "CL";
  };

  if (!user) {
    return null;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <main className="flex-1 container flex flex-col items-center py-12">
          <div className="w-full max-w-3xl px-4">
            <h1 className="text-4xl font-bold text-center mb-8 text-gradient">Your Profile</h1>
            
            <Card className="glass-card overflow-hidden">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 border-4 border-cutelist-primary">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback className="text-lg bg-cutelist-primary/30">
                        {getInitials(user.email || "")}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleAvatarUpload}
                        disabled={loading}
                      />
                      <span className="text-white text-xs">Change</span>
                    </label>
                  </div>
                </div>
                <CardTitle className="text-center">{profile.username || user.email}</CardTitle>
                <CardDescription className="text-center">{user.email}</CardDescription>
              </CardHeader>

              <Tabs defaultValue="info">
                <div className="px-6">
                  <TabsList className="w-full">
                    <TabsTrigger value="info" className="flex-1">Profile Info</TabsTrigger>
                    <TabsTrigger value="stats" className="flex-1">Activity Stats</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="info" className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        value={profile.username}
                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                        className="mt-1"
                        placeholder="Enter a username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Input
                        id="bio"
                        type="text"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className="mt-1"
                        placeholder="Tell us about yourself"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="stats" className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-cutelist-dark/50 p-4 rounded-lg flex items-start">
                      <div className="bg-cutelist-primary/20 p-2 rounded-full mr-3">
                        <CheckCircle2 className="h-5 w-5 text-cutelist-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-cutelist-primary">Completed Tasks</h3>
                        <p className="text-3xl font-bold mt-1">{statsLoading ? "..." : userStats.completedTasks}</p>
                        <p className="text-sm text-gray-300 mt-1">
                          {statsLoading ? "Loading..." : `out of ${userStats.totalTasks} total tasks`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-cutelist-dark/50 p-4 rounded-lg flex items-start">
                      <div className="bg-cutelist-primary/20 p-2 rounded-full mr-3">
                        <ClipboardCheck className="h-5 w-5 text-cutelist-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-cutelist-primary">Completion Rate</h3>
                        <p className="text-3xl font-bold mt-1">
                          {statsLoading ? "..." : userStats.totalTasks > 0 
                            ? `${Math.round((userStats.completedTasks / userStats.totalTasks) * 100)}%` 
                            : "0%"}
                        </p>
                        <p className="text-sm text-gray-300 mt-1">
                          Task completion percentage
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-cutelist-dark/50 p-4 rounded-lg flex items-start">
                      <div className="bg-cutelist-primary/20 p-2 rounded-full mr-3">
                        <Book className="h-5 w-5 text-cutelist-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-cutelist-primary">Quotes Shared</h3>
                        <p className="text-3xl font-bold mt-1">{statsLoading ? "..." : userStats.quotes}</p>
                        <p className="text-sm text-gray-300 mt-1">
                          Inspirational quotes you've added
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-cutelist-dark/50 p-4 rounded-lg flex items-start">
                      <div className="bg-cutelist-primary/20 p-2 rounded-full mr-3">
                        <CalendarIcon className="h-5 w-5 text-cutelist-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-cutelist-primary">Active Days</h3>
                        <p className="text-3xl font-bold mt-1">Coming Soon</p>
                        <p className="text-sm text-gray-300 mt-1">
                          Days you've been active on the app
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <CardFooter className="flex justify-end gap-2 p-6">
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  Cancel
                </Button>
                <Button
                  onClick={updateProfile}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Profile;
