import React, { useState, useEffect, useCallback } from 'react';
import {
  Music,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Sparkles,
  SlidersHorizontal,
  Eye,
  Camera,
  Share2,
  Check,
} from 'lucide-react';
import {
  INITIAL_LOVE_STORY_CONTENT,
  LoveStoryContent,
} from './data/loveStoryData';
import {
  calculateAnniversaryMetrics,
  getMainAnniversaryPhoto,
  mergeUploadedPhotosWithCleanText,
} from './utils/storyLogic';
import { romanticPiano } from './utils/pianoAudio';
import { OpeningScreen } from './components/OpeningScreen';
import { TimelineSection } from './components/TimelineSection';
import { PhotoGallerySection } from './components/PhotoGallerySection';
import { LoveLetterSection } from './components/LoveLetterSection';
import { TwelveLoveNotesSection } from './components/TwelveLoveNotesSection';
import { SealedSurpriseSection } from './components/SealedSurpriseSection';
import { DigitalGiftsSection } from './components/DigitalGiftsSection';
import { FinalScreenSection } from './components/FinalScreenSection';
import { StudioAndAssistantModal } from './components/StudioAndAssistantModal';

const STORAGE_KEY = 'loraine_fourth_anniversary_v1';
const OPENED_NOTES_KEY = 'loraine_opened_notes_v1';
const GIFT_MODE_KEY = 'loraine_gift_mode_v1';

export default function App() {
  const [hasEnteredStory, setHasEnteredStory] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('autostart') === '1';
    }
    return false;
  });

  const [isGiftMode, setIsGiftMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('gift') === '1') return true;
      if (params.get('edit') === '1') return false;
      try {
        return localStorage.getItem(GIFT_MODE_KEY) === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const [musicEnabledOnStart, setMusicEnabledOnStart] = useState<boolean>(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [isMutedMusic, setIsMutedMusic] = useState<boolean>(false);
  const [musicVolume, setMusicVolume] = useState<number>(() =>
    romanticPiano.getVolume()
  );
  const [currentTrackName, setCurrentTrackName] = useState<string>(
    romanticPiano.getTrackName()
  );

  const [content, setContent] = useState<LoveStoryContent>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as LoveStoryContent;
        return mergeUploadedPhotosWithCleanText(
          parsed,
          INITIAL_LOVE_STORY_CONTENT
        );
      }
    } catch {
      // Fallback to initial content
    }
    return INITIAL_LOVE_STORY_CONTENT;
  });

  const [openedNoteIds, setOpenedNoteIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(OPENED_NOTES_KEY);
      if (saved) {
        return JSON.parse(saved) as number[];
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [lastPublishedAt, setLastPublishedAt] = useState<string | null>(null);
  const [justPublishedToast, setJustPublishedToast] = useState<boolean>(false);

  const [studioModalState, setStudioModalState] = useState<{
    isOpen: boolean;
    tab: 'customize' | 'analyze' | 'chat';
    analyzeImage: { imageUrl: string; title: string } | null;
  }>({
    isOpen: false,
    tab: 'customize',
    analyzeImage: null,
  });

  const publishContentToServer = useCallback(
    async (
      storyToSave: LoveStoryContent,
      giftModeDefault = true
    ): Promise<{ ok: boolean; publishedAt?: string; error?: string }> => {
      try {
        const res = await fetch('/api/story/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: storyToSave,
            giftModeDefault,
          }),
        });
        const data = await res.json();
        if (data.ok) {
          setLastPublishedAt(data.publishedAt);
          return { ok: true, publishedAt: data.publishedAt };
        }
        return { ok: false, error: data.error || 'Could not publish story' };
      } catch {
        return { ok: false, error: 'Network error while saving story' };
      }
    },
    []
  );

  // On initial mount:
  // - If James has uploaded photos in localStorage, merge with clean text and auto-sync to the server (/public/published-story.json).
  // - If a visitor (like Loraine on Vercel or Cloud Run) opens the link, load from /api/story or static /published-story.json!
  useEffect(() => {
    let isMounted = true;
    const rawSaved = localStorage.getItem(STORAGE_KEY);
    const hasLocalCustomizations = Boolean(rawSaved);

    async function loadRemoteOrStaticStory() {
      try {
        const apiRes = await fetch('/api/story');
        if (apiRes.ok) {
          const data = await apiRes.json();
          if (data?.found && data?.content) return data;
        }
      } catch {
        // Fallback to static /published-story.json (Vercel / Netlify / GitHub Pages)
      }
      try {
        const staticRes = await fetch('/published-story.json');
        if (staticRes.ok) {
          const staticData = await staticRes.json();
          if (staticData?.content) {
            return { found: true, ...staticData };
          }
          if (staticData?.groomName && Array.isArray(staticData?.galleryPhotos)) {
            return { found: true, content: staticData, giftModeDefault: true };
          }
        }
      } catch {
        // No static published-story.json yet
      }
      return { found: false };
    }

    loadRemoteOrStaticStory().then((serverData) => {
      if (!isMounted) return;
      if (hasLocalCustomizations && rawSaved) {
        try {
          const localParsed = JSON.parse(rawSaved) as LoveStoryContent;
          const merged = mergeUploadedPhotosWithCleanText(
            localParsed,
            INITIAL_LOVE_STORY_CONTENT
          );
          setContent(merged);
          publishContentToServer(merged, true);
        } catch {
          // ignore
        }
      } else if (serverData?.found && serverData?.content) {
        const mergedServer = mergeUploadedPhotosWithCleanText(
          serverData.content as LoveStoryContent,
          INITIAL_LOVE_STORY_CONTENT
        );
        setContent(mergedServer);
        if (serverData.publishedAt) {
          setLastPublishedAt(serverData.publishedAt);
        }
        const params = new URLSearchParams(window.location.search);
        if (params.get('edit') !== '1' && serverData.giftModeDefault !== false) {
          setIsGiftMode(true);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [publishContentToServer]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch {
      // Ignore quota errors if very large base64 images were added
    }
  }, [content]);

  useEffect(() => {
    try {
      localStorage.setItem(OPENED_NOTES_KEY, JSON.stringify(openedNoteIds));
    } catch {
      // ignore
    }
  }, [openedNoteIds]);

  const handleToggleGiftMode = (enabled: boolean) => {
    setIsGiftMode(enabled);
    try {
      localStorage.setItem(GIFT_MODE_KEY, String(enabled));
    } catch {
      // ignore
    }
  };

  const handleQuickLockInAndPublish = async () => {
    const res = await publishContentToServer(content, true);
    if (res.ok) {
      setJustPublishedToast(true);
      window.setTimeout(() => setJustPublishedToast(false), 4000);
    }
  };

  const metrics = calculateAnniversaryMetrics('2026-10-26T00:00:00Z');
  const mainPhoto = getMainAnniversaryPhoto(content.galleryPhotos);

  const handleStartMusicGesture = async (enableMusic: boolean) => {
    if (enableMusic) {
      const started = await romanticPiano.play();
      setIsPlayingMusic(started);
    } else {
      romanticPiano.pause();
      setIsPlayingMusic(false);
    }
  };

  const handleOpenStoryFromCurtain = async (enableMusic: boolean) => {
    setHasEnteredStory(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (enableMusic && !romanticPiano.getIsPlaying()) {
      const started = await romanticPiano.play();
      setIsPlayingMusic(started);
    }
  };

  const handleTogglePlayMusic = async () => {
    if (isPlayingMusic) {
      romanticPiano.pause();
      setIsPlayingMusic(false);
    } else {
      if (isMutedMusic) {
        romanticPiano.setMuted(false);
        setIsMutedMusic(false);
      }
      const started = await romanticPiano.play();
      setIsPlayingMusic(started);
    }
  };

  const handleToggleMuteMusic = () => {
    const nextMuted = !isMutedMusic;
    romanticPiano.setMuted(nextMuted);
    setIsMutedMusic(nextMuted);
  };

  const handleChangeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVol = parseFloat(e.target.value);
    setMusicVolume(nextVol);
    romanticPiano.setVolume(nextVol);
    setIsMutedMusic(romanticPiano.getMuted());
  };

  const handleExportBackup = () => {
    const payload = {
      content,
      giftModeDefault: true,
      publishedAt: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'published-story.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReplayStory = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setHasEnteredStory(false);
  };

  const handleInspectPhotoWithAI = (imageUrl: string, title: string) => {
    setStudioModalState({
      isOpen: true,
      tab: 'analyze',
      analyzeImage: { imageUrl, title },
    });
  };

  return (
    <div className="min-h-screen bg-[#270812] text-[#FFF7F0] relative selection:bg-[#D8B16D]/30">
      {/* SECTION 3: Full-Screen Cinematic Opening Curtain */}
      {!hasEnteredStory && (
        <OpeningScreen
          onOpenStory={handleOpenStoryFromCurtain}
          onStartMusicGesture={handleStartMusicGesture}
          musicEnabledChoice={musicEnabledOnStart}
          onToggleMusicChoice={setMusicEnabledOnStart}
        />
      )}

      {/* Strict 3-Zone Top Bar Navigation Contract */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-4 bg-[#270812]/90 backdrop-blur-md border-b border-[#D8B16D]/25">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#story-timeline"
          className="font-serif-editorial text-xl sm:text-2xl font-semibold tracking-wide text-[#FFF7F0] whitespace-nowrap shrink-0"
        >
          James &amp; Loraine
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Primary sections"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#F1D6DC]"
        >
          <a
            href="#story-timeline"
            className="hover:text-[#D8B16D] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Our Story
          </a>
          <a
            href="#photo-gallery"
            className="hover:text-[#D8B16D] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Gallery
          </a>
          <a
            href="#things-i-may-not-say-enough"
            className="hover:text-[#D8B16D] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Love Letter
          </a>
          <a
            href="#twelve-love-notes"
            className="hover:text-[#D8B16D] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            12 Notes
          </a>
          <a
            href="#sealed-surprise-letter"
            className="hover:text-[#D8B16D] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Final Surprise
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {isGiftMode ? (
            <a
              href="#sealed-surprise-letter"
              className="px-4 py-2 text-xs font-semibold text-[#270812] bg-[#D8B16D] hover:bg-[#E5C17E] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Read Your Letter ♥
            </a>
          ) : (
            <button
              type="button"
              onClick={() =>
                setStudioModalState({
                  isOpen: true,
                  tab: 'customize',
                  analyzeImage: null,
                })
              }
              className="px-4 py-2 text-xs font-semibold text-[#270812] bg-[#D8B16D] hover:bg-[#E5C17E] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Share &amp; Backup
            </button>
          )}
        </div>
      </header>

      {/* Secondary Toolbar for Music Player & Gift Mode / Publish Controls */}
      <div className="bg-[#380B1C]/80 border-b border-[#D8B16D]/20 px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Soft Romantic Piano Controls (Section 10) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-[#D8B16D] font-medium">
              <Music className="w-3.5 h-3.5" />
              <span className="truncate max-w-[180px] sm:max-w-xs">
                {currentTrackName}
              </span>
            </span>

            <button
              type="button"
              onClick={handleTogglePlayMusic}
              aria-label={
                isPlayingMusic
                  ? 'Pause soft romantic piano music'
                  : 'Play soft romantic piano music'
              }
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#4A1025] hover:bg-[#611530] border border-[#D8B16D]/50 text-[#FFF7F0] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {isPlayingMusic ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-[#D8B16D]" />
                  <span>Pause Music</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#D8B16D]" />
                  <span>Play Piano</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleToggleMuteMusic}
              aria-label={isMutedMusic ? 'Unmute piano music' : 'Mute piano music'}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#270812]/80 hover:bg-[#4A1025] border border-[#D8B16D]/35 text-[#F1D6DC] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {isMutedMusic ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-300" />
                  <span>Unmute</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#D8B16D]" />
                  <span>Mute</span>
                </>
              )}
            </button>

            <label className="hidden sm:inline-flex items-center gap-1.5 text-[#F1D6DC]/80">
              <span className="sr-only">Piano Volume</span>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={isMutedMusic ? 0 : musicVolume}
                onChange={handleChangeVolume}
                aria-label="Piano music volume"
                className="w-20 accent-[#D8B16D] cursor-pointer"
              />
            </label>
          </div>

          {/* Photo Mode vs Loraine's Gift View Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {isGiftMode ? (
              <button
                type="button"
                onClick={() => handleToggleGiftMode(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#270812]/60 hover:bg-[#4A1025] border border-[#D8B16D]/25 text-[#F1D6DC]/75 hover:text-[#FFF7F0] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Switch back to Photo Upload Mode"
              >
                <Camera className="w-3 h-3 text-[#D8B16D]" />
                <span>Photo Upload Mode (James)</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleQuickLockInAndPublish}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#D8B16D] hover:bg-[#E7C686] text-[#270812] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {justPublishedToast ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved for Loraine’s Link!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Lock In &amp; Save for Loraine</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleGiftMode(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#4A1025] hover:bg-[#611530] border border-[#D8B16D]/50 text-[#FFF7F0] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Eye className="w-3.5 h-3.5 text-[#D8B16D]" />
                  <span>Loraine’s Gift View</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setStudioModalState({
                      isOpen: true,
                      tab: 'analyze',
                      analyzeImage: mainPhoto
                        ? {
                            imageUrl: mainPhoto.imageUrl,
                            title: mainPhoto.caption,
                          }
                        : null,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#270812]/80 hover:bg-[#4A1025] border border-[#D8B16D]/40 text-[#D8B16D] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setStudioModalState({
                      isOpen: true,
                      tab: 'chat',
                      analyzeImage: null,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#270812]/80 hover:bg-[#4A1025] border border-[#D8B16D]/40 text-[#F1D6DC] hover:text-[#FFF7F0] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#D8B16D]" />
                  <span>Storyteller Chat</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Quick Section Navigation Strip */}
        <nav
          aria-label="Mobile section navigation"
          className="flex md:hidden items-center gap-4 overflow-x-auto pt-2.5 mt-2.5 border-t border-[#D8B16D]/15 text-xs text-[#F1D6DC]"
        >
          <a
            href="#story-timeline"
            className="hover:text-[#D8B16D] whitespace-nowrap shrink-0"
          >
            Our Story
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="#photo-gallery"
            className="hover:text-[#D8B16D] whitespace-nowrap shrink-0"
          >
            Gallery
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="#things-i-may-not-say-enough"
            className="hover:text-[#D8B16D] whitespace-nowrap shrink-0"
          >
            Love Letter
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="#twelve-love-notes"
            className="hover:text-[#D8B16D] whitespace-nowrap shrink-0"
          >
            12 Notes
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="#sealed-surprise-letter"
            className="hover:text-[#D8B16D] whitespace-nowrap shrink-0"
          >
            Final Surprise
          </a>
        </nav>
      </div>

      {/* Main Content Flow */}
      <main>
        {/* SECTION 4: Five-Chapter Interactive Love Story Timeline */}
        <TimelineSection
          content={content}
          metrics={metrics}
          isGiftMode={isGiftMode}
          onUpdateContent={setContent}
          onInspectMemoryPhotoWithAI={handleInspectPhotoWithAI}
        />

        {/* SECTION 5: Our Photo Gallery & Scrapbook Manager */}
        <PhotoGallerySection
          photos={content.galleryPhotos}
          isGiftMode={isGiftMode}
          onUpdatePhotos={(updater) =>
            setContent((prev) => ({
              ...prev,
              galleryPhotos: updater(prev.galleryPhotos),
            }))
          }
          onExportBackup={handleExportBackup}
          onInspectPhotoWithAI={handleInspectPhotoWithAI}
        />

        {/* SECTION 6: "Things I May Not Say Enough" Love Letter */}
        <LoveLetterSection
          letter={content.thingsIMayNotSayEnoughLetter}
          isGiftMode={isGiftMode}
        />

        {/* SECTION 7: Twelve Little Love Notes */}
        <TwelveLoveNotesSection
          notes={content.twelveLoveNotes}
          openedNoteIds={openedNoteIds}
          isGiftMode={isGiftMode}
          onRecordOpenedNote={setOpenedNoteIds}
        />

        {/* SECTION 8: The Big Surprise — A Letter Sealed With Love */}
        <SealedSurpriseSection
          letter={content.sealedSurpriseLetter}
          mainPhoto={mainPhoto}
          supportingPhotos={content.galleryPhotos}
          isGiftMode={isGiftMode}
        />

        {/* SECTION 9: Three Interactive Digital Gifts */}
        <DigitalGiftsSection
          gifts={content.digitalGifts}
          mainPhoto={mainPhoto}
          isGiftMode={isGiftMode}
        />

        {/* SECTION 11: The Final Screen */}
        <FinalScreenSection
          mainPhoto={mainPhoto}
          onReplayStory={handleReplayStory}
        />
      </main>

      {/* Share, Backup, Audio Replacement & Gemini Studio Modal */}
      <StudioAndAssistantModal
        isOpen={studioModalState.isOpen}
        initialTab={studioModalState.tab}
        initialAnalyzeImage={studioModalState.analyzeImage}
        onClose={() =>
          setStudioModalState((prev) => ({ ...prev, isOpen: false }))
        }
        content={content}
        isGiftMode={isGiftMode}
        onToggleGiftMode={handleToggleGiftMode}
        onPublishToServer={() => publishContentToServer(content, true)}
        lastPublishedAt={lastPublishedAt}
        onImportContent={(newContent) => {
          const merged = mergeUploadedPhotosWithCleanText(
            newContent,
            INITIAL_LOVE_STORY_CONTENT
          );
          setContent(merged);
          publishContentToServer(merged, true);
        }}
        onResetToDefaults={() => {
          setContent(INITIAL_LOVE_STORY_CONTENT);
          setOpenedNoteIds([]);
        }}
        onExportBackup={handleExportBackup}
        currentTrackName={currentTrackName}
        onSelectCustomAudio={(fileUrl, fileName) => {
          romanticPiano.setCustomAudioFile(fileUrl, fileName);
          setCurrentTrackName(romanticPiano.getTrackName());
          setIsPlayingMusic(romanticPiano.getIsPlaying());
        }}
        onResetDefaultAudio={() => {
          romanticPiano.clearCustomAudioFile();
          setCurrentTrackName(romanticPiano.getTrackName());
          setIsPlayingMusic(romanticPiano.getIsPlaying());
        }}
      />
    </div>
  );
}
