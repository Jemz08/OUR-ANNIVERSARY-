import { LoveStoryContent } from '../data/loveStoryData';
import { combineStoriesPreservingRealPhotos } from './storyLogic';

const IDB_NAME = 'loraine_fourth_anniversary_idb';
const IDB_STORE = 'story_store';
const IDB_KEY = 'current_story';

/**
 * Compresses and resizes an uploaded image File to a crisp JPEG data URL (max 1400px, 0.82 quality)
 * so 15+ photos stay lightweight (~150KB-220KB each) for fast saving, localStorage, and GitHub/Vercel.
 */
export function compressImageFile(
  file: File,
  maxDimension = 1400,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      compressDataUrl(rawDataUrl, maxDimension, quality)
        .then(resolve)
        .catch(() => resolve(rawDataUrl));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses any existing large base64 data URL (e.g., > 320KB) so existing photos fit comfortably
 * under localStorage and server limits without losing visual clarity.
 */
export function compressDataUrl(
  dataUrl: string,
  maxDimension = 1400,
  quality = 0.82
): Promise<string> {
  if (!dataUrl || dataUrl.startsWith('data:image/svg+xml')) {
    return Promise.resolve(dataUrl);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Optimizes any oversized base64 images (> 320KB) inside a LoveStoryContent object.
 */
export async function optimizeAllPhotosInStory(
  story: LoveStoryContent
): Promise<{ optimized: LoveStoryContent; changed: boolean }> {
  let changed = false;
  const threshold = 320_000;

  const maybeShrink = async (url: string): Promise<string> => {
    if (url && !url.startsWith('data:image/svg+xml') && url.length > threshold) {
      const next = await compressDataUrl(url, 1350, 0.8);
      if (next.length < url.length) {
        changed = true;
        return next;
      }
    }
    return url;
  };

  const c1Url = await maybeShrink(story.chapterOne.imageUrl);
  const c2Url = await maybeShrink(story.chapterTwo.imageUrl);
  const c4Url = await maybeShrink(story.chapterFour.imageUrl);

  const memories = await Promise.all(
    story.chapterThree.memories.map(async (m) => ({
      ...m,
      imageUrl: await maybeShrink(m.imageUrl),
    }))
  );

  const galleryPhotos = await Promise.all(
    story.galleryPhotos.map(async (p) => ({
      ...p,
      imageUrl: await maybeShrink(p.imageUrl),
    }))
  );

  if (!changed) {
    return { optimized: story, changed: false };
  }

  return {
    changed: true,
    optimized: {
      ...story,
      chapterOne: { ...story.chapterOne, imageUrl: c1Url },
      chapterTwo: { ...story.chapterTwo, imageUrl: c2Url },
      chapterFour: { ...story.chapterFour, imageUrl: c4Url },
      chapterThree: { ...story.chapterThree, memories },
      galleryPhotos,
    },
  };
}

function openStoryDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadStoryFromIndexedDB(): Promise<LoveStoryContent | null> {
  try {
    const db = await openStoryDB();
    const result = await new Promise<LoveStoryContent | null>(
      (resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
        req.onsuccess = () =>
          resolve((req.result as LoveStoryContent) || null);
        req.onerror = () => reject(req.error);
      }
    );
    db.close();
    return result;
  } catch {
    return null;
  }
}

export async function saveStoryToIndexedDB(
  story: LoveStoryContent
): Promise<LoveStoryContent> {
  try {
    const existing = await loadStoryFromIndexedDB();
    const merged = existing
      ? combineStoriesPreservingRealPhotos(story, existing)
      : story;
    const db = await openStoryDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(merged, IDB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    return merged;
  } catch {
    return story;
  }
}

