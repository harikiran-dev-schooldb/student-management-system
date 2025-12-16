import Image from "next/image";
import EventCalendar from "./EventCalendar";
import EventList from "./EventList";

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
    <div className="p-4 bg-white dark:bg-gray-900 rounded-md">
      <EventCalendar />

      <div className="flex items-center justify-between">
        <h1 className="my-4 text-xl font-semibold text-black dark:text-gray-300">
          Events
        </h1>
        <Image src="/moreDark.png" alt="More" width={20} height={20} />
      </div>

      <div className="flex flex-col gap-4">
        <EventList events={events} dateParam={dateParam} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;
