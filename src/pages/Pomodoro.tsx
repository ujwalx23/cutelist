
import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, RotateCcw, Bell, CheckCircle2, History, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface PomodoroSession {
  id: string;
  user_id: string;
  duration: number;
  type: "work" | "shortBreak" | "longBreak";
  completed_at: string;
}

const Pomodoro = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"work" | "shortBreak" | "longBreak">("work");
  const [cycle, setCycle] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch completed sessions
  const { data: completedSessions } = useQuery({
    queryKey: ['pomodoro-sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // In a real implementation, we would fetch from Supabase
      // This is a placeholder for demonstration
      return []; // Return empty array by default
    },
    enabled: !!user && showHistory
  });

  // Save completed session
  const saveSessionMutation = useMutation({
    mutationFn: async (sessionData: Omit<PomodoroSession, "id" | "user_id">) => {
      if (!user) throw new Error("User not authenticated");
      
      const newSession = {
        ...sessionData,
        user_id: user.id,
      };
      
      // In a real implementation, we would save to Supabase
      console.log("Would save pomodoro session:", newSession);
      
      return {
        ...newSession,
        id: Date.now().toString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['pomodoro-sessions']});
      setSessionsCompleted(prev => prev + 1);
    }
  });

  useEffect(() => {
    audioRef.current = new Audio("/lovable-uploads/cd11890b-c610-464d-b694-2b59ee09a21d.png");
    
    // Register Pomodoro session completion with the browser
    if ('serviceWorker' in navigator && 'Notification' in window) {
      // Request notification permission
      Notification.requestPermission();
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer completed
            clearInterval(timerRef.current!);
            setIsActive(false);
            
            // Play sound
            if (audioRef.current) {
              audioRef.current.play().catch(e => console.log("Audio play prevented by browser"));
            }
            
            // Show notification
            if ('Notification' in window && Notification.permission === 'granted') {
              const title = mode === 'work' 
                ? 'Work session completed!' 
                : mode === 'shortBreak'
                  ? 'Break time over!'
                  : 'Long break finished!';
                  
              const body = mode === 'work'
                ? 'Great job! Take a break now.'
                : 'Ready to get back to work?';
                
              new Notification(title, { body });
            }
            
            // Save completed session if it was a work session
            if (mode === "work" && user) {
              saveSessionMutation.mutate({
                duration: 25,
                type: "work",
                completed_at: new Date().toISOString(),
              });
            }
            
            // Switch modes
            if (mode === "work") {
              const newCycle = cycle + 1;
              setCycle(newCycle);
              
              if (newCycle % 4 === 0) {
                // After 4 work sessions, take a long break
                setMode("longBreak");
                setMinutes(15);
              } else {
                // Otherwise take a short break
                setMode("shortBreak");
                setMinutes(5);
              }
              
              toast({
                title: "Session completed!",
                description: `Time for a ${newCycle % 4 === 0 ? 'long' : 'short'} break.`,
              });
            } else {
              // After break, go back to work
              setMode("work");
              setMinutes(25);
              
              toast({
                title: "Break time over",
                description: "Let's get back to work!",
              });
            }
            
            setSeconds(0);
            return;
          }
          
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, minutes, seconds, mode, cycle, user, toast, saveSessionMutation]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    
    if (mode === "work") {
      setMinutes(25);
    } else if (mode === "shortBreak") {
      setMinutes(5);
    } else {
      setMinutes(15);
    }
    
    setSeconds(0);
  };

  const handleModeChange = (newMode: "work" | "shortBreak" | "longBreak") => {
    setIsActive(false);
    setMode(newMode);
    
    if (newMode === "work") {
      setMinutes(25);
    } else if (newMode === "shortBreak") {
      setMinutes(5);
    } else {
      setMinutes(15);
    }
    
    setSeconds(0);
  };
  
  const formatTime = (mins: number, secs: number) => {
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <main className="flex-1 container flex flex-col items-center py-8 md:py-12 px-4">
          <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-lg'} mx-auto`}>
            <div className="flex flex-col items-center">
              <h1 className="text-4xl font-bold text-center mb-2 text-gradient">
                Pomodoro Timer
              </h1>
              <p className="text-center text-gray-400 mb-6">
                Boost your productivity with the Pomodoro technique
              </p>
              
              <Card className="w-full glass-card mb-6">
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="flex justify-center gap-2 mb-8 w-full">
                    <Button
                      onClick={() => handleModeChange("work")}
                      variant={mode === "work" ? "default" : "outline"}
                      size={isMobile ? "sm" : "default"}
                      className={mode === "work" ? "bg-cutelist-primary hover:bg-cutelist-secondary" : ""}
                    >
                      Work
                    </Button>
                    <Button
                      onClick={() => handleModeChange("shortBreak")}
                      variant={mode === "shortBreak" ? "default" : "outline"}
                      size={isMobile ? "sm" : "default"}
                      className={mode === "shortBreak" ? "bg-cutelist-accent hover:bg-cutelist-accent/80" : ""}
                    >
                      Short Break
                    </Button>
                    <Button
                      onClick={() => handleModeChange("longBreak")}
                      variant={mode === "longBreak" ? "default" : "outline"}
                      size={isMobile ? "sm" : "default"}
                      className={mode === "longBreak" ? "bg-cutelist-primary hover:bg-cutelist-secondary" : ""}
                    >
                      Long Break
                    </Button>
                  </div>
                  
                  <div 
                    className={`text-6xl md:text-7xl font-bold mb-8 p-6 rounded-full ${
                      mode === "work" 
                        ? "text-cutelist-primary" 
                        : mode === "shortBreak" 
                          ? "text-cutelist-accent" 
                          : "text-cutelist-primary"
                    }`}
                  >
                    {formatTime(minutes, seconds)}
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <Button 
                      size="lg" 
                      onClick={toggleTimer}
                      className={isActive 
                        ? "bg-red-500 hover:bg-red-600" 
                        : "bg-cutelist-primary hover:bg-cutelist-secondary"
                      }
                    >
                      {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                      {isActive ? "Pause" : "Start"}
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      onClick={resetTimer}
                    >
                      <RotateCcw className="mr-2" /> Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex flex-col md:flex-row justify-between items-center w-full mb-6">
                <div className="text-center md:text-left mb-4 md:mb-0">
                  <h3 className="font-semibold">Current Cycle: {Math.floor(cycle / 4) + 1}</h3>
                  <p className="text-sm text-gray-400">Session {(cycle % 4) + 1} of 4</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {user && sessionsCompleted > 0 && (
                    <Badge variant="outline" className="bg-cutelist-primary/10 border-cutelist-primary/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> 
                      {sessionsCompleted} sessions completed today
                    </Badge>
                  )}
                  {user && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowHistory(!showHistory)}
                      className="text-gray-400 hover:text-white"
                    >
                      <History className="h-4 w-4 mr-1" /> 
                      {showHistory ? "Hide History" : "Show History"}
                    </Button>
                  )}
                </div>
              </div>
              
              {showHistory && (
                <Card className="w-full glass-card mb-6">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-3">Session History</h3>
                    {completedSessions && completedSessions.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {completedSessions.map((session: PomodoroSession) => (
                          <div 
                            key={session.id}
                            className="flex items-center justify-between p-2 bg-cutelist-dark/50 rounded border border-cutelist-primary/10"
                          >
                            <div className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                              <div>
                                <p className="text-sm">
                                  {session.type === "work" ? "Work Session" : session.type === "shortBreak" ? "Short Break" : "Long Break"}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {format(new Date(session.completed_at), "MMM d, h:mm a")}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {session.duration} min
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-3 text-gray-400">
                        <p>No completed sessions yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              <div className="glass-card p-5 rounded-xl w-full">
                <h3 className="text-xl font-semibold mb-2 text-gradient">How It Works</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-400">
                  <li>Work for 25 minutes (one "Pomodoro")</li>
                  <li>Take a 5-minute break</li>
                  <li>After 4 Pomodoros, take a longer 15-minute break</li>
                  <li>We’re all just trying to do our best</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Pomodoro;
