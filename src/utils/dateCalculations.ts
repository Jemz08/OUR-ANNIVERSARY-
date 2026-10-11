import { TimeBreakdown } from '../types';

/**
 * Calculates live time elapsed since a starting date.
 */
export function calculateTimeElapsed(startDateStr: string, now: Date = new Date()): TimeBreakdown {
  const [year, month, day] = startDateStr.split('-').map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);

  const diffMs = Math.max(0, now.getTime() - start.getTime());

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  // Exact calendar years, months, days
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    // Days in previous month
    const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  return {
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    hours,
    minutes,
    seconds,
  };
}

/**
 * Calculates countdown and details for the upcoming October 26 anniversary.
 */
export function getUpcomingAnniversary(officialDateStr: string, now: Date = new Date()) {
  const currentYear = now.getFullYear();
  const [startYear] = officialDateStr.split('-').map(Number);

  // Anniversary date in the current calendar year (October 26)
  let targetAnniversary = new Date(currentYear, 9, 26, 0, 0, 0, 0); // Month 9 is October (0-indexed)

  // End of anniversary day
  const endOfAnniversary = new Date(currentYear, 9, 26, 23, 59, 59, 999);

  // If today is October 26
  const isToday =
    now.getMonth() === 9 && now.getDate() === 26;

  let anniversaryYear = currentYear;

  // If this year's anniversary has already passed
  if (now.getTime() > endOfAnniversary.getTime()) {
    targetAnniversary = new Date(currentYear + 1, 9, 26, 0, 0, 0, 0);
    anniversaryYear = currentYear + 1;
  }

  const diffMs = targetAnniversary.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const hoursLeft = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const minutesLeft = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
  const secondsLeft = Math.max(0, Math.floor((diffMs % (1000 * 60)) / 1000));

  const ordinalNumber = anniversaryYear - startYear;

  function getOrdinal(n: number) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  return {
    isToday,
    targetDate: targetAnniversary,
    anniversaryYear,
    ordinalText: getOrdinal(ordinalNumber),
    ordinalNumber,
    daysLeft,
    hoursLeft,
    minutesLeft,
    secondsLeft,
  };
}

/**
 * Formats a YYYY-MM-DD date string to a human-readable format.
 */
export function formatDatePretty(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
