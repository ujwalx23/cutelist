
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";

// Import our new components
import { Memory, Quote } from "@/components/memories/types";
import { MemoriesTab } from "@/components/memories/MemoriesTab";
import { QuotesTab } from "@/components/memories/QuotesTab";
import { AddMemoryModal } from "@/components/memories/AddMemoryModal";
import { AddQuoteModal } from "@/components/memories/AddQuoteModal";
import { ViewMemoryModal } from "@/components/memories/ViewMemoryModal";

const Memories = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  // State management
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState(false);
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null);
  const [viewType, setViewType] = useState<"memories" | "quotes">("memories");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access memories and quotes.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, navigate, toast, loading]);

  // Fetch memories
  const { data: memories = [], isLoading: isLoadingMemories, refetch: refetchMemories } = useQuery({
    queryKey: ['memories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data: memoriesData, error } = await supabase
          .from('memories')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return memoriesData || [];
      } catch (error) {
        console.error("Error fetching memories:", error);
        return [];
      }
    },
    enabled: !!user && !loading && viewType === "memories"
  });

  // Fetch quotes
  const { data: quotes = [], isLoading: isLoadingQuotes, refetch: refetchQuotes } = useQuery({
    queryKey: ['quotes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data: quotesData, error } = await supabase
          .from('quotes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return quotesData || [];
      } catch (error) {
        console.error("Error fetching quotes:", error);
        return [];
      }
    },
    enabled: !!user && !loading && viewType === "quotes"
  });

  // Create memory mutation
  const createMemoryMutation = useMutation({
    mutationFn: async (memoryData: { title: string; description: string; image: File | null; tags: string }) => {
      if (!user) throw new Error("User not authenticated");
      setUploadProgress(10);
      
      let imageUrl = "";
      
      // If there's an image, upload it to Storage
      if (memoryData.image) {
        const fileExt = memoryData.image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        setUploadProgress(30);
        
        // Actual upload to Supabase storage
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('memories')
          .upload(fileName, memoryData.image);
        
        if (uploadError) throw uploadError;
        
        setUploadProgress(60);
        
        // Get public URL
        const { data } = supabase.storage
          .from('memories')
          .getPublicUrl(fileName);
        
        imageUrl = data.publicUrl;
        setUploadProgress(90);
      }
      
      setUploadProgress(100);
      
      // Convert tags string to array
      const tagsArray = memoryData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      // Create a new memory record in Supabase
      const { data: newMemoryData, error } = await supabase
        .from('memories')
        .insert([{
          user_id: user.id,
          title: memoryData.title,
          description: memoryData.description,
          image_url: imageUrl,
          tags: tagsArray,
        }])
        .select();
      
      if (error) throw error;
      
      return newMemoryData[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['memories', user?.id]});
      refetchMemories();
      toast({
        title: "Memory Created",
        description: "Your memory has been stored successfully.",
      });
      setIsAddModalOpen(false);
      setUploadProgress(0);
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
    mutationFn: async (quoteData: { content: string; author: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      // Create a new quote in Supabase
      const { data: newQuoteData, error } = await supabase
        .from('quotes')
        .insert([{
          user_id: user.id,
          content: quoteData.content,
          author: quoteData.author || null,
        }])
        .select();
      
      if (error) throw error;
      
      return newQuoteData[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['quotes']});
      refetchQuotes();
      toast({
        title: "Quote Added",
        description: "Your inspirational quote has been added successfully.",
      });
      setIsAddQuoteModalOpen(false);
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
      
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', memoryId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['memories', user?.id]});
      refetchMemories();
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
      
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['quotes']});
      refetchQuotes();
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

  const handleCreateMemory = (memoryData: { title: string; description: string; image: File | null; tags: string }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create memories.",
        variant: "destructive",
      });
      return;
    }

    if (!memoryData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your memory.",
        variant: "destructive",
      });
      return;
    }
    
    createMemoryMutation.mutate(memoryData);
  };

  const handleCreateQuote = (quoteData: { content: string; author: string }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add quotes.",
        variant: "destructive",
      });
      return;
    }

    if (!quoteData.content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter content for your quote.",
        variant: "destructive",
      });
      return;
    }
    
    createQuoteMutation.mutate(quoteData);
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

  // Show loading state while checking authentication
  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex flex-col bg-cutelist-dark">
          <Header />
          <main className="flex-1 container py-12 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full border-2 border-cutelist-primary border-t-transparent animate-spin mb-4"></div>
              <p className="text-gray-400">Loading...</p>
            </div>
          </main>
        </div>
      </ThemeProvider>
    );
  }

  // If not authenticated and finished loading, show sign-in prompt
  if (!user && !loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex flex-col bg-cutelist-dark">
          <Header />
          <main className="flex-1 container py-12 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Sign in Required</CardTitle>
                <CardDescription>Please sign in to access memories and quotes</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate("/")}>
                  Go to Sign In
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </ThemeProvider>
    );
  }

  // Main UI when authenticated
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
                {viewType === "memories" && (
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Create Memory
                  </Button>
                )}
                {viewType === "quotes" && (
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
                <MemoriesTab
                  memories={memories}
                  isLoading={isLoadingMemories}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onViewMemory={handleViewMemory}
                  onAddMemory={() => setIsAddModalOpen(true)}
                />
              </TabsContent>
              
              <TabsContent value="quotes">
                <QuotesTab
                  quotes={quotes}
                  isLoading={isLoadingQuotes}
                  currentUserId={user?.id}
                  onDeleteQuote={(id) => deleteQuoteMutation.mutate(id)}
                  onAddQuote={() => setIsAddQuoteModalOpen(true)}
                  isMobile={isMobile}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        {/* Modals */}
        <AddMemoryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onCreateMemory={handleCreateMemory}
          isPending={createMemoryMutation.isPending}
          uploadProgress={uploadProgress}
        />
        
        <ViewMemoryModal
          memory={activeMemory}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          onDelete={handleDeleteMemory}
          isFavorite={activeMemory ? favorites.includes(activeMemory.id) : false}
          onToggleFavorite={toggleFavorite}
        />
        
        <AddQuoteModal
          isOpen={isAddQuoteModalOpen}
          onClose={() => setIsAddQuoteModalOpen(false)}
          onCreateQuote={handleCreateQuote}
          isPending={createQuoteMutation.isPending}
        />
      </div>
    </ThemeProvider>
  );
};

export default Memories;
