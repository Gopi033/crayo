import { EdgeTTS } from "node-edge-tts";
import fs from "node:fs";
import path from "node:path";

export interface Voice {
  Name: string;
  ShortName: string;
  FriendlyName: string;
  Gender: "Male" | "Female";
  Locale: string;
  VoiceTag: {
    ContentCategories: string[];
    VoicePersonalities: string[];
  };
}

export interface WordBoundary {
  text: string;
  offset: number; // milliseconds from start
  duration: number; // milliseconds
}

export interface TtsOptions {
  voice?: string;
  rate?: string;
  pitch?: string;
  volume?: string;
}

const baseUrl = "speech.platform.bing.com/consumer/speech/synthesize/readaloud";
const token = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const voiceListUrl = `https://${baseUrl}/voices/list?trustedclienttoken=${token}`;

/**
 * Synthesize text to audio file and return word boundaries.
 * Uses node-edge-tts which handles the latest DRM/token authentication.
 */
export async function synthesizeToFile(
  text: string,
  outputPath: string,
  options: TtsOptions = {}
): Promise<WordBoundary[]> {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const {
    voice = "en-US-ChristopherNeural",
    rate = "default",
    pitch = "default",
    volume = "default",
  } = options;

  // Determine language from voice name (e.g. "en-US-ChristopherNeural" -> "en-US")
  const langMatch = voice.match(/^([a-z]{2}-[A-Z]{2})/);
  const lang = langMatch ? langMatch[1] : "en-US";

  const tts = new EdgeTTS({
    voice,
    lang,
    outputFormat: "audio-24khz-48kbitrate-mono-mp3",
    saveSubtitles: true,
    rate,
    pitch,
    volume,
    timeout: 60000,
  });

  await tts.ttsPromise(text, outputPath);

  // node-edge-tts saves subtitles as a .json file next to the audio
  const subPath = outputPath + ".json";
  const wordBoundaries: WordBoundary[] = [];

  if (fs.existsSync(subPath)) {
    try {
      const subData = JSON.parse(fs.readFileSync(subPath, "utf-8")) as Array<{
        part: string;
        start: number;
        end: number;
      }>;

      for (const sub of subData) {
        wordBoundaries.push({
          text: sub.part.trim(),
          offset: sub.start,
          duration: Math.max(1, sub.end - sub.start),
        });
      }

      // Clean up the subtitle json file
      fs.unlinkSync(subPath);
    } catch {
      // If subtitle parsing fails, continue without word boundaries
      console.warn("Warning: Could not parse TTS subtitle data");
    }
  }

  return wordBoundaries;
}

/**
 * Synthesize text and return audio buffer (for preview).
 */
export async function synthesize(
  text: string,
  options: TtsOptions = {}
): Promise<{ audioBuffer: Buffer; wordBoundaries: WordBoundary[] }> {
  // Use a temp file since node-edge-tts writes to disk
  const tmpDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const tmpFile = path.join(tmpDir, `preview_${Date.now()}.mp3`);

  try {
    const wordBoundaries = await synthesizeToFile(text, tmpFile, options);
    const audioBuffer = fs.readFileSync(tmpFile) as Buffer;
    return { audioBuffer, wordBoundaries };
  } finally {
    // Clean up temp file
    try {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    } catch {
      // non-critical
    }
  }
}

/**
 * Get available TTS voices, optionally filtered by locale prefix or exact locales.
 * @param localeFilter - optional prefix (e.g. "en") to include all matching locales
 * @param allowedLocales - optional exact locales (e.g. ["en-US", "en-AU"]) to restrict results
 */
export async function getVoices(
  localeFilter?: string,
  allowedLocales?: string[]
): Promise<Voice[]> {
  const resp = await fetch(voiceListUrl);
  if (!resp.ok) {
    throw new Error(`Failed to fetch voices: ${resp.status}`);
  }
  let voices = (await resp.json()) as Voice[];
  if (allowedLocales?.length) {
    const set = new Set(allowedLocales.map((l) => l.toLowerCase()));
    voices = voices.filter((v) => set.has(v.Locale.toLowerCase()));
  } else if (localeFilter) {
    voices = voices.filter((v) =>
      v.Locale.toLowerCase().startsWith(localeFilter.toLowerCase())
    );
  }
  return voices;
}
