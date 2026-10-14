import React from 'react';
import { Heart, Plus, Sparkles, Settings, User } from 'lucide-react';
import { CoupleConfig } from '../types';

interface TopNavProps {
  config: CoupleConfig;
  currentUserName: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
  onOpenUserSwitch: () => void;
  onTriggerConfetti: () => void;
  onOpenSkyLantern: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  config,
  currentUserName,
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenSettings,
  onOpenUserSwitch,
  onTriggerConfetti,
  onOpenSkyLantern,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#fff9fa]/90 backdrop-blur-md border-b border-[#ffc2d1]/80 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-6 md:gap-8">
        {/* Zone 1: Brand Wordmark (Title: US AND FOREVER) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <button
            onClick={() => setActiveTab('counter')}
            className="flex items-center gap-2 group text-left cursor-pointer min-w-0"
          >
            <span className="w-8 h-8 rounded-full bg-[#ffe5ec] flex items-center justify-center border border-[#ffc2d1] text-[#fb6f92] group-hover:scale-105 transition-transform shrink-0 shadow-xs">
              <Heart className="w-4 h-4 fill-[#fb6f92]" />
            </span>
            <div className="flex flex-col truncate">
              <span className="font-serif text-sm sm:text-lg md:text-xl font-bold tracking-tight text-stone-900 group-hover:text-[#fb6f92] transition-colors whitespace-nowrap">
                US AND FOREVER
              </span>
              <span className="text-[10px] text-stone-400 font-medium -mt-1 hidden sm:block truncate">
                {config.partner1} &amp; {config.partner2}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-stone-600">
          <button
            onClick={() => setActiveTab('counter')}
            className={`whitespace-nowrap transition-all py-1 relative cursor-pointer active:scale-95 ${
              activeTab === 'counter'
                ? 'text-[#fb6f92] font-semibold'
                : 'hover:text-[#fb6f92]'
            }`}
          >
            Days Together
            {activeTab === 'counter' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fb6f92] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`whitespace-nowrap transition-all py-1 relative cursor-pointer active:scale-95 ${
              activeTab === 'gallery'
                ? 'text-[#fb6f92] font-semibold'
                : 'hover:text-[#fb6f92]'
            }`}
          >
            Shared Gallery
            {activeTab === 'gallery' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fb6f92] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`whitespace-nowrap transition-all py-1 relative cursor-pointer active:scale-95 ${
              activeTab === 'timeline'
                ? 'text-[#fb6f92] font-semibold'
                : 'hover:text-[#fb6f92]'
            }`}
          >
            Our Story
            {activeTab === 'timeline' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fb6f92] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`whitespace-nowrap transition-all py-1 relative cursor-pointer active:scale-95 ${
              activeTab === 'notes'
                ? 'text-[#fb6f92] font-semibold'
                : 'hover:text-[#fb6f92]'
            }`}
          >
            Love Notes
            {activeTab === 'notes' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fb6f92] rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Actions + Current User Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* User Profile Badge (Click to switch or change nickname) */}
          {currentUserName && (
            <button
              onClick={onOpenUserSwitch}
              title={`Logged in as ${currentUserName}. Tap to switch nickname.`}
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-full bg-[#ffe5ec] hover:bg-[#ffc2d1]/60 text-[#5c182b] border border-[#ffc2d1] text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-2xs max-w-[120px] sm:max-w-[140px]"
            >
              <User className="w-3.5 h-3.5 text-[#fb6f92] shrink-0" />
              <span className="truncate">{currentUserName}</span>
            </button>
          )}

          {/* Sky Lantern Surprise Button */}
          <button
            onClick={onOpenSkyLantern}
            title="Anniversary Sky Lantern Surprise (Oct 26)"
            className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-2xs"
            aria-label="Sky Lantern Surprise"
          >
            <span className="text-sm">🏮</span>
            <span className="hidden sm:inline font-serif text-[11px] font-bold text-amber-950">
              Oct 26
            </span>
          </button>

          <button
            onClick={onTriggerConfetti}
            title="Celebrate Love"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-stone-600 hover:text-[#fb6f92] hover:bg-[#ffe5ec] border border-[#ffc2d1] active:scale-90 transition-all cursor-pointer"
            aria-label="Celebrate with confetti"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#fb6f92]" />
          </button>

          <button
            onClick={onOpenSettings}
            title="Anniversary Settings"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-stone-600 hover:text-[#fb6f92] hover:bg-[#ffe5ec] border border-[#ffc2d1] active:scale-90 transition-all cursor-pointer"
            aria-label="Settings"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={onOpenUpload}
            className="h-8 sm:h-9 px-2.5 sm:px-4 rounded-full bg-[#fb6f92] hover:bg-[#e8557b] text-white text-xs font-semibold tracking-wide flex items-center gap-1 sm:gap-1.5 shadow-sm shadow-[#fb6f92]/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden min-[420px]:inline">Upload</span>
          </button>
        </div>
      </div>
    </header>
  );
};
