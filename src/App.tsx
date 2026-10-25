import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Upload,
  FileUp,
  RefreshCw,
  Globe,
} from 'lucide-react';
import {
  INITIAL_LOVE_STORY_CONTENT,
  LoveStoryContent,
} from './data/loveStoryData';
import publishedStoryBundle from './data/publishedStory.json';
import {
  applyQuickUploadToSlot,
  calculateAnniversaryMetrics,
  combineStoriesPreservingRealPhotos,
  getMainAnniversaryPhoto,
  getPhotoSyncSummary,
  mergeUploadedPhotosWithCleanText,
  validateImportedStoryContent,
  verifyRemoteStoryMatchesLocal,
} from './utils/storyLogic';
import {
  compressImageFile,
  loadStoryFromIndexedDB,
  optimizeAllPhotosInStory,
  saveStoryToIndexedDB,
} from './utils/imageStorage';
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

function getInitialBundledStory(): LoveStoryContent {
  const bundleObj = publishedStoryBundle as unknown as {
    content?: LoveStoryContent;
  };
  let base = INITIAL_LOVE_STORY_CONTENT;
  if (bundleObj?.content) {
    base = combineStoriesPreservingRealPhotos(
      mergeUploadedPhotosWithCleanText(
        bundleObj.content,
        INITIAL_LOVE_STORY_CONTENT
      ),
      base
    );
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as LoveStoryContent;
      const cleanedLocal = mergeUploadedPhotosWithCleanText(
        parsed,
        INITIAL_LOVE_STORY_CONTENT
      );
      base = combineStoriesPreservingRealPhotos(cleanedLocal, base);
    }
  } catch {
    // Ignore parse errors
  }
  return base;
}

function isStaticProductionHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return (
    host.endsWith('.vercel.app') ||
    host.endsWith('.netlify.app') ||
    host.endsWith('.github.io')
  );
}

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
      // On Vercel / production links, always default to Loraine's pure Gift View!
      if (isStaticProductionHost()) return true;
      try {
        const storedGift = localStorage.getItem(GIFT_MODE_KEY);
        if (storedGift !== null) return storedGift === 'true';
      } catch {
        // ignore
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

  const [content, setContent] = useState<LoveStoryContent>(
    getInitialBundledStory
  );

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

  const [lastPublishedAt, setLastPublishedAt] = useState<string | null>(() => {
    const bundleObj = publishedStoryBundle as unknown as {
      publishedAt?: string;
    };
    return bundleObj?.publishedAt || null;
  });
  const [justPublishedToast, setJustPublishedToast] = useState<boolean>(false);
  const [isSavingToServer, setIsSavingToServer] = useState<boolean>(false);
  const [importStatusBanner, setImportStatusBanner] = useState<string | null>(
    null
  );
  const [remoteSyncState, setRemoteSyncState] = useState<
    'idle' | 'syncing' | 'verifying' | 'verified' | 'static-local' | 'error'
  >('idle');
  const [remoteVerifiedCount, setRemoteVerifiedCount] = useState<number>(() =>
    getPhotoSyncSummary(getInitialBundledStory()).realCount
  );
  const [liveVercelStatus, setLiveVercelStatus] = useState<{
    checked: boolean;
    reachable: boolean;
    realCount: number;
    totalSlots: number;
    isLiveMatchedWithProject: boolean;
    publishedAt: string | null;
  }>({
    checked: false,
    reachable: false,
    realCount: 12,
    totalSlots: 15,
    isLiveMatchedWithProject: false,
    publishedAt: null,
  });

  const hasCompletedInitialHydrationRef = useRef<boolean>(false);

  const [studioModalState, setStudioModalState] = useState<{
    isOpen: boolean;
    tab: 'customize' | 'analyze' | 'chat';
    analyzeImage: { imageUrl: string; title: string } | null;
  }>({
    isOpen: false,
    tab: 'customize',
    analyzeImage: null,
  });

  const checkLiveVercelSyncStatus = useCallback(
    async (currentLocalStory: LoveStoryContent) => {
      if (isStaticProductionHost()) {
        try {
          const res = await fetch(`/published-story.json?t=${Date.now()}`, {
            cache: 'no-store',
          });
          if (res.ok) {
            const data = await res.json();
            const rawStory = (data?.content || data) as LoveStoryContent;
            const vSummary = getPhotoSyncSummary(rawStory);
            const verification = verifyRemoteStoryMatchesLocal(
              currentLocalStory,
              rawStory
            );
            setLiveVercelStatus({
              checked: true,
              reachable: true,
              realCount: vSummary.realCount,
              totalSlots: vSummary.totalSlots,
              isLiveMatchedWithProject:
                verification.verified &&
                vSummary.realCount ===
                  getPhotoSyncSummary(currentLocalStory).realCount,
              publishedAt: data?.publishedAt || null,
            });
          }
        } catch {
          // ignore
        }
        return;
      }

      try {
        const res = await fetch(`/api/story/sync-status?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.liveVercel) {
            setLiveVercelStatus({
              checked: true,
              reachable: Boolean(data.liveVercel.reachable),
              realCount: Number(data.liveVercel.realCount ?? 0),
              totalSlots: Number(data.liveVercel.totalSlots ?? 15),
              isLiveMatchedWithProject: Boolean(
                data.liveVercel.isLiveMatchedWithProject
              ),
              publishedAt: data.liveVercel.publishedAt || null,
            });
          }
        }
      } catch {
        // ignore
      }
    },
    []
  );

  const publishContentToServer = useCallback(
    async (
      storyToSave: LoveStoryContent,
      giftModeDefault = true
    ): Promise<{
      ok: boolean;
      verified?: boolean;
      publishedAt?: string;
      error?: string;
    }> => {
      const mergedIdb = await saveStoryToIndexedDB(storyToSave);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedIdb));
      } catch {
        // IndexedDB and server handle large payloads
      }

      if (isStaticProductionHost()) {
        setRemoteSyncState('static-local');
        void checkLiveVercelSyncStatus(mergedIdb);
        return {
          ok: true,
          verified: false,
          publishedAt: new Date().toISOString(),
        };
      }

      setIsSavingToServer(true);
      setRemoteSyncState('syncing');

      try {
        let currentPayloadToSave = mergedIdb;
        let verified = false;
        let latestPublishedAt: string | undefined;

        // Attempt publish + explicit remote /published-story.json verification (up to 2 attempts)
        for (let attempt = 0; attempt < 2; attempt++) {
          const res = await fetch('/api/story/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: currentPayloadToSave,
              giftModeDefault,
            }),
          });
          const data = await res.json();
          if (data?.ok) {
            latestPublishedAt = data.publishedAt;
            setLastPublishedAt(data.publishedAt);
            if (data.content) {
              currentPayloadToSave = combineStoriesPreservingRealPhotos(
                currentPayloadToSave,
                data.content as LoveStoryContent
              );
              setContent((prev) =>
                combineStoriesPreservingRealPhotos(prev, currentPayloadToSave)
              );
            }
          }

          // Explicit background verification of remote /published-story.json
          setRemoteSyncState('verifying');
          const verifyRes = await fetch(
            `/published-story.json?t=${Date.now()}-${attempt}`,
            { cache: 'no-store' }
          );
          if (verifyRes.ok) {
            const remoteJson = await verifyRes.json();
            const remoteStory = (remoteJson?.content ||
              remoteJson) as LoveStoryContent;
            const check = verifyRemoteStoryMatchesLocal(
              currentPayloadToSave,
              remoteStory
            );
            setRemoteVerifiedCount(check.remoteRealCount);
            if (check.verified) {
              verified = true;
              break;
            }
            // Merge any extra remote photos before retry
            currentPayloadToSave = combineStoriesPreservingRealPhotos(
              currentPayloadToSave,
              remoteStory
            );
          }
        }

        setIsSavingToServer(false);
        setRemoteSyncState(verified ? 'verified' : 'error');
        void checkLiveVercelSyncStatus(currentPayloadToSave);

        return {
          ok: true,
          verified,
          publishedAt: latestPublishedAt,
        };
      } catch {
        setIsSavingToServer(false);
        setRemoteSyncState('error');
        return { ok: false, error: 'Saved locally in browser' };
      }
    },
    [checkLiveVercelSyncStatus]
  );

  // Wrapper for all photo uploads / changes: immediately updates state + IndexedDB AND explicitly triggers background /published-story.json verification
  const handleUserUpdateContent = useCallback(
    (updater: (prev: LoveStoryContent) => LoveStoryContent) => {
      setContent((prev) => {
        const next = updater(prev);
        window.setTimeout(() => {
          void publishContentToServer(next, true);
        }, 0);
        return next;
      });
    },
    [publishContentToServer]
  );

  // Forced synchronization strategy on initial hydration:
  // 1. Reads IndexedDB + localStorage + bundled JSON + un-cached /api/story & /published-story.json BEFORE any write
  // 2. Merges all real photos non-destructively and optimizes oversized images
  // 3. Forces an immediate sync + verification against remote /published-story.json and checks live Vercel status
  useEffect(() => {
    let isMounted = true;

    async function hydrateAndForceSyncAllSources() {
      let combined = getInitialBundledStory();

      // 1. Read IndexedDB first before any writes can occur
      const idbStory = await loadStoryFromIndexedDB();
      if (idbStory) {
        const cleanedIdb = mergeUploadedPhotosWithCleanText(
          idbStory,
          INITIAL_LOVE_STORY_CONTENT
        );
        combined = combineStoriesPreservingRealPhotos(cleanedIdb, combined);
      }

      // 2. Fetch un-cached remote /api/story and /published-story.json
      let remoteGiftDefault: boolean | undefined;
      try {
        const apiRes = await fetch(`/api/story?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (apiRes.ok) {
          const data = await apiRes.json();
          if (data?.found && data?.content) {
            const cleanedServer = mergeUploadedPhotosWithCleanText(
              data.content as LoveStoryContent,
              INITIAL_LOVE_STORY_CONTENT
            );
            combined = combineStoriesPreservingRealPhotos(
              combined,
              cleanedServer
            );
            remoteGiftDefault = data.giftModeDefault;
            if (data.publishedAt && isMounted) {
              setLastPublishedAt(data.publishedAt);
            }
          }
        }
      } catch {
        // Fallback to un-cached static /published-story.json on Vercel
      }

      try {
        const staticRes = await fetch(`/published-story.json?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (staticRes.ok) {
          const staticData = await staticRes.json();
          const rawStory = staticData?.content || staticData;
          if (rawStory?.groomName) {
            const cleanedStatic = mergeUploadedPhotosWithCleanText(
              rawStory as LoveStoryContent,
              INITIAL_LOVE_STORY_CONTENT
            );
            combined = combineStoriesPreservingRealPhotos(
              combined,
              cleanedStatic
            );
            remoteGiftDefault =
              remoteGiftDefault ?? staticData?.giftModeDefault ?? true;
          }
        }
      } catch {
        // ignore
      }

      // 3. Optimize any oversized photos (> 320KB) so all 15+ photos fit easily in localStorage & GitHub/Vercel
      const { optimized } = await optimizeAllPhotosInStory(combined);

      if (!isMounted) return;
      hasCompletedInitialHydrationRef.current = true;
      setContent(optimized);

      // 4. Forced background synchronization & verification of remote /published-story.json
      void publishContentToServer(optimized, true);

      // On static production hosts (Vercel), default to Loraine's Gift View (unless ?edit=1).
      // In AI Studio, keep Photo Upload Mode open whenever any photo slot is still missing so James sees the Sync & Verification Bar.
      const params = new URLSearchParams(window.location.search);
      if (params.get('gift') === '1') {
        setIsGiftMode(true);
      } else if (params.get('edit') === '1') {
        setIsGiftMode(false);
      } else if (isStaticProductionHost()) {
        setIsGiftMode(true);
      } else if (getPhotoSyncSummary(optimized).missingSlots.length > 0) {
        setIsGiftMode(false);
      } else if (
        localStorage.getItem(GIFT_MODE_KEY) === 'true' &&
        remoteGiftDefault
      ) {
        setIsGiftMode(true);
      }
    }

    void hydrateAndForceSyncAllSources();

    return () => {
      isMounted = false;
    };
  }, [publishContentToServer]);

  // Only persist on content changes AFTER initial hydration has completed so mount never clobbers IndexedDB
  useEffect(() => {
    if (!hasCompletedInitialHydrationRef.current) return;
    void saveStoryToIndexedDB(content);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch {
      // IndexedDB and server handle storage if localStorage is full
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
    const { optimized } = await optimizeAllPhotosInStory(content);
    setContent(optimized);
    const res = await publishContentToServer(optimized, true);
    if (res.ok) {
      setJustPublishedToast(true);
      window.setTimeout(() => setJustPublishedToast(false), 4500);
    }
  };

  const handleQuickSlotFileUpload = async (
    slotKey: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const compressedDataUrl = await compressImageFile(file);
    handleUserUpdateContent((prev) =>
      applyQuickUploadToSlot(prev, slotKey, compressedDataUrl)
    );
  };

  const handleQuickImportJsonPackage = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const raw = JSON.parse(String(reader.result || '{}'));
        const validation = validateImportedStoryContent(raw);
        if (validation.valid && validation.data) {
          const cleaned = mergeUploadedPhotosWithCleanText(
            validation.data,
            INITIAL_LOVE_STORY_CONTENT
          );
          const merged = combineStoriesPreservingRealPhotos(cleaned, content);
          const { optimized } = await optimizeAllPhotosInStory(merged);
          setContent(optimized);
          await publishContentToServer(optimized, true);
          const summary = getPhotoSyncSummary(optimized);
          setImportStatusBanner(
            `Imported & synced! ${summary.realCount} / ${summary.totalSlots} real photos are now saved into the GitHub/Vercel project.`
          );
        }
      } catch {
        setImportStatusBanner('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const metrics = calculateAnniversaryMetrics('2026-10-26T00:00:00Z');
  const mainPhoto = getMainAnniversaryPhoto(content.galleryPhotos);
  const photoSyncSummary = getPhotoSyncSummary(content);
  const showEditToggleInGiftMode =
    !isStaticProductionHost() ||
    (typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('edit') === '1');

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
              showEditToggleInGiftMode && (
                <button
                  type="button"
                  onClick={() => handleToggleGiftMode(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#270812]/60 hover:bg-[#4A1025] border border-[#D8B16D]/25 text-[#F1D6DC]/75 hover:text-[#FFF7F0] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  title="Switch back to Photo Upload Mode"
                >
                  <Camera className="w-3 h-3 text-[#D8B16D]" />
                  <span>Photo Upload Mode (James)</span>
                </button>
              )
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
                      <span>Locked In &amp; Saved to Project!</span>
                    </>
                  ) : isSavingToServer ? (
                    <>
                      <Share2 className="w-3.5 h-3.5 animate-pulse" />
                      <span>Auto-Saving Photo...</span>
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

      {/* Cross-Device Photo Sync & Remote /published-story.json + Live Vercel Deployment Verification Bar */}
      {!isGiftMode && (
        <div
          aria-label="Remote payload and live Vercel synchronization status"
          className="bg-[#2D0816] border-b border-[#D8B16D]/30 px-6 py-4"
        >
          <div className="max-w-6xl mx-auto flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Indicator 1: Local + /published-story.json Verification Pill */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-mono-tabular text-xs font-bold ${
                    remoteSyncState === 'syncing' ||
                    remoteSyncState === 'verifying'
                      ? 'bg-amber-300 text-[#270812]'
                      : remoteSyncState === 'verified'
                      ? 'bg-emerald-400 text-[#14291D]'
                      : 'bg-[#D8B16D] text-[#270812]'
                  }`}
                >
                  {remoteSyncState === 'syncing' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing to /published-story.json...</span>
                    </>
                  ) : remoteSyncState === 'verifying' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying /published-story.json...</span>
                    </>
                  ) : remoteSyncState === 'verified' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        /published-story.json Verified ({remoteVerifiedCount}/
                        {photoSyncSummary.totalSlots} Photos)
                      </span>
                    </>
                  ) : (
                    <span>
                      {photoSyncSummary.realCount} /{' '}
                      {photoSyncSummary.totalSlots} Real Photos Saved
                    </span>
                  )}
                </span>

                {/* Indicator 2: Live Vercel Deployment Verification Pill */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${
                    liveVercelStatus.isLiveMatchedWithProject &&
                    liveVercelStatus.realCount === photoSyncSummary.totalSlots
                      ? 'bg-emerald-950/90 border-emerald-400/60 text-emerald-200'
                      : liveVercelStatus.isLiveMatchedWithProject
                      ? 'bg-[#4A1025] border-[#D8B16D]/50 text-[#FFF7F0]'
                      : 'bg-amber-950/80 border-amber-400/60 text-amber-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-[#D8B16D]" />
                  {liveVercelStatus.isLiveMatchedWithProject &&
                  liveVercelStatus.realCount === photoSyncSummary.totalSlots ? (
                    <span>
                      ✓ Live on Vercel: All {liveVercelStatus.realCount}/
                      {liveVercelStatus.totalSlots} Photos Deployed
                    </span>
                  ) : liveVercelStatus.reachable ? (
                    <span>
                      Live Vercel Deployment: {liveVercelStatus.realCount}/
                      {liveVercelStatus.totalSlots} Photos Live
                      {photoSyncSummary.realCount > liveVercelStatus.realCount
                        ? ` · Push to GitHub to deploy ${photoSyncSummary.realCount}/${photoSyncSummary.totalSlots} to Vercel`
                        : ''}
                    </span>
                  ) : (
                    <span>
                      Ready for GitHub → Vercel ({photoSyncSummary.realCount}/
                      {photoSyncSummary.totalSlots} in bundle)
                    </span>
                  )}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickLockInAndPublish}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D8B16D] hover:bg-[#E7C686] text-[#270812] text-xs font-semibold cursor-pointer transition-colors"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      isSavingToServer ? 'animate-spin' : ''
                    }`}
                  />
                  <span>Force Sync &amp; Verify Now</span>
                </button>

                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4A1025] hover:bg-[#611530] border border-[#D8B16D]/50 text-xs text-[#FFF7F0] font-medium cursor-pointer transition-colors">
                  <FileUp className="w-3.5 h-3.5 text-[#D8B16D]" />
                  <span>Import Chrome Backup (.json)</span>
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={handleQuickImportJsonPackage}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            <p className="text-xs text-[#F1D6DC]/90">
              {photoSyncSummary.missingSlots.length === 0
                ? '✓ All 15 photo frames are verified in /published-story.json! Push to GitHub so Vercel builds all 15 photos for every phone.'
                : `${photoSyncSummary.missingSlots.length} frame${
                    photoSyncSummary.missingSlots.length > 1 ? 's' : ''
                  } still using default artwork in /published-story.json — upload them below, then push to GitHub so Vercel updates all phones:`}
            </p>

            {importStatusBanner && (
              <p className="text-xs text-emerald-300 font-medium">
                ✓ {importStatusBanner}
              </p>
            )}

            {photoSyncSummary.missingSlots.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {photoSyncSummary.missingSlots.map((slot) => (
                  <div
                    key={slot.slotKey}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#4A1025]/60 border border-[#D8B16D]/40"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-[#D8B16D] font-semibold truncate">
                        {slot.sectionLabel}
                      </p>
                      <p className="text-xs text-[#FFF7F0] truncate">
                        {slot.title}
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D8B16D] hover:bg-[#E7C686] text-[#270812] text-xs font-semibold cursor-pointer shrink-0 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleQuickSlotFileUpload(slot.slotKey, e)
                        }
                        className="sr-only"
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Flow */}
      <main>
        {/* SECTION 4: Five-Chapter Interactive Love Story Timeline */}
        <TimelineSection
          content={content}
          metrics={metrics}
          isGiftMode={isGiftMode}
          onUpdateContent={handleUserUpdateContent}
          onInspectMemoryPhotoWithAI={handleInspectPhotoWithAI}
        />

        {/* SECTION 5: Our Photo Gallery & Scrapbook Manager */}
        <PhotoGallerySection
          photos={content.galleryPhotos}
          isGiftMode={isGiftMode}
          onUpdatePhotos={(updater) =>
            handleUserUpdateContent((prev) => ({
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
          void publishContentToServer(merged, true);
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
