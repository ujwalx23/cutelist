
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AddQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateQuote: (quoteData: { content: string; author: string }) => void;
  isPending: boolean;
}

export const AddQuoteModal = ({
  isOpen,
  onClose,
  onCreateQuote,
  isPending,
}: AddQuoteModalProps) => {
  const [newQuote, setNewQuote] = useState({
    content: "",
    author: "",
  });

  const handleSubmit = () => {
    onCreateQuote(newQuote);
  };

  const handleClose = () => {
    onClose();
    setNewQuote({
      content: "",
      author: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
          <Button 
            variant="outline" 
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isPending || !newQuote.content.trim()}
          >
            {isPending ? "Adding..." : "Share Quote"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
