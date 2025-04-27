
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TaskInputProps {
  onAddTask: (text: string) => void;
}

export function TaskInput({ onAddTask }: TaskInputProps) {
  const [taskText, setTaskText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskText.trim()) {
      onAddTask(taskText);
      setTaskText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <Input
        type="text"
        placeholder="Add a new task..."
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        className="flex-1 bg-cutelist-dark/50 border-cutelist-primary/30 focus-visible:ring-cutelist-primary placeholder:text-gray-500"
      />
      <Button 
        type="submit"
        className="bg-cutelist-primary hover:bg-cutelist-secondary text-white"
      >
        <Plus className="mr-1 h-4 w-4" />
        Add
      </Button>
    </form>
  );
}
