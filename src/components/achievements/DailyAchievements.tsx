
import { format, parseISO, isSameDay } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, CheckCircle2, BookOpen, Clock } from "lucide-react";

interface CompletedTask {
  id: string;
  content: string;
  completed_at: string;
  type: "todo" | "book" | "pomodoro";
}

interface DailyAchievementsProps {
  isLoading: boolean;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date) => void;
  tasksForSelectedDate: CompletedTask[] | undefined;
}

const DailyAchievements = ({
  isLoading,
  selectedDate,
  setSelectedDate,
  tasksForSelectedDate
}: DailyAchievementsProps) => {
  return (
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
  );
};

export default DailyAchievements;
