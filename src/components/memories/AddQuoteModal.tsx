
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Quote } from "./types";

interface AddQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote?: Quote;
}

export const AddQuoteModal = ({ open, onOpenChange, quote }: AddQuoteModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    content: quote?.content || "",
    author: quote?.author || "",
  });

  const createQuoteMutation = useMutation({
    mutationFn: async (data: { content: string; author: string }) => {
      if (!user) throw new Error("Must be logged in");

      if (quote) {
        // Update existing quote
        const { data: result, error } = await supabase
          .from('quotes')
          .update({
            content: data.content,
            author: data.author
          })
          .eq('id', quote.id)
          .select()
          .single();
        
        if (error) throw error;
        return result;
      } else {
        // Create new quote
        const { data: result, error } = await supabase
          .from('quotes')
          .insert([{
            content: data.content,
            author: data.author,
            user_id: user.id
          }])
          .select()
          .single();
        
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({
        title: quote ? "Quote updated" : "Quote created",
        description: `Your quote has been successfully ${quote ? 'updated' : 'created'}.`,
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: `Failed to ${quote ? 'update' : 'create'} quote. Please try again.`,
        variant: "destructive",
      });
    }
  });

  const handleClose = () => {
    onOpenChange(false);
    setFormData({ content: "", author: "" });
  };

  const handleSubmit = () => {
    if (!formData.content.trim()) return;
    createQuoteMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{quote ? 'Edit Quote' : 'Add Inspirational Quote'}</DialogTitle>
          <DialogDescription>
            {quote ? 'Update your quote' : 'Share your favorite quote with the community'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="content">Quote</Label>
            <Textarea
              id="content"
              placeholder="Type your favorite quote here..."
              className="min-h-[120px]"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              placeholder="Who said or wrote this quote?"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createQuoteMutation.isPending || !formData.content.trim()}
          >
            {createQuoteMutation.isPending ? 
              (quote ? "Updating..." : "Adding...") : 
              (quote ? "Update Quote" : "Share Quote")
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
