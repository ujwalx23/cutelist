
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Import our new components
import ActivityCalendar from "@/components/achievements/ActivityCalendar";
import StatisticsCard from "@/components/achievements/StatisticsCard";
import DailyAchievements from "@/components/achievements/DailyAchievements";
import AchievementBadgesList from "@/components/achievements/AchievementBadgesList";
import { useAchievements } from "@/components/achievements/useAchievements";

const Achievements = () => {
  const isMobile = useIsMobile();
  const {
    selectedDate,
    setSelectedDate,
    highlightedDates,
    tasksForSelectedDate,
    isLoading,
    totalCompleted,
    todosCompleted,
    booksCompleted,
    pomodoroCompleted,
    currentStreak,
    mostProductiveDay
  } = useAchievements();

  // Function to render components in the correct order based on device
  const renderComponents = () => {
    if (isMobile) {
      return (
        <div className="space-y-6">
          {/* Statistics first */}
          <StatisticsCard 
            isLoading={isLoading}
            totalCompleted={totalCompleted}
            todosCompleted={todosCompleted}
            booksCompleted={booksCompleted}
            pomodoroCompleted={pomodoroCompleted}
            mostProductiveDay={mostProductiveDay}
          />
          
          {/* Daily Achievements second */}
          <DailyAchievements 
            isLoading={isLoading}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            tasksForSelectedDate={tasksForSelectedDate}
          />
          
          {/* Activity Calendar third */}
          <ActivityCalendar 
            isLoading={isLoading} 
            selectedDate={selectedDate} 
            setSelectedDate={setSelectedDate} 
            highlightedDates={highlightedDates} 
          />
          
          {/* Achievement Badges last */}
          <div className="glass-card p-5 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Achievement Badges</h2>
            <p className="text-gray-400 mb-4">Unlock badges by completing various tasks</p>
            
            <AchievementBadgesList
              isLoading={isLoading}
              todosCompleted={todosCompleted}
              booksCompleted={booksCompleted}
              pomodoroCompleted={pomodoroCompleted}
              currentStreak={currentStreak}
            />
          </div>
        </div>
      );
    } else {
      // Desktop layout - grid with left and right columns
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Calendar & Stats */}
          <div className="space-y-6 order-2 lg:order-1">
            <ActivityCalendar 
              isLoading={isLoading} 
              selectedDate={selectedDate} 
              setSelectedDate={setSelectedDate} 
              highlightedDates={highlightedDates} 
            />
            
            <StatisticsCard 
              isLoading={isLoading}
              totalCompleted={totalCompleted}
              todosCompleted={todosCompleted}
              booksCompleted={booksCompleted}
              pomodoroCompleted={pomodoroCompleted}
              mostProductiveDay={mostProductiveDay}
            />
          </div>
          
          {/* Right Column - Daily Achievements & Badges */}
          <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
            <DailyAchievements 
              isLoading={isLoading}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              tasksForSelectedDate={tasksForSelectedDate}
            />
            
            <div className="glass-card p-5 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Achievement Badges</h2>
              <p className="text-gray-400 mb-4">Unlock badges by completing various tasks</p>
              
              <AchievementBadgesList
                isLoading={isLoading}
                todosCompleted={todosCompleted}
                booksCompleted={booksCompleted}
                pomodoroCompleted={pomodoroCompleted}
                currentStreak={currentStreak}
              />
            </div>
          </div>
        </div>
      );
    }
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
            
            {/* Render components in the correct order based on device */}
            {renderComponents()}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Achievements;
