// Utility functions for formatting data

import { format, parseISO } from 'date-fns';

export function formatDate(dateString: string, timeString?: string): string {
  try {
    const date = parseISO(dateString);
    if (timeString) {
      return format(date, 'MMM dd, yyyy HH:mm');
    }
    return format(date, 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
}

export function formatRaceTime(timeString?: string): string {
  if (!timeString) return '-';
  return timeString;
}

export function formatStatus(status: string): string {
  if (status.includes('+')) return status;
  if (status === 'Finished') return '✓';
  if (status.includes('Lap')) return status;

  // Shortened common statuses
  const statusMap: Record<string, string> = {
    'Collision': 'Crash',
    'Accident': 'Crash',
    'Spun off': 'Spin',
    'Retired': 'DNF',
    'Engine': 'Engine',
    'Gearbox': 'Gearbox',
    'Transmission': 'Trans',
    'Brakes': 'Brakes',
    'Electrical': 'Electrical',
    'Hydraulics': 'Hydraulics',
    'Disqualified': 'DSQ',
  };

  for (const [key, value] of Object.entries(statusMap)) {
    if (status.includes(key)) return value;
  }

  return status;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 1) + '…';
}

export function padRight(text: string, length: number): string {
  return text.padEnd(length, ' ');
}

export function padLeft(text: string, length: number): string {
  return text.padStart(length, ' ');
}

export function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
