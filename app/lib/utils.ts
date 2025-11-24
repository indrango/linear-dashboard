import { type ClassValue, clsx } from "clsx";

/**
 * Utility function to merge class names using clsx
 * @param inputs - Class values to merge (strings, objects, arrays)
 * @returns Merged class name string
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Formats a date string to a readable date format
 * @param dateString - ISO date string or null
 * @returns Formatted date string (e.g., "Jan 15, 2024") or "-" if null
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a date string to a readable date and time format
 * @param dateString - ISO date string or null
 * @returns Formatted date and time string (e.g., "Jan 15, 2024, 10:30 AM") or "-" if null
 */
export function formatDateTime(dateString: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Rounds a number to two decimal places
 * @param value - Number to round or null
 * @returns Rounded number or null if input is null
 */
export function roundToTwoDecimals(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}


