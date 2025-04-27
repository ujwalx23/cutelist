
import { TaskItem } from "./TaskItem";
import { Task } from "@/types/task";

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export function TaskList({ tasks, onToggleTask, onDeleteTask }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="animate-bounce-subtle mb-4">
          <span className="text-4xl">✨</span>
        </div>
        <h3 className="text-lg font-medium text-cutelist-primary mb-2">Your list is empty</h3>
        <p className="text-gray-400">Add some tasks to get started</p>
      </div>
    );
  }

  return (
    <div>
      {tasks.map((task) => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onToggle={onToggleTask} 
          onDelete={onDeleteTask}
        />
      ))}
    </div>
  );
}
