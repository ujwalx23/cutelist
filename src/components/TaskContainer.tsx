
import { useState, useEffect } from "react";
import { TaskInput } from "./TaskInput";
import { TaskList } from "./TaskList";
import { Task } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function TaskContainer() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load tasks from Supabase
  useEffect(() => {
    if (user) {
      const loadTasks = async () => {
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading tasks:', error);
          return;
        }

        setTasks(data.map(task => ({
          id: task.id,
          text: task.content,
          completed: task.is_complete || false,
          createdAt: task.created_at,
        })));
      };

      loadTasks();
    }
  }, [user]);

  const addTask = async (text: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add tasks.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{
          content: text,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      const newTask: Task = {
        id: data.id,
        text: data.content,
        completed: false,
        createdAt: data.created_at,
      };
      
      setTasks((prev) => [newTask, ...prev]);
      
      toast({
        title: "Task added!",
        description: "Your new task has been added to your list.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleTask = async (id: string) => {
    if (!user) return;

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_complete: !task.completed })
        .eq('id', id);

      if (error) throw error;

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks((prev) => prev.filter((task) => task.id !== id));
      
      toast({
        title: "Task deleted!",
        description: "Your task has been removed from your list.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-cutelist-primary mb-2">Please sign in</h3>
        <p className="text-gray-400">Sign in to manage your tasks</p>
      </div>
    );
  }

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
