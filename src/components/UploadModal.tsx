import React, { useState, useRef } from 'react';
import { X, Upload, Calendar, MapPin, User, Heart, Sparkles, AlertCircle } from 'lucide-react';
import { Photo, CoupleConfig } from '../types';

interface UploadModalProps {
  config: CoupleConfig;
  currentUserName?: string;
  isOpen: boolean;
  onClose: () => void;
  onPhotoUploaded: (photo: Photo) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  config,
  currentUserName,
  isOpen,
  onClose,
  onPhotoUploaded,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [album, setAlbum] = useState<string>('PHOTO OF US');
  const [customAlbum, setCustomAlbum] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [uploadedBy, setUploadedBy] = useState<string>(currentUserName || config.partner1);
  const [favorite, setFavorite] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Compress & convert image file to high-res, optimized base64
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;

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
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image file'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    try {
      setSelectedFile(file);
      const optimizedUrl = await processImageFile(file);
      setPreviewUrl(optimizedUrl);
      if (!title) {
        // Strip extension as default title
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not process this image. Please choose another file.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) {
      setErrorMsg('Please select a photo to upload');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const finalAlbum = album === 'Custom' ? (customAlbum.trim() || 'Everyday Love') : album;

      const newPhotoData = {
        url: previewUrl,
        title: title.trim() || 'A Beautiful Memory',
        caption: caption.trim(),
        date: date || new Date().toISOString().split('T')[0],
        album: finalAlbum,
        location: location.trim(),
        uploadedBy: uploadedBy || config.partner1,
        favorite,
      };

      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhotoData),
      });

      if (!res.ok) throw new Error('Upload failed');
      const savedPhoto = await res.json();

      onPhotoUploaded(savedPhoto);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to upload memory. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] overflow-y-auto shadow-2xl border border-[#ffc2d1] my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ffe5ec]">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#ffe5ec] text-[#fb6f92] flex items-center justify-center border border-[#ffc2d1]/60">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Add to Our Shared Album
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#ffe5ec]/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#ffe5ec] text-[#5c182b] border border-[#ffc2d1] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#fb6f92]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Photo Preview / Dropzone */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden aspect-16/10 bg-[#ffe5ec]/30 border border-[#ffc2d1] group">
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-full bg-white text-stone-900 text-xs font-semibold shadow-md cursor-pointer hover:bg-[#ffe5ec]"
                  >
                    Change Photo
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-16/10 rounded-2xl border-2 border-dashed border-[#ffc2d1] hover:border-[#ff8fab] bg-[#ffe5ec]/30 hover:bg-[#ffe5ec]/50 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-[#ffe5ec] text-[#fb6f92] border border-[#ffc2d1] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-stone-800">
                  Tap to upload or take photo
                </span>
                <span className="text-[11px] text-stone-400 mt-1">
                  Supports JPEG, PNG, HEIC from camera or photo album
                </span>
              </button>
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

          {/* Album & Date (2 columns) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700">
              Memory Style & Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { id: 'PHOTO OF US', label: 'PHOTO OF US', sub: '💑 Couple', active: 'border-[#fb6f92] bg-[#ffe5ec] text-[#5c182b]' },
                { id: 'SOLO PHOTO', label: 'SOLO PHOTO', sub: '✦ Portrait', active: 'border-stone-800 bg-stone-900 text-white' },
                { id: 'MOMENTS', label: 'MOMENTS', sub: '🎞️ Polaroid', active: 'border-amber-400 bg-amber-100 text-amber-900' },
                { id: 'DATES', label: 'DATES', sub: '🥂 Candlelight', active: 'border-amber-400 bg-gradient-to-r from-amber-600 to-rose-600 text-white' },
                { id: 'RANDOM', label: 'RANDOM', sub: '✨ Scrapbook', active: 'border-emerald-400 bg-emerald-100 text-emerald-900' },
                { id: 'Custom', label: '+ Custom', sub: 'Create new', active: 'border-stone-400 bg-stone-200 text-stone-900' },
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
                    <span className="text-[10px] opacity-75 mt-0.5 block">{cat.sub}</span>
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
                {currentUserName && currentUserName !== config.partner1 && currentUserName !== config.partner2 && (
                  <option value={currentUserName}>{currentUserName} (You)</option>
                )}
                <option value={config.partner1}>{config.partner1}</option>
                <option value={config.partner2}>{config.partner2}</option>
              </select>
            </div>
          </div>

          {/* Caption */}
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
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setFavorite(!favorite)}
              className="flex items-center gap-2 text-xs font-medium text-stone-700 hover:text-[#fb6f92] cursor-pointer"
            >
              <Heart
                className={`w-4 h-4 ${favorite ? 'fill-[#fb6f92] text-[#fb6f92]' : 'text-stone-400'}`}
              />
              <span>{favorite ? 'Added to Favorites' : 'Add to Favorites'}</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#ffe5ec]">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !previewUrl}
              className="px-6 py-2.5 rounded-full bg-[#fb6f92] hover:bg-[#e8557b] text-white text-xs font-semibold shadow-sm shadow-[#fb6f92]/25 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isUploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Memory...</span>
                </>
              ) : (
                <span>Save to Gallery</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
