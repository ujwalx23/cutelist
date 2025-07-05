
import { TaskItem } from "./TaskItem";
import { Task } from "@/types/task";

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, newText: string) => void;
}

export function TaskList({ tasks, onToggleTask, onDeleteTask, onEditTask }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 animate-fade-in">
        <div className="animate-bounce-subtle mb-4">
          <span className="text-4xl">✨</span>
        </div>
        <h3 className="text-lg font-medium text-cutelist-primary mb-2">Your list is empty</h3>
        <p className="text-gray-400">Add some tasks to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task, index) => (
        <div 
          key={task.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <TaskItem 
            task={task} 
            onToggle={onToggleTask} 
            onDelete={onDeleteTask}
            onEdit={onEditTask}
          />
        </div>
      ))}
    </div>
  );
}
