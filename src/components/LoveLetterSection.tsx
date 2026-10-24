import React from 'react';
import { Heart } from 'lucide-react';
import { LoveStoryContent } from '../data/loveStoryData';

interface LoveLetterSectionProps {
  letter: LoveStoryContent['thingsIMayNotSayEnoughLetter'];
  isGiftMode?: boolean;
  onUpdateLetter?: (
    updater: (
      prev: LoveStoryContent['thingsIMayNotSayEnoughLetter']
    ) => LoveStoryContent['thingsIMayNotSayEnoughLetter']
  ) => void;
}

export const LoveLetterSection: React.FC<LoveLetterSectionProps> = ({
  letter,
}) => {
  return (
    <section
      id="things-i-may-not-say-enough"
      aria-labelledby="sincere-letter-heading"
      className="py-20 md:py-28 px-6 max-w-4xl mx-auto border-t border-[#D8B16D]/20"
    >
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.25em] uppercase text-[#D8B16D] mb-2">
          Section Six · Words From My Heart
        </p>
        <h2
          id="sincere-letter-heading"
          className="font-serif-editorial text-4xl sm:text-5xl text-[#FFF7F0]"
          style={{ textWrap: 'balance' }}
        >
          Things I May Not Say Enough
        </h2>
      </div>

      <article className="relative rounded-2xl ivory-paper p-8 sm:p-14 md:p-16 border-2 border-[#4A1025] shadow-[0_25px_65px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute inset-3 rounded-xl border border-[#D8B16D]/60" />

        <div className="relative z-10 space-y-6">
          <div className="pb-6 border-b border-[#4A1025]/20">
            <p className="text-xs tracking-[0.22em] uppercase text-[#4A1025]/75 mb-1">
              October 26, 2026 · Fourth Anniversary
            </p>
            <h3 className="font-serif-editorial text-3xl sm:text-4xl text-[#4A1025] font-semibold">
              {letter.heading}
            </h3>
          </div>

          <p className="font-script text-3xl text-[#4A1025]">
            {letter.salutation}
          </p>

          <blockquote className="p-6 rounded-xl bg-[#4A1025]/[0.06] border border-[#4A1025]/20 font-serif-editorial italic text-xl sm:text-2xl text-[#270812] leading-relaxed">
            “{letter.requiredPassage}”
          </blockquote>

          <div className="space-y-5 text-base sm:text-lg text-[#270812]/90 leading-relaxed font-serif-editorial">
            {letter.paragraphs.map((para, idx) => (
              <p key={idx} className="text-lg sm:text-xl leading-relaxed">
                {para}
              </p>
            ))}

            <div className="p-5 rounded-xl bg-[#FFFDF9] border border-[#4A1025]/25">
              <p className="text-xs uppercase tracking-widest text-[#4A1025]/70 font-sans mb-1.5">
                A Personal Note Just Between Us
              </p>
              <p className="italic text-lg sm:text-xl text-[#4A1025]">
                {letter.customDetailPlaceholder}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-[#4A1025]/15 space-y-3">
            {letter.closingLines.map((line, i) => (
              <p
                key={i}
                className="font-serif-editorial text-xl sm:text-2xl text-[#270812] leading-relaxed"
              >
                {line}
              </p>
            ))}

            <div className="pt-4 flex items-center justify-between">
              <div>
                <p className="font-serif-editorial italic text-lg text-[#4A1025]">
                  With all my love,
                </p>
                <p className="font-script text-4xl sm:text-5xl text-[#4A1025] mt-1">
                  James <span className="font-sans text-2xl">♥</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#4A1025] text-[#D8B16D] flex items-center justify-center border border-[#D8B16D]">
                <Heart className="w-5 h-5 fill-[#D8B16D]" />
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};
