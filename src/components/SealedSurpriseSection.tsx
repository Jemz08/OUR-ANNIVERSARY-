import React, { useState, useEffect } from 'react';
import {
  Heart,
  FastForward,
  RotateCcw,
  Pause,
  Play,
} from 'lucide-react';
import { GalleryPhoto, LoveStoryContent } from '../data/loveStoryData';
import { RomanticImage } from './RomanticImage';

interface SealedSurpriseSectionProps {
  letter: LoveStoryContent['sealedSurpriseLetter'];
  mainPhoto?: GalleryPhoto;
  supportingPhotos: GalleryPhoto[];
  isGiftMode?: boolean;
  onUpdateSurpriseLetter?: (
    updater: (
      prev: LoveStoryContent['sealedSurpriseLetter']
    ) => LoveStoryContent['sealedSurpriseLetter']
  ) => void;
}

export const SealedSurpriseSection: React.FC<SealedSurpriseSectionProps> = ({
  letter,
  mainPhoto,
  supportingPhotos,
}) => {
  const [envelopeState, setEnvelopeState] = useState<
    'sealed' | 'breaking' | 'opened'
  >('sealed');
  const [visibleParagraphCount, setVisibleParagraphCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalSteps = letter.paragraphs.length + 1;

  useEffect(() => {
    if (envelopeState !== 'opened') return;
    if (isPaused) return;
    if (visibleParagraphCount >= totalSteps) return;

    const timer = window.setTimeout(() => {
      setVisibleParagraphCount((prev) => Math.min(totalSteps, prev + 1));
    }, 1150);

    return () => window.clearTimeout(timer);
  }, [envelopeState, visibleParagraphCount, isPaused, totalSteps]);

  const handleOpenEnvelope = () => {
    setEnvelopeState('breaking');
    window.setTimeout(() => {
      setEnvelopeState('opened');
      setVisibleParagraphCount(1);
    }, 550);
  };

  const handleSkipAnimation = () => {
    setEnvelopeState('opened');
    setVisibleParagraphCount(totalSteps);
  };

  const handleReplayEnvelope = () => {
    setEnvelopeState('sealed');
    setVisibleParagraphCount(0);
    setIsPaused(false);
  };

  return (
    <section
      id="sealed-surprise-letter"
      aria-labelledby="surprise-letter-heading"
      className="relative py-24 md:py-32 px-6 max-w-5xl mx-auto border-t border-[#D8B16D]/25"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center"
      >
        <div className="w-[38rem] h-[38rem] rounded-full bg-[#D8B16D]/10 blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto mb-14">
        <p className="text-xs tracking-[0.25em] uppercase text-[#D8B16D] mb-2">
          Section Eight · A Letter Sealed With Love
        </p>
        <h2
          id="surprise-letter-heading"
          className="font-serif-editorial text-4xl sm:text-5xl text-[#FFF7F0] mb-6"
          style={{ textWrap: 'balance' }}
        >
          The Heart of Our Anniversary
        </h2>
        <p className="font-serif-editorial italic text-2xl sm:text-3xl text-[#FFF7F0] leading-relaxed mb-4">
          “{letter.preRevealIntro}”
        </p>
        <p className="text-base text-[#F1D6DC]/90 leading-relaxed">
          {letter.preRevealSubtext}
        </p>
      </div>

      {envelopeState !== 'opened' ? (
        <div className="relative z-10 max-w-2xl mx-auto">
          <div
            className={`relative rounded-2xl p-8 sm:p-14 bg-gradient-to-b from-[#4A1025] via-[#380B1C] to-[#270812] border-2 border-[#D8B16D] shadow-[0_28px_70px_rgba(0,0,0,0.65)] text-center transition-all duration-500 ${
              envelopeState === 'breaking' ? 'scale-105 opacity-80' : 'scale-100'
            }`}
          >
            <div
              aria-hidden="true"
              className="mx-auto max-w-md h-24 border-b border-[#D8B16D]/40 mb-8 flex flex-col items-center justify-end pb-4"
            >
              <span className="text-xs tracking-[0.3em] uppercase text-[#D8B16D]/90">
                For Baby · October 26, 2026
              </span>
            </div>

            <div className="my-6 flex flex-col items-center justify-center">
              <div
                className={`w-24 h-24 rounded-full bg-gradient-to-br from-[#E6C687] via-[#D8B16D] to-[#9E7836] border-4 border-[#FFF7F0]/50 shadow-[0_10px_30px_rgba(216,177,109,0.45)] flex items-center justify-center transition-transform duration-500 ${
                  envelopeState === 'breaking'
                    ? 'scale-125 rotate-12 opacity-0'
                    : 'scale-100'
                }`}
              >
                <Heart className="w-10 h-10 text-[#4A1025] fill-[#4A1025]" />
              </div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#D8B16D] mt-4">
                Sealed With All My Love · James
              </p>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleOpenEnvelope}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#D8B16D] hover:bg-[#E7C686] text-[#270812] font-serif-editorial font-semibold text-xl sm:text-2xl tracking-wide shadow-[0_12px_35px_rgba(216,177,109,0.35)] transition-all duration-200 cursor-pointer"
              >
                <span>Open Your Letter, Baby</span>
                <span className="font-sans">♥</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 space-y-10">
          {supportingPhotos.length >= 2 && (
            <div className="hidden md:grid grid-cols-2 gap-6 max-w-3xl mx-auto opacity-90">
              {supportingPhotos.slice(0, 2).map((photo) => (
                <div
                  key={photo.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-[#4A1025]/50 border border-[#D8B16D]/35"
                >
                  <RomanticImage
                    src={photo.imageUrl}
                    alt={photo.caption}
                    className="w-20 h-16 rounded-lg object-cover shrink-0 border border-[#D8B16D]/50"
                  />
                  <div className="min-w-0">
                    <p className="font-serif-editorial text-base text-[#FFF7F0] truncate">
                      {photo.caption}
                    </p>
                    <p className="text-xs text-[#D8B16D]">
                      {photo.date || 'Our Cherished Memory'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#4A1025]/60 border border-[#D8B16D]/40">
            <div className="flex items-center gap-2 text-xs text-[#F1D6DC]">
              <Heart className="w-4 h-4 text-[#D8B16D]" />
              <span>
                {visibleParagraphCount < totalSteps
                  ? `Revealing paragraph ${visibleParagraphCount} of ${letter.paragraphs.length}...`
                  : 'Complete anniversary letter revealed'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {visibleParagraphCount < totalSteps && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsPaused(!isPaused)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#270812] hover:bg-[#3A0C1D] border border-[#D8B16D]/40 text-xs text-[#FFF7F0] cursor-pointer"
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-3.5 h-3.5 text-[#D8B16D]" />
                        <span>Resume Reveal</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5 text-[#D8B16D]" />
                        <span>Pause</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipAnimation}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D8B16D] text-[#270812] text-xs font-semibold cursor-pointer"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>Skip Animation &amp; Show All</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handleReplayEnvelope}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8B16D]/40 text-xs text-[#D8B16D] hover:text-[#FFF7F0] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Envelope Opening</span>
              </button>
            </div>
          </div>

          <article className="relative rounded-2xl ivory-paper p-8 sm:p-14 md:p-16 border-2 border-[#D8B16D] shadow-[0_30px_80px_rgba(0,0,0,0.65)] space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-6 border-b border-[#4A1025]/20">
              <p className="font-script text-3xl sm:text-4xl text-[#4A1025]">
                {letter.salutation}
              </p>
              <span className="font-mono-tabular text-xs uppercase tracking-widest text-[#4A1025]/75">
                June 2016 · Oct 26, 2022 · Oct 26, 2026
              </span>
            </div>

            <div className="space-y-5 font-serif-editorial text-xl sm:text-2xl text-[#270812] leading-relaxed">
              {letter.paragraphs
                .slice(0, visibleParagraphCount)
                .map((paragraph, idx) => {
                  const isHighlightedSentiment = idx === 2 || idx === 4;
                  return isHighlightedSentiment ? (
                    <blockquote
                      key={idx}
                      className="p-6 rounded-xl bg-[#4A1025]/[0.06] border border-[#4A1025]/25 italic text-[#4A1025] text-xl sm:text-2xl leading-relaxed transition-opacity duration-500"
                    >
                      “{paragraph}”
                    </blockquote>
                  ) : (
                    <p key={idx} className="transition-opacity duration-500">
                      {paragraph}
                    </p>
                  );
                })}
            </div>

            {visibleParagraphCount >= totalSteps && (
              <div className="pt-10 mt-10 border-t-2 border-[#4A1025]/20 space-y-10 text-center">
                <div className="space-y-3">
                  <h3 className="font-serif-editorial text-3xl sm:text-5xl text-[#4A1025] font-semibold">
                    {letter.closingHeadline}
                  </h3>
                  <p className="font-serif-editorial italic text-xl sm:text-2xl text-[#270812]/85">
                    “{letter.closingSubheadline}”
                  </p>
                </div>

                {mainPhoto && (
                  <div className="max-w-xl mx-auto p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-[#270812] to-[#4A1025] border-2 border-[#D8B16D] shadow-[0_20px_50px_rgba(74,16,37,0.35)]">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden border border-[#D8B16D]/60">
                      <RomanticImage
                        src={mainPhoto.imageUrl}
                        alt={mainPhoto.caption}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="font-serif-editorial italic text-lg text-[#FFF7F0] mt-4">
                      {mainPhoto.caption}
                    </p>
                  </div>
                )}

                <div className="max-w-xl mx-auto space-y-2 font-serif-editorial text-xl sm:text-2xl text-[#270812]">
                  {letter.closingGratitudeLines.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                  <div className="pt-6">
                    <p className="italic text-lg text-[#4A1025]">
                      {letter.closingSignOff}
                    </p>
                    <p className="font-script text-5xl text-[#4A1025] mt-2">
                      James <span className="font-sans text-2xl">♥</span>
                    </p>
                  </div>
                </div>

                <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#4A1025] text-[#FFF7F0] border border-[#D8B16D] text-left shadow-lg">
                  <div className="mb-3">
                    <span className="text-xs uppercase tracking-[0.2em] text-[#D8B16D]">
                      One Final Personal Message From Me to You
                    </span>
                  </div>
                  <p className="font-serif-editorial italic text-xl sm:text-2xl text-[#FFF7F0] leading-relaxed">
                    “{letter.personalMessagePlaceholder}”
                  </p>
                </div>
              </div>
            )}
          </article>
        </div>
      )}
    </section>
  );
};
