
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarCheck2 } from "lucide-react";
import { Date as DateType } from "date-fns";

interface ActivityCalendarProps {
  isLoading: boolean;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  highlightedDates: Date[];
}

const ActivityCalendar = ({
  isLoading,
  selectedDate,
  setSelectedDate,
  highlightedDates
}: ActivityCalendarProps) => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Calendar</CardTitle>
          <CalendarCheck2 className="h-5 w-5 text-cutelist-primary" />
        </div>
        <CardDescription>
          Days with completed tasks are highlighted
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : (
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full"
            modifiers={{
              highlighted: highlightedDates,
            }}
            modifiersStyles={{
              highlighted: {
                backgroundColor: "rgba(155, 135, 245, 0.2)",
                borderRadius: "100%",
              },
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityCalendar;
