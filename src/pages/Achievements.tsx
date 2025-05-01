import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Badge } from "@/components/ui/badge";
import { Trophy, MessageCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button"; 

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

  const openChatbot = () => {
    window.open("https://cdn.botpress.cloud/webchat/v2.4/shareable.html?configUrl=https://files.bpcontent.cloud/2025/04/30/11/20250430112856-NCNEDXT4.json", "_blank");
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
              {/* Mobile-friendly order */}
              {isMobile ? (
                <>
                  {/* Mobile Order: Stats, Daily, Calendar, Badges */}
                  <div className="space-y-6 order-1">
                    <StatisticsCard 
                      isLoading={isLoading}
                      totalCompleted={totalCompleted}
                      todosCompleted={todosCompleted}
                      booksCompleted={booksCompleted}
                      pomodoroCompleted={pomodoroCompleted}
                      mostProductiveDay={mostProductiveDay}
                      currentStreak={currentStreak}
                    />
                  </div>
                  
                  <div className="lg:col-span-2 space-y-6 order-2">
                    <DailyAchievements 
                      isLoading={isLoading}
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                      tasksForSelectedDate={tasksForSelectedDate}
                    />
                  </div>
                  
                  <div className="space-y-6 order-3">
                    <ActivityCalendar 
                      isLoading={isLoading} 
                      selectedDate={selectedDate} 
                      setSelectedDate={setSelectedDate} 
                      highlightedDates={highlightedDates} 
                    />
                  </div>
                  
                  <div className="lg:col-span-3 order-4">
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
                </>
              ) : (
                <>
                  {/* Desktop layout - unchanged */}
                  <div className="space-y-6 order-1">
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
                      currentStreak={currentStreak}
                    />
                  </div>
                  
                  <div className="lg:col-span-2 space-y-6 order-2">
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
                </>
              )}
            </div>
          </div>
        </main>
        
        {/* Chatbot button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={openChatbot}
            className="rounded-full bg-cutelist-primary hover:bg-cutelist-secondary w-12 h-12 flex items-center justify-center shadow-lg"
            aria-label="Chat with us"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Achievements;
