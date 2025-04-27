
import { Check, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@/types/task";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
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
      <span className="flex-1">{task.text}</span>
      <button 
        onClick={() => onDelete(task.id)}
        className="text-gray-400 hover:text-cutelist-accent ml-2"
      >
        <Trash className="h-4 w-4" />
      </button>
    </div>
  );
}
