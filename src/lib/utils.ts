import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Returns a date string like "2026-04-21" for use as a daily seed. */
export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns a 0-based index for "today" suitable for picking from an array. */
export function dailyIndex(arrayLength: number): number {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = +d - +start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return dayOfYear % arrayLength;
}
