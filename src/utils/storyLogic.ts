import {
  GalleryCategory,
  GalleryPhoto,
  INITIAL_LOVE_STORY_CONTENT,
  LoveStoryContent,
} from '../data/loveStoryData';

export interface StoryDurationMetrics {
  yearsSinceFirstMet: number;
  yearsOfficialCouple: number;
  monthsOfficialCouple: number;
  daysOfficialCouple: number;
}

/**
 * Calculates deterministic relationship milestones between:
 * - First Met: June 15–20, 2016 (using June 18, 2016 midpoint)
 * - Official Relationship Start: October 26, 2022
 * - Fourth Anniversary: October 26, 2026
 */
export function calculateAnniversaryMetrics(
  targetAnniversaryIso = '2026-10-26T00:00:00Z'
): StoryDurationMetrics {
  const firstMetDate = new Date('2016-06-18T00:00:00Z');
  const officialStartDate = new Date('2022-10-26T00:00:00Z');
  const anniversaryDate = new Date(targetAnniversaryIso);

  const yearsSinceFirstMet =
    anniversaryDate.getUTCFullYear() - firstMetDate.getUTCFullYear();
  const yearsOfficialCouple =
    anniversaryDate.getUTCFullYear() - officialStartDate.getUTCFullYear();
  const monthsOfficialCouple = yearsOfficialCouple * 12;

  const diffMs = anniversaryDate.getTime() - officialStartDate.getTime();
  const daysOfficialCouple = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return {
    yearsSinceFirstMet,
    yearsOfficialCouple,
    monthsOfficialCouple,
    daysOfficialCouple,
  };
}

export function filterGalleryByCategory(
  photos: GalleryPhoto[],
  category: GalleryCategory | 'All'
): GalleryPhoto[] {
  if (category === 'All') {
    return photos;
  }
  return photos.filter((photo) => photo.category === category);
}

export function getMainAnniversaryPhoto(photos: GalleryPhoto[]): GalleryPhoto | undefined {
  return (
    photos.find((photo) => photo.isMainAnniversaryPhoto) || photos[0]
  );
}

export function setMainPhotoById(
  photos: GalleryPhoto[],
  photoId: string
): GalleryPhoto[] {
  const exists = photos.some((p) => p.id === photoId);
  if (!exists) return photos;
  return photos.map((photo) => ({
    ...photo,
    isMainAnniversaryPhoto: photo.id === photoId,
  }));
}

export function reorderGalleryPhotos(
  photos: GalleryPhoto[],
  fromIndex: number,
  toIndex: number
): GalleryPhoto[] {
  if (
    fromIndex < 0 ||
    fromIndex >= photos.length ||
    toIndex < 0 ||
    toIndex >= photos.length ||
    fromIndex === toIndex
  ) {
    return photos;
  }
  const updated = [...photos];
  const [moved] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, moved);
  return updated;
}

export function removeGalleryPhotoById(
  photos: GalleryPhoto[],
  photoId: string
): GalleryPhoto[] {
  const filtered = photos.filter((photo) => photo.id !== photoId);
  if (
    filtered.length > 0 &&
    !filtered.some((photo) => photo.isMainAnniversaryPhoto)
  ) {
    filtered[0] = { ...filtered[0], isMainAnniversaryPhoto: true };
  }
  return filtered;
}

export function toggleOpenedNoteIds(
  openedIds: number[],
  noteId: number
): number[] {
  if (openedIds.includes(noteId)) {
    return openedIds;
  }
  return [...openedIds, noteId].sort((a, b) => a - b);
}

export function validateImportedStoryContent(
  raw: unknown
): { valid: boolean; error?: string; data?: LoveStoryContent } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Imported package must be a valid JSON object.' };
  }
  const maybeWrapped = raw as { content?: Partial<LoveStoryContent> };
  const candidate = (
    maybeWrapped.content && typeof maybeWrapped.content === 'object'
      ? maybeWrapped.content
      : raw
  ) as Partial<LoveStoryContent>;
  if (
    typeof candidate.groomName !== 'string' ||
    typeof candidate.brideName !== 'string' ||
    !Array.isArray(candidate.galleryPhotos) ||
    !Array.isArray(candidate.twelveLoveNotes)
  ) {
    return {
      valid: false,
      error:
        'Invalid package structure: missing core fields (groomName, brideName, galleryPhotos, or twelveLoveNotes).',
    };
  }
  return { valid: true, data: candidate as LoveStoryContent };
}

/**
 * Preserves any photos James has already uploaded in localStorage while
 * automatically upgrading any old "[BRACKETED PLACEHOLDER]" text to our
 * finished romantic writing.
 */
export function mergeUploadedPhotosWithCleanText(
  saved: LoveStoryContent,
  cleanDefaults: LoveStoryContent = INITIAL_LOVE_STORY_CONTENT
): LoveStoryContent {
  const hasBracket = (str?: string) => Boolean(str && /\[.+\]/.test(str));

  return {
    ...cleanDefaults,
    chapterOne: {
      ...cleanDefaults.chapterOne,
      imageUrl: saved.chapterOne?.imageUrl || cleanDefaults.chapterOne.imageUrl,
      imageCaption: hasBracket(saved.chapterOne?.imageCaption)
        ? cleanDefaults.chapterOne.imageCaption
        : saved.chapterOne?.imageCaption || cleanDefaults.chapterOne.imageCaption,
    },
    chapterTwo: {
      ...cleanDefaults.chapterTwo,
      imageUrl: saved.chapterTwo?.imageUrl || cleanDefaults.chapterTwo.imageUrl,
      imageCaption: hasBracket(saved.chapterTwo?.imageCaption)
        ? cleanDefaults.chapterTwo.imageCaption
        : saved.chapterTwo?.imageCaption || cleanDefaults.chapterTwo.imageCaption,
    },
    chapterThree: {
      ...cleanDefaults.chapterThree,
      memories: cleanDefaults.chapterThree.memories.map((defaultMem, idx) => {
        const savedMem =
          saved.chapterThree?.memories?.find((m) => m.id === defaultMem.id) ||
          saved.chapterThree?.memories?.[idx];
        return {
          ...defaultMem,
          imageUrl: savedMem?.imageUrl || defaultMem.imageUrl,
          title:
            savedMem?.title && !hasBracket(savedMem.title)
              ? savedMem.title
              : defaultMem.title,
          date:
            savedMem?.date && !hasBracket(savedMem.date)
              ? savedMem.date
              : defaultMem.date,
          story:
            savedMem?.story && !hasBracket(savedMem.story)
              ? savedMem.story
              : defaultMem.story,
        };
      }),
    },
    chapterFour: {
      ...cleanDefaults.chapterFour,
      imageUrl: saved.chapterFour?.imageUrl || cleanDefaults.chapterFour.imageUrl,
      imageCaption: hasBracket(saved.chapterFour?.imageCaption)
        ? cleanDefaults.chapterFour.imageCaption
        : saved.chapterFour?.imageCaption || cleanDefaults.chapterFour.imageCaption,
    },
    chapterFive: {
      ...cleanDefaults.chapterFive,
      personalWishPlaceholder:
        saved.chapterFive?.personalWishPlaceholder &&
        !hasBracket(saved.chapterFive.personalWishPlaceholder)
          ? saved.chapterFive.personalWishPlaceholder
          : cleanDefaults.chapterFive.personalWishPlaceholder,
    },
    galleryPhotos: Array.isArray(saved.galleryPhotos) && saved.galleryPhotos.length > 0
      ? saved.galleryPhotos.map((p, idx) => {
          const fallbackPhoto =
            cleanDefaults.galleryPhotos.find((d) => d.id === p.id) ||
            cleanDefaults.galleryPhotos[idx % cleanDefaults.galleryPhotos.length];
          return {
            ...p,
            caption:
              p.caption && !hasBracket(p.caption)
                ? p.caption
                : fallbackPhoto.caption,
            date:
              p.date && !hasBracket(p.date)
                ? p.date
                : fallbackPhoto.date,
            memory:
              p.memory && !hasBracket(p.memory)
                ? p.memory
                : fallbackPhoto.memory,
          };
        })
      : cleanDefaults.galleryPhotos,
    thingsIMayNotSayEnoughLetter: {
      ...cleanDefaults.thingsIMayNotSayEnoughLetter,
      customDetailPlaceholder:
        saved.thingsIMayNotSayEnoughLetter?.customDetailPlaceholder &&
        !hasBracket(saved.thingsIMayNotSayEnoughLetter.customDetailPlaceholder)
          ? saved.thingsIMayNotSayEnoughLetter.customDetailPlaceholder
          : cleanDefaults.thingsIMayNotSayEnoughLetter.customDetailPlaceholder,
    },
    twelveLoveNotes: cleanDefaults.twelveLoveNotes.map((defaultNote) => {
      const savedNote = saved.twelveLoveNotes?.find(
        (n) => n.id === defaultNote.id
      );
      return {
        ...defaultNote,
        message:
          savedNote?.message && !hasBracket(savedNote.message)
            ? savedNote.message
            : defaultNote.message,
      };
    }),
    sealedSurpriseLetter: {
      ...cleanDefaults.sealedSurpriseLetter,
      personalMessagePlaceholder:
        saved.sealedSurpriseLetter?.personalMessagePlaceholder &&
        !hasBracket(saved.sealedSurpriseLetter.personalMessagePlaceholder)
          ? saved.sealedSurpriseLetter.personalMessagePlaceholder
          : cleanDefaults.sealedSurpriseLetter.personalMessagePlaceholder,
    },
    digitalGifts: {
      ...cleanDefaults.digitalGifts,
      memoryToKeepCaption:
        saved.digitalGifts?.memoryToKeepCaption &&
        !hasBracket(saved.digitalGifts.memoryToKeepCaption)
          ? saved.digitalGifts.memoryToKeepCaption
          : cleanDefaults.digitalGifts.memoryToKeepCaption,
      promiseToRememberMessage:
        saved.digitalGifts?.promiseToRememberMessage &&
        !hasBracket(saved.digitalGifts.promiseToRememberMessage)
          ? saved.digitalGifts.promiseToRememberMessage
          : cleanDefaults.digitalGifts.promiseToRememberMessage,
      wishForNextChapterPlaceholder:
        saved.digitalGifts?.wishForNextChapterPlaceholder &&
        !hasBracket(saved.digitalGifts.wishForNextChapterPlaceholder)
          ? saved.digitalGifts.wishForNextChapterPlaceholder
          : cleanDefaults.digitalGifts.wishForNextChapterPlaceholder,
    },
  };
}
