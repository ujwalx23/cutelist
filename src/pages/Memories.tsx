
import { useState } from "react";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PlusCircle, 
  Image as ImageIcon, 
  Calendar as CalendarIcon, 
  Heart, 
  Trash2, 
  X, 
  Pencil,
  AtSign,
  Tag
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface Memory {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string;
  tags: string[];
  mood: string;
  created_at: string;
}

const Memories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null);
  const [newMemory, setNewMemory] = useState({
    title: "",
    description: "",
    image: null as File | null,
    tags: "",
    mood: "happy",
  });
  const [viewFilter, setViewFilter] = useState<"all" | "recent" | "favorite">("all");
  const [favorites, setFavorites] = useState<string[]>([]);

  // Fetch memories
  const { data: memories, isLoading } = useQuery({
    queryKey: ['memories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // This is a placeholder since we haven't created the memories table yet
      // In a real implementation, we would fetch from Supabase
      const dummyMemories: Memory[] = [
        {
          id: "1",
          user_id: user.id,
          title: "Beach Day",
          description: "Had an amazing day at the beach with friends!",
          image_url: "https://source.unsplash.com/random/800x600/?beach",
          tags: ["beach", "friends", "summer"],
          mood: "happy",
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: "2",
          user_id: user.id,
          title: "Hiking Adventure",
          description: "Climbed Mount Rainier today. The view was breathtaking!",
          image_url: "https://source.unsplash.com/random/800x600/?mountain",
          tags: ["hiking", "mountains", "nature"],
          mood: "excited",
          created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
        {
          id: "3",
          user_id: user.id,
          title: "Family Dinner",
          description: "Had a lovely dinner with my family after so long.",
          image_url: "https://source.unsplash.com/random/800x600/?dinner",
          tags: ["family", "food", "gathering"],
          mood: "relaxed",
          created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
        },
      ];
      
      return dummyMemories;
    },
    enabled: !!user
  });

  // Create memory mutation
  const createMemoryMutation = useMutation({
    mutationFn: async (memoryData: typeof newMemory) => {
      if (!user) throw new Error("User not authenticated");
      
      let imageUrl = "";
      
      // If there's an image, upload it to Storage
      if (memoryData.image) {
        const fileExt = memoryData.image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        // This is a placeholder for the actual upload
        // In a real implementation, we would upload to Supabase storage
        console.log("Would upload file:", fileName);
        imageUrl = "https://source.unsplash.com/random/800x600/?memory";
      }
      
      // Convert tags string to array
      const tagsArray = memoryData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      // Create a new memory object
      const newMemoryRecord: Omit<Memory, "id"> = {
        user_id: user.id,
        title: memoryData.title,
        description: memoryData.description,
        image_url: imageUrl,
        tags: tagsArray,
        mood: memoryData.mood,
        created_at: new Date().toISOString(),
      };
      
      // In a real implementation, we would insert into Supabase
      console.log("Would create memory:", newMemoryRecord);
      
      // Return a mock response with an id
      return {
        ...newMemoryRecord,
        id: Date.now().toString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['memories']});
      toast({
        title: "Memory Created",
        description: "Your memory has been stored successfully.",
      });
      setIsAddModalOpen(false);
      setNewMemory({
        title: "",
        description: "",
        image: null,
        tags: "",
        mood: "happy",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create memory: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete memory mutation
  const deleteMemoryMutation = useMutation({
    mutationFn: async (memoryId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      // In a real implementation, we would delete from Supabase
      console.log("Would delete memory:", memoryId);
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['memories']});
      toast({
        title: "Memory Deleted",
        description: "Your memory has been deleted successfully.",
      });
      setIsViewModalOpen(false);
      setActiveMemory(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete memory: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setNewMemory({ ...newMemory, image: e.target.files[0] });
  };

  const handleCreateMemory = () => {
    if (!newMemory.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your memory.",
        variant: "destructive",
      });
      return;
    }
    
    createMemoryMutation.mutate(newMemory);
  };

  const handleDeleteMemory = (id: string) => {
    deleteMemoryMutation.mutate(id);
  };

  const handleViewMemory = (memory: Memory) => {
    setActiveMemory(memory);
    setIsViewModalOpen(true);
  };

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(fav => fav !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const filteredMemories = memories?.filter(memory => {
    if (viewFilter === "all") return true;
    if (viewFilter === "recent") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(memory.created_at) >= oneWeekAgo;
    }
    if (viewFilter === "favorite") {
      return favorites.includes(memory.id);
    }
    return true;
  });

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "happy":
        return "😊";
      case "excited":
        return "🎉";
      case "relaxed":
        return "😌";
      case "sad":
        return "😢";
      case "angry":
        return "😡";
      default:
        return "😐";
    }
  };

  const renderMemoryCard = (memory: Memory) => {
    const isFavorite = favorites.includes(memory.id);
    
    return (
      <Card 
        key={memory.id} 
        className="overflow-hidden transition-all hover:shadow-lg cursor-pointer group"
        onClick={() => handleViewMemory(memory)}
      >
        <div className="aspect-video relative overflow-hidden">
          <img 
            src={memory.image_url} 
            alt={memory.title} 
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div 
            className="absolute top-2 right-2 z-10"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(memory.id);
            }}
          >
            <Heart 
              className={`h-6 w-6 transition-colors ${
                isFavorite 
                  ? "fill-red-500 text-red-500" 
                  : "fill-transparent text-white/70 hover:text-white"
              }`} 
            />
          </div>
        </div>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg line-clamp-1">{memory.title}</CardTitle>
            <div className="text-xl">{getMoodIcon(memory.mood)}</div>
          </div>
          <CardDescription className="line-clamp-1 flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {format(new Date(memory.created_at), "MMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-gray-400 line-clamp-2">{memory.description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex flex-wrap gap-1">
            {memory.tags.map((tag, i) => (
              <span 
                key={i} 
                className="text-xs px-2 py-1 bg-cutelist-primary/20 text-cutelist-primary rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <main className="flex-1 container py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gradient mb-2">Memories</h1>
                <p className="text-gray-400">Capture and save your precious moments</p>
              </div>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 md:mt-0 flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Create Memory
              </Button>
            </div>
            
            <Tabs 
              defaultValue="all" 
              value={viewFilter} 
              onValueChange={(value) => setViewFilter(value as any)}
              className="mb-6"
            >
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="all">All Memories</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="favorite">Favorites</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                      <Card key={i} className="opacity-50">
                        <div className="aspect-video bg-cutelist-dark/70 animate-pulse" />
                        <CardHeader>
                          <div className="h-6 w-3/4 bg-cutelist-dark/70 rounded animate-pulse" />
                          <div className="h-4 w-1/3 bg-cutelist-dark/70 rounded animate-pulse" />
                        </CardHeader>
                        <CardContent>
                          <div className="h-4 w-full bg-cutelist-dark/70 rounded animate-pulse mb-2" />
                          <div className="h-4 w-5/6 bg-cutelist-dark/70 rounded animate-pulse" />
                        </CardContent>
                      </Card>
                    ))
                  ) : filteredMemories && filteredMemories.length > 0 ? (
                    filteredMemories.map(memory => renderMemoryCard(memory))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-12">
                      <ImageIcon className="h-16 w-16 mb-4 text-gray-600" />
                      <h3 className="text-xl font-medium mb-2">No memories yet</h3>
                      <p className="text-gray-400 text-center mb-4">
                        {viewFilter === "favorite" 
                          ? "You haven't favorited any memories yet" 
                          : "Create your first memory to get started"}
                      </p>
                      <Button onClick={() => setIsAddModalOpen(true)}>
                        Create Memory
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="recent" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <Card key={i} className="opacity-50">
                        <div className="aspect-video bg-cutelist-dark/70 animate-pulse" />
                        <CardHeader>
                          <div className="h-6 w-3/4 bg-cutelist-dark/70 rounded animate-pulse" />
                          <div className="h-4 w-1/3 bg-cutelist-dark/70 rounded animate-pulse" />
                        </CardHeader>
                        <CardContent>
                          <div className="h-4 w-full bg-cutelist-dark/70 rounded animate-pulse mb-2" />
                          <div className="h-4 w-5/6 bg-cutelist-dark/70 rounded animate-pulse" />
                        </CardContent>
                      </Card>
                    ))
                  ) : filteredMemories && filteredMemories.length > 0 ? (
                    filteredMemories.map(memory => renderMemoryCard(memory))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-12">
                      <CalendarIcon className="h-16 w-16 mb-4 text-gray-600" />
                      <h3 className="text-xl font-medium mb-2">No recent memories</h3>
                      <p className="text-gray-400 text-center mb-4">
                        You haven't created any memories in the past week
                      </p>
                      <Button onClick={() => setIsAddModalOpen(true)}>
                        Create Memory
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="favorite" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <Card key={i} className="opacity-50">
                        <div className="aspect-video bg-cutelist-dark/70 animate-pulse" />
                        <CardHeader>
                          <div className="h-6 w-3/4 bg-cutelist-dark/70 rounded animate-pulse" />
                          <div className="h-4 w-1/3 bg-cutelist-dark/70 rounded animate-pulse" />
                        </CardHeader>
                        <CardContent>
                          <div className="h-4 w-full bg-cutelist-dark/70 rounded animate-pulse mb-2" />
                          <div className="h-4 w-5/6 bg-cutelist-dark/70 rounded animate-pulse" />
                        </CardContent>
                      </Card>
                    ))
                  ) : filteredMemories && filteredMemories.length > 0 ? (
                    filteredMemories.map(memory => renderMemoryCard(memory))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-12">
                      <Heart className="h-16 w-16 mb-4 text-gray-600" />
                      <h3 className="text-xl font-medium mb-2">No favorite memories</h3>
                      <p className="text-gray-400 text-center mb-4">
                        Mark memories as favorites to see them here
                      </p>
                      <Button onClick={() => setViewFilter("all")}>
                        View All Memories
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        {/* Add Memory Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Memory</DialogTitle>
              <DialogDescription>
                Capture a special moment to remember
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Give your memory a title"
                  value={newMemory.title}
                  onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What makes this memory special?"
                  className="min-h-[100px]"
                  value={newMemory.description}
                  onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Mood</Label>
                <div className="flex flex-wrap gap-2">
                  {["happy", "excited", "relaxed", "sad", "angry"].map((mood) => (
                    <Button
                      key={mood}
                      type="button"
                      variant={newMemory.mood === mood ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setNewMemory({ ...newMemory, mood })}
                    >
                      {getMoodIcon(mood)} <span className="ml-1 capitalize">{mood}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex items-center">
                  <AtSign className="mr-2 h-4 w-4 text-gray-500" />
                  <Input
                    id="tags"
                    placeholder="summer, vacation, friends (comma separated)"
                    value={newMemory.tags}
                    onChange={(e) => setNewMemory({ ...newMemory, tags: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <div className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg p-4 transition-colors hover:border-gray-500">
                  {newMemory.image ? (
                    <div className="relative w-full">
                      <img
                        src={URL.createObjectURL(newMemory.image)}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => setNewMemory({ ...newMemory, image: null })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="image-upload" className="flex flex-col items-center space-y-2 cursor-pointer p-4">
                      <ImageIcon className="h-8 w-8 text-gray-500" />
                      <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateMemory} disabled={createMemoryMutation.isPending}>
                {createMemoryMutation.isPending ? "Creating..." : "Save Memory"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* View Memory Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-xl">
            {activeMemory && (
              <>
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-400 hover:text-white"
                    onClick={() => toggleFavorite(activeMemory.id)}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favorites.includes(activeMemory.id)
                          ? "fill-red-500 text-red-500"
                          : ""
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-400 hover:text-red-500"
                    onClick={() => handleDeleteMemory(activeMemory.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-400 hover:text-white"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="pt-6">
                  <div className="aspect-video mb-4 overflow-hidden rounded-lg">
                    <img
                      src={activeMemory.image_url}
                      alt={activeMemory.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center">
                      {activeMemory.title}
                      <span className="ml-2 text-2xl">{getMoodIcon(activeMemory.mood)}</span>
                    </h2>
                    <div className="text-sm text-gray-400 flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {format(new Date(activeMemory.created_at), "MMMM d, yyyy")}
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-6">{activeMemory.description}</p>
                  
                  {activeMemory.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="h-4 w-4" />
                        <span className="font-medium">Tags</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {activeMemory.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-sm px-2 py-1 bg-cutelist-primary/20 text-cutelist-primary rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ThemeProvider>
  );
};

export default Memories;
