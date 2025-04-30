
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AddQuoteForm } from "./AddQuoteForm";
import { Quote } from "@/types/memory";

export function QuotesList() {
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: quotes = [], refetch, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching quotes:", error);
        throw error;
      }
      return data as Quote[] || [];
    },
    refetchOnWindowFocus: false,
  });

  const onQuoteAdded = () => {
    setShowAddForm(false);
    refetch();
    toast({
      title: "Quote added!",
      description: "Your quote has been shared successfully.",
    });
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
      {user && (
        <div className="text-center">
          {showAddForm ? (
            <AddQuoteForm onSuccess={onQuoteAdded} onCancel={() => setShowAddForm(false)} />
          ) : (
            <Button onClick={() => setShowAddForm(true)}>
              Add Your Quote
            </Button>
          )}
        </div>
      )}
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-pulse">
              <CardContent className="pt-6 h-24" />
            </Card>
          ))}
        </div>
      ) : quotes.length > 0 ? (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <Card key={quote.id} className="bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardContent className="pt-6">
                <p className="text-lg text-center italic">"{quote.content}"</p>
                {quote.author && (
                  <p className="text-sm text-right text-gray-400 mt-2">— {quote.author}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">No quotes yet. Be the first to add one!</p>
        </div>
      )}
    </div>
  );
}
