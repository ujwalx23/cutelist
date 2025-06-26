
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemoriesTab } from "@/components/memories/MemoriesTab";
import { QuotesTab } from "@/components/memories/QuotesTab";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Memory, Quote } from "@/components/memories/types";

const Memories = () => {
  const { user } = useAuth();

  // Default data that's always available
  const defaultQuotes: Quote[] = [
    {
      id: "default-1",
      content: "Don't stop doing good just because you don't get credit for it.",
      author: "Keep doing what's right, even if no one recognizes it.",
      created_at: new Date().toISOString(),
      user_id: "default",
      isDefault: true
    },
    {
      id: "default-2", 
      content: "Small actions today can lead to big changes tomorrow.",
      author: "Every effort counts, and consistency is key.",
      created_at: new Date().toISOString(),
      user_id: "default",
      isDefault: true
    },
    {
      id: "default-3",
      content: "Your worth isn't defined by external validation.",
      author: "Focus on your values, passions, and strengths, rather than seeking approval from others.",
      created_at: new Date().toISOString(),
      user_id: "default", 
      isDefault: true
    }
  ];

  const defaultMemories: Memory[] = [
    {
      id: "default-1",
      title: "Hiking with friends",
      description: "Today was special, hiking with friends who never stop talking! Laughter, stories, and great views made it unforgettable",
      image_url: "/lovable-uploads/cd21a374-add7-423b-b4ba-e107778b5e3a.png",
      tags: ["friends", "nature", "loving"],
      created_at: new Date().toISOString(),
      user_id: "default",
      isDefault: true
    }
  ];

  // Fetch user quotes
  const { data: userQuotes = [] } = useQuery({
    queryKey: ['quotes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Fetch user memories
  const { data: userMemories = [] } = useQuery({
    queryKey: ['memories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Combine default and user data
  const allQuotes: Quote[] = [...defaultQuotes, ...userQuotes];
  const allMemories: Memory[] = [...defaultMemories, ...userMemories];

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <main className="flex-1 container py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 text-gradient">
                Memories & Quotes
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Capture your precious moments and inspiring thoughts. Create a digital scrapbook of your life's journey.
              </p>
            </div>

            <Tabs defaultValue="memories" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="memories">Memories</TabsTrigger>
                <TabsTrigger value="quotes">Quotes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="memories">
                <MemoriesTab memories={allMemories} />
              </TabsContent>
              
              <TabsContent value="quotes">
                <QuotesTab quotes={allQuotes} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Memories;
