# Changelog

## Recent updates

### LLM-generated stories
- Two story types: AITA and General Reddit.
- User-editable prompt files: `prompts/aita.md` and `prompts/reddit-general.md` with placeholders `{{word_count}}` and `{{seed_input}}`.
- StoryStep: story type selector, word count input (default 300), keywords/descriptions textarea, Generate button.
- Generated story is editable before proceeding; manual paste still supported.
- API: `/api/generate-story` loads prompts, substitutes placeholders, calls OpenRouter (Arcee Trinity Large Preview).

### Story formatting
- Story text is normalized to a single continuous block (no paragraphs or line breaks) before TTS for a faster-paced feel.

### Voice speed control
- Speaking rate slider in Voice step: 0 to +50% faster.
- Rate applied to TTS preview and final render via Edge TTS prosody parameter.

### Video duration
- Removed 90-second minimum; video ends exactly when TTS audio ends.
- Output length matches story length.

---

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
- Random start for background: at least 2 minutes in, so long videos (8+ min) don't always start at the intro.
- Background looped if shorter than audio.

### Tech
- Next.js 16, React, TypeScript, Tailwind CSS.
- API routes: `/api/backgrounds`, `/api/tts` (GET voices, POST preview), `/api/generate-story` (POST), `/api/render` (POST render, GET download).
- OpenRouter (Arcee AI Trinity Large Preview) for LLM story generation; `OPENROUTER_API_KEY` required in `.env.local`.
