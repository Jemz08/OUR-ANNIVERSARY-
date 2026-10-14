export interface Photo {
  id: string;
  url: string;
  title: string;
  caption: string;
  date: string; // YYYY-MM-DD
  album: string;
  location: string;
  uploadedBy: string;
  favorite: boolean;
  createdAt: string;
}

export interface LoveNote {
  id: string;
  author: string;
  text: string;
  date: string;
  createdAt: string;
}

export interface SecretLetter {
  title?: string;
  message?: string;
  sender?: string;
  recipient?: string;
  lastUpdated?: string;
}

export interface CoupleConfig {
  metDate: string; // "2016-06-15"
  officialDate: string; // "2022-10-26"
  anniversaryMonthDay: string; // "10-26"
  partner1: string; // "James"
  partner2: string; // "My Love"
  loveQuote: string;
  songTitle?: string;
  theme?: string;
  secretLetter?: SecretLetter;
}

export interface TimeBreakdown {
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
