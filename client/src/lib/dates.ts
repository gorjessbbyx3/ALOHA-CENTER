import { format, parseISO, addMinutes, isSameDay, isSameMonth, differenceInCalendarDays } from "date-fns";

/**
 * Formats a date string into a readable format
 * @param date ISO date string
 * @param formatString Format string for date-fns
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, formatString: string = "MMMM d, yyyy"): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatString);
}

/**
 * Calculates the end time of an appointment based on start time and duration
 * @param startTime Start time string in HH:MM format
 * @param durationMinutes Duration in minutes
 * @returns End time string in HH:MM format
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = addMinutes(startDate, durationMinutes);
  return format(endDate, "HH:mm");
}

/**
 * Formats a time string in a more readable format (e.g., "9:00 AM")
 * @param time Time string in HH:MM format
 * @returns Formatted time string
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return format(date, "h:mm a");
}

/**
 * Formats a date and time for display
 * @param date Date string or Date object
 * @param time Time string in HH:MM format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | Date, time: string): string {
  const dateString = formatDate(date);
  const timeString = formatTime(time);
  return `${dateString} at ${timeString}`;
}

/**
 * Returns a human-readable relative date description
 * @param date Date to compare
 * @param baseDate Base date to compare against (defaults to today)
 * @returns String like "Today", "Tomorrow", "Yesterday", or formatted date
 */
export function getRelativeDay(date: Date, baseDate: Date = new Date()): string {
  if (isSameDay(date, baseDate)) {
    return "Today";
  }
  
  const diffDays = differenceInCalendarDays(date, baseDate);
  
  if (diffDays === 1) {
    return "Tomorrow";
  }
  
  if (diffDays === -1) {
    return "Yesterday";
  }
  
  if (isSameMonth(date, baseDate)) {
    return format(date, "EEEE, do");
  }
  
  return format(date, "MMMM d, yyyy");
}

/**
 * Generate an array of time slots
 * @param interval Interval in minutes between slots
 * @param startHour Starting hour in 24-hour format
 * @param endHour Ending hour in 24-hour format
 * @returns Array of time strings in HH:MM format
 */
export function generateTimeSlots(
  interval: number = 30,
  startHour: number = 8,
  endHour: number = 17
): string[] {
  const slots: string[] = [];
  const now = new Date();
  now.setHours(startHour, 0, 0, 0);
  const end = new Date();
  end.setHours(endHour, 0, 0, 0);
  
  while (now <= end) {
    slots.push(format(now, "HH:mm"));
    now.setMinutes(now.getMinutes() + interval);
  }
  
  return slots;
}
