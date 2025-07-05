
import { Check, Trash, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@/types/task";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

export function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onEdit(task.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(task.text);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className={cn(
      "flex items-start p-4 rounded-xl border border-white/10 mb-3 bg-white/5 backdrop-blur-sm w-full max-w-none",
      task.completed && "opacity-60"
    )}>
      <button 
        onClick={() => onToggle(task.id)}
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5",
          task.completed 
            ? "bg-cutelist-primary border-cutelist-primary text-white" 
            : "border-white/30 hover:border-cutelist-primary"
        )}
      >
        {task.completed && <Check className="h-4 w-4" />}
      </button>
      
      {isEditing ? (
        <div className="flex-1 flex flex-col gap-3">
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-cutelist-primary focus-visible:border-cutelist-primary"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              onClick={handleSaveEdit}
              className="px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelEdit}
              className="px-6 border-white/30 text-white hover:bg-white/10 rounded-lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 mr-2 min-w-0">
            <p className={cn(
              "text-white leading-snug text-base word-wrap break-words hyphens-auto",
              task.completed && "line-through text-white/60"
            )} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              {task.text}
            </p>
          </div>
          <div className="flex gap-1 flex-shrink-0 ml-2">
            <button 
              onClick={() => setIsEditing(true)}
              className="text-white/60 hover:text-cutelist-primary p-1.5 hover:bg-white/10 rounded-lg"
              title="Edit task"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button 
              onClick={() => onDelete(task.id)}
              className="text-white/60 hover:text-red-400 p-1.5 hover:bg-white/10 rounded-lg"
              title="Delete task"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
