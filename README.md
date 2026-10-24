# For Loraine, My Baby — Our Love Story (4th Anniversary Website)

Created with love by **James** for **Baby Loraine**  
**First Met:** June 15–20, 2016  
**Official Relationship Anniversary:** October 26, 2022  
**Fourth Anniversary:** October 26, 2026  

---

## 1. Previewing the Website Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.  
*(Tip: Append `?autostart=1` to skip the opening curtain during testing.)*

---

## 2. How to Personalize Messages, Letters & Love Notes

You have two ways to personalize every word on the website:

1. **Directly in the Browser (No Coding Required):**
   - Click **Personalize**, **Edit Caption**, or **Customize Memory** on any timeline chapter, gallery photo, love letter, love note, or digital gift.
   - All changes are automatically saved in your browser's `localStorage`.
   - Click **Customize & Studio -> Download Project Backup (.json)** to save a permanent copy of your customized text and photos.

2. **Editing the Source Content File (Permanent for Deployment):**
   - Open `src/data/loveStoryData.ts`.
   - Update any placeholder in `INITIAL_LOVE_STORY_CONTENT` (such as `[JAMES'S PERSONAL WISH FOR OUR FUTURE]`, `[JAMES'S PERSONAL MESSAGE TO LORAINE]`, or `[A REAL PLAN, DATE, ACTIVITY, OR DREAM JAMES WANTS TO SHARE WITH LORAINE]`).

---

## 3. How to Add Your Actual Photos

1. **Quick Browser Upload & Preview:**
   - Scroll to **Our Photo Gallery** and click **Manage & Add Photos**.
   - Select multiple photos at once, preview them, edit their captions/dates/categories, and click **Add Photos to Gallery**.
   - Click **Set as Main** on your favorite photo of the two of you to feature it in the Sealed Surprise Letter, Gift One, and the Final Screen.
   - Click **Replace** on any individual frame in the Timeline or Gallery to swap in a real photo.

2. **Permanent Folder Workflow for Publishing:**
   - Place your real `.jpg` / `.png` / `.webp` photos inside `public/photos/` (for example, `public/photos/our-favorite.jpg`).
   - In `src/data/loveStoryData.ts`, set `imageUrl: '/photos/our-favorite.jpg'`.
   - Your private photos are never silently uploaded to third-party servers.

---

## 4. How to Replace the Soft Romantic Piano Music

- **In the Browser:** Open **Customize & Studio -> Save, Music & Publishing Guide** and click **Choose Local Piano Recording (.mp3 / .wav)**.
- **Permanent File Replacement:** Place your licensed or personal piano recording at `public/music/our-piano-song.mp3` and pass `/music/our-piano-song.mp3` to `romanticPiano.setCustomAudioFile('/music/our-piano-song.mp3', 'Our Piano Song')`.

---

## 5. Publishing to Vercel

1. Build and verify locally:
   ```bash
   npm run build
   ```
2. Deploy with Vercel CLI or GitHub integration:
   ```bash
   npx vercel --prod
   ```
3. **Important Privacy Note:** If you host the website on a public URL, anyone who obtains the link may be able to view it. Do not assume a public URL is password-protected unless you enable deployment protection in your hosting dashboard.
