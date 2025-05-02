
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, isSameDay } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type TaskType = "todo" | "book" | "pomodoro";

export interface CompletedTask {
  id: string;
  content: string;
  completed_at: string;
  type: TaskType;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [highlightedDates, setHighlightedDates] = useState<Date[]>([]);

  // Fetch all completed tasks
  const { data: completedTasks, isLoading, error } = useQuery({
    queryKey: ['completed-tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // Fetch completed todos
        const { data: todos, error: todosError } = await supabase
          .from('todos')
          .select('id, content, updated_at, created_at')
          .eq('user_id', user.id)
          .eq('is_complete', true);
          
        if (todosError) throw todosError;
        
        // Fetch completed books
        const { data: books, error: booksError } = await supabase
          .from('books')
          .select('id, title, created_at, updated_at')
          .eq('user_id', user.id)
          .eq('read', true);
        
        if (booksError) throw booksError;
        
        // Format completed books
        const completedBooks = books ? books.map(book => ({
          id: book.id,
          content: book.title,
          completed_at: book.updated_at || book.created_at,
          type: 'book' as TaskType
        })) : [];
        
        // Placeholder for pomodoro
        const completedPomodoro: CompletedTask[] = [];
        
        // Transform todo data to match our format
        const formattedTodos = todos ? todos.map(todo => ({
          id: todo.id,
          content: todo.content,
          completed_at: todo.updated_at || todo.created_at,
          type: 'todo' as TaskType
        })) : [];
        
        // Combine all completed tasks
        return [...formattedTodos, ...completedBooks, ...completedPomodoro];
      } catch (error) {
        console.error("Error fetching completed tasks:", error);
        return [];
      }
    },
    enabled: !!user
  });

  useEffect(() => {
    if (completedTasks && completedTasks.length > 0) {
      // Extract unique dates from completed tasks
      const dates = completedTasks.map(task => {
        return parseISO(task.completed_at);
      });
      
      // Remove duplicates
      const uniqueDates = dates.filter((date, index, self) => 
        self.findIndex(d => isSameDay(d, date)) === index
      );
      
      setHighlightedDates(uniqueDates);
    }
  }, [completedTasks]);

  // Filter tasks for selected date
  const tasksForSelectedDate = completedTasks?.filter(task => {
    if (!selectedDate) return false;
    return isSameDay(parseISO(task.completed_at), selectedDate);
  });
  
  // Calculate statistics
  const totalCompleted = completedTasks?.length || 0;
  const todosCompleted = completedTasks?.filter(task => task.type === 'todo').length || 0;
  const booksCompleted = completedTasks?.filter(task => task.type === 'book').length || 0;
  const pomodoroCompleted = completedTasks?.filter(task => task.type === 'pomodoro').length || 0;
  
  // Calculate streak (placeholder logic)
  const calculateStreak = () => {
    if (!completedTasks || completedTasks.length === 0) return 0;
    
    // Sort tasks by date
    const sortedDates = [...highlightedDates].sort((a, b) => b.getTime() - a.getTime());
    
    if (sortedDates.length === 0) return 0;
    
    // Check if today has completions
    const today = new Date();
    const hasCompletionToday = sortedDates.some(date => isSameDay(date, today));
    
    // If no completion today, check if yesterday had one
    if (!hasCompletionToday) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const hasCompletionYesterday = sortedDates.some(date => isSameDay(date, yesterday));
      if (!hasCompletionYesterday) return 0;
    }
    
    // Count consecutive days with completions
    let streak = hasCompletionToday ? 1 : 0;
    let currentDate = hasCompletionToday ? today : new Date(today);
    
    if (!hasCompletionToday) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    // Check previous days
    for (let i = 1; i < 100; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() - i);
      
      const hasCompletion = sortedDates.some(date => isSameDay(date, checkDate));
      
      if (hasCompletion) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  const currentStreak = calculateStreak();
  
  const getDayWithMostTasks = () => {
    if (!completedTasks || completedTasks.length === 0) return null;
    
    // Group tasks by date
    const tasksByDate = completedTasks.reduce((acc, task) => {
      const dateStr = format(parseISO(task.completed_at), 'yyyy-MM-dd');
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(task);
      return acc;
    }, {} as Record<string, CompletedTask[]>);
    
    // Find date with most tasks
    let maxCount = 0;
    let maxDate = '';
    
    Object.entries(tasksByDate).forEach(([date, tasks]) => {
      if (tasks.length > maxCount) {
        maxCount = tasks.length;
        maxDate = date;
      }
    });
    
    return {
      date: parseISO(maxDate),
      count: maxCount
    };
  };
  
  const mostProductiveDay = getDayWithMostTasks();
  
  if (error) {
    toast({
      title: "Error loading achievements",
      description: "Failed to load your achievements. Please try again.",
      variant: "destructive",
    });
  }

  return {
    selectedDate,
    setSelectedDate,
    highlightedDates,
    completedTasks,
    tasksForSelectedDate,
    isLoading,
    totalCompleted,
    todosCompleted,
    booksCompleted,
    pomodoroCompleted,
    currentStreak,
    mostProductiveDay
  };
};
