# Changelog

## Initial implementation

### Core pipeline
- 4-step wizard: Story → Background → Voice & Captions → Render.
- Manual story input (textarea); 200+ words recommended for ~90s video.
- Background video picker: list MP4s from `public/backgrounds/`, preview on hover.
- TTS via Microsoft Edge (node-edge-tts): 400+ voices, word-level timestamps for captions.
- ASS subtitle generator: 3 styles (Classic karaoke, Bold/Hormozi, Subtitle), 4 fonts (Impact, Arial Black, Montserrat, Comic Sans).
- FFmpeg composition: background + TTS audio + burned-in ASS → 1080×1920 MP4.

### Video behavior
- 16:9 backgrounds center-cropped to 9:16 (sides cut, no rotation).
- Random start for background: at least 2 minutes in, so long videos (8+ min) don’t always start at the intro.
- Minimum output length 90 seconds; shorter stories padded with silence at the end.
- Background looped if shorter than audio.

### Tech
- Next.js 16, React, TypeScript, Tailwind CSS.
- API routes: `/api/backgrounds`, `/api/tts` (GET voices, POST preview), `/api/render` (POST render, GET download).
- No LLM/OpenRouter in use; story input is manual only.
