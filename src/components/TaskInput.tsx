
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TaskInputProps {
  onAddTask: (text: string) => void;
}

export function TaskInput({ onAddTask }: TaskInputProps) {
  const [taskText, setTaskText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (taskText.trim()) {
      setIsAdding(true);
      await onAddTask(taskText);
      setTaskText("");
      setIsAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6 animate-fade-in">
      <Input
        type="text"
        placeholder="Add a new task... ✨"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        className="flex-1 bg-cutelist-dark/50 border-cutelist-primary/30 focus-visible:ring-cutelist-primary placeholder:text-gray-500 transition-all duration-200 focus:scale-105 focus:shadow-lg"
        disabled={isAdding}
      />
      <Button 
        type="submit"
        disabled={isAdding || !taskText.trim()}
        className="bg-gradient-to-r from-cutelist-primary to-cutelist-heart hover:from-cutelist-secondary hover:to-cutelist-primary text-white transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAdding ? (
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
        ) : (
          <>
            <Plus className="mr-1 h-4 w-4" />
            Add
          </>
        )}
      </Button>
    </form>
  );
}
