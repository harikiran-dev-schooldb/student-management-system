import { format } from "date-fns";

export interface Event {
  id: number;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  classId: number | null;
}

interface EventListProps {
  events: Event[];
  dateParam?: string;
}

const EventList = ({ events, dateParam }: EventListProps) => {
  const selectedDate = dateParam ? new Date(dateParam) : null;

  const filteredEvents = selectedDate
    ? events.filter((event) => {
        const d = new Date(event.startTime);
        return (
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate()
        );
      })
    : events;

  if (filteredEvents.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        No events for the selected date
      </div>
    );
  }

  return (
    <>
      {filteredEvents.map((event) => (
        <div
          key={event.id}
          className="p-5 rounded-md border-t-4 border-gray-200 dark:border-gray-700 odd:border-t-LamaSky even:border-t-LamaPurple bg-white dark:bg-darkMode"
        >
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-black dark:text-black">
              {event.title}
            </h1>
            <span className="text-xs text-black dark:text-black">
              {format(new Date(event.startTime), "HH:mm")}
            </span>
          </div>

          <p className="mt-2 text-sm text-black dark:text-black dark:bg-darkMode">
            {event.description}
          </p>
        </div>
      ))}
    </>
  );
};

export default EventList;
