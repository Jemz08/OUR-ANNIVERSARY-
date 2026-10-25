import React from 'react';
import { RotateCcw, Heart } from 'lucide-react';
import { GalleryPhoto } from '../data/loveStoryData';
import { RomanticImage } from './RomanticImage';

interface FinalScreenSectionProps {
  mainPhoto?: GalleryPhoto;
  onReplayStory: () => void;
}

export const FinalScreenSection: React.FC<FinalScreenSectionProps> = ({
  mainPhoto,
  onReplayStory,
}) => {
  return (
    <section
      id="final-screen"
      aria-labelledby="final-screen-heading"
      className="relative py-24 md:py-36 px-6 border-t border-[#D8B16D]/25 bg-gradient-to-b from-[#270812] via-[#3B0C1D] to-[#1A040B] overflow-hidden"
    >
      {/* Subtle Golden Ambient Light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="w-[36rem] h-[36rem] rounded-full bg-[#D8B16D]/10 blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-10">
        {/* Favorite Picture in Golden Frame */}
        {mainPhoto && (
          <div className="max-w-md mx-auto p-3 sm:p-4 rounded-2xl bg-[#FFF7F0] border-2 border-[#D8B16D] shadow-[0_22px_55px_rgba(0,0,0,0.6)]">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#270812]">
              <RomanticImage
                src={mainPhoto.imageUrl}
                alt={mainPhoto.caption}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Exact Required Statements */}
        <div className="space-y-4 font-serif-editorial text-xl sm:text-2xl md:text-3xl tracking-wide text-[#F1D6DC]">
          <p>OUR STORY BEGAN WITH A MEETING.</p>
          <p>OUR LOVE BECAME OFFICIAL ON OCTOBER 26, 2022.</p>
          <p className="text-[#D8B16D]">
            AND TODAY, OCTOBER 26, 2026, I AM STILL GRATEFUL THAT IT IS YOU.
          </p>
        </div>

        <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#D8B16D] to-transparent mx-auto" />

        <h2
          id="final-screen-heading"
          className="font-serif-editorial text-4xl sm:text-5xl md:text-6xl text-[#FFF7F0] tracking-wide"
          style={{ textWrap: 'balance' }}
        >
          HAPPY ANNIVERSARY, MY BABY LORAINE{' '}
          <span className="font-sans text-[#D8B16D]">♥</span>
        </h2>

        <p className="font-serif-editorial italic text-xl sm:text-2xl text-[#F1D6DC]/95 max-w-2xl mx-auto leading-relaxed">
          “Here’s to every memory that brought us here, every little moment that
          makes our love meaningful, and all the beautiful chapters we have yet
          to write.”
        </p>

        {/* Signature */}
        <div className="pt-4">
          <p className="font-serif-editorial italic text-lg text-[#D8B16D]">
            With all my love,
          </p>
          <p className="font-script text-5xl sm:text-6xl text-[#FFF7F0] mt-1">
            James
          </p>
        </div>

        {/* Replay Button */}
        <div className="pt-8">
          <button
            type="button"
            onClick={onReplayStory}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#4A1025] hover:bg-[#611530] border border-[#D8B16D] text-[#FFF7F0] font-serif-editorial text-xl tracking-wide shadow-[0_12px_35px_rgba(0,0,0,0.45)] transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 text-[#D8B16D]" />
            <span>Replay Our Love Story</span>
            <span className="font-sans text-[#D8B16D]">♥</span>
          </button>
        </div>

        {/* Quiet Copyright / Dedication Footer */}
        <footer className="pt-16 text-xs text-[#F1D6DC]/65 flex flex-wrap items-center justify-center gap-2">
          <span>Made with all my love (From Me to You)</span>
          <span aria-hidden="true">·</span>
          <Heart className="w-3.5 h-3.5 text-[#D8B16D] inline" />
          <span aria-hidden="true">·</span>
          <span>Fourth Official Anniversary: October 26, 2026</span>
        </footer>
      </div>
    </section>
  );
};
