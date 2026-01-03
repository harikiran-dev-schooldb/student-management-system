import { ArrowRight } from "lucide-react";
import EventCalendar from "./EventCalendar";
import EventList from "./EventList";
import Link from "next/link";

export type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export interface Event {
  id: number;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  classId: number | null;
}

interface EventCalendarContainerProps {
  events: Event[];
  searchParams: SearchParams;
}

const EventCalendarContainer = ({
  events,
  searchParams,
}: EventCalendarContainerProps) => {
  const rawDate = searchParams.date;

  const dateParam =
    typeof rawDate === "string"
      ? rawDate
      : Array.isArray(rawDate)
      ? rawDate[0]
      : undefined;

  return (
    <div className="p-4 bg-white  rounded-md dark:bg-darkMode">
      <EventCalendar />

      <div className="flex items-center justify-between">
        <h1 className="my-4 text-xl font-semibold text-black dark:text-gray-300">
          Events
        </h1>
        <Link
          href="/list/messages"
          className="text-xs font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        <EventList events={events} dateParam={dateParam} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;
