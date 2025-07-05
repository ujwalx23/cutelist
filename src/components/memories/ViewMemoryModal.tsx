
import { format } from "date-fns";
import { Heart, Trash2, X, CalendarIcon, Tag } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Memory {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string;
  tags: string[];
  created_at: string;
}

interface ViewMemoryModalProps {
  memory: Memory | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  currentUserId?: string;
}

export const ViewMemoryModal = ({
  memory,
  isOpen,
  onClose,
  onDelete,
  isFavorite,
  onToggleFavorite,
  currentUserId,
}: ViewMemoryModalProps) => {
  if (!memory) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <div className="absolute top-2 right-2 flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-white"
            onClick={() => onToggleFavorite(memory.id)}
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : ""
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-red-500"
            onClick={() => onDelete(memory.id)}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="pt-6">
          <div className="aspect-video mb-4 overflow-hidden rounded-lg">
            <img
              src={memory.image_url}
              alt={memory.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              {memory.title}
            </h2>
            <div className="text-sm text-gray-400 flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {format(new Date(memory.created_at), "MMMM d, yyyy")}
            </div>
          </div>
          
          <p className="text-gray-300 mb-6">{memory.description}</p>
          
          {memory.tags && memory.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4" />
                <span className="font-medium">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {memory.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-sm px-2 py-1 bg-cutelist-primary/20 text-cutelist-primary rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
