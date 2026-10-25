import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyQuickUploadToSlot,
  calculateAnniversaryMetrics,
  filterGalleryByCategory,
  getMainAnniversaryPhoto,
  getPhotoSyncSummary,
  mergeUploadedPhotosWithCleanText,
  removeGalleryPhotoById,
  reorderGalleryPhotos,
  setMainPhotoById,
  toggleOpenedNoteIds,
  validateImportedStoryContent,
} from './storyLogic';
import { INITIAL_LOVE_STORY_CONTENT, LoveStoryContent } from '../data/loveStoryData';

test('calculateAnniversaryMetrics returns accurate 2016 and 2022 to 2026 milestones', () => {
  const metrics = calculateAnniversaryMetrics('2026-10-26T00:00:00Z');
  assert.equal(metrics.yearsSinceFirstMet, 10);
  assert.equal(metrics.yearsOfficialCouple, 4);
  assert.equal(metrics.monthsOfficialCouple, 48);
  assert.equal(metrics.daysOfficialCouple, 1461); // includes 2024 leap year
});

test('filterGalleryByCategory filters accurately and returns all for All', () => {
  const photos = INITIAL_LOVE_STORY_CONTENT.galleryPhotos;
  const all = filterGalleryByCategory(photos, 'All');
  assert.equal(all.length, photos.length);

  const favMemories = filterGalleryByCategory(
    photos,
    'My Favorite Memories of Us'
  );
  assert.ok(favMemories.length >= 1);
  assert.ok(
    favMemories.every((p) => p.category === 'My Favorite Memories of Us')
  );
});

test('setMainPhotoById switches main anniversary photo exclusively', () => {
  const photos = INITIAL_LOVE_STORY_CONTENT.galleryPhotos;
  const updated = setMainPhotoById(photos, 'gal-3');
  const main = getMainAnniversaryPhoto(updated);
  assert.equal(main?.id, 'gal-3');
  assert.equal(
    updated.filter((p) => p.isMainAnniversaryPhoto).length,
    1
  );
});

test('reorderGalleryPhotos moves photo cleanly and ignores out-of-bounds indices', () => {
  const photos = INITIAL_LOVE_STORY_CONTENT.galleryPhotos;
  const firstId = photos[0].id;
  const secondId = photos[1].id;

  const reordered = reorderGalleryPhotos(photos, 0, 1);
  assert.equal(reordered[0].id, secondId);
  assert.equal(reordered[1].id, firstId);

  const unchanged = reorderGalleryPhotos(photos, -1, 99);
  assert.equal(unchanged[0].id, firstId);
});

test('removeGalleryPhotoById reassigns main anniversary photo if the main photo was removed', () => {
  const photos = INITIAL_LOVE_STORY_CONTENT.galleryPhotos;
  const mainPhoto = getMainAnniversaryPhoto(photos)!;
  const remaining = removeGalleryPhotoById(photos, mainPhoto.id);
  assert.equal(remaining.length, photos.length - 1);
  assert.equal(remaining.some((p) => p.isMainAnniversaryPhoto), true);
});

test('toggleOpenedNoteIds records opened notes without duplicates', () => {
  let opened: number[] = [];
  opened = toggleOpenedNoteIds(opened, 5);
  opened = toggleOpenedNoteIds(opened, 1);
  opened = toggleOpenedNoteIds(opened, 5);
  assert.deepEqual(opened, [1, 5]);
});

test('validateImportedStoryContent validates valid and invalid packages', () => {
  const validResult = validateImportedStoryContent(INITIAL_LOVE_STORY_CONTENT);
  assert.equal(validResult.valid, true);

  const invalidResult = validateImportedStoryContent({ foo: 'bar' });
  assert.equal(invalidResult.valid, false);
  assert.ok(invalidResult.error);
});

test('mergeUploadedPhotosWithCleanText preserves uploaded photos and upgrades bracketed placeholders', () => {
  const savedWithOldPlaceholders: LoveStoryContent = {
    ...INITIAL_LOVE_STORY_CONTENT,
    chapterOne: {
      ...INITIAL_LOVE_STORY_CONTENT.chapterOne,
      imageUrl: 'data:image/jpeg;base64,JAMES_UPLOADED_PHOTO_1',
      imageCaption: 'Early keepsake — June 15–20, 2016 [Replace with your photo or caption]',
    },
    chapterFive: {
      ...INITIAL_LOVE_STORY_CONTENT.chapterFive,
      personalWishPlaceholder: "[JAMES'S PERSONAL WISH FOR OUR FUTURE]",
    },
  };

  const merged = mergeUploadedPhotosWithCleanText(
    savedWithOldPlaceholders,
    INITIAL_LOVE_STORY_CONTENT
  );

  assert.equal(merged.chapterOne.imageUrl, 'data:image/jpeg;base64,JAMES_UPLOADED_PHOTO_1');
  assert.equal(merged.chapterOne.imageCaption.includes('['), false);
  assert.equal(merged.chapterFive.personalWishPlaceholder.includes('['), false);
});

test('getPhotoSyncSummary and applyQuickUploadToSlot accurately track and fill missing photo slots', () => {
  const initialSummary = getPhotoSyncSummary(INITIAL_LOVE_STORY_CONTENT);
  assert.equal(initialSummary.totalSlots, 15);
  assert.equal(initialSummary.realCount, 0);
  assert.equal(initialSummary.missingSlots.length, 15);

  let updated = applyQuickUploadToSlot(
    INITIAL_LOVE_STORY_CONTENT,
    'chapterFour',
    'data:image/jpeg;base64,REAL_CH4'
  );
  updated = applyQuickUploadToSlot(
    updated,
    'mem-2',
    'data:image/jpeg;base64,REAL_MEM2'
  );
  updated = applyQuickUploadToSlot(
    updated,
    'gal-6',
    'data:image/jpeg;base64,REAL_GAL6'
  );

  const afterSummary = getPhotoSyncSummary(updated);
  assert.equal(afterSummary.realCount, 3);
  assert.equal(afterSummary.missingSlots.length, 12);
});

