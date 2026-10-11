import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Heart } from 'lucide-react';
import { CoupleConfig, Photo, LoveNote } from './types';
import { API } from './utils/api';
import { TopNav } from './components/TopNav';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HeroCounter } from './components/HeroCounter';
import { PhotoGallery } from './components/PhotoGallery';
import { OurStoryTimeline } from './components/OurStoryTimeline';
import { LoveNotesBoard } from './components/LoveNotesBoard';
import { UploadModal } from './components/UploadModal';
import { AnniversarySettingsModal } from './components/AnniversarySettingsModal';
import { UserGateModal } from './components/UserGateModal';
import { getCategoryStyle } from './utils/categoryStyles';

const TABS = ['counter', 'gallery', 'timeline', 'notes'];

export default function App() {
  const [config, setConfig] = useState<CoupleConfig>({
    metDate: '2016-06-15',
    officialDate: '2022-10-26',
    anniversaryMonthDay: '10-26',
    partner1: 'James',
    partner2: 'Loraine',
    loveQuote: 'Every love story is beautiful, but ours is my favorite.',
  });

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [notes, setNotes] = useState<LoveNote[]>([]);
  const [activeTab, setActiveTab] = useState<string>('counter');
  const [tabTransition, setTabTransition] = useState<'animate-slide-left' | 'animate-slide-right' | 'animate-fade-scale'>('animate-fade-scale');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [selectedPhotoForLightbox, setSelectedPhotoForLightbox] = useState<Photo | null>(null);

  // Screen swiping references for touch navigation across tabs
  const touchStartXRef = React.useRef<number | null>(null);
  const touchStartYRef = React.useRef<number | null>(null);

  // Switch tab with directional transition animation
  const handleSwitchTab = useCallback((newTab: string) => {
    setActiveTab((prevTab) => {
      const prevIdx = TABS.indexOf(prevTab);
      const nextIdx = TABS.indexOf(newTab);
      if (nextIdx > prevIdx) {
        setTabTransition('animate-slide-left');
      } else if (nextIdx < prevIdx) {
        setTabTransition('animate-slide-right');
      } else {
        setTabTransition('animate-fade-scale');
      }
      return newTab;
    });
  }, []);

  // Remembered Visitor Name / Nickname
  const [currentUserName, setCurrentUserName] = useState<string>(() => {
    return localStorage.getItem('us_forever_username') || sessionStorage.getItem('us_forever_username') || '';
  });

  // Welcome Gate Modal: Opens automatically if no name was remembered yet
  const [isGateOpen, setIsGateOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('us_forever_username') || sessionStorage.getItem('us_forever_username');
    return !saved;
  });

  // Trigger celebration confetti using the palette colors (#ffe5ec, #ffc2d1, #ffb3c6, #ff8fab, #fb6f92)
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#fb6f92', '#ff8fab', '#ffb3c6', '#ffc2d1', '#ffe5ec'],
      });
    } catch (e) {
      console.warn('Confetti unavailable', e);
    }
  }, []);

  // Fetch initial data
  const loadData = useCallback(async () => {
    try {
      const [fetchedConfig, fetchedPhotos, fetchedNotes] = await Promise.all([
        API.getConfig(),
        API.getPhotos(),
        API.getNotes(),
      ]);
      setConfig(fetchedConfig);
      setPhotos(fetchedPhotos);
      setNotes(fetchedNotes);
    } catch (err) {
      console.error('Failed to load couple data', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handlePhotoUploaded = (newPhoto: Photo) => {
    setPhotos((prev) => [newPhoto, ...prev]);
    triggerConfetti();
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    // Optimistic update
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, favorite: !current } : p))
    );
    try {
      await API.updatePhoto(id, { favorite: !current });
    } catch (err) {
      console.error('Failed to update favorite', err);
      // Revert on failure
      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, favorite: current } : p))
      );
    }
  };

  const handleDeletePhoto = async (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    try {
      await API.deletePhoto(id);
    } catch (err) {
      console.error('Failed to delete photo', err);
    }
  };

  const handleAddNote = async (newNote: { author: string; text: string }) => {
    const saved = await API.addNote(newNote);
    setNotes((prev) => [saved, ...prev]);
    triggerConfetti();
  };

  const handleDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await API.deleteNote(id);
  };

  const handleSaveConfig = async (updated: Partial<CoupleConfig>) => {
    const saved = await API.updateConfig(updated);
    setConfig(saved);
  };

  const handleResetDemo = async () => {
    await API.resetDemo();
    await loadData();
    triggerConfetti();
  };

  const handleConfirmUser = (name: string, remember: boolean) => {
    setCurrentUserName(name);
    if (remember) {
      localStorage.setItem('us_forever_username', name);
      localStorage.setItem('us_forever_remember', 'true');
    } else {
      sessionStorage.setItem('us_forever_username', name);
      localStorage.removeItem('us_forever_username');
      localStorage.removeItem('us_forever_remember');
    }
    setIsGateOpen(false);
    triggerConfetti();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fff9fa] text-stone-900 pb-24 md:pb-12">
      {/* Top Bar Navigation */}
      <TopNav
        config={config}
        currentUserName={currentUserName}
        activeTab={activeTab}
        setActiveTab={handleSwitchTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenUserSwitch={() => setIsGateOpen(true)}
        onTriggerConfetti={triggerConfetti}
      />

      {/* Main Content Areas with Screen Swiping Gestures */}
      <main
        className="flex-1"
        onTouchStart={(e) => {
          if (activeTab === 'gallery') return;
          touchStartXRef.current = e.touches[0].clientX;
          touchStartYRef.current = e.touches[0].clientY;
        }}
        onTouchEnd={(e) => {
          if (activeTab === 'gallery') return;
          if (touchStartXRef.current === null || touchStartYRef.current === null) return;
          const deltaX = touchStartXRef.current - e.changedTouches[0].clientX;
          const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
          if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
            const currentIdx = TABS.indexOf(activeTab);
            if (deltaX > 0 && currentIdx < TABS.length - 1) {
              handleSwitchTab(TABS[currentIdx + 1]);
            } else if (deltaX < 0 && currentIdx > 0) {
              handleSwitchTab(TABS[currentIdx - 1]);
            }
          }
          touchStartXRef.current = null;
          touchStartYRef.current = null;
        }}
      >
        <div key={activeTab} className={tabTransition}>
          {activeTab === 'counter' && (
            <div className="space-y-4">
              <HeroCounter
                config={config}
                currentUserName={currentUserName}
                onOpenUpload={() => setIsUploadOpen(true)}
                onViewGallery={() => handleSwitchTab('gallery')}
                onTriggerConfetti={triggerConfetti}
              />

              {/* Quick Preview of Recent Photos on the Home Page with category styles */}
              <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pt-2 sm:pt-4 pb-8 sm:pb-12">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                      Latest Shared Memories
                    </h2>
                    <p className="text-xs text-stone-500">
                      From our album of {photos.length} photos
                    </p>
                  </div>
                  <button
                    onClick={() => handleSwitchTab('gallery')}
                    className="text-xs font-semibold text-[#fb6f92] hover:text-[#e8557b] active:scale-95 transition-all cursor-pointer"
                  >
                    View All &rarr;
                  </button>
                </div>

                {photos.length === 0 ? (
                  <div className="bg-white/90 border border-[#ffc2d1] rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-[#ffe5ec] border border-[#ffc2d1] text-[#fb6f92] flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-6 h-6 fill-[#fb6f92]" />
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                      Your Shared Album Awaits Its First Memory
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1 mb-4 leading-relaxed">
                      You and {config.partner2} will be the very first to fill this gallery! Tap below to upload your couple pictures across your 5 categories:
                      <span className="font-semibold text-stone-700 block mt-1 text-[11px] sm:text-xs">
                        PHOTO OF US · SOLO PHOTO · MOMENTS · DATES · RANDOM
                      </span>
                    </p>
                    <button
                      onClick={() => setIsUploadOpen(true)}
                      className="px-5 py-2.5 rounded-full bg-[#fb6f92] hover:bg-[#e8557b] active:scale-95 text-white text-xs font-semibold shadow-sm shadow-[#fb6f92]/20 cursor-pointer transition-all inline-flex items-center gap-1.5"
                    >
                      <span>+ Upload Your First Photo</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
                    {photos.slice(0, 4).map((p) => {
                      const style = getCategoryStyle(p.album);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            handleSwitchTab('gallery');
                          }}
                          className={`group relative aspect-4/3 rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-md transition-all active:scale-95 ${style.cardFrameClass}`}
                        >
                          <img
                            src={p.url}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2 left-2 z-10">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${style.badgeClass}`}>
                              {style.badgeLabel}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-2.5 sm:p-3">
                            <div className="text-white truncate w-full">
                              <span className="font-serif text-xs font-bold block truncate">
                                {p.title}
                              </span>
                              <span className="text-[10px] text-[#ffe5ec] block">
                                {p.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <PhotoGallery
              photos={photos}
              onOpenUpload={() => setIsUploadOpen(true)}
              onToggleFavorite={handleToggleFavorite}
              onDeletePhoto={handleDeletePhoto}
            />
          )}

          {activeTab === 'timeline' && (
            <OurStoryTimeline
              config={config}
              photos={photos}
              onOpenUpload={() => setIsUploadOpen(true)}
              onSelectPhoto={(photo) => {
                setSelectedPhotoForLightbox(photo);
                handleSwitchTab('gallery');
              }}
            />
          )}

          {activeTab === 'notes' && (
            <LoveNotesBoard
              config={config}
              currentUserName={currentUserName}
              notes={notes}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#ffc2d1]/80 bg-white/60 py-6 sm:py-8 px-4 text-center text-xs text-stone-500">
        <div className="max-w-xl mx-auto space-y-1.5">
          <p className="font-serif font-medium text-stone-800">
            {config.partner1} &amp; {config.partner2} · Forever &amp; Always
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-stone-400 text-[11px]">
            <span>Met June 15, 2016</span>
            <span aria-hidden="true" className="text-[#ffc2d1]">·</span>
            <span>Official October 26, 2022</span>
            <span aria-hidden="true" className="text-[#ffc2d1]">·</span>
            <span>Annual Anniversary: Every Oct 26</span>
          </div>
        </div>
      </footer>

      {/* Mobile Ergonomic Bottom Tab Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={handleSwitchTab}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Upload Photo Modal */}
      <UploadModal
        config={config}
        currentUserName={currentUserName}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onPhotoUploaded={handlePhotoUploaded}
      />

      {/* Anniversary & Couple Settings Modal */}
      <AnniversarySettingsModal
        config={config}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveConfig={handleSaveConfig}
        onResetDemo={handleResetDemo}
      />

      {/* Welcome & Remember Me Gate Modal */}
      <UserGateModal
        config={config}
        isOpen={isGateOpen}
        currentUserName={currentUserName}
        onConfirmUser={handleConfirmUser}
        onClose={() => setIsGateOpen(false)}
        canDismiss={!!currentUserName}
      />
    </div>
  );
}
