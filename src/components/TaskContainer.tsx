
import { useState, useEffect } from "react";
import { TaskInput } from "./TaskInput";
import { TaskList } from "./TaskList";
import { Task } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function TaskContainer() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load tasks from Supabase
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    const loadTasks = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading tasks:', error);
          toast({
            title: "Error loading tasks",
            description: "Please try refreshing the page.",
            variant: "destructive",
          });
          return;
        }

        const formattedTasks = data.map(task => ({
          id: task.id,
          text: task.content,
          completed: task.is_complete || false,
          createdAt: task.created_at,
        }));
        
        setTasks(formattedTasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        toast({
          title: "Network Error",
          description: "Failed to load tasks. Please check your internet connection.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [user, toast]);

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
      // Add directly to Supabase
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
        title: "Task added! ✨",
        description: "Your new task has been added to your list.",
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const editTask = async (id: string, newText: string) => {
    if (!user) return;

    try {
      // Update in Supabase
      const { error } = await supabase
        .from('todos')
        .update({ content: newText })
        .eq('id', id);

      if (error) throw error;

      // Update state after successful database update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, text: newText } : t
        )
      );

      toast({
        title: "Task updated! 📝",
        description: "Your task has been successfully updated.",
      });
    } catch (error) {
      console.error('Error editing task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleTask = async (id: string) => {
    if (!user) return;

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      // Update in Supabase
      const { error } = await supabase
        .from('todos')
        .update({ is_complete: !task.completed })
        .eq('id', id);

      if (error) throw error;

      // Update state after successful database update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      );

      toast({
        title: task.completed ? "Task marked as pending 🔄" : "Task completed! 🎉",
        description: task.completed ? "Keep going!" : "Great job!",
      });
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update state after successful database deletion
      setTasks((prev) => prev.filter((task) => task.id !== id));
      
      toast({
        title: "Task deleted! 🗑️",
        description: "Your task has been removed from your list.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10 animate-fade-in">
        <h3 className="text-lg font-medium text-cutelist-primary mb-2">Please sign in</h3>
        <Button variant="link" onClick={() => {
          const authModal = document.querySelector('[role="dialog"]');
          if (authModal) {
            const signInButton = authModal.querySelector('button');
            if (signInButton) signInButton.click();
          }
        }}>
          Sign in to manage your tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gradient">My Tasks</h2>
        {isLoading && (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Loading...
          </div>
        )}
      </div>
      <TaskInput onAddTask={addTask} />
      <TaskList
        tasks={tasks}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
        onEditTask={editTask}
      />
    </div>
  );
}
