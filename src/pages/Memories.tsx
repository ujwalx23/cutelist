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

// Default quotes and memory
const defaultQuotes: Quote[] = [
  {
    id: "default-1",
    user_id: "default",
    content: "Your worth isn't defined by external validation.",
    author: "Unknown",
    created_at: new Date().toISOString(),
  },
  {
    id: "default-2",
    user_id: "default",
    content: "Don't stop doing good just because you don't get credit for it.",
    author: "Ujwal Singh",
    created_at: new Date().toISOString(),
  },
];

const defaultMemory: Memory = {
  id: "default-memory",
  user_id: "default",
  title: "Nature's Calm",
  description: "Let the rain wash away worries, and let peace bloom in every moment.😊",
  image_url: "/lovable-uploads/cd21a374-add7-423b-b4ba-e107778b5e3a.png",
  tags: ["peace", "nature", "love"],
  created_at: new Date().toISOString(),
};

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

  // Fetch memories
  const { data: userMemories = [], isLoading: isLoadingMemories, refetch: refetchMemories } = useQuery({
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
  const { data: userQuotes = [], isLoading: isLoadingQuotes, refetch: refetchQuotes } = useQuery({
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

  // Combine default and user data
  const allMemories = user ? [defaultMemory, ...userMemories] : [defaultMemory];
  const allQuotes = user ? [...defaultQuotes, ...userQuotes] : defaultQuotes;

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
      
      // Allow deletion of default memory when user is signed in
      if (memoryId === "default-memory") {
        // Don't actually delete from database, just remove from local state
        return { success: true, isDefault: true };
      }
      
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', memoryId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return { success: true, isDefault: false };
    },
    onSuccess: (data) => {
      if (!data.isDefault) {
        queryClient.invalidateQueries({queryKey: ['memories', user?.id]});
        refetchMemories();
      }
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
      
      // Allow deletion of default quotes when user is signed in
      if (quoteId.startsWith("default-")) {
        // Don't actually delete from database, just remove from local state
        return { success: true, isDefault: true };
      }
      
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return { success: true, isDefault: false };
    },
    onSuccess: (data) => {
      if (!data.isDefault) {
        queryClient.invalidateQueries({queryKey: ['quotes']});
        refetchQuotes();
      }
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

  const handleAddMemory = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add memories.",
        variant: "destructive",
      });
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleAddQuote = () => {
    if (!user) {
      toast({
        title: "Authentication Required", 
        description: "Please sign in to add quotes.",
        variant: "destructive",
      });
      return;
    }
    setIsAddQuoteModalOpen(true);
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

  // Main UI (accessible to everyone)
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
                {!user && (
                  <p className="text-sm text-gray-500 mt-2">Sign in to add your own memories and quotes</p>
                )}
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                {viewType === "memories" && (
                  <Button
                    onClick={handleAddMemory}
                    className="flex items-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Create Memory
                  </Button>
                )}
                {viewType === "quotes" && (
                  <Button
                    onClick={handleAddQuote}
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
                  memories={allMemories}
                  isLoading={isLoadingMemories}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onViewMemory={handleViewMemory}
                  onAddMemory={handleAddMemory}
                />
              </TabsContent>
              
              <TabsContent value="quotes">
                <QuotesTab
                  quotes={allQuotes}
                  isLoading={isLoadingQuotes}
                  currentUserId={user?.id}
                  onDeleteQuote={(id) => deleteQuoteMutation.mutate(id)}
                  onAddQuote={handleAddQuote}
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
          currentUserId={user?.id}
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
