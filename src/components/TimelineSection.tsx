import React from 'react';
import { Upload, Sparkles } from 'lucide-react';
import {
  ChapterThreeMemory,
  LoveStoryContent,
} from '../data/loveStoryData';
import { StoryDurationMetrics } from '../utils/storyLogic';
import { RomanticImage } from './RomanticImage';

interface TimelineSectionProps {
  content: LoveStoryContent;
  metrics: StoryDurationMetrics;
  isGiftMode?: boolean;
  onUpdateContent: (updater: (prev: LoveStoryContent) => LoveStoryContent) => void;
  onInspectMemoryPhotoWithAI?: (imageUrl: string, currentTitle: string) => void;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({
  content,
  metrics,
  isGiftMode = false,
  onUpdateContent,
  onInspectMemoryPhotoWithAI,
}) => {
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onLoaded: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onLoaded(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateChapterThreeMemory = (
    memId: string,
    patch: Partial<ChapterThreeMemory>
  ) => {
    onUpdateContent((prev) => ({
      ...prev,
      chapterThree: {
        ...prev.chapterThree,
        memories: prev.chapterThree.memories.map((m) =>
          m.id === memId ? { ...m, ...patch, isPlaceholder: false } : m
        ),
      },
    }));
  };

  return (
    <section
      id="story-timeline"
      aria-labelledby="timeline-main-heading"
      className="py-20 md:py-28 px-6 max-w-6xl mx-auto"
    >
      {/* Main Emotional Message Banner */}
      <div className="max-w-3xl mx-auto text-center mb-20 md:mb-28 p-8 md:p-12 rounded-2xl bg-[#4A1025]/45 border border-[#D8B16D]/35 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
        <p className="text-xs tracking-[0.25em] uppercase text-[#D8B16D] mb-4">
          A Little Piece of My Heart · October 26, 2026
        </p>
        <blockquote className="font-serif-editorial italic text-2xl sm:text-3xl md:text-4xl text-[#FFF7F0] leading-relaxed mb-6">
          “{content.mainEmotionalMessage}”
        </blockquote>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-[#F1D6DC]/85">
          <span>First Met: {content.firstMetDateText}</span>
          <span aria-hidden="true">·</span>
          <span>Official Couple: {content.officialAnniversaryDateText}</span>
          <span aria-hidden="true">·</span>
          <span>Fourth Anniversary: {content.fourthAnniversaryDateText}</span>
        </div>
      </div>

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-20">
        <p className="text-xs tracking-[0.25em] uppercase text-[#D8B16D] mb-3">
          Five Chapters of Us
        </p>
        <h2
          id="timeline-main-heading"
          className="font-serif-editorial text-4xl sm:text-5xl text-[#FFF7F0] tracking-wide mb-4"
          style={{ textWrap: 'balance' }}
        >
          Our Love Story Timeline
        </h2>
        <p className="text-sm sm:text-base text-[#F1D6DC]/85 leading-relaxed">
          Celebrating the quiet June days in 2016 when our paths first crossed,
          and the four official years we have spent loving and growing together
          since October 26, 2022.
        </p>
      </div>

      {/* CHAPTER ONE */}
      <article className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-24 pb-20 border-b border-[#D8B16D]/20">
        <div className="lg:col-span-6 space-y-5">
          <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#D8B16D]">
            <span>Chapter One: The Beginning</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">{content.chapterOne.date}</span>
          </div>
          <h3
            className="font-serif-editorial text-3xl sm:text-4xl text-[#FFF7F0] leading-tight"
            style={{ textWrap: 'balance' }}
          >
            {content.chapterOne.heading}
          </h3>
          <blockquote className="p-5 rounded-xl bg-[#4A1025]/40 border border-[#D8B16D]/30 font-serif-editorial italic text-xl text-[#F1D6DC] leading-relaxed">
            “{content.chapterOne.quote}”
          </blockquote>
          {content.chapterOne.paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-base text-[#FFF7F0]/90 leading-relaxed"
            >
              {p}
            </p>
          ))}
        </div>

        <div className="lg:col-span-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF7F0] text-[#270812] border border-[#D8B16D] shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
            <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-[#270812]">
              <RomanticImage
                src={content.chapterOne.imageUrl}
                alt={content.chapterOne.heading}
                className="w-full h-full object-cover"
                fallbackTitle="June 15–20, 2016"
                fallbackSubtitle="Before We Knew What Our Story Would Become"
              />
              {!isGiftMode && (
                <label className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#270812]/85 hover:bg-[#4A1025] text-[#FFF7F0] border border-[#D8B16D]/50 text-xs font-medium cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#D8B16D]" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    aria-label="Upload photo for Chapter One"
                    onChange={(e) =>
                      handleFileUpload(e, (dataUrl) =>
                        onUpdateContent((prev) => ({
                          ...prev,
                          chapterOne: { ...prev.chapterOne, imageUrl: dataUrl },
                        }))
                      )
                    }
                  />
                </label>
              )}
            </div>
            <div className="mt-4">
              <p className="font-serif-editorial italic text-base text-[#4A1025]">
                {content.chapterOne.imageCaption}
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* CHAPTER TWO */}
      <article className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-24 pb-20 border-b border-[#D8B16D]/20">
        <div className="lg:col-span-6 order-2 lg:order-1">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF7F0] text-[#270812] border border-[#D8B16D] shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
            <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-[#270812]">
              <RomanticImage
                src={content.chapterTwo.imageUrl}
                alt={content.chapterTwo.heading}
                className="w-full h-full object-cover"
                fallbackTitle="10.26.2022"
                fallbackSubtitle="The Day You Became My Baby"
              />
              {!isGiftMode && (
                <label className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#270812]/85 hover:bg-[#4A1025] text-[#FFF7F0] border border-[#D8B16D]/50 text-xs font-medium cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#D8B16D]" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    aria-label="Upload photo for Chapter Two"
                    onChange={(e) =>
                      handleFileUpload(e, (dataUrl) =>
                        onUpdateContent((prev) => ({
                          ...prev,
                          chapterTwo: { ...prev.chapterTwo, imageUrl: dataUrl },
                        }))
                      )
                    }
                  />
                </label>
              )}
            </div>
            <div className="mt-4">
              <p className="font-serif-editorial italic text-base text-[#4A1025]">
                “{content.chapterTwo.imageCaption}”
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
          <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#D8B16D]">
            <span>Chapter Two: The Day We Became Us</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">{content.chapterTwo.date}</span>
          </div>

          <div className="inline-block py-3 px-6 rounded-xl bg-[#4A1025]/60 border border-[#D8B16D]/50">
            <span className="font-serif-editorial font-mono-tabular text-4xl sm:text-6xl text-[#D8B16D] tracking-widest">
              {content.chapterTwo.largeDateDisplay}
            </span>
          </div>

          <h3
            className="font-serif-editorial text-3xl sm:text-4xl text-[#FFF7F0] leading-tight"
            style={{ textWrap: 'balance' }}
          >
            {content.chapterTwo.heading}
          </h3>

          {content.chapterTwo.paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-base text-[#FFF7F0]/90 leading-relaxed"
            >
              {p}
            </p>
          ))}
        </div>
      </article>

      {/* CHAPTER THREE: THE LITTLE THINGS THAT BECAME EVERYTHING */}
      <article className="mb-24 pb-20 border-b border-[#D8B16D]/20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 text-xs tracking-[0.2em] uppercase text-[#D8B16D] mb-2">
            <span>Chapter Three: The Little Things That Became Everything</span>
          </div>
          <h3
            className="font-serif-editorial text-3xl sm:text-4xl text-[#FFF7F0] mb-3"
            style={{ textWrap: 'balance' }}
          >
            {content.chapterThree.heading}
          </h3>
          <p className="text-sm sm:text-base text-[#F1D6DC]/85 leading-relaxed">
            {content.chapterThree.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.chapterThree.memories.map((mem) => (
            <div
              key={mem.id}
              className="flex flex-col rounded-2xl bg-[#4A1025]/40 border border-[#D8B16D]/30 overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
            >
              <div className="relative aspect-[4/3] bg-[#270812]">
                <RomanticImage
                  src={mem.imageUrl}
                  alt={mem.label}
                  className="w-full h-full object-cover"
                  fallbackTitle={mem.label}
                />
                {!isGiftMode && (
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                    {onInspectMemoryPhotoWithAI && (
                      <button
                        type="button"
                        onClick={() =>
                          onInspectMemoryPhotoWithAI(mem.imageUrl, mem.label)
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#270812]/85 hover:bg-[#4A1025] text-[#D8B16D] border border-[#D8B16D]/40 text-xs font-medium cursor-pointer"
                        title="Reflect on this photo"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Reflect</span>
                      </button>
                    )}
                    <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#270812]/85 hover:bg-[#4A1025] text-[#FFF7F0] border border-[#D8B16D]/40 text-xs font-medium cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-[#D8B16D]" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        aria-label={`Upload photo for ${mem.label}`}
                        onChange={(e) =>
                          handleFileUpload(e, (dataUrl) =>
                            handleUpdateChapterThreeMemory(mem.id, {
                              imageUrl: dataUrl,
                            })
                          )
                        }
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#D8B16D]">
                    <span>{mem.label}</span>
                    <span>·</span>
                    <span className="font-mono-tabular">{mem.date}</span>
                  </div>
                  <h4 className="font-serif-editorial text-2xl text-[#FFF7F0]">
                    {mem.title}
                  </h4>
                  <p className="text-sm text-[#F1D6DC]/90 leading-relaxed">
                    {mem.story}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>

      {/* CHAPTER FOUR: FOUR YEARS OF US */}
      <article className="mb-24 pb-20 border-b border-[#D8B16D]/20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-12">
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#D8B16D]">
              <span>Chapter Four: Four Years of Us</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">{content.chapterFour.date}</span>
            </div>

            <h3
              className="font-serif-editorial text-3xl sm:text-5xl text-[#FFF7F0] leading-tight"
              style={{ textWrap: 'balance' }}
            >
              {content.chapterFour.heading}
            </h3>

            {content.chapterFour.paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-base text-[#FFF7F0]/90 leading-relaxed"
              >
                {p}
              </p>
            ))}
          </div>

          <div className="lg:col-span-6">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF7F0] text-[#270812] border border-[#D8B16D] shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
              <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-[#270812]">
                <RomanticImage
                  src={content.chapterFour.imageUrl}
                  alt={content.chapterFour.heading}
                  className="w-full h-full object-cover"
                  fallbackTitle="Four Years of Loving You, Baby"
                  fallbackSubtitle="October 26, 2022 – October 26, 2026"
                />
                {!isGiftMode && (
                  <label className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#270812]/85 hover:bg-[#4A1025] text-[#FFF7F0] border border-[#D8B16D]/50 text-xs font-medium cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#D8B16D]" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      aria-label="Upload photo for Chapter Four"
                      onChange={(e) =>
                        handleFileUpload(e, (dataUrl) =>
                          onUpdateContent((prev) => ({
                            ...prev,
                            chapterFour: { ...prev.chapterFour, imageUrl: dataUrl },
                          }))
                        )
                      }
                    />
                  </label>
                )}
              </div>
              <div className="mt-4">
                <p className="font-serif-editorial italic text-base text-[#4A1025]">
                  {content.chapterFour.imageCaption}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Anniversary Milestone Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 p-6 sm:p-8 rounded-2xl bg-[#4A1025]/45 border border-[#D8B16D]/35">
          <div className="text-center p-3">
            <p className="font-serif-editorial font-mono-tabular text-4xl sm:text-5xl text-[#D8B16D] mb-1">
              {metrics.yearsOfficialCouple}
            </p>
            <p className="text-xs sm:text-sm text-[#FFF7F0] font-medium">
              Official Years Together
            </p>
            <p className="text-xs text-[#F1D6DC]/75 mt-0.5">
              Oct 26, 2022 – Oct 26, 2026
            </p>
          </div>
          <div className="text-center p-3">
            <p className="font-serif-editorial font-mono-tabular text-4xl sm:text-5xl text-[#D8B16D] mb-1">
              {metrics.monthsOfficialCouple}
            </p>
            <p className="text-xs sm:text-sm text-[#FFF7F0] font-medium">
              Months as a Couple
            </p>
            <p className="text-xs text-[#F1D6DC]/75 mt-0.5">
              Learning &amp; growing side by side
            </p>
          </div>
          <div className="text-center p-3">
            <p className="font-serif-editorial font-mono-tabular text-4xl sm:text-5xl text-[#D8B16D] mb-1">
              {metrics.daysOfficialCouple.toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-[#FFF7F0] font-medium">
              Days of Being Us
            </p>
            <p className="text-xs text-[#F1D6DC]/75 mt-0.5">
              Every ordinary day made meaningful
            </p>
          </div>
          <div className="text-center p-3">
            <p className="font-serif-editorial font-mono-tabular text-4xl sm:text-5xl text-[#D8B16D] mb-1">
              {metrics.yearsSinceFirstMet}+
            </p>
            <p className="text-xs sm:text-sm text-[#FFF7F0] font-medium">
              Years Since We First Met
            </p>
            <p className="text-xs text-[#F1D6DC]/75 mt-0.5">
              First crossed paths June 15–20, 2016
            </p>
          </div>
        </div>
      </article>

      {/* CHAPTER FIVE: THE STORY ISN'T OVER */}
      <article className="max-w-3xl mx-auto text-center p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-[#4A1025]/55 to-[#270812] border border-[#D8B16D]/40 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <p className="text-xs tracking-[0.25em] uppercase text-[#D8B16D] mb-3">
          Chapter Five: The Story Isn’t Over
        </p>
        <h3
          className="font-serif-editorial text-3xl sm:text-5xl text-[#FFF7F0] mb-6"
          style={{ textWrap: 'balance' }}
        >
          {content.chapterFive.heading}
        </h3>
        {content.chapterFive.paragraphs.map((p, i) => (
          <p
            key={i}
            className="text-base sm:text-lg text-[#F1D6DC]/95 leading-relaxed mb-6"
          >
            {p}
          </p>
        ))}

        {/* Personal Wish for Our Future */}
        <div className="my-8 p-6 rounded-xl bg-[#270812]/80 border border-[#D8B16D]/45 text-left">
          <div className="mb-3">
            <span className="text-xs uppercase tracking-widest text-[#D8B16D]">
              James’s Wish for Our Future
            </span>
          </div>
          <p className="font-serif-editorial italic text-xl sm:text-2xl text-[#FFF7F0] leading-relaxed">
            “{content.chapterFive.personalWishPlaceholder}”
          </p>
        </div>

        <p className="font-serif-editorial italic text-xl sm:text-2xl text-[#D8B16D] leading-relaxed">
          “{content.chapterFive.closingLine}”
        </p>
      </article>
    </section>
  );
};
