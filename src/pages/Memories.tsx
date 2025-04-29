
import { useState, useRef } from "react";
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
  Tag,
  MessageSquare,
  Quote,
  Send
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

interface Quote {
  id: string;
  user_id: string;
  content: string;
  author: string;
  created_at: string;
}

const Memories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState(false);
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null);
  const [viewType, setViewType] = useState<"memories" | "quotes">("memories");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newMemory, setNewMemory] = useState({
    title: "",
    description: "",
    image: null as File | null,
    tags: "",
    mood: "happy",
  });
  const [newQuote, setNewQuote] = useState({
    content: "",
    author: "",
  });
  const [favorites, setFavorites] = useState<string[]>([]);

  // Fetch memories
  const { data: memories, isLoading: isLoadingMemories } = useQuery({
    queryKey: ['memories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // In a real implementation, we would fetch from Supabase
        // This is a placeholder for demonstration
        return []; // Return empty array by default instead of dummy data
      } catch (error) {
        console.error("Error fetching memories:", error);
        return [];
      }
    },
    enabled: !!user && viewType === "memories"
  });

  // Fetch quotes
  const { data: quotes, isLoading: isLoadingQuotes } = useQuery({
    queryKey: ['quotes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // In a real implementation, we would fetch quotes from Supabase
        // This is a placeholder for demonstration
        return []; // Return empty array by default instead of dummy data
      } catch (error) {
        console.error("Error fetching quotes:", error);
        return [];
      }
    },
    enabled: !!user && viewType === "quotes"
  });

  // Create memory mutation
  const createMemoryMutation = useMutation({
    mutationFn: async (memoryData: typeof newMemory) => {
      if (!user) throw new Error("User not authenticated");
      setUploadProgress(10);
      
      let imageUrl = "";
      
      // If there's an image, upload it to Storage
      if (memoryData.image) {
        const fileExt = memoryData.image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        setUploadProgress(30);
        
        // This is a placeholder for the actual upload
        // In a real implementation, we would upload to Supabase storage
        console.log("Would upload file:", fileName);
        
        // Simulate upload progress
        await new Promise(resolve => setTimeout(resolve, 500));
        setUploadProgress(60);
        await new Promise(resolve => setTimeout(resolve, 500));
        setUploadProgress(90);
        
        imageUrl = URL.createObjectURL(memoryData.image);
      }
      
      setUploadProgress(100);
      
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
      setPreviewImage(null);
      setUploadProgress(0);
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
      setUploadProgress(0);
    },
  });

  // Create quote mutation
  const createQuoteMutation = useMutation({
    mutationFn: async (quoteData: typeof newQuote) => {
      if (!user) throw new Error("User not authenticated");
      
      // Create a new quote object
      const newQuoteRecord: Omit<Quote, "id" | "created_at"> = {
        user_id: user.id,
        content: quoteData.content,
        author: quoteData.author,
      };
      
      // In a real implementation, we would insert into Supabase
      console.log("Would create quote:", newQuoteRecord);
      
      // Return a mock response with an id
      return {
        ...newQuoteRecord,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['quotes']});
      toast({
        title: "Quote Added",
        description: "Your inspirational quote has been added successfully.",
      });
      setIsAddQuoteModalOpen(false);
      setNewQuote({
        content: "",
        author: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add quote: ${error.message}`,
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

  // Delete quote mutation
  const deleteQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      // In a real implementation, we would delete from Supabase
      console.log("Would delete quote:", quoteId);
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['quotes']});
      toast({
        title: "Quote Deleted",
        description: "Your quote has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete quote: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setNewMemory({ ...newMemory, image: file });
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
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

  const handleCreateQuote = () => {
    if (!newQuote.content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter content for your quote.",
        variant: "destructive",
      });
      return;
    }
    
    createQuoteMutation.mutate(newQuote);
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

  const renderQuoteCard = (quote: Quote) => {
    return (
      <Card key={quote.id} className="overflow-hidden">
        <CardHeader className="p-4">
          <div className="flex justify-between items-start">
            <Quote className="h-6 w-6 text-cutelist-primary/80" />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-gray-400 hover:text-red-500"
              onClick={() => deleteQuoteMutation.mutate(quote.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-lg italic mb-2">"{quote.content}"</p>
          <p className="text-sm text-gray-400 text-right">— {quote.author}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 text-xs text-gray-500 flex justify-between">
          <span>{format(new Date(quote.created_at), "MMM d, yyyy")}</span>
        </CardFooter>
      </Card>
    );
  };

  const renderMemoriesTab = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingMemories ? (
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
        ) : memories && memories.length > 0 ? (
          memories.map(memory => renderMemoryCard(memory))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-16 w-16 mb-4 text-gray-600" />
            <h3 className="text-xl font-medium mb-2">No memories yet</h3>
            <p className="text-gray-400 text-center mb-4">
              Create your first memory to get started
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              Create Memory
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderQuotesTab = () => {
    return (
      <div>
        <div className="mb-6 bg-cutelist-primary/10 p-5 rounded-xl border border-cutelist-primary/20">
          <h3 className="text-lg font-medium mb-2">Share Inspiration</h3>
          <p className="text-gray-400 text-sm mb-4">
            Share your favorite quotes, affirmations, or words of wisdom with the community.
          </p>
          {user ? (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsAddQuoteModalOpen(true)}
                size={isMobile ? "sm" : "default"}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Add Quote
              </Button>
            </div>
          ) : (
            <p className="text-sm text-cutelist-primary">Sign in to share quotes</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingQuotes ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="opacity-50">
                <CardHeader>
                  <div className="h-6 w-3/4 bg-cutelist-dark/70 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full bg-cutelist-dark/70 rounded animate-pulse mb-2" />
                  <div className="h-4 w-5/6 bg-cutelist-dark/70 rounded animate-pulse" />
                  <div className="h-4 w-1/3 bg-cutelist-dark/70 rounded animate-pulse mt-2 ml-auto" />
                </CardContent>
              </Card>
            ))
          ) : quotes && quotes.length > 0 ? (
            quotes.map(quote => renderQuoteCard(quote))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-16 w-16 mb-4 text-gray-600" />
              <h3 className="text-xl font-medium mb-2">No quotes yet</h3>
              <p className="text-gray-400 text-center mb-4">
                Be the first to share an inspiring quote
              </p>
              <Button onClick={() => setIsAddQuoteModalOpen(true)}>
                Add Quote
              </Button>
            </div>
          )}
        </div>
      </div>
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
                <h1 className="text-4xl font-bold text-gradient mb-2">Memories & Inspirations</h1>
                <p className="text-gray-400">Capture your precious moments and share inspiring quotes</p>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                {viewType === "memories" && user && (
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Create Memory
                  </Button>
                )}
                {viewType === "quotes" && user && (
                  <Button
                    onClick={() => setIsAddQuoteModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Quote
                  </Button>
                )}
              </div>
            </div>
            
            <Tabs 
              defaultValue="memories" 
              value={viewType} 
              onValueChange={(value) => setViewType(value as any)}
              className="mb-6"
            >
              <TabsList className="mb-6">
                <TabsTrigger value="memories">Memories</TabsTrigger>
                <TabsTrigger value="quotes">Inspirational Quotes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="memories">
                {renderMemoriesTab()}
              </TabsContent>
              
              <TabsContent value="quotes">
                {renderQuotesTab()}
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        {/* Add Memory Modal - Improved Upload UI */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Memory</DialogTitle>
              <DialogDescription>
                Capture a special moment to remember
              </DialogDescription>
            </DialogHeader>
            {uploadProgress > 0 && uploadProgress < 100 ? (
              <div className="py-10">
                <div className="mb-2 flex justify-between text-sm">
                  <span>Uploading image...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cutelist-primary" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
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
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  <div 
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 transition-colors ${
                      previewImage ? 'border-cutelist-primary/30' : 'border-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewImage ? (
                      <div className="relative w-full">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(null);
                            setNewMemory({ ...newMemory, image: null });
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2 cursor-pointer p-8">
                        <div className="rounded-full bg-cutelist-primary/20 p-3">
                          <ImageIcon className="h-8 w-8 text-cutelist-primary" />
                        </div>
                        <span className="text-sm font-medium">Upload Image</span>
                        <span className="text-xs text-gray-500">Click to browse or drag and drop</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddModalOpen(false);
                  setPreviewImage(null);
                  setNewMemory({
                    title: "",
                    description: "",
                    image: null,
                    tags: "",
                    mood: "happy",
                  });
                }}
                disabled={uploadProgress > 0 && uploadProgress < 100}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateMemory}
                disabled={
                  createMemoryMutation.isPending || 
                  (uploadProgress > 0 && uploadProgress < 100)
                }
              >
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
        
        {/* Add Quote Modal */}
        <Dialog open={isAddQuoteModalOpen} onOpenChange={setIsAddQuoteModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Inspirational Quote</DialogTitle>
              <DialogDescription>
                Share your favorite quote with the community
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="content">Quote</Label>
                <Textarea
                  id="content"
                  placeholder="Type your favorite quote here..."
                  className="min-h-[120px]"
                  value={newQuote.content}
                  onChange={(e) => setNewQuote({ ...newQuote, content: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  placeholder="Who said or wrote this quote?"
                  value={newQuote.author}
                  onChange={(e) => setNewQuote({ ...newQuote, author: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddQuoteModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateQuote} disabled={createQuoteMutation.isPending}>
                {createQuoteMutation.isPending ? "Adding..." : "Add Quote"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ThemeProvider>
  );
};

export default Memories;
