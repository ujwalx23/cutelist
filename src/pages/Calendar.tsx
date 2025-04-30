
import { useState } from "react";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateId } from "@/lib/utils";
import { CalendarDays, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
}

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([
    { 
      id: "event1", 
      title: "Team Meeting", 
      description: "Weekly team sync",
      date: new Date(new Date().setDate(new Date().getDate() + 1))
    },
    { 
      id: "event2", 
      title: "Doctor's Appointment", 
      description: "Annual checkup",
      date: new Date(new Date().setDate(new Date().getDate() + 3))
    },
  ]);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const { user } = useAuth();

  const addEvent = () => {
    if (!date || !newEventTitle) return;
    
    const newEvent: Event = {
      id: generateId(),
      title: newEventTitle,
      description: newEventDescription,
      date: date,
    };
    
    setEvents([...events, newEvent]);
    setNewEventTitle("");
    setNewEventDescription("");
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
  };

  // Filter events for the selected date
  const selectedDateEvents = events.filter(
    (event) => date && event.date.toDateString() === date.toDateString()
  );

  // Filter events for today and upcoming
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayEvents = events.filter(
    (event) => event.date.toDateString() === today.toDateString()
  );
  
  const upcomingEvents = events.filter(
    (event) => event.date > today
  ).sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <main className="flex-1 container py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-4xl font-bold text-center mb-2 text-gradient">
                Calendar
              </h1>
              <p className="text-center text-gray-400 mb-6">
                Plan your days with our cute calendar
              </p>

              <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="glass-card p-6 rounded-xl">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md pointer-events-auto"
                  />
                </div>

                <div className="lg:col-span-2">
                  <Tabs defaultValue="day" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="day">Selected Day</TabsTrigger>
                      <TabsTrigger value="today">Today</TabsTrigger>
                      <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="day" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                          {date ? format(date, "PPPP") : "Select a date"}
                        </h2>
                      </div>
                      
                      {user && (
                        <Card className="bg-cutelist-dark/30 backdrop-blur-sm border-cutelist-primary/20">
                          <CardHeader>
                            <CardTitle className="text-lg">Add New Event</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <Input
                                placeholder="Event title"
                                value={newEventTitle}
                                onChange={(e) => setNewEventTitle(e.target.value)}
                                className="bg-cutelist-dark/50 border-cutelist-primary/30"
                              />
                              <Input
                                placeholder="Description (optional)"
                                value={newEventDescription}
                                onChange={(e) => setNewEventDescription(e.target.value)}
                                className="bg-cutelist-dark/50 border-cutelist-primary/30"
                              />
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              onClick={addEvent} 
                              className="bg-cutelist-primary hover:bg-cutelist-secondary"
                              disabled={!date || !newEventTitle}
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add Event
                            </Button>
                          </CardFooter>
                        </Card>
                      )}
                      
                      {selectedDateEvents.length > 0 ? (
                        <div className="space-y-4">
                          {selectedDateEvents.map((event) => (
                            <Card key={event.id} className="bg-cutelist-dark/30 backdrop-blur-sm border-cutelist-primary/20">
                              <CardHeader className="pb-2 flex flex-row justify-between items-start">
                                <div>
                                  <CardTitle>{event.title}</CardTitle>
                                  <CardDescription>{format(event.date, "p")}</CardDescription>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => removeEvent(event.id)}
                                >
                                  <X className="h-4 w-4 text-red-400" />
                                </Button>
                              </CardHeader>
                              {event.description && (
                                <CardContent className="pt-2">
                                  <p className="text-gray-400">{event.description}</p>
                                </CardContent>
                              )}
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <div className="flex justify-center mb-4">
                            <CalendarDays className="h-12 w-12 text-cutelist-primary opacity-50" />
                          </div>
                          <h3 className="text-lg font-medium text-cutelist-primary mb-2">No events for this day</h3>
                          {user ? (
                            <p className="text-gray-400">Add an event to get started</p>
                          ) : (
                            <p className="text-gray-400">Sign in to add events</p>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="today" className="space-y-4">
                      <h2 className="text-xl font-semibold">Today's Events</h2>
                      {todayEvents.length > 0 ? (
                        <div className="space-y-4">
                          {todayEvents.map((event) => (
                            <Card key={event.id} className="bg-cutelist-dark/30 backdrop-blur-sm border-cutelist-primary/20">
                              <CardHeader className="pb-2 flex flex-row justify-between items-start">
                                <div>
                                  <CardTitle>{event.title}</CardTitle>
                                  <CardDescription>{format(event.date, "p")}</CardDescription>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => removeEvent(event.id)}
                                >
                                  <X className="h-4 w-4 text-red-400" />
                                </Button>
                              </CardHeader>
                              {event.description && (
                                <CardContent className="pt-2">
                                  <p className="text-gray-400">{event.description}</p>
                                </CardContent>
                              )}
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <div className="flex justify-center mb-4">
                            <CalendarDays className="h-12 w-12 text-cutelist-primary opacity-50" />
                          </div>
                          <h3 className="text-lg font-medium text-cutelist-primary mb-2">No events for today</h3>
                          <p className="text-gray-400">Enjoy your free day!</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="upcoming" className="space-y-4">
                      <h2 className="text-xl font-semibold">Upcoming Events</h2>
                      {upcomingEvents.length > 0 ? (
                        <div className="space-y-4">
                          {upcomingEvents.map((event) => (
                            <Card key={event.id} className="bg-cutelist-dark/30 backdrop-blur-sm border-cutelist-primary/20">
                              <CardHeader className="pb-2 flex flex-row justify-between items-start">
                                <div>
                                  <CardTitle>{event.title}</CardTitle>
                                  <CardDescription>{format(event.date, "PPP")}</CardDescription>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => removeEvent(event.id)}
                                >
                                  <X className="h-4 w-4 text-red-400" />
                                </Button>
                              </CardHeader>
                              {event.description && (
                                <CardContent className="pt-2">
                                  <p className="text-gray-400">{event.description}</p>
                                </CardContent>
                              )}
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <div className="flex justify-center mb-4">
                            <CalendarDays className="h-12 w-12 text-cutelist-primary opacity-50" />
                          </div>
                          <h3 className="text-lg font-medium text-cutelist-primary mb-2">No upcoming events</h3>
                          <p className="text-gray-400">Your schedule is clear!</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

// Export the component as default
export default CalendarPage;
