
import { Check, Trash, Edit, X } from "lucide-react";
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
  onMarkNotDone: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete, onEdit, onMarkNotDone }: TaskItemProps) {
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
    <div className={cn("task-item", task.completed && "task-completed")}>
      <button 
        onClick={() => onToggle(task.id)}
        className={cn(
          "w-6 h-6 rounded-full border flex items-center justify-center mr-3",
          task.completed 
            ? "bg-cutelist-primary border-cutelist-primary text-white" 
            : "border-cutelist-primary/40 hover:border-cutelist-primary"
        )}
      >
        {task.completed && <Check className="h-4 w-4" />}
      </button>
      
      {isEditing ? (
        <div className="flex-1 flex gap-2 items-center">
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 h-8 text-sm"
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleSaveEdit}
            className="h-8 px-2 bg-green-600 hover:bg-green-700"
          >
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancelEdit}
            className="h-8 px-2"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <span className="flex-1">{task.text}</span>
      )}
      
      <div className="flex gap-1 ml-2">
        {!isEditing && (
          <>
            <button 
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-blue-500 p-1"
              title="Edit task"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button 
              onClick={() => onMarkNotDone(task.id)}
              className="text-gray-400 hover:text-orange-500 p-1"
              title="Mark as not done this time"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        )}
        <button 
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-cutelist-accent p-1"
          title="Delete task"
        >
          <Trash className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
