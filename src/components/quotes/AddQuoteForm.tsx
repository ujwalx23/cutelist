
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

interface AddQuoteFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddQuoteForm({ onSuccess, onCancel }: AddQuoteFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('quotes')
        .insert([{ content, user_id: user.id }]);

      if (error) throw error;
      onSuccess();
      setContent("");
    } catch (error) {
      console.error('Error adding quote:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your inspirational quote..."
        required
        className="min-h-[100px]"
      />
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Share Quote"}
        </Button>
      </div>
    </form>
  );
}
