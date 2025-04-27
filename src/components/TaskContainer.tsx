
import { useState, useEffect } from "react";
import { TaskInput } from "./TaskInput";
import { TaskList } from "./TaskList";
import { Task } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { generateId } from "@/lib/utils";

export function TaskContainer() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("cutelistTasks");
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error("Error loading tasks:", error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("cutelistTasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (text: string) => {
    const newTask: Task = {
      id: generateId(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    
    setTasks((prev) => [newTask, ...prev]);
    
    toast({
      title: "Task added!",
      description: "Your new task has been added to your list.",
    });
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    
    toast({
      title: "Task deleted!",
      description: "Your task has been removed from your list.",
    });
  };

  return (
    <div className="glass-card p-6 rounded-xl w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gradient">My Tasks</h2>
      <TaskInput onAddTask={addTask} />
      <TaskList
        tasks={tasks}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
      />
    </div>
  );
}
