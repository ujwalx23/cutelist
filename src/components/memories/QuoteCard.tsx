
import { format } from "date-fns";
import { Quote, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuoteProps {
  id: string;
  user_id: string;
  content: string;
  author: string;
  created_at: string;
  currentUserId?: string;
  onDelete: (id: string) => void;
}

export const QuoteCard = ({
  id,
  user_id,
  content,
  author,
  created_at,
  currentUserId,
  onDelete,
}: QuoteProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <Quote className="h-6 w-6 text-cutelist-primary/80" />
          {user_id === currentUserId && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-gray-400 hover:text-red-500"
              onClick={() => onDelete(id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-lg italic mb-2">"{content}"</p>
        <p className="text-sm text-gray-400 text-right">— {author || "Unknown"}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 text-xs text-gray-500 flex justify-between">
        <span>{format(new Date(created_at), "MMM d, yyyy")}</span>
      </CardFooter>
    </Card>
  );
};
