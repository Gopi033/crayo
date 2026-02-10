# Crayo - Reddit Story Video Generator

A local Next.js application that generates downloadable MP4 videos in the style of TikTok/Instagram "Reddit story" clips. Enter your story, pick a background video and voice, then render a ready-to-upload short-form video with animated captions.

## Features

- **Manual story input** — type or paste your story (200+ words recommended for ~90s video)
- **Background video** — pick from local MP4 files (e.g. gameplay: Minecraft, Subway Surfers)
- **16:9 → 9:16** — backgrounds are center-cropped (sides cut), no rotation; ideal for YouTube-downloaded 16:9 clips
- **Random start** — each render starts the background at a random point (min 2 minutes in) so long videos (8+ min) don’t always begin at the intro
- **Minimum 90 seconds** — output is always at least 90s; short stories get silent padding at the end
- **Voice narration** — 400+ free Microsoft Edge TTS voices with preview
- **Animated captions** — 3 styles (Classic karaoke, Bold/Hormozi, Subtitle) and 4 fonts (Impact, Arial Black, Montserrat, Comic Sans)
- **1080×1920 output** — portrait 9:16 MP4 for TikTok/Instagram/YouTube Shorts

## Prerequisites

- **Node.js** 18+
- **FFmpeg** on your PATH (with `libass` for ASS subtitles)
  - Windows: [gyan.dev/ffmpeg](https://www.gyan.dev/ffmpeg/builds/) or `winget install FFmpeg`

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Add background videos**

   Put MP4 files in `public/backgrounds/`. They can be 16:9 (e.g. from YouTube); the app will center-crop to 9:16. Long videos (8+ minutes) work well; a random start point (after 2 minutes) is chosen per render.

3. **Start the app**

   ```bash
   npm run dev
   ```

   Open the URL shown (e.g. [http://localhost:3000](http://localhost:3000)).

## How it works

1. **Story** — Paste or type your story. Aim for 200+ words for a full ~90s video.
2. **Background** — Choose one of the MP4s in `public/backgrounds/`.
3. **Voice & captions** — Select TTS voice, caption style, and font.
4. **Render** — Click "Render Video". Wait ~60–90s; the MP4 will be offered for download.

Pipeline: **Microsoft Edge TTS** (free) → word timestamps → **ASS subtitles** (karaoke-style) → **FFmpeg** (background + audio + burned-in captions) → 1080×1920 MP4 (min 90s).

## Caption styles

| Style     | Description |
|----------|-------------|
| **Classic**  | 4 words at a time, karaoke fill (yellow on white), centered |
| **Bold**     | 1 word at a time, large text, pop-in (Hormozi style) |
| **Subtitle** | 6 words at bottom, current word in gold |

## Project structure

```
app/
  page.tsx                 Wizard UI (4 steps)
  layout.tsx, globals.css
  components/
    StoryStep.tsx           Manual story textarea
    BackgroundStep.tsx      Video grid selector
    VoiceStep.tsx           Voice + caption style + font
    RenderStep.tsx          Render button + download
  api/
    backgrounds/route.ts    List MP4s in public/backgrounds
    tts/route.ts            Voice list + TTS preview
    render/route.ts         Full render + download
lib/
  tts.ts                    node-edge-tts (audio + word boundaries)
  subtitles.ts              ASS generator (3 styles, 4 fonts)
  ffmpeg.ts                 Compose video, random start, 90s min, crop 9:16
public/
  backgrounds/              Your MP4 files
output/                     Rendered videos (gitignored)
```

## Troubleshooting

- **FFmpeg error** — Install FFmpeg and ensure `libass` is enabled (`ffmpeg -version`).
- **No backgrounds** — Add `.mp4` files to `public/backgrounds/`.
- **TTS fails** — Needs internet (Microsoft Edge TTS). Proxies can block it.
- **Port in use** — Next may use another port (e.g. 3005); check the terminal.
- **Dev lock error** — Stop other `next dev` processes and delete `.next/dev/lock` if needed.

## Tech stack

- Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- TTS: [node-edge-tts](https://www.npmjs.com/package/node-edge-tts) (Microsoft Edge, free)
- Video: FFmpeg (fluent-ffmpeg), ASS subtitles with libass
