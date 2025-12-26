import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// src/lib/utils.ts
export const currentWorkWeek = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);

  const diff = dayOfWeek === 0 ? 1 : 1 - dayOfWeek; // Sunday → Monday
  startOfWeek.setDate(today.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  return startOfWeek;
};

export function adjustScheduleToCurrentWeek(
  data: { start: Date; end: Date; title: string }[]
) {
  const today = new Date();
  const currentDay = today.getDay();
  const diff = currentDay === 0 ? -6 : 1 - currentDay;

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  return data.map((event) => {
    const originalStart = new Date(event.start);
    const originalEnd = new Date(event.end);
    const dayOfWeek = originalStart.getDay();

    const start = new Date(startOfWeek);
    const end = new Date(startOfWeek);

    start.setDate(start.getDate() + dayOfWeek);
    start.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0);

    end.setDate(end.getDate() + dayOfWeek);
    end.setHours(originalEnd.getHours(), originalEnd.getMinutes(), 0, 0);

    return { title: event.title, start, end };
  });
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
