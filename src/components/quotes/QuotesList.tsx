
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AddQuoteForm } from "./AddQuoteForm";

export function QuotesList() {
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: quotes = [], refetch } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
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
      
      <div className="space-y-4">
        {quotes.map((quote) => (
          <Card key={quote.id} className="bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardContent className="pt-6">
              <p className="text-lg text-center italic">"{quote.content}"</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
