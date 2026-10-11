import React from 'react';
import { CoupleConfig, Photo } from '../types';
import { formatDatePretty } from '../utils/dateCalculations';

interface OurStoryTimelineProps {
  config: CoupleConfig;
  photos: Photo[];
  onOpenUpload: () => void;
  onSelectPhoto: (photo: Photo) => void;
}

export const OurStoryTimeline: React.FC<OurStoryTimelineProps> = ({
  config,
  photos,
  onOpenUpload,
  onSelectPhoto,
}) => {
  // Key milestone chapters
  const milestones = [
    {
      id: 'met',
      date: config.metDate,
      displayDate: formatDatePretty(config.metDate),
      title: 'The First Hello · Where Destiny Started',
      subtitle: formatDatePretty(config.metDate),
      narrative:
        'The day our paths crossed for the very first time. Before we knew we would become each other’s favorite person, destiny set everything into motion.',
      badge: 'Origin Story',
      isSpecial: true,
    },
    {
      id: 'official',
      date: config.officialDate,
      displayDate: formatDatePretty(config.officialDate),
      title: 'The Official Day One · Our Anniversary',
      subtitle: 'October 26, 2022',
      narrative:
        'The beginning of our official forever. October 26 became our sacred date—the anniversary we celebrate with all our heart every single year.',
      badge: 'Anniversary Established',
      isSpecial: true,
    },
    {
      id: 'anniv-1',
      date: '2023-10-26',
      displayDate: 'October 26, 2023',
      title: 'Our 1st Official Anniversary',
      subtitle: '1 Year Together',
      narrative:
        '365 days of official romance, dinner by candlelight, and learning even more ways to make each other laugh until our stomachs hurt.',
      badge: '1st Milestone',
    },
    {
      id: 'anniv-2',
      date: '2024-10-26',
      displayDate: 'October 26, 2024',
      title: 'Our 2nd Official Anniversary',
      subtitle: '2 Years Together · 7 Years Knowing You',
      narrative:
        'Two full years as partners in crime. Moving mountains together, celebrating small victories, and growing deeper in love.',
      badge: '2nd Milestone',
    },
    {
      id: 'anniv-3',
      date: '2025-10-26',
      displayDate: 'October 26, 2025',
      title: 'Our 3rd Official Anniversary',
      subtitle: '3 Years Together',
      narrative:
        'Three years of holding hands through every season. Our bond proved stronger and warmer than ever.',
      badge: '3rd Milestone',
    },
    {
      id: 'anniv-4',
      date: '2026-10-26',
      displayDate: 'October 26, 2026',
      title: 'Our 4th Anniversary Celebration',
      subtitle: '4 Years Official · 9+ Years Since We Met',
      narrative:
        'Our latest chapter! Looking forward to October 26 with gratitude for every quiet morning, every spontaneous date, and every forever promise.',
      badge: 'Upcoming Anniversary',
      isUpcoming: true,
    },
    {
      id: 'future',
      date: 'Forever',
      displayDate: 'All Our Tomorrows',
      title: 'To Infinity & Every October 26 To Come',
      subtitle: 'Endless Adventures Await',
      narrative:
        'Every October 26 is a chapter in the book of us. Hand in hand, always and forever.',
      badge: 'Forever',
      isFuture: true,
    },
  ];

  return (
    <section className="py-4 sm:py-8 md:py-10 max-w-4xl mx-auto px-3 sm:px-6 md:px-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#fb6f92] uppercase tracking-widest mb-1 sm:mb-1.5">
          <span>Our Journey</span>
          <span aria-hidden="true" className="text-[#ffc2d1]">·</span>
          <span>From {formatDatePretty(config.metDate)} to Forever</span>
        </div>
        <h2 className="text-xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          How Our Story Unfolded
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 sm:mt-2 leading-relaxed">
          From the day we first met in {config.metDate.split('-')[0] || '2016'} to every October 26 anniversary.
        </p>
      </div>

      {/* Timeline Tree: Fully responsive margin and line */}
      <div className="relative border-l-2 border-[#ffb3c6] ml-3 sm:ml-5 md:ml-32 pl-4 sm:pl-6 md:pl-10 space-y-8 sm:space-y-12 pb-6 sm:pb-8">
        {milestones.map((m) => {
          // Find matching photos from around this milestone
          const milestonePhotos = photos.filter((p) => {
            if (m.id === 'met') return p.date <= `${config.metDate.split('-')[0]}-12-31` || p.album.includes('First Met');
            if (m.id === 'official') return p.date.startsWith('2022-10') || p.title.toLowerCase().includes('official');
            if (m.id === 'anniv-1') return p.date.startsWith('2023-10');
            if (m.id === 'anniv-2') return p.date.startsWith('2024-10');
            if (m.id === 'anniv-3') return p.date.startsWith('2025-10');
            if (m.id === 'anniv-4') return p.date.startsWith('2026-10');
            return false;
          });

          return (
            <div key={m.id} className="relative group">
              {/* Timeline Marker Dot: Auto-positioned relative to left line */}
              <div
                className={`absolute -left-[23px] sm:-left-[27px] md:-left-[47px] top-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 sm:border-4 border-[#fff9fa] transition-transform ${
                  m.isUpcoming
                    ? 'bg-[#ff8fab] ring-3 sm:ring-4 ring-[#ffe5ec]'
                    : m.isSpecial
                    ? 'bg-[#fb6f92] ring-3 sm:ring-4 ring-[#ffe5ec]'
                    : 'bg-[#ffc2d1] ring-2 ring-[#ffe5ec]'
                }`}
              />

              {/* Date callout on desktop (hidden on mobile) */}
              <div className="hidden md:block absolute -left-44 top-1 text-right w-32">
                <span className="text-xs font-serif font-bold text-stone-900 block">
                  {m.displayDate}
                </span>
                <span className="text-[11px] text-[#fb6f92] font-semibold block">{m.badge}</span>
              </div>

              {/* Card Container */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 md:p-6 border border-[#ffc2d1]/80 hover:border-[#ff8fab] shadow-xs hover:shadow-md transition-all">
                {/* Mobile date kicker */}
                <div className="md:hidden flex items-center justify-between text-xs text-stone-500 mb-1.5 sm:mb-2">
                  <span className="font-serif font-semibold text-stone-900">{m.displayDate}</span>
                  <span className="text-[#fb6f92] font-semibold text-[11px]">{m.badge}</span>
                </div>

                <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 mb-1">
                  {m.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {m.narrative}
                </p>

                {/* Attached Photos from this Milestone */}
                {milestonePhotos.length > 0 && (
                  <div className="mt-3.5 sm:mt-4 pt-3 sm:pt-4 border-t border-[#ffe5ec]">
                    <span className="text-[11px] text-stone-400 font-medium block mb-2">
                      Photographs from this chapter:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {milestonePhotos.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => onSelectPhoto(p)}
                          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-[#ffc2d1] cursor-pointer group/img hover:border-[#fb6f92] shadow-2xs"
                        >
                          <img
                            src={p.url}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover/img:bg-transparent transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
