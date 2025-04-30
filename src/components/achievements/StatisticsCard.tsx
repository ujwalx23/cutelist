
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface StatisticsCardProps {
  isLoading: boolean;
  totalCompleted: number;
  todosCompleted: number;
  booksCompleted: number;
  pomodoroCompleted: number;
  mostProductiveDay: { date: Date; count: number } | null;
}

const StatisticsCard = ({
  isLoading,
  totalCompleted,
  todosCompleted,
  booksCompleted,
  pomodoroCompleted,
  mostProductiveDay
}: StatisticsCardProps) => {
  return (
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
  );
};

export default StatisticsCard;
