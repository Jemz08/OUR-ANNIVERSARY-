import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
const CONFIG_FILE = path.join(DATA_DIR, 'couple-config.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial couple configuration
const DEFAULT_CONFIG = {
  metDate: '2016-06-15',
  officialDate: '2022-10-26',
  anniversaryMonthDay: '10-26',
  partner1: 'James',
  partner2: 'Loraine',
  loveQuote: 'Every love story is beautiful, but ours is my favorite.',
  songTitle: 'Our Special Song',
  theme: 'romantic-rose',
};

// Gallery starts empty so the couple can upload their own real memories first
const INITIAL_PHOTOS: any[] = [];

const INITIAL_NOTES = [
  {
    id: 'note-1',
    author: 'James',
    text: 'Every single day with you is my new favorite day. Happy upcoming Oct 26 my love! ❤️',
    date: '2026-10-01',
    createdAt: new Date('2026-10-01T12:00:00Z').toISOString(),
  },
  {
    id: 'note-2',
    author: 'Loraine',
    text: 'Thank you for loving me so gently and making me laugh every single day since 2016. Here is to forever! 🥂',
    date: '2026-10-05',
    createdAt: new Date('2026-10-05T14:30:00Z').toISOString(),
  },
];

// Helper functions for reading/writing persistent JSON
function readJSON(filePath: string, fallback: any) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

function writeJSON(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Body parsing for JSON and data URLs
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Initialize data files if not present
  if (!fs.existsSync(PHOTOS_FILE)) {
    writeJSON(PHOTOS_FILE, INITIAL_PHOTOS);
  }
  if (!fs.existsSync(NOTES_FILE)) {
    writeJSON(NOTES_FILE, INITIAL_NOTES);
  }
  if (!fs.existsSync(CONFIG_FILE)) {
    writeJSON(CONFIG_FILE, DEFAULT_CONFIG);
  }

  // --- API ROUTES ---

  // Couple Config & Dates
  app.get('/api/config', (req, res) => {
    const config = readJSON(CONFIG_FILE, DEFAULT_CONFIG);
    res.json(config);
  });

  app.put('/api/config', (req, res) => {
    const current = readJSON(CONFIG_FILE, DEFAULT_CONFIG);
    const updated = { ...current, ...req.body };
    writeJSON(CONFIG_FILE, updated);
    res.json(updated);
  });

  // Photos
  app.get('/api/photos', (req, res) => {
    const photos = readJSON(PHOTOS_FILE, INITIAL_PHOTOS);
    res.json(photos);
  });

  app.post('/api/photos', (req, res) => {
    try {
      const photos = readJSON(PHOTOS_FILE, INITIAL_PHOTOS);
      const { url, title, caption, date, album, location, uploadedBy, favorite } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'Photo URL or image data is required' });
      }

      const newPhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        url,
        title: title || 'A Special Memory',
        caption: caption || '',
        date: date || new Date().toISOString().split('T')[0],
        album: album || 'PHOTO OF US',
        location: location || '',
        uploadedBy: uploadedBy || 'James',
        favorite: !!favorite,
        createdAt: new Date().toISOString(),
      };

      photos.unshift(newPhoto);
      writeJSON(PHOTOS_FILE, photos);
      res.status(201).json(newPhoto);
    } catch (err) {
      console.error('Failed to save photo:', err);
      res.status(500).json({ error: 'Failed to save photo' });
    }
  });

  app.put('/api/photos/:id', (req, res) => {
    const photos = readJSON(PHOTOS_FILE, INITIAL_PHOTOS);
    const index = photos.findIndex((p: any) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    photos[index] = { ...photos[index], ...req.body };
    writeJSON(PHOTOS_FILE, photos);
    res.json(photos[index]);
  });

  app.delete('/api/photos/:id', (req, res) => {
    const photos = readJSON(PHOTOS_FILE, INITIAL_PHOTOS);
    const filtered = photos.filter((p: any) => p.id !== req.params.id);
    writeJSON(PHOTOS_FILE, filtered);
    res.json({ success: true, count: filtered.length });
  });

  // Love Notes
  app.get('/api/notes', (req, res) => {
    const notes = readJSON(NOTES_FILE, INITIAL_NOTES);
    res.json(notes);
  });

  app.post('/api/notes', (req, res) => {
    try {
      const notes = readJSON(NOTES_FILE, INITIAL_NOTES);
      const { author, text } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Note text is required' });
      }
      const newNote = {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        author: author || 'James',
        text,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };
      notes.unshift(newNote);
      writeJSON(NOTES_FILE, notes);
      res.status(201).json(newNote);
    } catch (err) {
      console.error('Failed to create note:', err);
      res.status(500).json({ error: 'Failed to create note' });
    }
  });

  app.delete('/api/notes/:id', (req, res) => {
    const notes = readJSON(NOTES_FILE, INITIAL_NOTES);
    const filtered = notes.filter((n: any) => n.id !== req.params.id);
    writeJSON(NOTES_FILE, filtered);
    res.json({ success: true });
  });

  // Reset to initial demo state
  app.post('/api/reset-demo', (req, res) => {
    writeJSON(PHOTOS_FILE, INITIAL_PHOTOS);
    writeJSON(NOTES_FILE, INITIAL_NOTES);
    writeJSON(CONFIG_FILE, DEFAULT_CONFIG);
    res.json({ success: true, message: 'Gallery reset to initial anniversary memories' });
  });

  // --- VITE MIDDLEWARE / STATIC ASSETS ---
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Anniversary App Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
});
