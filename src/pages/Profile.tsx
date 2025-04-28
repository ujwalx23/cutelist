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
import { User } from "lucide-react";

interface ProfileData {
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
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
                  <div className="space-y-4">
                    <div className="bg-cutelist-dark/50 p-4 rounded-lg">
                      <h3 className="font-medium text-cutelist-primary">Task Statistics</h3>
                      <p className="text-sm text-gray-300 mt-1">Coming soon! Track your productivity stats.</p>
                    </div>
                    <div className="bg-cutelist-dark/50 p-4 rounded-lg">
                      <h3 className="font-medium text-cutelist-primary">App Usage</h3>
                      <p className="text-sm text-gray-300 mt-1">Coming soon! See your app usage patterns.</p>
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
