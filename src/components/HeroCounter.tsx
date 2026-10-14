import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, ArrowRight, MessageSquareHeart } from 'lucide-react';
import { CoupleConfig, TimeBreakdown } from '../types';
import { calculateTimeElapsed, getUpcomingAnniversary, formatDatePretty } from '../utils/dateCalculations';

interface HeroCounterProps {
  config: CoupleConfig;
  currentUserName?: string;
  onOpenUpload: () => void;
  onViewGallery: () => void;
  onOpenNotes?: () => void;
  onTriggerConfetti: () => void;
}

export const HeroCounter: React.FC<HeroCounterProps> = ({
  config,
  currentUserName,
  onOpenUpload,
  onViewGallery,
  onOpenNotes,
  onTriggerConfetti,
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const [selectedBase, setSelectedBase] = useState<'met' | 'official'>('met');

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Time elapsed since first met (June 15, 2016)
  const metElapsed: TimeBreakdown = calculateTimeElapsed(config.metDate, now);

  // Time elapsed since official relationship started (October 26, 2022)
  const officialElapsed: TimeBreakdown = calculateTimeElapsed(config.officialDate, now);

  // Annual anniversary details for October 26
  const upcomingAnniversary = getUpcomingAnniversary(config.officialDate, now);

  // Active counter displayed based on toggle
  const activeElapsed = selectedBase === 'met' ? metElapsed : officialElapsed;
  const activeLabel =
    selectedBase === 'met'
      ? `Since we met on ${formatDatePretty(config.metDate)}`
      : `Since we made it official on ${formatDatePretty(config.officialDate)}`;

  // Estimated heartbeats (~72 bpm)
  const estimatedHeartbeats = Math.floor(activeElapsed.totalSeconds * 1.2).toLocaleString();

  return (
    <section className="relative pt-4 sm:pt-6 pb-8 sm:pb-12 md:py-16 overflow-hidden px-3 sm:px-6 md:px-8">
      {/* Soft warm glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[500px] md:w-[650px] h-[320px] sm:h-[500px] md:h-[650px] bg-[#ffe5ec]/70 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto">
        {/* Anniversary Celebration Banner if today is October 26 */}
        {upcomingAnniversary.isToday && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#fb6f92] via-[#ff8fab] to-[#ffb3c6] text-white shadow-xl shadow-[#fb6f92]/20 text-center animate-fade-in">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-white/90">
                Happy Anniversary!
              </span>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold tracking-tight">
              Celebrating Our {upcomingAnniversary.ordinalText} Anniversary Today!
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-white/90 mt-1 max-w-xl mx-auto">
              Every October 26 is our special day. Here is to endless chapters together, {config.partner2}.
            </p>
            <button
              onClick={onTriggerConfetti}
              className="mt-3 sm:mt-4 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white text-[#fb6f92] text-xs font-semibold shadow-md hover:bg-[#ffe5ec] active:scale-95 transition-all cursor-pointer"
            >
              Shower Love Confetti
            </button>
          </div>
        )}

        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-stone-500 mb-2 sm:mb-3 tracking-wide">
            {currentUserName && (
              <>
                <span className="text-[#fb6f92] font-semibold">Welcome, {currentUserName}</span>
                <span aria-hidden="true" className="text-[#ffc2d1]">·</span>
              </>
            )}
            <span>{config.partner1}</span>
            <span className="text-[#fb6f92]">♥</span>
            <span>{config.partner2}</span>
            <span aria-hidden="true" className="text-[#ffc2d1]">·</span>
            <span>Annual Anniversary: Every Oct 26</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-stone-900 leading-tight px-2">
            US AND FOREVER
          </h1>
          <p className="mt-2 text-stone-600 text-xs sm:text-sm md:text-base leading-relaxed italic px-4">
            &ldquo;{config.loveQuote}&rdquo;
          </p>
        </div>

        {/* Primary Prominent Days Counter Container (Responsive autofitting) */}
        <div className="bg-white/95 backdrop-blur-sm border border-[#ffc2d1] rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-12 shadow-sm text-center relative">
          {/* Base selector segmented control: stacks cleanly on small phones, row on tablets/desktop */}
          <div className="inline-flex flex-col min-[440px]:flex-row w-full min-[440px]:w-auto p-1 bg-[#ffe5ec]/60 border border-[#ffc2d1]/60 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 text-xs font-medium gap-1 min-[440px]:gap-0">
            <button
              onClick={() => setSelectedBase('met')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
                selectedBase === 'met'
                  ? 'bg-white text-stone-900 shadow-xs border border-[#ffc2d1] font-semibold'
                  : 'text-stone-600 hover:text-[#fb6f92]'
              }`}
            >
              <span>Since We Met </span>
              <span className="text-[11px] opacity-80">(June 15, 2016)</span>
            </button>
            <button
              onClick={() => setSelectedBase('official')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
                selectedBase === 'official'
                  ? 'bg-white text-stone-900 shadow-xs border border-[#ffc2d1] font-semibold'
                  : 'text-stone-600 hover:text-[#fb6f92]'
              }`}
            >
              <span>Official Anniversary </span>
              <span className="text-[11px] opacity-80">(Oct 26, 2022)</span>
            </button>
          </div>

          {/* Big Prominent Number (Fluid responsive typography) */}
          <div className="my-2 sm:my-4">
            <div className="flex items-baseline justify-center gap-1.5 sm:gap-3 flex-wrap">
              <span className="text-5xl min-[360px]:text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif font-bold tracking-tight sm:tracking-tighter text-stone-900 tabular-nums">
                {activeElapsed.totalDays.toLocaleString()}
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl font-serif text-[#fb6f92] font-semibold">
                Days
              </span>
            </div>
            <p className="text-[11px] sm:text-xs md:text-sm text-stone-500 font-medium tracking-wide mt-1.5 sm:mt-2">
              {activeLabel}
            </p>
          </div>

          {/* Real-time Detailed Breakdown Grid: 3 cols on mobile, 6 cols on md+ */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4 max-w-3xl mx-auto my-6 sm:my-8 pt-4 sm:pt-6 border-t border-[#ffe5ec]">
            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-[#fff9fa] border border-[#ffc2d1]/60">
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-stone-900 tabular-nums font-serif">
                {activeElapsed.years}
              </div>
              <div className="text-[10px] sm:text-[11px] text-stone-500 uppercase tracking-wider font-medium mt-0.5">
                Years
              </div>
            </div>

            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-[#fff9fa] border border-[#ffc2d1]/60">
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-stone-900 tabular-nums font-serif">
                {activeElapsed.months}
              </div>
              <div className="text-[10px] sm:text-[11px] text-stone-500 uppercase tracking-wider font-medium mt-0.5">
                Months
              </div>
            </div>

            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-[#fff9fa] border border-[#ffc2d1]/60">
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-stone-900 tabular-nums font-serif">
                {activeElapsed.days}
              </div>
              <div className="text-[10px] sm:text-[11px] text-stone-500 uppercase tracking-wider font-medium mt-0.5">
                Days
              </div>
            </div>

            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-[#fff9fa] border border-[#ffc2d1]/60">
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-stone-900 tabular-nums font-serif">
                {String(activeElapsed.hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-[11px] text-stone-500 uppercase tracking-wider font-medium mt-0.5">
                Hours
              </div>
            </div>

            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-[#fff9fa] border border-[#ffc2d1]/60">
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-stone-900 tabular-nums font-serif">
                {String(activeElapsed.minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-[11px] text-stone-500 uppercase tracking-wider font-medium mt-0.5">
                Minutes
              </div>
            </div>

            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-[#ffe5ec] border border-[#ffb3c6]">
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-[#fb6f92] tabular-nums font-serif">
                {String(activeElapsed.seconds).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#fb6f92] uppercase tracking-wider font-semibold mt-0.5">
                Seconds
              </div>
            </div>
          </div>

          {/* Quick Actions (Full width on mobile, inline on sm+) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 mt-4 sm:mt-6">
            <button
              onClick={onOpenUpload}
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#fb6f92] hover:bg-[#e8557b] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#fb6f92]/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Add a Photo Memory</span>
            </button>
            <button
              onClick={onViewGallery}
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#ffe5ec]/80 hover:bg-[#ffe5ec] text-[#5c182b] border border-[#ffc2d1] text-xs sm:text-sm font-semibold active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Gallery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {onOpenNotes && (
              <button
                onClick={onOpenNotes}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white hover:bg-[#fff5f7] text-[#fb6f92] border border-[#ffc2d1] text-xs sm:text-sm font-semibold active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <MessageSquareHeart className="w-4 h-4 text-[#fb6f92]" />
                <span>Leave a Love Note</span>
              </button>
            )}
          </div>
        </div>

        {/* Milestone Cards: Autofits into 1 column on phone, 2 on tablet, 3 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 mt-5 sm:mt-6">
          {/* Card 1: Upcoming October 26 Anniversary */}
          <div className="bg-white border border-[#ffc2d1] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#ff8fab] transition-colors">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="font-semibold text-[#fb6f92]">Annual Milestone</span>
                <span className="text-[#ff8fab] font-medium">Oct 26</span>
              </div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                {upcomingAnniversary.isToday
                  ? `Happy ${upcomingAnniversary.ordinalText} Anniversary!`
                  : `Next: ${upcomingAnniversary.ordinalText} Anniversary`}
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {upcomingAnniversary.isToday
                  ? `Celebrating today on October 26, ${upcomingAnniversary.anniversaryYear}!`
                  : `Countdown to October 26, ${upcomingAnniversary.anniversaryYear}`}
              </p>
            </div>

            <div className="mt-3.5 sm:mt-4 pt-3 border-t border-[#ffe5ec]">
              {upcomingAnniversary.isToday ? (
                <div className="text-[#fb6f92] font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Celebrating today!</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tabular-nums">
                    {upcomingAnniversary.daysLeft}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">days left</span>
                  <span className="text-xs text-[#fb6f92] font-medium">
                    ({upcomingAnniversary.hoursLeft}h {upcomingAnniversary.minutesLeft}m)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Met Date Milestone (June 15, 2016) */}
          <div className="bg-white border border-[#ffc2d1] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#ff8fab] transition-colors">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="font-medium text-stone-700">Origin Story</span>
                <span className="text-stone-400">{formatDatePretty(config.metDate)}</span>
              </div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                When Destiny Began
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {metElapsed.years} years, {metElapsed.months} months since the first time you met.
              </p>
            </div>

            <div className="mt-3.5 sm:mt-4 pt-3 border-t border-[#ffe5ec] flex items-baseline justify-between">
              <div>
                <span className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tabular-nums">
                  {metElapsed.totalDays.toLocaleString()}
                </span>
                <span className="text-xs text-stone-500 font-medium ml-1.5">days together</span>
              </div>
              <span className="text-xs text-stone-400">Total days</span>
            </div>
          </div>

          {/* Card 3: Official Date Milestone (Oct 26, 2022) */}
          <div className="bg-white border border-[#ffc2d1] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#ff8fab] transition-colors sm:col-span-2 lg:col-span-1">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="font-medium text-stone-700">Official Date</span>
                <span className="text-stone-400">October 26, 2022</span>
              </div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                Officially In Love
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {officialElapsed.years} years, {officialElapsed.months} months since making it official.
              </p>
            </div>

            <div className="mt-3.5 sm:mt-4 pt-3 border-t border-[#ffe5ec] flex items-baseline justify-between">
              <div>
                <span className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tabular-nums">
                  {officialElapsed.totalDays.toLocaleString()}
                </span>
                <span className="text-xs text-stone-500 font-medium ml-1.5">days official</span>
              </div>
              <span className="text-xs text-[#fb6f92] font-medium">~{estimatedHeartbeats} beats</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
