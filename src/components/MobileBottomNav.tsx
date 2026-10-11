import React from 'react';
import { CalendarHeart, Image as ImageIcon, Plus, BookHeart, MessageCircleHeart } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpload: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#ffc2d1] pb-safe shadow-[0_-4px_16px_rgba(251,111,146,0.06)]">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
        {/* Counter Tab */}
        <button
          onClick={() => setActiveTab('counter')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 active:scale-90 transition-all cursor-pointer ${
            activeTab === 'counter' ? 'text-[#fb6f92] font-semibold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <CalendarHeart className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] tracking-tight mt-1">Counter</span>
        </button>

        {/* Gallery Tab */}
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 active:scale-90 transition-all cursor-pointer ${
            activeTab === 'gallery' ? 'text-[#fb6f92] font-semibold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <ImageIcon className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] tracking-tight mt-1">Gallery</span>
        </button>

        {/* Prominent Upload Button in Center */}
        <div className="flex items-center justify-center">
          <button
            onClick={onOpenUpload}
            className="w-12 h-12 rounded-full bg-[#fb6f92] hover:bg-[#e8557b] text-white flex items-center justify-center shadow-md shadow-[#fb6f92]/30 active:scale-85 transition-transform cursor-pointer"
            aria-label="Upload photo"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Our Story Tab */}
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 active:scale-90 transition-all cursor-pointer ${
            activeTab === 'timeline' ? 'text-[#fb6f92] font-semibold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <BookHeart className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] tracking-tight mt-1">Story</span>
        </button>

        {/* Love Notes Tab */}
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 active:scale-90 transition-all cursor-pointer ${
            activeTab === 'notes' ? 'text-[#fb6f92] font-semibold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <MessageCircleHeart className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] tracking-tight mt-1">Notes</span>
        </button>
      </div>
    </nav>
  );
};
