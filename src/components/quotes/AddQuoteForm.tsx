
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

interface AddQuoteFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddQuoteForm({ onSuccess, onCancel }: AddQuoteFormProps) {
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!content.trim()) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('quotes')
        .insert([{ content, author: author.trim() || null, user_id: user.id }]);

      if (error) throw error;
      onSuccess();
      setContent("");
      setAuthor("");
    } catch (error) {
      console.error('Error adding quote:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="quote-content">Quote</Label>
        <Textarea
          id="quote-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your inspirational quote..."
          required
          className="min-h-[100px]"
        />
      </div>
      <div>
        <Label htmlFor="quote-author">Author (Optional)</Label>
        <Input
          id="quote-author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Who said or wrote this quote?"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !content.trim()}>
          {loading ? "Adding..." : "Share Quote"}
        </Button>
      </div>
    </form>
  );
}
