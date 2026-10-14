import React, { useState, useEffect } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { getSaskatoonTimeInfo, isPreviewUnlocked, SaskatoonTimeInfo } from '../utils/saskatoonTime';

interface SkyLanternFloatingButtonProps {
  onOpen: () => void;
}

export const SkyLanternFloatingButton: React.FC<SkyLanternFloatingButtonProps> = ({ onOpen }) => {
  const [saskatoonInfo, setSaskatoonInfo] = useState<SaskatoonTimeInfo>(() => getSaskatoonTimeInfo());
  const [isPreview, setIsPreview] = useState<boolean>(() => isPreviewUnlocked());

  useEffect(() => {
    const timer = setInterval(() => {
      setSaskatoonInfo(getSaskatoonTimeInfo());
      setIsPreview(isPreviewUnlocked());
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const isUnlocked = saskatoonInfo.isPastOrOnOct26 || isPreview;

  return (
    <aside 
      aria-label="Anniversary Sky Lantern Surprise"
      className="fixed bottom-20 md:bottom-6 right-3.5 sm:right-6 z-40"
    >
      <button
        onClick={onOpen}
        title={
          isUnlocked
            ? 'Open Anniversary Sky Lantern Surprise'
            : `Sealed until October 26 (Saskatoon Time) — ${saskatoonInfo.daysRemaining}d ${saskatoonInfo.hoursRemaining}h remaining`
        }
        className={`group relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-lg border active:scale-95 transition-all cursor-pointer ${
          isUnlocked
            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-stone-950 font-bold border-amber-300 shadow-amber-500/30 hover:shadow-amber-500/50'
            : 'bg-stone-900/95 text-amber-200 border-amber-500/40 hover:border-amber-400 shadow-stone-900/40 backdrop-blur-md'
        }`}
      >
        {/* Pulsing Ember Halo */}
        <span 
          aria-hidden="true" 
          className={`absolute -inset-0.5 rounded-full blur-xs opacity-75 animate-pulse ${
            isUnlocked ? 'bg-amber-400' : 'bg-amber-500/30'
          }`}
        />

        <div className="relative flex items-center gap-1.5 sm:gap-2">
          {/* Lantern Icon with internal glow */}
          <span className="text-base sm:text-lg filter drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]">
            🏮
          </span>

          <div className="flex flex-col text-left">
            <span className="text-xs sm:text-sm font-serif font-bold tracking-tight leading-none flex items-center gap-1">
              <span>{isUnlocked ? 'Anniversary Lantern' : 'Oct 26 Secret'}</span>
              {!isUnlocked ? (
                <Lock className="w-3 h-3 text-amber-400" />
              ) : (
                <Sparkles className="w-3 h-3 text-stone-950" />
              )}
            </span>
            <span className={`text-[10px] leading-tight font-mono ${isUnlocked ? 'text-stone-900/80 font-medium' : 'text-amber-300/70'}`}>
              {isPreview
                ? 'James Preview'
                : isUnlocked
                ? 'Open Surprise'
                : `${saskatoonInfo.daysRemaining}d left (Saskatoon)`}
            </span>
          </div>
        </div>
      </button>
    </aside>
  );
};
