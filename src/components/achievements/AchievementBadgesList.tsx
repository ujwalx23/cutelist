
import { BookOpen, CalendarCheck2, CheckCircle2, Star, Clock } from "lucide-react";
import AchievementBadge from "./AchievementBadge";
import { Skeleton } from "@/components/ui/skeleton";

interface AchievementBadgesListProps {
  isLoading: boolean;
  todosCompleted: number;
  booksCompleted: number;
  currentStreak: number;
}

const AchievementBadgesList = ({
  isLoading,
  todosCompleted,
  booksCompleted,
  currentStreak
}: AchievementBadgesListProps) => {
  
  const achievements = [
    { id: 1, name: "First Task", description: "Completed your first task", unlocked: todosCompleted >= 1, icon: <CheckCircle2 className="h-5 w-5" /> },
    { id: 2, name: "Read 3 Books", description: "Completed reading 3 books", unlocked: booksCompleted >= 3, icon: <BookOpen className="h-5 w-5" /> },
    { id: 3, name: "Completed 100 Tasks", description: "Completed 100 tasks", unlocked: todosCompleted >= 100, icon: <CheckCircle2 className="h-5 w-5" /> },
    { id: 4, name: "7-Day Streak", description: "Completed tasks for 7 consecutive days", unlocked: currentStreak >= 7, icon: <CalendarCheck2 className="h-5 w-5" /> },
    { id: 5, name: "30-Day Streak", description: "Completed tasks for 30 consecutive days", unlocked: currentStreak >= 30, icon: <Star className="h-5 w-5" /> },
  ];
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {achievements.map(achievement => (
        <AchievementBadge 
          key={achievement.id}
          name={achievement.name}
          description={achievement.description}
          unlocked={achievement.unlocked}
          icon={achievement.icon}
        />
      ))}
    </div>
  );
};

export default AchievementBadgesList;
