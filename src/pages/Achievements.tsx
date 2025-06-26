
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DailyAchievements } from "@/components/achievements/DailyAchievements";
import { StatisticsCard } from "@/components/achievements/StatisticsCard";
import { AchievementBadgesList } from "@/components/achievements/AchievementBadgesList";
import { ActivityCalendar } from "@/components/achievements/ActivityCalendar";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const Achievements = () => {
  const { user } = useAuth();

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <main className="flex-1 container py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 text-gradient">
                Achievements & Progress
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Track your productivity journey and celebrate your accomplishments
              </p>
            </div>

            {!user && (
              <Card className="glass-card mb-8">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    Sign in to Track Your Progress
                  </h3>
                  <p className="text-gray-400">
                    Connect your account to start tracking achievements, view statistics, and monitor your productivity journey. 
                    Explore what's available below!
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <DailyAchievements />
                <ActivityCalendar />
              </div>
              
              <div className="space-y-6">
                <StatisticsCard />
                <AchievementBadgesList />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Achievements;
