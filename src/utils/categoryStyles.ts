import React from 'react';
import { Heart, Sparkles, Film, Wine, Shuffle, Camera, Users, Flame, Star, Smile } from 'lucide-react';

export interface CategoryStyleConfig {
  id: string;
  label: string;
  shortName: string;
  tagline: string;
  badgeLabel: string;
  colorTheme: string;
  tabActiveClass: string;
  tabInactiveClass: string;
  cardFrameClass: string;
  imageAspectClass: string;
  imageEffectClass: string;
  badgeClass: string;
  accentTextClass: string;
  cardExtraElement?: string;
  iconName: 'heart' | 'sparkles' | 'film' | 'wine' | 'shuffle';
}

export const CATEGORY_STYLES: Record<string, CategoryStyleConfig> = {
  'PHOTO OF US': {
    id: 'PHOTO OF US',
    label: 'PHOTO OF US',
    shortName: 'Couple',
    tagline: 'Us together forever',
    badgeLabel: '💑 PHOTO OF US',
    colorTheme: 'rose',
    tabActiveClass: 'bg-gradient-to-r from-[#fb6f92] to-[#ff8fab] text-white shadow-sm shadow-[#fb6f92]/30',
    tabInactiveClass: 'bg-[#ffe5ec]/80 text-[#5c182b] hover:bg-[#ffe5ec] border border-[#ffb3c6]/60',
    cardFrameClass:
      'bg-gradient-to-b from-[#fff7f9] to-white border-2 border-[#fb6f92]/40 hover:border-[#fb6f92] shadow-sm hover:shadow-md hover:shadow-[#fb6f92]/20',
    imageAspectClass: 'aspect-square min-[360px]:aspect-4/3',
    imageEffectClass: 'group-hover:scale-105 transition-transform duration-500',
    badgeClass: 'bg-[#fb6f92] text-white shadow-xs border border-white/30',
    accentTextClass: 'text-[#fb6f92]',
    iconName: 'heart',
  },
  'SOLO PHOTO': {
    id: 'SOLO PHOTO',
    label: 'SOLO PHOTO',
    shortName: 'Solo',
    tagline: 'Portraits & beautiful solos',
    badgeLabel: '✦ SOLO PORTRAIT',
    colorTheme: 'stone',
    tabActiveClass: 'bg-stone-900 text-white shadow-sm shadow-stone-900/30',
    tabInactiveClass: 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300',
    cardFrameClass:
      'bg-white border-2 border-stone-200 hover:border-stone-800 shadow-sm hover:shadow-xl transition-all',
    imageAspectClass: 'aspect-3/4 min-[360px]:aspect-4/5',
    imageEffectClass: 'group-hover:scale-103 transition-transform duration-500 saturate-[1.05]',
    badgeClass: 'bg-stone-900 text-stone-100 tracking-wider uppercase text-[10px] font-semibold border border-stone-700',
    accentTextClass: 'text-stone-800 font-semibold',
    iconName: 'sparkles',
  },
  'MOMENTS': {
    id: 'MOMENTS',
    label: 'MOMENTS',
    shortName: 'Moments',
    tagline: 'Vintage polaroid instant film',
    badgeLabel: '🎞️ POLAROID MOMENT',
    colorTheme: 'amber',
    tabActiveClass: 'bg-amber-700 text-amber-50 shadow-sm shadow-amber-800/30',
    tabInactiveClass: 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200',
    cardFrameClass:
      'bg-[#fffdf9] border-2 border-stone-300/80 hover:border-amber-300 shadow-md hover:shadow-xl hover:-rotate-1 transition-all duration-300 p-2 sm:p-2.5 pb-4 sm:pb-5',
    imageAspectClass: 'aspect-square',
    imageEffectClass: 'group-hover:scale-102 transition-transform duration-500 filter sepia-[0.08]',
    badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300/90 font-mono text-[10px] font-semibold',
    accentTextClass: 'text-amber-800',
    iconName: 'film',
  },
  'DATES': {
    id: 'DATES',
    label: 'DATES',
    shortName: 'Dates',
    tagline: 'Candlelit & romantic celebrations',
    badgeLabel: '🥂 ROMANTIC DATE',
    colorTheme: 'gold',
    tabActiveClass: 'bg-gradient-to-r from-amber-600 to-rose-700 text-amber-50 shadow-sm shadow-amber-900/30',
    tabInactiveClass: 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300/60',
    cardFrameClass:
      'bg-gradient-to-b from-[#fffdfa] via-amber-50/30 to-white border-2 border-amber-300/80 hover:border-amber-400 shadow-sm hover:shadow-lg hover:shadow-amber-200/40',
    imageAspectClass: 'aspect-4/3 min-[360px]:aspect-square',
    imageEffectClass: 'group-hover:scale-105 transition-transform duration-500 contrast-[1.03]',
    badgeClass: 'bg-gradient-to-r from-amber-600 to-rose-600 text-amber-50 font-semibold shadow-xs border border-amber-300/40',
    accentTextClass: 'text-amber-700 font-semibold',
    iconName: 'wine',
  },
  'RANDOM': {
    id: 'RANDOM',
    label: 'RANDOM',
    shortName: 'Random',
    tagline: 'Playful scrapbook candid joy',
    badgeLabel: '✨ RANDOM JOY',
    colorTheme: 'teal',
    tabActiveClass: 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/30',
    tabInactiveClass: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200',
    cardFrameClass:
      'bg-[#fffbfc] border-2 border-dashed border-[#ff8fab]/70 hover:border-[#fb6f92] shadow-xs hover:shadow-md hover:rotate-1 transition-all duration-300 relative',
    imageAspectClass: 'aspect-4/3 min-[360px]:aspect-square',
    imageEffectClass: 'group-hover:scale-105 transition-transform duration-500',
    badgeClass: 'bg-emerald-500 text-white font-medium shadow-xs border border-emerald-300',
    accentTextClass: 'text-emerald-700 font-semibold',
    iconName: 'shuffle',
  },
};

export function getCategoryStyle(albumName: string): CategoryStyleConfig {
  const normalized = albumName?.toUpperCase().trim();
  if (CATEGORY_STYLES[normalized]) {
    return CATEGORY_STYLES[normalized];
  }
  // Fallback defaults to romantic style
  return CATEGORY_STYLES['PHOTO OF US'];
}
