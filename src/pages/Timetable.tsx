
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeSlot, Timetable } from "@/types/timetable";
import { Clock, Plus, Trash2, Save, Calendar } from "lucide-react";
import { generateId } from "@/lib/utils";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const colorOptions = [
  { name: "Purple", value: "#9b87f5" },
  { name: "Blue", value: "#87b1f5" },
  { name: "Green", value: "#87f5b9" },
  { name: "Yellow", value: "#f5e487" },
  { name: "Orange", value: "#f5b087" },
  { name: "Red", value: "#f58787" },
  { name: "Pink", value: "#f587e4" },
];

const TimetablePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [activeTimetable, setActiveTimetable] = useState<Timetable | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [title, setTitle] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Track online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Inform service worker we're online
      navigator.serviceWorker.controller?.postMessage({
        type: "ONLINE_STATUS_CHANGE",
        online: true
      });
      
      // Attempt to sync data
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
          registration.sync.register('sync-offline-data');
        });
      }
      
      // Refresh data from server
      if (user) {
        fetchTimetables();
      }
      
      toast({
        title: "You're back online!",
        description: "Your changes will now sync with the server.",
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      // Inform service worker we're offline
      navigator.serviceWorker.controller?.postMessage({
        type: "ONLINE_STATUS_CHANGE",
        online: false
      });
      
      toast({
        title: "You're offline",
        description: "Don't worry, changes will be saved locally and synced when you're back online.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [user]);

  // Fetch timetables
  useEffect(() => {
    if (user) {
      fetchTimetables();
    }
  }, [user]);

  const fetchTimetables = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('timetables')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Parse slots from JSON if needed
        const parsedTimetables = data.map(table => ({
          ...table,
          slots: Array.isArray(table.slots) ? table.slots : JSON.parse(table.slots || '[]')
        }));
        
        setTimetables(parsedTimetables);
      }
    } catch (error) {
      console.error("Error fetching timetables:", error);
      
      // If offline, try to get from IndexedDB
      if (!navigator.onLine && 'indexedDB' in window) {
        try {
          const dbRequest = indexedDB.open('offlineData', 1);
          
          dbRequest.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['timetables'], 'readonly');
            const store = transaction.objectStore('timetables');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => {
              if (getAllRequest.result) {
                setTimetables(getAllRequest.result);
              }
            };
          };
        } catch (dbError) {
          console.error("Error accessing offline data:", dbError);
        }
      }
      
      toast({
        title: "Failed to load timetables",
        description: navigator.onLine 
          ? "There was an error loading your timetables. Please try again." 
          : "You're currently offline. Some data may not be available.",
        variant: "destructive",
      });
    }
  };

  const handleAddSlot = () => {
    const newSlot: TimeSlot = {
      id: generateId(),
      day: "Monday",
      startTime: "09:00",
      endTime: "10:00",
      activity: "",
      description: "",
      color: colorOptions[0].value
    };
    
    setSlots([...slots, newSlot]);
  };

  const handleSlotChange = (id: string, field: keyof TimeSlot, value: string) => {
    setSlots(slots.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const handleRemoveSlot = (id: string) => {
    setSlots(slots.filter(slot => slot.id !== id));
  };

  const saveTimetable = async () => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please login to save your timetable.",
          variant: "destructive",
        });
        return;
      }
      
      if (!title.trim()) {
        toast({
          title: "Title required",
          description: "Please add a title for your timetable.",
          variant: "destructive",
        });
        return;
      }

      if (slots.length === 0) {
        toast({
          title: "No time slots",
          description: "Please add at least one time slot to your timetable.",
          variant: "destructive",
        });
        return;
      }

      // Check that all slots have activities
      const incompleteSlot = slots.find(slot => !slot.activity.trim());
      if (incompleteSlot) {
        toast({
          title: "Incomplete time slot",
          description: "Please add an activity name for all time slots.",
          variant: "destructive",
        });
        return;
      }

      const timetableData = {
        id: activeTimetable?.id || generateId(),
        user_id: user.id,
        title,
        slots,
        created_at: activeTimetable?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // If offline, store in IndexedDB
      if (!navigator.onLine) {
        if ('indexedDB' in window) {
          try {
            const dbRequest = indexedDB.open('offlineData', 1);
            
            dbRequest.onsuccess = (event) => {
              const db = event.target.result;
              const transaction = db.transaction(['timetables'], 'readwrite');
              const store = transaction.objectStore('timetables');
              store.put(timetableData);
              
              // Also add to pending changes
              const pendingTransaction = db.transaction(['pendingChanges'], 'readwrite');
              const pendingStore = pendingTransaction.objectStore('pendingChanges');
              pendingStore.add({
                id: Date.now().toString(),
                url: `${supabase.supabaseUrl}/rest/v1/timetables`,
                method: activeTimetable ? 'PATCH' : 'POST',
                body: timetableData,
                time: new Date().toISOString()
              });
              
              transaction.oncomplete = () => {
                // Update local state
                if (activeTimetable) {
                  setTimetables(timetables.map(t => t.id === activeTimetable.id ? timetableData : t));
                } else {
                  setTimetables([timetableData, ...timetables]);
                }
                
                resetForm();
                
                toast({
                  title: "Saved offline",
                  description: "Your timetable has been saved locally and will sync when you're online.",
                });
              };
            };
          } catch (dbError) {
            console.error("Error saving offline data:", dbError);
            toast({
              title: "Failed to save",
              description: "Could not save timetable offline. Please try again when online.",
              variant: "destructive",
            });
          }
        }
        return;
      }

      // If online, save to Supabase
      const { error } = activeTimetable 
        ? await supabase.from('timetables').update(timetableData).eq('id', timetableData.id)
        : await supabase.from('timetables').insert(timetableData);

      if (error) throw error;

      // Update local state
      if (activeTimetable) {
        setTimetables(timetables.map(t => t.id === activeTimetable.id ? timetableData : t));
      } else {
        setTimetables([timetableData, ...timetables]);
      }
      
      resetForm();
      
      toast({
        title: activeTimetable ? "Timetable updated" : "Timetable created",
        description: activeTimetable 
          ? "Your timetable has been updated successfully." 
          : "Your new timetable has been created successfully.",
      });
    } catch (error) {
      console.error("Error saving timetable:", error);
      toast({
        title: "Failed to save",
        description: "There was an error saving your timetable. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteTimetable = async (id: string) => {
    try {
      if (!user) return;

      // If offline, mark for deletion in IndexedDB
      if (!navigator.onLine) {
        if ('indexedDB' in window) {
          try {
            const dbRequest = indexedDB.open('offlineData', 1);
            
            dbRequest.onsuccess = (event) => {
              const db = event.target.result;
              
              // Add to pending changes for later deletion
              const pendingTransaction = db.transaction(['pendingChanges'], 'readwrite');
              const pendingStore = pendingTransaction.objectStore('pendingChanges');
              pendingStore.add({
                id: Date.now().toString(),
                url: `${supabase.supabaseUrl}/rest/v1/timetables?id=eq.${id}`,
                method: 'DELETE',
                body: {},
                time: new Date().toISOString()
              });
              
              pendingTransaction.oncomplete = () => {
                // Update local state
                setTimetables(timetables.filter(t => t.id !== id));
                
                toast({
                  title: "Marked for deletion",
                  description: "This timetable will be deleted when you're back online.",
                });
              };
            };
          } catch (dbError) {
            console.error("Error marking for deletion:", dbError);
          }
        }
        return;
      }

      // If online, delete from Supabase
      const { error } = await supabase
        .from('timetables')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setTimetables(timetables.filter(t => t.id !== id));
      
      toast({
        title: "Timetable deleted",
        description: "Your timetable has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting timetable:", error);
      toast({
        title: "Failed to delete",
        description: "There was an error deleting your timetable. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setTitle("");
    setSlots([]);
    setActiveTimetable(null);
    setIsCreating(false);
  };

  const editTimetable = (timetable: Timetable) => {
    setTitle(timetable.title);
    setSlots(timetable.slots);
    setActiveTimetable(timetable);
    setIsCreating(true);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-cutelist-dark">
        <Header />
        <main className="flex-1 container py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-4xl font-bold text-center mb-2 text-gradient">Timetable Maker</h1>
              <p className="text-center text-gray-400 mb-6">
                Create your personalized schedule with our enhanced timetable maker
                {!isOnline && " (Currently in offline mode)"}
              </p>
              
              {!isCreating ? (
                <div className="w-full">
                  <Button 
                    onClick={() => setIsCreating(true)} 
                    className="bg-cutelist-primary hover:bg-cutelist-secondary mb-6"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Create New Timetable
                  </Button>
                  
                  {timetables.length === 0 ? (
                    <div className="text-center p-8 glass-card rounded-xl">
                      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">No timetables yet</h3>
                      <p className="text-gray-400 mb-4">Create your first timetable to get started</p>
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {timetables.map(timetable => (
                        <Card key={timetable.id} className="glass-card overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-xl">{timetable.title}</CardTitle>
                            <CardDescription>
                              {timetable.slots.length} activities scheduled
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {timetable.slots.slice(0, 5).map(slot => (
                                <div 
                                  key={slot.id}
                                  className="flex items-center p-2 rounded-md"
                                  style={{ backgroundColor: `${slot.color}20` }}
                                >
                                  <div 
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: slot.color }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{slot.activity}</p>
                                    <p className="text-xs text-gray-400">
                                      {slot.day} • {slot.startTime}-{slot.endTime}
                                    </p>
                                  </div>
                                </div>
                              ))}
                              {timetable.slots.length > 5 && (
                                <p className="text-xs text-center text-gray-400">
                                  +{timetable.slots.length - 5} more activities
                                </p>
                              )}
                            </div>
                            <div className="flex mt-4 space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => editTimetable(timetable)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => deleteTimetable(timetable.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full glass-card p-6 rounded-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">
                      {activeTimetable ? 'Edit Timetable' : 'Create New Timetable'}
                    </h2>
                    <Button 
                      variant="outline" 
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="title">Timetable Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g. Spring Semester 2025"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-cutelist-dark/50 border-cutelist-primary/30 mt-1"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Time Slots</Label>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleAddSlot}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Slot
                        </Button>
                      </div>
                      
                      <div className="space-y-4 max-h-[400px] overflow-y-auto p-2">
                        {slots.length === 0 && (
                          <div className="text-center p-6">
                            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-400">
                              No time slots yet. Click "Add Slot" to create your first activity.
                            </p>
                          </div>
                        )}
                        
                        {slots.map((slot, index) => (
                          <Card key={slot.id} className="bg-cutelist-dark/30 border-cutelist-primary/20">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between">
                                <CardTitle className="text-base flex items-center">
                                  <div 
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: slot.color }}
                                  />
                                  Slot {index + 1}
                                </CardTitle>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleRemoveSlot(slot.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-400" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <Label htmlFor={`activity-${slot.id}`}>Activity</Label>
                                  <Input
                                    id={`activity-${slot.id}`}
                                    placeholder="e.g. Math Class"
                                    value={slot.activity}
                                    onChange={(e) => handleSlotChange(slot.id, 'activity', e.target.value)}
                                    className="bg-cutelist-dark/50 border-cutelist-primary/30 mt-1"
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor={`day-${slot.id}`}>Day</Label>
                                  <Select
                                    value={slot.day}
                                    onValueChange={(value) => handleSlotChange(slot.id, 'day', value)}
                                  >
                                    <SelectTrigger className="bg-cutelist-dark/50 border-cutelist-primary/30 mt-1">
                                      <SelectValue placeholder="Select day" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {daysOfWeek.map(day => (
                                        <SelectItem key={day} value={day}>{day}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <Label htmlFor={`start-${slot.id}`}>Start Time</Label>
                                  <Input
                                    id={`start-${slot.id}`}
                                    type="time"
                                    value={slot.startTime}
                                    onChange={(e) => handleSlotChange(slot.id, 'startTime', e.target.value)}
                                    className="bg-cutelist-dark/50 border-cutelist-primary/30 mt-1"
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor={`end-${slot.id}`}>End Time</Label>
                                  <Input
                                    id={`end-${slot.id}`}
                                    type="time"
                                    value={slot.endTime}
                                    onChange={(e) => handleSlotChange(slot.id, 'endTime', e.target.value)}
                                    className="bg-cutelist-dark/50 border-cutelist-primary/30 mt-1"
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor={`color-${slot.id}`}>Color</Label>
                                  <Select
                                    value={slot.color}
                                    onValueChange={(value) => handleSlotChange(slot.id, 'color', value)}
                                  >
                                    <SelectTrigger className="bg-cutelist-dark/50 border-cutelist-primary/30 mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {colorOptions.map(color => (
                                        <SelectItem key={color.value} value={color.value}>
                                          <div className="flex items-center">
                                            <div 
                                              className="w-4 h-4 rounded-full mr-2"
                                              style={{ backgroundColor: color.value }}
                                            />
                                            {color.name}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="md:col-span-2">
                                  <Label htmlFor={`description-${slot.id}`}>Description (optional)</Label>
                                  <Textarea
                                    id={`description-${slot.id}`}
                                    placeholder="Add notes about this activity"
                                    value={slot.description || ''}
                                    onChange={(e) => handleSlotChange(slot.id, 'description', e.target.value)}
                                    className="bg-cutelist-dark/50 border-cutelist-primary/30 mt-1 resize-none"
                                    rows={2}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={saveTimetable} 
                        disabled={!title.trim() || slots.length === 0}
                        className="bg-cutelist-primary hover:bg-cutelist-secondary"
                      >
                        <Save className="h-4 w-4 mr-2" /> 
                        {activeTimetable ? 'Update Timetable' : 'Save Timetable'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default TimetablePage;
