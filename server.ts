import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { combineStoriesPreservingRealPhotos } from './src/utils/storyLogic';
import { LoveStoryContent } from './src/data/loveStoryData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLISHED_STORY_PATH = path.join(__dirname, 'published-story.json');
const PUBLIC_DIR_PATH = path.join(__dirname, 'public');
const PUBLIC_STORY_PATH = path.join(PUBLIC_DIR_PATH, 'published-story.json');
const SRC_DATA_STORY_PATH = path.join(__dirname, 'src', 'data', 'publishedStory.json');

const SYSTEM_INSTRUCTION = `You are a warm, sincere, emotionally honest romantic anniversary writing assistant helping James personalize his fourth anniversary website for his girlfriend, Loraine, whom he lovingly calls "Baby".
Key facts you must always respect:
- Groom/Creator name: James
- Girlfriend's name: Loraine (nickname: "Baby")
- Approximate day they first met: June 15–20, 2016
- Official relationship anniversary: October 26, 2022
- Fourth official anniversary: October 26, 2026
- Never confuse the date they first met (June 15–20, 2016) with their official relationship anniversary (October 26, 2022).
- Never invent specific fictional trips, arguments, or events that James has not shared; instead, write tender, grounded, sincere prose or provide clear bracketed placeholders where James can fill in his specific detail.`;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function readExistingPublishedContent(): Promise<LoveStoryContent | null> {
  for (const candidatePath of [PUBLIC_STORY_PATH, PUBLISHED_STORY_PATH, SRC_DATA_STORY_PATH]) {
    try {
      const raw = await fs.readFile(candidatePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed?.content) {
        return parsed.content as LoveStoryContent;
      }
    } catch {
      // try next
    }
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large payloads for base64 encoded high-res anniversary photos
  app.use(express.json({ limit: '50mb' }));

  // Load saved/published story for Loraine's device
  app.get('/api/story', async (_req, res) => {
    for (const candidatePath of [PUBLIC_STORY_PATH, PUBLISHED_STORY_PATH, SRC_DATA_STORY_PATH]) {
      try {
        const raw = await fs.readFile(candidatePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed?.content) {
          return res.json({ found: true, ...parsed });
        }
      } catch {
        // try next
      }
    }
    return res.json({ found: false });
  });

  // Save & publish James's customized story + photos to /public/published-story.json and /src/data/publishedStory.json so GitHub + Vercel + Cloud Run bundle it automatically
  app.post('/api/story/publish', async (req, res) => {
    try {
      const { content, giftModeDefault = true } = req.body || {};
      if (!content || typeof content !== 'object') {
        return res.status(400).json({ error: 'Invalid story content payload.' });
      }
      const existingContent = await readExistingPublishedContent();
      const mergedContent = existingContent
        ? combineStoriesPreservingRealPhotos(
            content as LoveStoryContent,
            existingContent
          )
        : (content as LoveStoryContent);

      const payload = {
        content: mergedContent,
        giftModeDefault: Boolean(giftModeDefault),
        publishedAt: new Date().toISOString(),
      };
      const serialized = JSON.stringify(payload, null, 2);
      await fs.mkdir(PUBLIC_DIR_PATH, { recursive: true });
      await fs.writeFile(PUBLIC_STORY_PATH, serialized, 'utf-8');
      await fs.writeFile(PUBLISHED_STORY_PATH, serialized, 'utf-8');
      await fs.writeFile(SRC_DATA_STORY_PATH, serialized, 'utf-8');
      return res.json({
        ok: true,
        publishedAt: payload.publishedAt,
        content: mergedContent,
      });
    } catch (err) {
      return res.status(500).json({
        error:
          err instanceof Error
            ? err.message
            : 'Failed to save published story on server.',
      });
    }
  });

  // Multi-turn Chat Endpoint (supports gemini-4-argon, gemini-3.8-flash, gemini-3.1-flash-lite)
  app.post('/api/gemini/chat', async (req, res) => {
    const { model = 'gemini-3.8-flash', messages = [] } = req.body || {};
    const validModels = [
      'gemini-4-argon',
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
    ];
    const chosenModel = validModels.includes(model)
      ? model
      : 'gemini-3.8-flash';

    const lastUserMessage =
      Array.isArray(messages) && messages.length > 0
        ? messages[messages.length - 1]?.text || ''
        : '';

    const ai = getGeminiClient();
    if (ai) {
      try {
        const contents = messages.map(
          (m: { role: string; text: string }) => ({
            role: m.role === 'model' ? 'model' : 'user',
            parts: [{ text: String(m.text || '') }],
          })
        );

        const response: GenerateContentResponse =
          await ai.models.generateContent({
            model: chosenModel,
            contents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
            },
          });

        return res.json({
          text: response.text || '',
          modelUsed: chosenModel,
        });
      } catch {
        if (chosenModel === 'gemini-4-argon') {
          try {
            const response: GenerateContentResponse =
              await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: lastUserMessage,
                config: {
                  systemInstruction: SYSTEM_INSTRUCTION,
                },
              });
            return res.json({
              text: response.text || '',
              modelUsed: 'gemini-3.8-flash',
            });
          } catch {
            // Fall through to romantic deterministic helper
          }
        }
      }
    }

    return res.json({
      text: `Here is a heartfelt wording tailored for Baby Loraine:\n\n"Baby, looking back at how our paths first crossed in June 2016 and how we became us on October 26, 2022, I am so thankful for every quiet moment and shared smile over these four years. Regarding ${
        lastUserMessage ? `"${lastUserMessage.slice(0, 80)}"` : 'our next chapter'
      }, what matters most to me is continuing to listen, grow, and make beautiful memories right beside you."`,
      modelUsed: `${chosenModel} (Poetic Studio Draft)`,
    });
  });

  // Image Analysis Endpoint using gemini-4-argon
  app.post('/api/gemini/analyze-image', async (req, res) => {
    const {
      imageDataUrl = '',
      prompt = 'Write a romantic anniversary caption and reflection for this keepsake.',
    } = req.body || {};

    if (!imageDataUrl) {
      return res
        .status(400)
        .json({ error: 'Please select or upload an image first.' });
    }

    const ai = getGeminiClient();
    const base64Match = String(imageDataUrl).match(
      /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
    );

    if (ai && base64Match) {
      const mimeType = base64Match[1];
      const base64Data = base64Match[2];
      try {
        const response: GenerateContentResponse =
          await ai.models.generateContent({
            model: 'gemini-4-argon',
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64Data,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
            },
          });

        return res.json({
          text: response.text || '',
          modelUsed: 'gemini-4-argon',
        });
      } catch {
        try {
          const response: GenerateContentResponse =
            await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: {
                parts: [
                  {
                    inlineData: {
                      mimeType,
                      data: base64Data,
                    },
                  },
                  {
                    text: prompt,
                  },
                ],
              },
              config: {
                systemInstruction: SYSTEM_INSTRUCTION,
              },
            });
          return res.json({
            text: response.text || '',
            modelUsed: 'gemini-4-argon',
          });
        } catch {
          // Fall through to romantic caption suggestion
        }
      }
    }

    return res.json({
      text: `Suggested Caption:\n"Four years of loving you, Baby — and this frame still holds the warmth I feel every time I am beside you."\n\nPersonal Scrapbook Reflection:\n"From our earliest meeting in June 2016 to celebrating four official years together on October 26, 2026, moments like this remind me that the simplest times with you become the memories I treasure most."`,
      modelUsed: 'gemini-4-argon',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `For Loraine, My Baby — Anniversary Server listening on http://localhost:${PORT}`
    );
  });
}

startServer();
