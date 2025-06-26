
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { AddQuoteModal } from "./AddQuoteModal";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Quote } from "./types";

interface QuoteCardProps {
  quote: Quote;
}

export function QuoteCard({ quote }: QuoteCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);

  const deleteQuoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({
        title: "Quote deleted",
        description: "Your quote has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete quote. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this quote?")) {
      deleteQuoteMutation.mutate(quote.id);
    }
  };

  const canModify = user && (quote.user_id === user.id || quote.isDefault);

  return (
    <>
      <Card className="glass-card group hover:scale-105 transition-transform duration-200">
        <CardContent className="p-6">
          <blockquote className="text-lg font-medium text-white mb-4 italic">
            "{quote.content}"
          </blockquote>
          {quote.author && (
            <cite className="text-sm text-gray-400 not-italic">
              — {quote.author}
            </cite>
          )}
          <div className="flex justify-between items-center mt-4">
            <span className="text-xs text-gray-500">
              {new Date(quote.created_at).toLocaleDateString()}
            </span>
            {canModify && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditModalOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {canModify && (
        <AddQuoteModal
          quote={quote}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
        />
      )}
    </>
  );
}
