import React, { useState } from 'react';
import { Heart, Music, VolumeX } from 'lucide-react';

interface OpeningScreenProps {
  onOpenStory: (enableMusic: boolean) => void;
  onStartMusicGesture?: (enableMusic: boolean) => void;
  musicEnabledChoice: boolean;
  onToggleMusicChoice: (enabled: boolean) => void;
}

const GOLDEN_PARTICLES = [
  { left: '12%', top: '18%', size: 4, delay: '0s' },
  { left: '24%', top: '72%', size: 3, delay: '1.2s' },
  { left: '38%', top: '14%', size: 5, delay: '2.1s' },
  { left: '64%', top: '22%', size: 3, delay: '0.7s' },
  { left: '78%', top: '68%', size: 4, delay: '1.8s' },
  { left: '88%', top: '32%', size: 3, delay: '2.6s' },
  { left: '18%', top: '46%', size: 3, delay: '1.5s' },
  { left: '52%', top: '82%', size: 4, delay: '0.4s' },
];

export const OpeningScreen: React.FC<OpeningScreenProps> = ({
  onOpenStory,
  onStartMusicGesture,
  musicEnabledChoice,
  onToggleMusicChoice,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleEnterClick = () => {
    // Trigger audio playback synchronously inside the user click gesture
    if (onStartMusicGesture) {
      onStartMusicGesture(musicEnabledChoice);
    }
    setIsFadingOut(true);
    window.setTimeout(() => {
      onOpenStory(musicEnabledChoice);
    }, 650);
  };

  return (
    <section
      aria-label="Opening Screen: For My Baby, Loraine"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between px-6 py-10 md:py-14 bg-gradient-to-b from-[#270812] via-[#3A0C1D] to-[#1D050D] text-[#FFF7F0] overflow-y-auto transition-all duration-700 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Subtle warm radial light bloom & golden particles */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] rounded-full bg-[#D8B16D]/10 blur-[110px]" />
        <div className="absolute top-1/4 left-1/3 w-[22rem] h-[22rem] rounded-full bg-[#C98291]/10 blur-[90px]" />
        {GOLDEN_PARTICLES.map((p, idx) => (
          <span
            key={idx}
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
            }}
            className="absolute rounded-full bg-[#D8B16D]/70 animate-shimmer-gold"
          />
        ))}
      </div>

      {/* Top delicate ornament */}
      <div className="relative z-10 flex items-center gap-3 text-xs tracking-[0.25em] text-[#D8B16D]/90 uppercase">
        <span className="w-8 h-px bg-[#D8B16D]/50" />
        <span>A Fourth Anniversary Keepsake</span>
        <span className="w-8 h-px bg-[#D8B16D]/50" />
      </div>

      {/* Center piece */}
      <div className="relative z-10 max-w-2xl mx-auto text-center my-auto py-8 flex flex-col items-center">
        <p className="text-sm md:text-base tracking-[0.28em] text-[#D8B16D] font-medium mb-4">
          FOR MY BABY, LORAINE <span className="font-sans">♥</span>
        </p>

        <p className="font-serif-editorial italic text-xl md:text-2xl text-[#F1D6DC] max-w-xl leading-relaxed mb-8">
          “Some stories are too beautiful to fit into a single memory.”
        </p>

        <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#D8B16D] to-transparent mb-8" />

        <h1
          className="font-serif-editorial text-4xl sm:text-6xl md:text-7xl font-normal tracking-wide text-[#FFF7F0] mb-3"
          style={{ textWrap: 'balance' }}
        >
          Our Love Story
        </h1>

        <p className="font-script text-3xl sm:text-4xl text-[#D8B16D] mb-4">
          James &amp; Loraine
        </p>

        <p className="font-mono-tabular text-xs sm:text-sm tracking-[0.2em] text-[#F1D6DC]/90 mb-10">
          October 26, 2022 — October 26, 2026
        </p>

        {/* Optional soft piano music toggle before entering */}
        <div className="mb-7 flex items-center justify-center">
          <button
            type="button"
            onClick={() => onToggleMusicChoice(!musicEnabledChoice)}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg border border-[#D8B16D]/45 bg-[#4A1025]/60 hover:bg-[#4A1025]/90 text-xs text-[#FFF7F0] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D8B16D]"
            aria-pressed={musicEnabledChoice}
          >
            {musicEnabledChoice ? (
              <>
                <Music className="w-3.5 h-3.5 text-[#D8B16D]" />
                <span>Accompany with soft romantic piano music (Enabled)</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#C98291]" />
                <span>Soft romantic piano music (Currently Muted — Click to Enable)</span>
              </>
            )}
          </button>
        </div>

        {/* Main Reveal CTA Button */}
        <button
          type="button"
          onClick={handleEnterClick}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#4A1025] via-[#631531] to-[#4A1025] border border-[#D8B16D] text-[#FFF7F0] font-serif-editorial text-xl md:text-2xl tracking-wide shadow-[0_12px_35px_rgba(0,0,0,0.5)] hover:border-[#FFF7F0] hover:shadow-[0_12px_45px_rgba(216,177,109,0.28)] transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D8B16D]"
        >
          <span>Open This Little Piece of My Heart</span>
          <Heart className="w-5 h-5 text-[#D8B16D] fill-[#D8B16D] group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Bottom dedication line */}
      <div className="relative z-10 text-center">
        <p className="font-serif-editorial italic text-sm md:text-base text-[#F1D6DC]/85 tracking-wide">
          Made with all my love, by James, for Baby Loraine.
        </p>
      </div>
    </section>
  );
};
