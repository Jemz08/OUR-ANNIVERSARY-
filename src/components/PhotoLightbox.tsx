import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Trash2,
  Download,
  Calendar,
  MapPin,
  User,
  Sparkles,
} from 'lucide-react';
import { Photo } from '../types';
import { formatDatePretty } from '../utils/dateCalculations';
import { getCategoryStyle } from '../utils/categoryStyles';

interface PhotoLightboxProps {
  photo: Photo | null;
  photos: Photo[];
  onClose: () => void;
  onSelectPhoto: (photo: Photo) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onDeletePhoto: (id: string) => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photo,
  photos,
  onClose,
  onSelectPhoto,
  onToggleFavorite,
  onDeletePhoto,
}) => {
  if (!photo) return null;

  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [slideDirection, setSlideDirection] = useState<'animate-slide-left' | 'animate-slide-right' | ''>('');
  const [poppingHeart, setPoppingHeart] = useState<boolean>(false);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const currentIndex = photos.findIndex((p) => p.id === photo.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      setSlideDirection('animate-slide-right');
      onSelectPhoto(photos[currentIndex - 1]);
      setTimeout(() => setSlideDirection(''), 350);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setSlideDirection('animate-slide-left');
      onSelectPhoto(photos[currentIndex + 1]);
      setTimeout(() => setSlideDirection(''), 350);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, photos]);

  // Touch swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = touchStartXRef.current - e.changedTouches[0].clientX;
    const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;

    // Horizontal swipe to browse
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX > 0 && hasNext) {
        handleNext();
      } else if (deltaX < 0 && hasPrev) {
        handlePrev();
      }
    }
    // Vertical swipe down to close
    else if (deltaY < -70 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      onClose();
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = `${photo.title.replace(/\s+/g, '_')}_${photo.date}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const categoryStyle = getCategoryStyle(photo.album);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col md:flex-row items-stretch justify-between animate-fade-in select-none"
    >
      {/* Top Mobile Controls Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 text-white z-20 bg-black/75 backdrop-blur-md border-b border-stone-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#ffe5ec] font-medium">
            {currentIndex + 1} / {photos.length}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${categoryStyle.badgeClass}`}
          >
            {categoryStyle.badgeLabel}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center transition-transform"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Display Area with swipe responsiveness */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 min-h-[44dvh] md:min-h-full overflow-hidden">
        {/* Navigation Arrows */}
        {hasPrev && (
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-[#fb6f92] active:scale-90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {hasNext && (
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-[#fb6f92] active:scale-90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Photo Image with slide animation */}
        <div className={`w-full h-full flex items-center justify-center ${slideDirection}`}>
          <img
            src={photo.url}
            alt={photo.title}
            referrerPolicy="no-referrer"
            className="max-h-[48dvh] sm:max-h-[58dvh] md:max-h-[88dvh] max-w-full object-contain rounded-xl shadow-2xl transition-all duration-300"
          />
        </div>

        {/* Mobile Swipe Hint */}
        <div className="md:hidden text-[10px] text-stone-400 mt-1 flex items-center gap-1.5 opacity-70">
          <span>Swipe left / right to browse · swipe down to close</span>
        </div>
      </div>

      {/* Details Area: Drawer at bottom on mobile, side panel on desktop */}
      <div className="w-full md:w-84 lg:w-96 bg-stone-900 text-stone-100 p-4 sm:p-6 md:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-stone-800 overflow-y-auto max-h-[48dvh] md:max-h-full shrink-0">
        <div>
          {/* Desktop Close & Counter */}
          <div className="hidden md:flex items-center justify-between mb-5 pb-3.5 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#ffb3c6] font-medium tracking-wide">
                Memory {currentIndex + 1} of {photos.length}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${categoryStyle.badgeClass}`}
              >
                {categoryStyle.badgeLabel}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 active:scale-90 transition-all cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Photo Title */}
          <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight mb-1.5">
            {photo.title}
          </h2>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-400 mb-3 sm:mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#ff8fab]" />
              {formatDatePretty(photo.date)}
            </span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span className="text-[#ffb3c6] font-medium">{photo.album}</span>
            {photo.location && (
              <>
                <span aria-hidden="true" className="text-stone-600">·</span>
                <span className="flex items-center gap-1 text-stone-300">
                  <MapPin className="w-3.5 h-3.5 text-[#ff8fab]" />
                  {photo.location}
                </span>
              </>
            )}
          </div>

          {/* Caption */}
          {photo.caption && (
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed bg-stone-800/50 p-3.5 rounded-xl border border-stone-800 mb-4 sm:mb-6">
              {photo.caption}
            </p>
          )}

          {/* Uploader Attribution */}
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <User className="w-3.5 h-3.5 text-[#ffb3c6]" />
            <span>
              Shared by <strong className="text-stone-200">{photo.uploadedBy}</strong>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-stone-800 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              setPoppingHeart(true);
              onToggleFavorite(photo.id, photo.favorite);
              setTimeout(() => setPoppingHeart(false), 500);
            }}
            className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-medium active:scale-95 transition-all cursor-pointer ${
              photo.favorite
                ? 'bg-[#5c182b] text-[#ffb3c6] border border-[#fb6f92]'
                : 'bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                photo.favorite ? 'fill-[#fb6f92] text-[#fb6f92]' : ''
              } ${poppingHeart ? 'animate-heart-pop' : ''}`}
            />
            <span>{photo.favorite ? 'Favorited ❤️' : 'Add to Favorites'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2.5 rounded-xl bg-stone-800 text-stone-300 hover:text-[#ffe5ec] hover:bg-stone-700 active:scale-90 transition-all cursor-pointer"
              title="Download photo"
              aria-label="Download photo"
            >
              <Download className="w-4 h-4" />
            </button>

            {confirmDelete ? (
              <div className="flex items-center gap-1.5 animate-fade-scale bg-stone-950 p-1 rounded-xl border border-[#fb6f92]">
                <button
                  type="button"
                  onClick={() => {
                    onDeletePhoto(photo.id);
                    onClose();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#fb6f92] hover:bg-[#e8557b] active:scale-95 text-white text-[11px] font-semibold cursor-pointer shadow-xs transition-colors"
                >
                  Delete?
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white active:scale-95 text-[11px] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="p-2.5 rounded-xl bg-stone-800 text-stone-400 hover:text-[#fb6f92] hover:bg-[#5c182b]/30 active:scale-90 transition-all cursor-pointer"
                title="Delete memory"
                aria-label="Delete memory"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
