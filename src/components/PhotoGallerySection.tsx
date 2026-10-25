import React, { useState, useEffect } from 'react';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  Plus,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
  ArrowLeft,
  ArrowRight,
  Download,
} from 'lucide-react';
import {
  GALLERY_CATEGORIES,
  GalleryCategory,
  GalleryPhoto,
} from '../data/loveStoryData';
import {
  filterGalleryByCategory,
  removeGalleryPhotoById,
  reorderGalleryPhotos,
  setMainPhotoById,
} from '../utils/storyLogic';
import { compressImageFile } from '../utils/imageStorage';
import { RomanticImage } from './RomanticImage';

interface PendingUploadPreview {
  id: string;
  dataUrl: string;
  caption: string;
  date: string;
  memory: string;
  category: GalleryCategory;
}

interface PhotoGallerySectionProps {
  photos: GalleryPhoto[];
  isGiftMode?: boolean;
  onUpdatePhotos: (updater: (prev: GalleryPhoto[]) => GalleryPhoto[]) => void;
  onExportBackup: () => void;
  onInspectPhotoWithAI?: (imageUrl: string, caption: string) => void;
}

export const PhotoGallerySection: React.FC<PhotoGallerySectionProps> = ({
  photos,
  isGiftMode = false,
  onUpdatePhotos,
  onExportBackup,
  onInspectPhotoWithAI,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    GalleryCategory | 'All'
  >('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pendingPreviews, setPendingPreviews] = useState<
    PendingUploadPreview[]
  >([]);

  const filteredPhotos = filterGalleryByCategory(photos, selectedCategory);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % filteredPhotos.length
        );
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + filteredPhotos.length) % filteredPhotos.length
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredPhotos.length]);

  const handleMultiFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file, idx) => {
      compressImageFile(file).then((compressedUrl) => {
        setPendingPreviews((prev) => [
          ...prev,
          {
            id: `pending-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
            dataUrl: compressedUrl,
            caption: 'A cherished moment of us together, Baby.',
            date: 'October 26, 2022 – October 26, 2026',
            memory:
              'Every photo of us reminds me how lucky I am to walk through life by your side.',
            category:
              selectedCategory === 'All'
                ? 'My Favorite Memories of Us'
                : selectedCategory,
          },
        ]);
      });
    });
    e.target.value = '';
  };

  const commitPendingUploads = () => {
    if (pendingPreviews.length === 0) return;
    const rotations = [-1.6, 1.4, -1.1, 1.8, -1.3];
    onUpdatePhotos((prev) => {
      const updated = [...prev];
      const remainingToPrepend: GalleryPhoto[] = [];

      pendingPreviews.forEach((item, i) => {
        const placeholderIdx = updated.findIndex(
          (p) => p.isPlaceholder || p.imageUrl.startsWith('data:image/svg+xml')
        );
        if (placeholderIdx !== -1) {
          updated[placeholderIdx] = {
            ...updated[placeholderIdx],
            imageUrl: item.dataUrl,
            isPlaceholder: false,
          };
        } else {
          remainingToPrepend.push({
            id: `gal-${Date.now()}-${i}`,
            category: item.category,
            imageUrl: item.dataUrl,
            caption: item.caption || 'A cherished moment together',
            date: item.date || undefined,
            memory: item.memory || undefined,
            isMainAnniversaryPhoto: false,
            isPlaceholder: false,
            rotationDeg: rotations[i % rotations.length],
          });
        }
      });

      return [...remainingToPrepend, ...updated];
    });
    setPendingPreviews([]);
  };

  const handleReplaceSinglePhoto = async (
    photoId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const compressedUrl = await compressImageFile(file);
    onUpdatePhotos((prev) =>
      prev.map((p) =>
        p.id === photoId
          ? { ...p, imageUrl: compressedUrl, isPlaceholder: false }
          : p
      )
    );
  };

  const activeLightboxPhoto =
    lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <section
      id="photo-gallery"
      aria-labelledby="gallery-heading"
      className="py-20 md:py-28 px-6 max-w-6xl mx-auto border-t border-[#D8B16D]/20"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-[#D8B16D] mb-2">
            Our Scrapbook of Keepsakes
          </p>
          <h2
            id="gallery-heading"
            className="font-serif-editorial text-4xl sm:text-5xl text-[#FFF7F0] tracking-wide"
            style={{ textWrap: 'balance' }}
          >
            Our Photo Gallery
          </h2>
          <p className="text-sm sm:text-base text-[#F1D6DC]/85 mt-2 max-w-xl">
            Every frame holds a piece of our story—from your brightest smiles to
            the quiet moments that mean the world to me.
          </p>
        </div>

        {!isGiftMode && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsManagerOpen(!isManagerOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A1025] hover:bg-[#5E1530] border border-[#D8B16D] text-xs sm:text-sm font-medium text-[#FFF7F0] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Camera className="w-4 h-4 text-[#D8B16D]" />
              <span>
                {isManagerOpen ? 'Close Photo Uploader' : 'Upload More Photos'}
              </span>
            </button>
            <button
              type="button"
              onClick={onExportBackup}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#270812] hover:bg-[#3A0C1D] border border-[#D8B16D]/50 text-xs sm:text-sm font-medium text-[#D8B16D] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Save / Export Package</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive Gallery Photo Uploader Panel */}
      {!isGiftMode && isManagerOpen && (
        <div
          aria-label="Gallery Management Studio"
          className="mb-12 p-6 sm:p-8 rounded-2xl bg-[#3A0C1D]/90 border border-[#D8B16D] shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8B16D]/25">
            <div>
              <h3 className="font-serif-editorial text-2xl text-[#FFF7F0]">
                Gallery Photo Uploader
              </h3>
              <p className="text-xs sm:text-sm text-[#F1D6DC]/85 mt-1">
                Upload several pictures at once, preview them, or click{' '}
                <strong>Upload Photo</strong> on any Polaroid card below to
                replace a specific frame.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D8B16D] hover:bg-[#E5C283] text-[#270812] text-xs sm:text-sm font-semibold cursor-pointer transition-colors whitespace-nowrap shrink-0">
              <Plus className="w-4 h-4" />
              <span>Select Photos to Upload</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultiFileSelect}
                className="sr-only"
                aria-label="Upload multiple photos to preview"
              />
            </label>
          </div>

          {pendingPreviews.length > 0 && (
            <div className="space-y-4 p-5 rounded-xl bg-[#270812] border border-[#D8B16D]/60">
              <div className="flex items-center justify-between">
                <h4 className="font-serif-editorial text-xl text-[#D8B16D]">
                  Ready to Add ({pendingPreviews.length})
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPendingPreviews([])}
                    className="px-3 py-1.5 rounded-lg border border-[#F1D6DC]/30 text-xs text-[#F1D6DC] cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={commitPendingUploads}
                    className="px-4 py-1.5 rounded-lg bg-[#D8B16D] text-[#270812] text-xs font-semibold cursor-pointer"
                  >
                    Add {pendingPreviews.length} Photo
                    {pendingPreviews.length > 1 ? 's' : ''} to Gallery
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingPreviews.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-[#3A0C1D]/70 border border-[#D8B16D]/30"
                  >
                    <img
                      src={item.dataUrl}
                      alt={item.caption}
                      className="w-20 h-20 rounded-lg object-cover shrink-0 border border-[#D8B16D]/40"
                    />
                    <div className="flex-1 space-y-2">
                      <select
                        value={item.category}
                        aria-label="Select photo category"
                        onChange={(e) =>
                          setPendingPreviews((prev) =>
                            prev.map((p) =>
                              p.id === item.id
                                ? {
                                    ...p,
                                    category: e.target.value as GalleryCategory,
                                  }
                                : p
                            )
                          )
                        }
                        className="w-full px-2.5 py-1.5 rounded bg-[#270812] border border-[#D8B16D]/40 text-xs text-[#D8B16D]"
                      >
                        {GALLERY_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-[#F1D6DC]/80 italic">
                        {item.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category Filter Tabs */}
      <div
        role="tablist"
        aria-label="Photo gallery categories"
        className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-[#4A1025]/45 border border-[#D8B16D]/25 mb-12"
      >
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === 'All'}
          onClick={() => setSelectedCategory('All')}
          className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            selectedCategory === 'All'
              ? 'bg-[#D8B16D] text-[#270812] font-semibold shadow-sm'
              : 'text-[#F1D6DC] hover:text-[#FFF7F0]'
          }`}
        >
          All Keepsakes ({photos.length})
        </button>
        {GALLERY_CATEGORIES.map((category) => {
          const count = photos.filter((p) => p.category === category).length;
          const active = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-[#D8B16D] text-[#270812] font-semibold shadow-sm'
                  : 'text-[#F1D6DC] hover:text-[#FFF7F0]'
              }`}
            >
              {category} ({count})
            </button>
          );
        })}
      </div>

      {/* Polaroid Scrapbook Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9">
        {filteredPhotos.map((photo, index) => {
          const overallIndex = photos.findIndex((p) => p.id === photo.id);
          const isConfirmingDelete = !isGiftMode && confirmDeleteId === photo.id;

          return (
            <div
              key={photo.id}
              style={{
                transform: `rotate(${photo.rotationDeg}deg)`,
              }}
              className="group relative flex flex-col p-4 pb-6 rounded-2xl bg-[#FFF7F0] text-[#270812] border border-[#D8B16D] shadow-[0_18px_40px_rgba(0,0,0,0.45)] hover:rotate-0 transition-transform duration-200"
            >
              <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#270812] mb-4">
                <button
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`Open ${photo.caption} in full-screen lightbox`}
                  className="w-full h-full block text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D8B16D]"
                >
                  <RomanticImage
                    src={photo.imageUrl}
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    fallbackTitle={photo.category}
                  />
                </button>

                {!isGiftMode && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdatePhotos((prev) =>
                          setMainPhotoById(prev, photo.id)
                        )
                      }
                      className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        photo.isMainAnniversaryPhoto
                          ? 'bg-[#D8B16D] text-[#270812] font-semibold shadow'
                          : 'bg-[#270812]/80 text-[#FFF7F0] hover:bg-[#4A1025] border border-[#D8B16D]/40'
                      }`}
                      title="Select as our Main Anniversary Photo"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          photo.isMainAnniversaryPhoto ? 'fill-[#270812]' : ''
                        }`}
                      />
                      <span>
                        {photo.isMainAnniversaryPhoto
                          ? 'Main Anniversary Photo'
                          : 'Set as Main'}
                      </span>
                    </button>

                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                      {onInspectPhotoWithAI && (
                        <button
                          type="button"
                          onClick={() =>
                            onInspectPhotoWithAI(photo.imageUrl, photo.caption)
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#270812]/85 hover:bg-[#4A1025] text-[#D8B16D] border border-[#D8B16D]/50 text-xs font-medium cursor-pointer"
                          title="Reflect on this photo"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Reflect</span>
                        </button>
                      )}
                      <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#270812]/85 hover:bg-[#4A1025] text-[#FFF7F0] border border-[#D8B16D]/50 text-xs font-medium cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-[#D8B16D]" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          aria-label={`Replace photo for ${photo.caption}`}
                          onChange={(e) =>
                            handleReplaceSinglePhoto(photo.id, e)
                          }
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#4A1025]/75 mb-1.5">
                    <span>{photo.category}</span>
                    {photo.date && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">{photo.date}</span>
                      </>
                    )}
                  </div>
                  <p className="font-serif-editorial text-xl text-[#270812] leading-snug mb-2">
                    {photo.caption}
                  </p>
                  {photo.memory && (
                    <p className="text-xs text-[#4A1025]/85 italic leading-relaxed">
                      {photo.memory}
                    </p>
                  )}
                </div>

                {!isGiftMode && (
                  <div className="mt-4 pt-3 border-t border-[#4A1025]/15 flex items-center justify-between gap-2 text-xs text-[#4A1025]/80">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={overallIndex <= 0}
                        onClick={() =>
                          onUpdatePhotos((prev) =>
                            reorderGalleryPhotos(
                              prev,
                              overallIndex,
                              overallIndex - 1
                            )
                          )
                        }
                        aria-label={`Move ${photo.caption} earlier`}
                        className="p-1.5 rounded hover:bg-[#4A1025]/10 disabled:opacity-30 cursor-pointer"
                        title="Move earlier"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={overallIndex >= photos.length - 1}
                        onClick={() =>
                          onUpdatePhotos((prev) =>
                            reorderGalleryPhotos(
                              prev,
                              overallIndex,
                              overallIndex + 1
                            )
                          )
                        }
                        aria-label={`Move ${photo.caption} later`}
                        className="p-1.5 rounded hover:bg-[#4A1025]/10 disabled:opacity-30 cursor-pointer"
                        title="Move later"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {photos.length > 1 &&
                        (isConfirmingDelete ? (
                          <div className="inline-flex items-center gap-1.5 bg-[#4A1025] text-[#FFF7F0] px-2 py-0.5 rounded">
                            <span>Remove?</span>
                            <button
                              type="button"
                              onClick={() => {
                                onUpdatePhotos((prev) =>
                                  removeGalleryPhotoById(prev, photo.id)
                                );
                                setConfirmDeleteId(null);
                              }}
                              className="underline font-semibold cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="opacity-80 cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(photo.id)}
                            aria-label={`Delete ${photo.caption}`}
                            className="p-1 text-[#4A1025]/70 hover:text-red-700 cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-Screen Lightbox Modal */}
      {activeLightboxPhoto && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full-screen photo lightbox"
          className="fixed inset-0 z-50 bg-[#140309]/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8"
        >
          <div className="flex items-center justify-between gap-4 max-w-6xl w-full mx-auto">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#D8B16D]">
              <Heart className="w-4 h-4" />
              <span>{activeLightboxPhoto.category}</span>
              {activeLightboxPhoto.date && (
                <>
                  <span>·</span>
                  <span className="font-mono-tabular">
                    {activeLightboxPhoto.date}
                  </span>
                </>
              )}
              <span>·</span>
              <span className="font-mono-tabular">
                {lightboxIndex + 1} / {filteredPhotos.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close lightbox"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4A1025] hover:bg-[#661634] border border-[#D8B16D] text-xs sm:text-sm text-[#FFF7F0] cursor-pointer"
            >
              <span>Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 max-w-5xl w-full mx-auto overflow-hidden">
            {filteredPhotos.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex(
                    (lightboxIndex - 1 + filteredPhotos.length) %
                      filteredPhotos.length
                  )
                }
                aria-label="Previous photo"
                className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-[#270812]/85 hover:bg-[#4A1025] border border-[#D8B16D] text-[#FFF7F0] cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div className="max-h-[68vh] w-full flex items-center justify-center p-2">
              <RomanticImage
                src={activeLightboxPhoto.imageUrl}
                alt={activeLightboxPhoto.caption}
                className="max-h-[65vh] w-auto max-w-full rounded-xl border-2 border-[#D8B16D] shadow-[0_20px_60px_rgba(0,0,0,0.8)] object-contain"
              />
            </div>

            {filteredPhotos.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)
                }
                aria-label="Next photo"
                className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-[#270812]/85 hover:bg-[#4A1025] border border-[#D8B16D] text-[#FFF7F0] cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className="max-w-3xl w-full mx-auto text-center space-y-2 pb-2">
            <h3 className="font-serif-editorial text-2xl sm:text-3xl text-[#FFF7F0]">
              {activeLightboxPhoto.caption}
            </h3>
            {activeLightboxPhoto.memory && (
              <p className="text-sm sm:text-base text-[#F1D6DC]/90 italic">
                “{activeLightboxPhoto.memory}”
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
