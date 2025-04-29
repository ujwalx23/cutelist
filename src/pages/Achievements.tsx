
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isSameDay } from "date-fns";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  CalendarCheck2,
  CheckCircle2,
  BookOpen,
  Calendar as CalendarIcon,
  Star,
  Award,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

type TaskType = "todo" | "book" | "pomodoro";

interface CompletedTask {
  id: string;
  content: string;
  completed_at: string;
  type: TaskType;
}

const Achievements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
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
        
        // We would fetch completed books and pomodoro from their respective tables
        // This is placeholder for the demo
        const completedBooks: CompletedTask[] = [];
        const completedPomodoro: CompletedTask[] = [];
        
        // Transform todo data to match our format
        const formattedTodos = todos.map(todo => ({
          id: todo.id,
          content: todo.content,
          completed_at: todo.updated_at || todo.created_at,
          type: 'todo' as TaskType
        }));
        
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
  
  const renderAchievementBadges = () => {
    // Achievements based on task completion
    const achievements = [
      { id: 1, name: "First Task", description: "Completed your first task", unlocked: todosCompleted >= 1, icon: <CheckCircle2 className="h-5 w-5" /> },
      { id: 2, name: "Read 3 Books", description: "Completed reading 3 books", unlocked: booksCompleted >= 3, icon: <BookOpen className="h-5 w-5" /> },
      { id: 3, name: "Completed 100 Tasks", description: "Completed 100 tasks", unlocked: todosCompleted >= 100, icon: <CheckCircle2 className="h-5 w-5" /> },
      { id: 4, name: "7-Day Streak", description: "Completed tasks for 7 consecutive days", unlocked: currentStreak >= 7, icon: <CalendarCheck2 className="h-5 w-5" /> },
      { id: 5, name: "30-Day Streak", description: "Completed tasks for 30 consecutive days", unlocked: currentStreak >= 30, icon: <Star className="h-5 w-5" /> },
      { id: 6, name: "20 Pomodoro Sessions", description: "Completed 20 pomodoro work sessions", unlocked: pomodoroCompleted >= 20, icon: <Clock className="h-5 w-5" /> },
    ];
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {achievements.map(achievement => (
          <div 
            key={achievement.id} 
            className={`rounded-lg p-4 border ${
              achievement.unlocked 
                ? "border-cutelist-primary/30 bg-cutelist-primary/10" 
                : "border-gray-700 bg-gray-800/50 opacity-60"
            }`}
          >
            <div className="flex items-center">
              <div className={`rounded-full p-2 mr-3 ${
                achievement.unlocked 
                  ? "bg-cutelist-primary/20 text-cutelist-primary" 
                  : "bg-gray-700 text-gray-400"
              }`}>
                {achievement.icon}
              </div>
              <div>
                <h3 className="font-medium">{achievement.name}</h3>
                <p className="text-sm text-gray-400">{achievement.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <main className="flex-1 container py-8 md:py-12">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gradient mb-2">Achievements</h1>
                <p className="text-gray-400">Track your progress and celebrate your wins!</p>
              </div>
              {currentStreak > 0 && (
                <Badge variant="outline" className="px-3 py-2 bg-gradient-to-r from-cutelist-primary/20 to-cutelist-accent/20 border-cutelist-primary/30 text-white mt-4 md:mt-0">
                  <Trophy className="h-4 w-4 mr-1 text-yellow-400" />
                  <span className="text-sm">Current streak: {currentStreak} days</span>
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Calendar & Stats */}
              <div className="space-y-6 order-2 lg:order-1">
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Activity Calendar</CardTitle>
                      <CalendarCheck2 className="h-5 w-5 text-cutelist-primary" />
                    </div>
                    <CardDescription>
                      Days with completed tasks are highlighted
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-[200px] w-full" />
                      </div>
                    ) : (
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="w-full"
                        modifiers={{
                          highlighted: highlightedDates,
                        }}
                        modifiersStyles={{
                          highlighted: {
                            backgroundColor: "rgba(155, 135, 245, 0.2)",
                            borderRadius: "100%",
                          },
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
                
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-base">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Total completed:</span>
                          <span className="font-medium">{totalCompleted}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Tasks completed:</span>
                          <span className="font-medium">{todosCompleted}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Books finished:</span>
                          <span className="font-medium">{booksCompleted}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Pomodoro sessions:</span>
                          <span className="font-medium">{pomodoroCompleted}</span>
                        </div>
                        {mostProductiveDay && (
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
                            <span className="text-sm text-gray-400">Most productive day:</span>
                            <span className="font-medium">
                              {format(mostProductiveDay.date, 'MMM d')} ({mostProductiveDay.count} tasks)
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column - Daily Achievements & Badges */}
              <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>
                          {selectedDate
                            ? isSameDay(selectedDate, new Date())
                              ? "Today's Achievements"
                              : `Achievements on ${format(selectedDate, 'MMM d, yyyy')}`
                            : "Select a date"
                          }
                        </CardTitle>
                        <CardDescription>
                          {tasksForSelectedDate?.length || 0} tasks completed
                        </CardDescription>
                      </div>
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : tasksForSelectedDate && tasksForSelectedDate.length > 0 ? (
                      <div className="space-y-2">
                        {tasksForSelectedDate.map((task) => (
                          <div key={task.id} className="flex items-center p-3 bg-cutelist-dark/50 rounded-lg border border-cutelist-primary/20">
                            <div className="mr-3">
                              {task.type === 'todo' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                              {task.type === 'book' && <BookOpen className="h-5 w-5 text-blue-500" />}
                              {task.type === 'pomodoro' && <Clock className="h-5 w-5 text-purple-500" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{task.content}</p>
                              <p className="text-xs text-gray-400">
                                {format(parseISO(task.completed_at), 'h:mm a')}
                              </p>
                            </div>
                            <Badge variant="outline" className="ml-2 capitalize">
                              {task.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-400">No achievements for this date</p>
                        <Button 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => setSelectedDate(new Date())}
                        >
                          View Today
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Achievement Badges</CardTitle>
                    <CardDescription>
                      Unlock badges by completing various tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                      </div>
                    ) : (
                      renderAchievementBadges()
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Achievements;
