import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Heart,
  Plus,
  Sparkles,
  MapPin,
  Play,
  Trash2,
  Film,
  Wine,
  Shuffle,
  Camera,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { Photo } from '../types';
import { formatDatePretty } from '../utils/dateCalculations';
import { CATEGORY_STYLES, getCategoryStyle } from '../utils/categoryStyles';
import { PhotoLightbox } from './PhotoLightbox';

interface PhotoGalleryProps {
  photos: Photo[];
  onOpenUpload: () => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onDeletePhoto: (id: string) => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  onOpenUpload,
  onToggleFavorite,
  onDeletePhoto,
}) => {
  const [selectedAlbum, setSelectedAlbum] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);
  const [isSlideshowActive, setIsSlideshowActive] = useState<boolean>(false);
  const [brokenImageIds, setBrokenImageIds] = useState<Set<string>>(new Set());
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [poppingHeartId, setPoppingHeartId] = useState<string | null>(null);
  const [swipeAnimation, setSwipeAnimation] = useState<'animate-slide-left' | 'animate-slide-right' | 'animate-fade-scale' | ''>('');

  // Swipe detection references
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // The 5 gallery categories requested by user
  const STANDARD_ALBUMS = [
    'PHOTO OF US',
    'SOLO PHOTO',
    'MOMENTS',
    'DATES',
    'RANDOM',
  ];

  // Extract all albums, prioritizing the 5 standard categories
  const albums = useMemo(() => {
    const extraAlbums = new Set<string>();
    photos.forEach((p) => {
      if (p.album && !STANDARD_ALBUMS.includes(p.album)) {
        extraAlbums.add(p.album);
      }
    });
    return ['All', ...STANDARD_ALBUMS, 'Favorites ❤️', ...Array.from(extraAlbums)];
  }, [photos]);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      const matchesAlbum =
        selectedAlbum === 'All'
          ? true
          : selectedAlbum === 'Favorites ❤️'
          ? p.favorite
          : p.album === selectedAlbum;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.caption.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.album.toLowerCase().includes(q);

      return matchesAlbum && matchesSearch;
    });
  }, [photos, selectedAlbum, searchQuery]);

  // Auto-advance slideshow
  React.useEffect(() => {
    if (!isSlideshowActive || !activePhoto || filteredPhotos.length === 0) return;
    const timer = setInterval(() => {
      const idx = filteredPhotos.findIndex((p) => p.id === activePhoto.id);
      const nextIdx = (idx + 1) % filteredPhotos.length;
      setActivePhoto(filteredPhotos[nextIdx]);
    }, 4500);
    return () => clearInterval(timer);
  }, [isSlideshowActive, activePhoto, filteredPhotos]);

  const startSlideshow = () => {
    if (filteredPhotos.length > 0) {
      setActivePhoto(filteredPhotos[0]);
      setIsSlideshowActive(true);
    }
  };

  // Swiping between categories gesture handler
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = touchStartXRef.current - e.changedTouches[0].clientX;
    const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;

    // Trigger swipe if mostly horizontal and significant distance (>55px)
    if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      const currentIdx = albums.indexOf(selectedAlbum);
      if (deltaX > 0 && currentIdx < albums.length - 1) {
        // Swiped Left -> Go to next category
        setSwipeAnimation('animate-slide-left');
        setSelectedAlbum(albums[currentIdx + 1]);
        setTimeout(() => setSwipeAnimation(''), 400);
      } else if (deltaX < 0 && currentIdx > 0) {
        // Swiped Right -> Go to previous category
        setSwipeAnimation('animate-slide-right');
        setSelectedAlbum(albums[currentIdx - 1]);
        setTimeout(() => setSwipeAnimation(''), 400);
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleHeartClick = (e: React.MouseEvent, photoId: string, current: boolean) => {
    e.stopPropagation();
    setPoppingHeartId(photoId);
    onToggleFavorite(photoId, current);
    setTimeout(() => setPoppingHeartId(null), 500);
  };

  // Helper icon for category button
  const renderCategoryIcon = (albumName: string) => {
    if (albumName === 'All') return <Sparkles className="w-3.5 h-3.5" />;
    if (albumName === 'Favorites ❤️') return <Heart className="w-3.5 h-3.5 fill-current" />;
    const style = getCategoryStyle(albumName);
    switch (style.iconName) {
      case 'heart':
        return <Heart className="w-3.5 h-3.5 fill-current" />;
      case 'sparkles':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'film':
        return <Film className="w-3.5 h-3.5" />;
      case 'wine':
        return <Wine className="w-3.5 h-3.5" />;
      case 'shuffle':
        return <Shuffle className="w-3.5 h-3.5" />;
      default:
        return <Camera className="w-3.5 h-3.5" />;
    }
  };

  return (
    <section
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="py-4 sm:py-8 md:py-10 max-w-7xl mx-auto px-3 sm:px-6 md:px-8 select-none"
    >
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#fb6f92] uppercase tracking-widest mb-1">
            <span>Our Shared Album</span>
            <span aria-hidden="true" className="text-[#ffc2d1]">·</span>
            <span>{photos.length} Captured Memories</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Moments We Will Never Forget
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5 sm:mt-1">
            5 bespoke memory styles: <span className="text-[#fb6f92] font-medium">PHOTO OF US</span> · <span className="text-stone-800 font-medium">SOLO</span> · <span className="text-amber-800 font-medium">MOMENTS</span> · <span className="text-amber-700 font-medium">DATES</span> · <span className="text-emerald-700 font-medium">RANDOM</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {filteredPhotos.length > 0 && (
            <button
              onClick={startSlideshow}
              className="px-3.5 sm:px-4 py-2 rounded-full border border-[#ffc2d1] bg-white hover:bg-[#ffe5ec]/50 active:scale-95 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current text-[#fb6f92]" />
              <span>Slideshow</span>
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className="px-4 py-2 rounded-full bg-[#fb6f92] hover:bg-[#e8557b] active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-[#fb6f92]/25 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Photo</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="bg-white/95 backdrop-blur-md border border-[#ffc2d1] rounded-2xl p-3 sm:p-4 mb-6 sm:mb-8 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search our memories by title, location, category, or note..."
            className="w-full pl-10 pr-12 py-2.5 bg-[#fff9fa] border border-[#ffc2d1]/80 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#ff8fab]/20 focus:border-[#fb6f92] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#fb6f92] hover:text-[#e8557b] font-medium active:scale-90 transition-transform cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Swipe Hint on Mobile */}
        <div className="flex items-center justify-between text-[11px] text-stone-400 px-1 md:hidden">
          <span>Swipe left & right to change styles</span>
          <div className="flex items-center gap-1 text-[#fb6f92]">
            <ChevronLeft className="w-3 h-3 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Swipe Categories</span>
            <ChevronRight className="w-3 h-3 animate-pulse" />
          </div>
        </div>

        {/* Styled Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs -mx-1 px-1 sm:mx-0 sm:px-0">
          {albums.map((album) => {
            const isActive = selectedAlbum === album;
            const count =
              album === 'All'
                ? photos.length
                : album === 'Favorites ❤️'
                ? photos.filter((p) => p.favorite).length
                : photos.filter((p) => p.album === album).length;

            const isStandard = STANDARD_ALBUMS.includes(album);
            const style = isStandard ? CATEGORY_STYLES[album] : null;

            return (
              <button
                key={album}
                onClick={() => {
                  setSelectedAlbum(album);
                  setSwipeAnimation('animate-fade-scale');
                  setTimeout(() => setSwipeAnimation(''), 350);
                }}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer font-medium shrink-0 flex items-center gap-1.5 active:scale-95 ${
                  isActive
                    ? style
                      ? style.tabActiveClass
                      : album === 'Favorites ❤️'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-[#fb6f92] text-white shadow-sm'
                    : style
                    ? style.tabInactiveClass
                    : album === 'Favorites ❤️'
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    : 'bg-[#ffe5ec]/60 text-[#5c182b] hover:bg-[#ffe5ec] border border-[#ffc2d1]/40'
                }`}
              >
                <span>{renderCategoryIcon(album)}</span>
                <span>{album}</span>
                <span
                  className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/25 text-white' : 'bg-black/5 text-current'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Photo Grid with Dynamic Category Styling */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white border border-[#ffc2d1] rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs animate-fade-scale">
          <div className="w-12 h-12 rounded-full bg-[#ffe5ec] border border-[#ffc2d1] text-[#fb6f92] flex items-center justify-center mx-auto mb-3.5 shadow-xs">
            <Heart className="w-6 h-6 fill-[#fb6f92]" />
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
            {photos.length === 0
              ? 'Your Gallery is Ready for Your First Memories'
              : selectedAlbum === 'All'
              ? 'No memories found'
              : `Album "${selectedAlbum}" is empty`}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            {photos.length === 0
              ? 'You and your girlfriend will be the very first to fill this shared album! Tap below to add your first photo together.'
              : searchQuery
              ? `No memories matched "${searchQuery}". Try clearing the search.`
              : `Be the first to upload a memory to "${selectedAlbum}"!`}
          </p>
          <button
            onClick={onOpenUpload}
            className="mt-4 sm:mt-5 px-6 py-2.5 rounded-full bg-[#fb6f92] text-white text-xs font-semibold hover:bg-[#e8557b] active:scale-95 shadow-sm shadow-[#fb6f92]/20 transition-all cursor-pointer"
          >
            + Upload Photo Now
          </button>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5 ${swipeAnimation}`}
        >
          {filteredPhotos.map((photo) => {
            const isBroken = brokenImageIds.has(photo.id);
            const style = getCategoryStyle(photo.album);
            const isPopping = poppingHeartId === photo.id;

            return (
              <div
                key={photo.id}
                onClick={() => {
                  setActivePhoto(photo);
                  setIsSlideshowActive(false);
                }}
                className={`group cursor-pointer flex flex-col justify-between overflow-hidden transition-all duration-300 ${style.cardFrameClass}`}
              >
                {/* Scrapbook Washi Tape Detail for RANDOM */}
                {photo.album === 'RANDOM' && (
                  <div
                    aria-hidden="true"
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-gradient-to-r from-[#ffc2d1]/90 to-[#ffb3c6]/90 border border-white/70 shadow-xs -rotate-2 rounded-xs pointer-events-none z-10"
                  />
                )}

                {/* Top Image Container */}
                <div
                  className={`relative ${style.imageAspectClass} bg-[#ffe5ec]/25 overflow-hidden rounded-xl`}
                >
                  {!isBroken ? (
                    <img
                      src={photo.url}
                      alt={photo.title}
                      referrerPolicy="no-referrer"
                      onError={() => {
                        setBrokenImageIds((prev) => new Set(prev).add(photo.id));
                      }}
                      className={`w-full h-full object-cover ${style.imageEffectClass}`}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#ffe5ec] to-white text-stone-500 text-center">
                      <Heart className="w-6 h-6 text-[#fb6f92] mb-1" />
                      <span className="text-xs font-medium text-stone-600 line-clamp-1">
                        {photo.title}
                      </span>
                    </div>
                  )}

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Category Style Badge Overlay */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight inline-flex items-center gap-1 backdrop-blur-md ${style.badgeClass}`}
                    >
                      {style.badgeLabel}
                    </span>
                  </div>

                  {/* Top Floating Actions: Delete and Favorite */}
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                    {/* Delete confirmation or trigger */}
                    {deletingPhotoId === photo.id ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 bg-black/90 backdrop-blur-md p-1 rounded-xl shadow-lg border border-[#fb6f92] animate-fade-scale"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePhoto(photo.id);
                            setDeletingPhotoId(null);
                          }}
                          className="px-2 py-1 rounded-lg bg-[#fb6f92] hover:bg-[#e8557b] active:scale-95 text-white text-[10px] font-bold cursor-pointer"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingPhotoId(null);
                          }}
                          className="px-1.5 py-1 rounded-lg bg-stone-700 text-stone-200 hover:text-white active:scale-95 text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingPhotoId(photo.id);
                        }}
                        className="w-7 h-7 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/75 text-white hover:text-[#fb6f92] backdrop-blur-md opacity-0 group-hover:opacity-100 max-sm:opacity-80 active:scale-90 transition-all cursor-pointer"
                        title="Delete photo"
                        aria-label="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Favorite Heart Button with Heart Pop Animation */}
                    <button
                      type="button"
                      onClick={(e) => handleHeartClick(e, photo.id, photo.favorite)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md active:scale-75 transition-all cursor-pointer ${
                        photo.favorite
                          ? 'bg-white text-[#fb6f92] shadow-sm'
                          : 'bg-black/35 text-white hover:bg-white hover:text-[#fb6f92] opacity-90 group-hover:opacity-100'
                      } ${isPopping ? 'animate-heart-pop' : ''}`}
                      aria-label="Toggle favorite"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          photo.favorite ? 'fill-[#fb6f92] text-[#fb6f92]' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Location label */}
                  {photo.location && (
                    <div className="absolute bottom-2 left-2.5 right-2.5 text-white text-[11px] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md truncate">
                      <MapPin className="w-3 h-3 text-[#ffb3c6] shrink-0" />
                      <span className="truncate">{photo.location}</span>
                    </div>
                  )}
                </div>

                {/* Card Text & Metadata customized by category */}
                <div
                  className={`flex-1 flex flex-col justify-between ${
                    photo.album === 'MOMENTS'
                      ? 'pt-2.5 px-1 pb-1'
                      : photo.album === 'SOLO PHOTO'
                      ? 'p-3'
                      : 'p-3 sm:p-3.5'
                  }`}
                >
                  <div>
                    {/* Title */}
                    <h3
                      className={`font-bold transition-colors line-clamp-1 ${
                        photo.album === 'MOMENTS'
                          ? 'font-handwritten text-lg sm:text-xl text-stone-800'
                          : photo.album === 'SOLO PHOTO'
                          ? 'font-serif text-sm text-stone-900 uppercase tracking-tight'
                          : 'font-serif text-sm text-stone-900 group-hover:text-[#fb6f92]'
                      }`}
                    >
                      {photo.title}
                    </h3>

                    {/* Caption */}
                    {photo.caption && (
                      <p
                        className={`mt-1 line-clamp-2 leading-relaxed ${
                          photo.album === 'MOMENTS'
                            ? 'font-handwritten text-stone-600 text-sm'
                            : 'text-[11px] text-stone-500'
                        }`}
                      >
                        {photo.caption}
                      </p>
                    )}
                  </div>

                  {/* Footer metadata line */}
                  <div
                    className={`flex items-center justify-between mt-2.5 pt-2 border-t text-[10px] sm:text-[11px] ${
                      photo.album === 'MOMENTS'
                        ? 'border-amber-200/80 font-mono text-amber-900/70'
                        : photo.album === 'DATES'
                        ? 'border-amber-200/80 text-amber-800'
                        : photo.album === 'SOLO PHOTO'
                        ? 'border-stone-200 text-stone-500'
                        : photo.album === 'RANDOM'
                        ? 'border-emerald-200/80 text-emerald-700'
                        : 'border-[#ffe5ec] text-stone-400'
                    }`}
                  >
                    <span>{formatDatePretty(photo.date)}</span>
                    <span className={style.accentTextClass}>
                      {photo.uploadedBy ? `by ${photo.uploadedBy}` : photo.album}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {activePhoto && (
        <PhotoLightbox
          photo={activePhoto}
          photos={filteredPhotos}
          onClose={() => {
            setActivePhoto(null);
            setIsSlideshowActive(false);
          }}
          onSelectPhoto={setActivePhoto}
          onToggleFavorite={onToggleFavorite}
          onDeletePhoto={onDeletePhoto}
        />
      )}
    </section>
  );
};
