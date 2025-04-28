import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Bell } from "lucide-react";

const Pomodoro = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"work" | "shortBreak" | "longBreak">("work");
  const [cycle, setCycle] = useState(0);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/lovable-uploads/cd11890b-c610-464d-b694-2b59ee09a21d.png");
    // Since we can't actually play a sound without user interaction in many browsers,
    // this is just for demonstration purposes
    
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
            } else {
              // After break, go back to work
              setMode("work");
              setMinutes(25);
            }
            
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
  }, [isActive, minutes, seconds, mode, cycle]);

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

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <main className="flex-1 container flex flex-col items-center justify-center py-12">
          <div className="w-full max-w-lg px-4">
            <div className="flex flex-col items-center">
              <h1 className="text-4xl font-bold text-center mb-2 text-gradient">
                Pomodoro Timer
              </h1>
              <p className="text-center text-gray-400 mb-8">
                Boost your productivity with the Pomodoro technique
              </p>
              
              <Card className="w-full glass-card mb-8">
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="flex justify-center gap-4 mb-8 w-full">
                    <Button
                      onClick={() => handleModeChange("work")}
                      variant={mode === "work" ? "default" : "outline"}
                      className={mode === "work" ? "bg-cutelist-primary hover:bg-cutelist-secondary" : ""}
                    >
                      Work
                    </Button>
                    <Button
                      onClick={() => handleModeChange("shortBreak")}
                      variant={mode === "shortBreak" ? "default" : "outline"}
                      className={mode === "shortBreak" ? "bg-cutelist-accent hover:bg-cutelist-accent/80" : ""}
                    >
                      Short Break
                    </Button>
                    <Button
                      onClick={() => handleModeChange("longBreak")}
                      variant={mode === "longBreak" ? "default" : "outline"}
                      className={mode === "longBreak" ? "bg-cutelist-primary hover:bg-cutelist-secondary" : ""}
                    >
                      Long Break
                    </Button>
                  </div>
                  
                  <div 
                    className={`text-7xl font-bold mb-8 p-8 rounded-full ${
                      mode === "work" 
                        ? "text-cutelist-primary" 
                        : mode === "shortBreak" 
                          ? "text-cutelist-accent" 
                          : "text-cutelist-primary"
                    }`}
                  >
                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
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
              
              <div className="text-center text-gray-400">
                <h3 className="font-semibold mb-2">Current Cycle: {Math.floor(cycle / 4) + 1}</h3>
                <p className="text-sm">Session {(cycle % 4) + 1} of 4</p>
              </div>
              
              <div className="mt-8 glass-card p-6 rounded-xl w-full max-w-md">
                <h3 className="text-xl font-semibold mb-2 text-gradient">How It Works</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-400">
                  <li>Work for 25 minutes (one "Pomodoro")</li>
                  <li>Take a 5-minute break</li>
                  <li>After 4 Pomodoros, take a longer 15-minute break</li>
                  <li>Repeat the cycle to maximize productivity</li>
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
