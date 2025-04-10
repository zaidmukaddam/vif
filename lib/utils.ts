import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Create dates in the user's timezone using a more reliable method
export function getDateInTimezone(timezone: string) {
  // Get current date/time string in the user's timezone
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

  // Format date in timezone
  const dateTimeString = new Intl.DateTimeFormat('en-US', options).format(now);

  // Parse components from formatted string (formats like "04/10/2024, 00:30:00")
  const [datePart] = dateTimeString.split(', ');
  const [month, day, year] = datePart.split('/').map(num => parseInt(num, 10));

  // Create a date string in YYYY-MM-DD format
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}