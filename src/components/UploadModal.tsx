import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Upload,
  Calendar,
  MapPin,
  User,
  Heart,
  Sparkles,
  AlertCircle,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { Photo, CoupleConfig } from '../types';
import { API } from '../utils/api';
import { CATEGORY_STYLES } from '../utils/categoryStyles';

interface UploadModalProps {
  config: CoupleConfig;
  currentUserName?: string;
  isOpen: boolean;
  onClose: () => void;
  onPhotoUploaded: (photo: Photo) => void;
}

// Romantic preset photos to make testing or instant memory adding effortless
const ROMANTIC_PRESETS = [
  {
    title: 'Golden Hour Together',
    url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80',
    album: 'PHOTO OF US',
    caption: 'Walking hand in hand into the warm sunset glow.',
    location: 'Sunset Beach',
  },
  {
    title: 'Our Cozy Coffee Date',
    url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80',
    album: 'DATES',
    caption: 'Stealing sweet glances over warm lattes.',
    location: 'Little Corner Café',
  },
  {
    title: 'Vintage Polaroid Kiss',
    url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80',
    album: 'MOMENTS',
    caption: 'A candid instant capture that feels timeless.',
    location: 'City Viewpoint',
  },
  {
    title: 'Radiant Portrait of Loraine',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
    album: 'SOLO PHOTO',
    caption: 'The way your eyes sparkle when you smile.',
    location: 'Botanical Gardens',
  },
  {
    title: 'Spontaneous Laughter',
    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
    album: 'RANDOM',
    caption: 'Unplanned, candid, and 100% us.',
    location: 'Our Favorite Park',
  },
];

export const UploadModal: React.FC<UploadModalProps> = ({
  config,
  currentUserName,
  isOpen,
  onClose,
  onPhotoUploaded,
}) => {
  // Input mode: 'file' | 'url' | 'presets'
  const [inputMode, setInputMode] = useState<'file' | 'url' | 'presets'>('file');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [album, setAlbum] = useState<string>('PHOTO OF US');
  const [customAlbum, setCustomAlbum] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [uploadedBy, setUploadedBy] = useState<string>(currentUserName || config.partner1 || 'James');
  const [favorite, setFavorite] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setIsUploading(false);
      if (currentUserName) {
        setUploadedBy(currentUserName);
      } else {
        setUploadedBy(config.partner1 || 'James');
      }
    }
  }, [isOpen, currentUserName, config.partner1]);

  // Compress & optimize image file to high-res, optimized base64
  const processImageFile = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawResult = (e.target?.result as string) || '';
        if (!rawResult) {
          reject(new Error('Empty file'));
          return;
        }

        const img = new Image();
        img.onload = () => {
          try {
            const maxDim = 1400;
            let width = img.width || 1000;
            let height = img.height || 800;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(rawResult);
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve(dataUrl || rawResult);
          } catch (err) {
            console.warn('Canvas optimization fallback to raw image data', err);
            resolve(rawResult);
          }
        };
        img.onerror = () => {
          // Fallback to raw data URL if canvas cannot decode (e.g. svg or raw stream)
          resolve(rawResult);
        };
        img.src = rawResult;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  const handleSelectedFile = useCallback(
    async (file: File) => {
      if (!file || !file.type.startsWith('image/')) {
        setErrorMsg('Please select a valid image file (JPEG, PNG, WEBP, etc.)');
        return;
      }
      setErrorMsg('');
      try {
        const optimizedUrl = await processImageFile(file);
        setPreviewUrl(optimizedUrl);
        if (!title) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Could not process this image. Please choose another file or paste an image link.');
      }
    },
    [processImageFile, title]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleSelectedFile(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleSelectedFile(file);
    }
  };

  // Clipboard paste support
  useEffect(() => {
    if (!isOpen) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleSelectedFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, handleSelectedFile]);

  // Handle URL input
  const applyUrlInput = () => {
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) {
      setErrorMsg('Please enter an image link URL');
      return;
    }
    setPreviewUrl(cleanUrl);
    setErrorMsg('');
    if (!title) {
      setTitle('Our Beautiful Memory');
    }
  };

  // Handle Preset selection
  const handleSelectPreset = (preset: (typeof ROMANTIC_PRESETS)[0]) => {
    setPreviewUrl(preset.url);
    setTitle(preset.title);
    setAlbum(preset.album);
    setCaption(preset.caption);
    setLocation(preset.location);
    setErrorMsg('');
  };

  const resetForm = () => {
    setPreviewUrl('');
    setUrlInput('');
    setTitle('');
    setCaption('');
    setLocation('');
    setCustomAlbum('');
    setFavorite(false);
    setErrorMsg('');
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) {
      setErrorMsg('Please select a photo, enter an image link, or pick a romantic preset');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const finalAlbum = album === 'Custom' ? (customAlbum.trim() || 'Everyday Love') : album;

      const newPhotoData: Partial<Photo> = {
        url: previewUrl,
        title: title.trim() || 'A Beautiful Memory',
        caption: caption.trim(),
        date: date || new Date().toISOString().split('T')[0],
        album: finalAlbum,
        location: location.trim(),
        uploadedBy: uploadedBy || config.partner1 || 'James',
        favorite,
      };

      const savedPhoto = await API.uploadPhoto(newPhotoData);
      onPhotoUploaded(savedPhoto);
      handleClose();
    } catch (err) {
      console.error('Photo save error:', err);
      setErrorMsg('Failed to save memory to the album. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] overflow-y-auto shadow-2xl border border-[#ffc2d1] my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#ffe5ec] sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#ffe5ec] text-[#fb6f92] flex items-center justify-center border border-[#ffc2d1]/60 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-stone-900 leading-tight">
                Add to Our Shared Album
              </h2>
              <p className="text-[11px] text-stone-500">
                James &amp; Loraine · Forever Memories
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#ffe5ec]/50 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Navigation Tabs: File Upload | Image URL | Preset Photos */}
        <div className="px-5 sm:px-6 pt-4 pb-2">
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#fff0f3] rounded-xl border border-[#ffc2d1]/60 text-xs">
            <button
              type="button"
              onClick={() => setInputMode('file')}
              className={`py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                inputMode === 'file'
                  ? 'bg-white text-[#fb6f92] shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('url')}
              className={`py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                inputMode === 'url'
                  ? 'bg-white text-[#fb6f92] shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Image Link</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('presets')}
              className={`py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                inputMode === 'presets'
                  ? 'bg-white text-[#fb6f92] shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Romantic Presets</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-5 sm:px-6 pb-6 pt-2 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#ffe5ec] text-[#5c182b] border border-[#ffc2d1] text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#fb6f92]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Photo Dropzone / Preview Area */}
          <div>
            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden aspect-16/10 bg-[#ffe5ec]/30 border-2 border-[#fb6f92]/40 group shadow-inner">
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label
                    htmlFor="photo-file-input"
                    className="px-3.5 py-1.5 rounded-full bg-white text-stone-900 text-xs font-semibold shadow-md cursor-pointer hover:bg-[#ffe5ec] transition-transform active:scale-95"
                  >
                    Change File
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl('');
                      setUrlInput('');
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-rose-600 text-white text-xs font-semibold shadow-md cursor-pointer hover:bg-rose-700 transition-transform active:scale-95"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <>
                {inputMode === 'file' && (
                  <div>
                    <input
                      id="photo-file-input"
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="photo-file-input"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`w-full aspect-16/10 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group select-none ${
                        isDragging
                          ? 'border-[#fb6f92] bg-[#ffe5ec] scale-[1.01]'
                          : 'border-[#ffc2d1] hover:border-[#ff8fab] bg-[#ffe5ec]/30 hover:bg-[#ffe5ec]/50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-[#ffe5ec] text-[#fb6f92] border border-[#ffc2d1] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-xs">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-stone-800">
                        Tap here to select a photo from your device
                      </span>
                      <span className="text-[11px] text-stone-500 mt-1">
                        Camera, Photo Library, or drag &amp; drop an image here
                      </span>
                      <span className="text-[10px] text-stone-400 mt-2 bg-white/70 px-2.5 py-0.5 rounded-full border border-[#ffc2d1]/50">
                        Supports JPEG, PNG, WEBP, GIF, HEIC · Or press Ctrl+V to paste
                      </span>
                    </label>
                  </div>
                )}

                {inputMode === 'url' && (
                  <div className="space-y-2 p-4 rounded-2xl bg-[#fff9fa] border border-[#ffc2d1]">
                    <label className="block text-xs font-semibold text-stone-700">
                      Paste Direct Image URL / Web Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        className="flex-1 px-3 py-2 bg-white border border-[#ffc2d1] rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#ff8fab]/20"
                      />
                      <button
                        type="button"
                        onClick={applyUrlInput}
                        className="px-4 py-2 rounded-xl bg-[#fb6f92] hover:bg-[#e8557b] text-white text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                      >
                        Preview
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      Supports direct image links from Unsplash, Google Photos, Cloudinary, etc.
                    </p>
                  </div>
                )}

                {inputMode === 'presets' && (
                  <div className="space-y-2">
                    <p className="text-xs text-stone-600 font-medium">
                      Select any romantic memory to preview and add:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ROMANTIC_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className="group relative rounded-xl overflow-hidden aspect-4/3 border border-[#ffc2d1] hover:border-[#fb6f92] hover:shadow-md transition-all text-left cursor-pointer active:scale-95"
                        >
                          <img
                            src={preset.url}
                            alt={preset.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2 flex flex-col justify-end text-white">
                            <span className="text-[10px] font-bold line-clamp-1">{preset.title}</span>
                            <span className="text-[9px] opacity-80">{preset.album}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Memory Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. October 26 Anniversary Dinner, Our Road Trip"
              required
              className="w-full px-3.5 py-2.5 bg-[#fff9fa] border border-[#ffc2d1] rounded-xl text-xs md:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#ff8fab]/20 focus:border-[#fb6f92] transition-all"
            />
          </div>

          {/* Album & Category Selection: The 5 Requested Styles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-stone-700">
                Memory Style &amp; Category
              </label>
              <span className="text-[10px] text-stone-400">
                Distinct style applied in gallery
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                {
                  id: 'PHOTO OF US',
                  label: 'PHOTO OF US',
                  sub: '💑 Couple Glow',
                  active: 'border-[#fb6f92] bg-[#ffe5ec] text-[#5c182b]',
                },
                {
                  id: 'SOLO PHOTO',
                  label: 'SOLO PHOTO',
                  sub: '✦ Editorial Portrait',
                  active: 'border-stone-800 bg-stone-900 text-white',
                },
                {
                  id: 'MOMENTS',
                  label: 'MOMENTS',
                  sub: '🎞️ Polaroid Instant',
                  active: 'border-amber-400 bg-amber-100 text-amber-900',
                },
                {
                  id: 'DATES',
                  label: 'DATES',
                  sub: '🥂 Candlelight Gold',
                  active: 'border-amber-400 bg-gradient-to-r from-amber-600 to-rose-600 text-white',
                },
                {
                  id: 'RANDOM',
                  label: 'RANDOM',
                  sub: '✨ Scrapbook Joy',
                  active: 'border-emerald-400 bg-emerald-100 text-emerald-900',
                },
                {
                  id: 'Custom',
                  label: '+ Custom',
                  sub: 'Custom Album',
                  active: 'border-stone-400 bg-stone-200 text-stone-900',
                },
              ].map((cat) => {
                const isSelected = album === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setAlbum(cat.id)}
                    className={`p-2 rounded-xl border text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? `${cat.active} shadow-xs font-semibold ring-1 ring-offset-1`
                        : 'border-[#ffc2d1]/60 bg-[#fff9fa] hover:bg-[#ffe5ec]/40 text-stone-700'
                    }`}
                  >
                    <span className="text-[11px] font-bold tracking-tight block">{cat.label}</span>
                    <span className="text-[10px] opacity-80 mt-0.5 block">{cat.sub}</span>
                  </button>
                );
              })}
            </div>

            {album === 'Custom' && (
              <input
                type="text"
                value={customAlbum}
                onChange={(e) => setCustomAlbum(e.target.value)}
                placeholder="Enter custom album name..."
                className="mt-2 w-full px-3 py-2 bg-[#fff9fa] border border-[#ffc2d1] rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#ff8fab]/20"
              />
            )}
          </div>

          {/* Date Taken */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#fb6f92]" />
              Date Taken
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#fff9fa] border border-[#ffc2d1] rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#ff8fab]/20 focus:border-[#fb6f92] transition-all cursor-pointer"
            />
          </div>

          {/* Location & Shared By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sunset Point, Paris, Our couch"
                className="w-full px-3 py-2 bg-[#fff9fa] border border-[#ffc2d1] rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#ff8fab]/20 focus:border-[#fb6f92] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-stone-400" />
                Shared By
              </label>
              <select
                value={uploadedBy}
                onChange={(e) => setUploadedBy(e.target.value)}
                className="w-full px-3 py-2 bg-[#fff9fa] border border-[#ffc2d1] rounded-xl text-xs text-stone-900 focus:outline-none cursor-pointer"
              >
                {currentUserName &&
                  currentUserName !== config.partner1 &&
                  currentUserName !== config.partner2 && (
                    <option value={currentUserName}>{currentUserName} (You)</option>
                  )}
                <option value={config.partner1 || 'James'}>{config.partner1 || 'James'}</option>
                <option value={config.partner2 || 'Loraine'}>{config.partner2 || 'Loraine'}</option>
              </select>
            </div>
          </div>

          {/* Caption / Story */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Story / Love Note
            </label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What made this moment so special to you?"
              className="w-full px-3.5 py-2.5 bg-[#fff9fa] border border-[#ffc2d1] rounded-xl text-xs md:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#ff8fab]/20 focus:border-[#fb6f92] transition-all"
            />
          </div>

          {/* Favorite heart toggle */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setFavorite(!favorite)}
              className="flex items-center gap-2 text-xs font-medium text-stone-700 hover:text-[#fb6f92] cursor-pointer active:scale-95 transition-transform"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  favorite ? 'fill-[#fb6f92] text-[#fb6f92]' : 'text-stone-400'
                }`}
              />
              <span>{favorite ? 'Marked as Favorite' : 'Mark as Favorite'}</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#ffe5ec]">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer active:scale-95 transition-transform"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !previewUrl}
              className="px-6 py-2.5 rounded-full bg-[#fb6f92] hover:bg-[#e8557b] text-white text-xs font-semibold shadow-sm shadow-[#fb6f92]/25 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              {isUploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Memory...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save to Gallery</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
