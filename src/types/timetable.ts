
// Define interfaces for TimeSlot and Timetable
export interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  activity: string;
  description?: string;
  color?: string;
}

export interface Timetable {
  id: string;
  user_id: string;
  title: string;
  slots: TimeSlot[];
  created_at: string;
  updated_at: string;
}
