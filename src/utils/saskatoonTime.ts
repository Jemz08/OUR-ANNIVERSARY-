/**
 * Utilities for Canada / Saskatoon (Saskatchewan) Timezone calculations
 * Saskatchewan is in the America/Regina timezone (CST, UTC-6 year-round, no DST).
 */

export const SECRET_PREVIEW_PASSWORD = 'Alburo.@james09955';
export const PREVIEW_STORAGE_KEY = 'us_forever_secret_preview_unlocked';

export interface SaskatoonTimeInfo {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hours: number;
  minutes: number;
  seconds: number;
  isOct26: boolean;
  isPastOrOnOct26: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  formattedSaskatoonTime: string;
  formattedTargetDate: string;
}

/**
 * Gets the current time in Saskatoon, SK, Canada (America/Regina timezone)
 * and calculates the exact countdown to October 26, 00:00:00 CST.
 */
export function getSaskatoonTimeInfo(now: Date = new Date()): SaskatoonTimeInfo {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Regina',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const getPart = (type: string) => {
      const p = parts.find((item) => item.type === type);
      return p ? parseInt(p.value, 10) : 0;
    };

    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');
    const hours = getPart('hour');
    const minutes = getPart('minute');
    const seconds = getPart('second');

    // Is it October 26 right now in Saskatoon?
    const isOct26 = month === 10 && day === 26;

    // Is it on or after October 26 in the current calendar year?
    const isPastOrOnOct26 = month > 10 || (month === 10 && day >= 26);

    // Target anniversary date: October 26 of current year (or next year if October 26 has fully passed)
    const targetYear = isPastOrOnOct26 && !isOct26 ? year + 1 : year;

    // Approximate UTC millisecond calculation for America/Regina (UTC-6)
    // Oct 26 00:00:00 Regina time is Oct 26 06:00:00 UTC
    const targetUtcMs = Date.UTC(targetYear, 9, 26, 6, 0, 0); // Month 9 is October (0-indexed)
    const nowUtcMs = now.getTime();
    const diffMs = Math.max(0, targetUtcMs - nowUtcMs);

    const daysRemaining = isOct26 ? 0 : Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hoursRemaining = isOct26 ? 0 : Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesRemaining = isOct26 ? 0 : Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secondsRemaining = isOct26 ? 0 : Math.floor((diffMs % (1000 * 60)) / 1000);

    // Formatted local Saskatoon display string
    const saskatoonDate = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Regina',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    }).format(now);

    return {
      year,
      month,
      day,
      hours,
      minutes,
      seconds,
      isOct26,
      isPastOrOnOct26,
      daysRemaining,
      hoursRemaining,
      minutesRemaining,
      secondsRemaining,
      formattedSaskatoonTime: saskatoonDate,
      formattedTargetDate: `October 26, ${targetYear}`,
    };
  } catch (err) {
    // Fallback if Intl timeZone fails
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const isOct26 = month === 10 && day === 26;
    return {
      year: now.getFullYear(),
      month,
      day,
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      isOct26,
      isPastOrOnOct26: month >= 10 && day >= 26,
      daysRemaining: isOct26 ? 0 : 12,
      hoursRemaining: 0,
      minutesRemaining: 0,
      secondsRemaining: 0,
      formattedSaskatoonTime: now.toLocaleString(),
      formattedTargetDate: `October 26, ${now.getFullYear()}`,
    };
  }
}

/**
 * Validates the preview password provided by James
 */
export function validatePreviewPassword(input: string): boolean {
  if (!input) return false;
  return input.trim() === SECRET_PREVIEW_PASSWORD;
}

/**
 * Checks if preview mode has been unlocked
 */
export function isPreviewUnlocked(): boolean {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const paramKey = urlParams.get('preview');
    if (paramKey && validatePreviewPassword(paramKey)) {
      sessionStorage.setItem(PREVIEW_STORAGE_KEY, 'true');
      return true;
    }
    return (
      sessionStorage.getItem(PREVIEW_STORAGE_KEY) === 'true' ||
      localStorage.getItem(PREVIEW_STORAGE_KEY) === 'true'
    );
  } catch (e) {
    return false;
  }
}

/**
 * Sets preview unlock status
 */
export function setPreviewUnlocked(unlocked: boolean): void {
  try {
    if (unlocked) {
      sessionStorage.setItem(PREVIEW_STORAGE_KEY, 'true');
    } else {
      sessionStorage.removeItem(PREVIEW_STORAGE_KEY);
      localStorage.removeItem(PREVIEW_STORAGE_KEY);
    }
  } catch (e) {
    // Ignore storage errors
  }
}
