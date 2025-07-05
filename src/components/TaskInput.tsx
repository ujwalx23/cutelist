
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
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
      <Input
        type="text"
        placeholder="Add a new task... ✨"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-cutelist-primary focus-visible:border-cutelist-primary rounded-xl h-12 px-4"
        disabled={isAdding}
      />
      <Button 
        type="submit"
        disabled={isAdding || !taskText.trim()}
        className="bg-gradient-to-r from-cutelist-primary to-cutelist-heart hover:from-cutelist-secondary hover:to-cutelist-primary text-white h-12 px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto w-full"
      >
        {isAdding ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <Plus className="mr-2 h-5 w-5" />
            Add
          </>
        )}
      </Button>
    </form>
  );
}
