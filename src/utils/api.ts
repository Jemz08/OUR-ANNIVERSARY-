import { Photo, LoveNote, CoupleConfig } from '../types';

export const API = {
  // Fetch couple config
  async getConfig(): Promise<CoupleConfig> {
    try {
      const res = await fetch('/api/config');
      if (!res.ok) throw new Error('Failed to fetch config');
      const data = await res.json();
      localStorage.setItem('oct26_config_cache', JSON.stringify(data));
      return data;
    } catch (err) {
      const cached = localStorage.getItem('oct26_config_cache');
      if (cached) return JSON.parse(cached);
      return {
        metDate: '2016-06-15',
        officialDate: '2022-10-26',
        anniversaryMonthDay: '10-26',
        partner1: 'James',
        partner2: 'Loraine',
        loveQuote: 'Every love story is beautiful, but ours is my favorite.',
      };
    }
  },

  // Update couple config
  async updateConfig(config: Partial<CoupleConfig>): Promise<CoupleConfig> {
    const res = await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to update config');
    const data = await res.json();
    localStorage.setItem('oct26_config_cache', JSON.stringify(data));
    return data;
  },

  // Fetch photos
  async getPhotos(): Promise<Photo[]> {
    try {
      const res = await fetch('/api/photos');
      if (!res.ok) throw new Error('Failed to fetch photos');
      const data: Photo[] = await res.json();
      localStorage.setItem('oct26_photos_cache', JSON.stringify(data));
      return data;
    } catch (err) {
      const cached = localStorage.getItem('oct26_photos_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // If the cached data was old seed photos, clear them so user starts clean
          const hasOldSeeds = parsed.some((p: Photo) => p.id && p.id.startsWith('seed-'));
          if (hasOldSeeds) {
            localStorage.removeItem('oct26_photos_cache');
            return [];
          }
          return parsed;
        } catch {}
      }
      return [];
    }
  },

  // Upload photo
  async uploadPhoto(photoData: Partial<Photo>): Promise<Photo> {
    let saved: Photo;
    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoData),
      });
      if (!res.ok) throw new Error('Failed to upload photo');
      saved = await res.json();
    } catch (err) {
      // Client-side fallback for static Vercel / Cloudflare hosting
      saved = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        url: photoData.url || '',
        title: photoData.title || 'A Beautiful Memory',
        caption: photoData.caption || '',
        date: photoData.date || new Date().toISOString().split('T')[0],
        album: photoData.album || 'PHOTO OF US',
        location: photoData.location || '',
        uploadedBy: photoData.uploadedBy || 'James',
        favorite: !!photoData.favorite,
        createdAt: new Date().toISOString(),
      };
    }
    const cached = localStorage.getItem('oct26_photos_cache');
    const existing: Photo[] = cached ? JSON.parse(cached) : [];
    const updated = [saved, ...existing.filter((p) => p.id !== saved.id)];
    localStorage.setItem('oct26_photos_cache', JSON.stringify(updated));
    return saved;
  },

  // Update photo
  async updatePhoto(id: string, updates: Partial<Photo>): Promise<Photo> {
    try {
      const res = await fetch(`/api/photos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const saved = await res.json();
        const cached = localStorage.getItem('oct26_photos_cache');
        if (cached) {
          const list: Photo[] = JSON.parse(cached);
          const updated = list.map((p) => (p.id === id ? { ...p, ...updates } : p));
          localStorage.setItem('oct26_photos_cache', JSON.stringify(updated));
        }
        return saved;
      }
    } catch {}

    const cached = localStorage.getItem('oct26_photos_cache');
    if (cached) {
      const list: Photo[] = JSON.parse(cached);
      const updated = list.map((p) => (p.id === id ? { ...p, ...updates } : p));
      localStorage.setItem('oct26_photos_cache', JSON.stringify(updated));
      const target = updated.find((p) => p.id === id);
      if (target) return target;
    }
    return updates as Photo;
  },

  // Delete photo
  async deletePhoto(id: string): Promise<boolean> {
    try {
      await fetch(`/api/photos/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('API delete note', e);
    }
    // Always update local cache
    const cached = localStorage.getItem('oct26_photos_cache');
    if (cached) {
      try {
        const parsed: Photo[] = JSON.parse(cached);
        const filtered = parsed.filter((p) => p.id !== id);
        localStorage.setItem('oct26_photos_cache', JSON.stringify(filtered));
      } catch {}
    }
    return true;
  },

  // Fetch love notes
  async getNotes(): Promise<LoveNote[]> {
    try {
      const res = await fetch('/api/notes');
      if (!res.ok) throw new Error('Failed to fetch notes');
      const data = await res.json();
      localStorage.setItem('oct26_notes_cache', JSON.stringify(data));
      return data;
    } catch (err) {
      const cached = localStorage.getItem('oct26_notes_cache');
      if (cached) return JSON.parse(cached);
      return [];
    }
  },

  // Add love note
  async addNote(note: { author: string; text: string }): Promise<LoveNote> {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    if (!res.ok) throw new Error('Failed to add note');
    return res.json();
  },

  // Delete love note
  async deleteNote(id: string): Promise<boolean> {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete note');
    return true;
  },

  // Reset to initial demo
  async resetDemo(): Promise<boolean> {
    const res = await fetch('/api/reset-demo', {
      method: 'POST',
    });
    return res.ok;
  },
};
