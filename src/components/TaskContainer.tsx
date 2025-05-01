
import { useState, useEffect } from "react";
import { TaskInput } from "./TaskInput";
import { TaskList } from "./TaskList";
import { Task } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  useOnlineStatus, 
  storeLocalTasks, 
  getLocalTasks,
  addOfflineTask,
  toggleOfflineTask,
  deleteOfflineTask,
  syncOfflineData
} from "@/utils/offlineSync";

export function TaskContainer() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const isOnline = useOnlineStatus();

  // Load tasks from Supabase when online, from local storage when offline
  useEffect(() => {
    if (!user) return;
    
    const loadTasks = async () => {
      // Try to load from cache first for immediate display
      const cachedTasks = await getLocalTasks();
      if (cachedTasks.length > 0) {
        setTasks(cachedTasks);
      }
      
      // If online, fetch from Supabase and update cache
      if (isOnline) {
        try {
          const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error loading tasks:', error);
            return;
          }

          const formattedTasks = data.map(task => ({
            id: task.id,
            text: task.content,
            completed: task.is_complete || false,
            createdAt: task.created_at,
          }));
          
          setTasks(formattedTasks);
          // Update the local cache
          await storeLocalTasks(formattedTasks);
          
          // Try to sync any pending offline changes
          await syncOfflineData();
        } catch (err) {
          console.error('Error fetching tasks:', err);
          toast({
            title: "Network Error",
            description: "Using cached tasks while offline",
          });
        }
      } else {
        // If offline and no cached tasks, show message
        if (cachedTasks.length === 0) {
          toast({
            title: "Offline Mode",
            description: "You're working offline with no cached tasks",
          });
        }
      }
    };

    loadTasks();
  }, [user, isOnline, toast]);

  // Display online/offline status when it changes
  useEffect(() => {
    if (!user) return;
    
    toast({
      title: isOnline ? "Online" : "Offline",
      description: isOnline 
        ? "Connected to the internet. Your changes will sync automatically." 
        : "You're offline. Changes will sync when you reconnect.",
      duration: 3000
    });
    
  }, [isOnline, user, toast]);

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
      let newTask: Task | null = null;
      
      if (isOnline) {
        // Online mode - add directly to Supabase
        const { data, error } = await supabase
          .from('todos')
          .insert([{
            content: text,
            user_id: user.id,
          }])
          .select()
          .single();

        if (error) throw error;

        newTask = {
          id: data.id,
          text: data.content,
          completed: false,
          createdAt: data.created_at,
        };
      } else {
        // Offline mode - store locally for later sync
        newTask = await addOfflineTask(text, user.id);
        if (!newTask) throw new Error("Failed to add offline task");
      }
      
      setTasks((prev) => [newTask!, ...prev]);
      
      // Update local cache
      const updatedTasks = [newTask!, ...tasks];
      await storeLocalTasks(updatedTasks);
      
      toast({
        title: "Task added!",
        description: isOnline 
          ? "Your new task has been added to your list." 
          : "Task saved locally and will sync when you're back online.",
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
      if (isOnline) {
        // Online mode - update in Supabase
        const { error } = await supabase
          .from('todos')
          .update({ is_complete: !task.completed })
          .eq('id', id);

        if (error) throw error;
      } else {
        // Offline mode - store change for later sync
        await toggleOfflineTask(id, !task.completed);
      }

      // Update state
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      );
      
      // Update local cache
      const updatedTasks = tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      await storeLocalTasks(updatedTasks);
      
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    try {
      if (isOnline) {
        // Online mode - delete from Supabase
        const { error } = await supabase
          .from('todos')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } else {
        // Offline mode - store for later sync
        await deleteOfflineTask(id);
      }

      // Update state
      setTasks((prev) => prev.filter((task) => task.id !== id));
      
      // Update local cache
      const updatedTasks = tasks.filter((task) => task.id !== id);
      await storeLocalTasks(updatedTasks);
      
      toast({
        title: "Task deleted!",
        description: isOnline 
          ? "Your task has been removed from your list." 
          : "Task marked for deletion and will sync when online.",
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
    <div className="glass-card p-6 rounded-xl w-full max-w-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-center text-gradient">My Tasks</h2>
        {!isOnline && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Offline
          </span>
        )}
      </div>
      <TaskInput onAddTask={addTask} />
      <TaskList
        tasks={tasks}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
      />
    </div>
  );
}
