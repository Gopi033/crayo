import type { WordBoundary } from "./tts";

export type CaptionStyle = "classic" | "bold" | "subtitle";
export type CaptionFont = "Impact" | "Arial Black" | "Montserrat" | "Comic Sans MS";

export const AVAILABLE_FONTS: { id: CaptionFont; label: string; description: string }[] = [
  { id: "Impact", label: "Impact", description: "Classic TikTok bold" },
  { id: "Arial Black", label: "Arial Black", description: "Clean and heavy" },
  { id: "Montserrat", label: "Montserrat", description: "Modern and sleek" },
  { id: "Comic Sans MS", label: "Comic Sans", description: "Casual and playful" },
];

interface StyleConfig {
  fontSize: number;
  primaryColor: string; // ASS color format &HAABBGGRR
  highlightColor: string;
  outlineColor: string;
  backColor: string;
  outline: number;
  shadow: number;
  alignment: number; // 5 = center, 2 = bottom center
  marginV: number;
  wordsPerChunk: number;
  bold: boolean;
  spacing: number;
}

const STYLE_CONFIGS: Record<CaptionStyle, StyleConfig> = {
  classic: {
    fontSize: 52,
    primaryColor: "&H00FFFFFF",   // white
    highlightColor: "&H0000FFFF", // yellow (BGR)
    outlineColor: "&H00000000",   // black
    backColor: "&H80000000",      // semi-transparent black
    outline: 5,
    shadow: 2,
    alignment: 5,                 // center
    marginV: 200,
    wordsPerChunk: 4,
    bold: true,
    spacing: 1,
  },
  bold: {
    fontSize: 90,
    primaryColor: "&H00FFFFFF",   // white
    highlightColor: "&H001478FF", // orange-red (BGR)
    outlineColor: "&H00000000",   // black
    backColor: "&H00000000",      // transparent (no background box)
    outline: 6,
    shadow: 3,
    alignment: 5,
    marginV: 200,
    wordsPerChunk: 1,             // one word at a time (Hormozi style)
    bold: true,
    spacing: 2,
  },
  subtitle: {
    fontSize: 38,
    primaryColor: "&H00FFFFFF",   // white
    highlightColor: "&H0000CCFF", // gold (BGR)
    outlineColor: "&H00000000",   // black
    backColor: "&HA0000000",      // darker semi-transparent
    outline: 3,
    shadow: 1,
    alignment: 2,                 // bottom center
    marginV: 80,
    wordsPerChunk: 6,
    bold: false,
    spacing: 0,
  },
};

function msToAssTime(ms: number): string {
  const totalSeconds = Math.max(0, ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${s.toFixed(2).padStart(5, "0")}`;
}

/** Convert milliseconds to ASS karaoke centiseconds */
function msToKaraoke(ms: number): number {
  return Math.max(1, Math.round(ms / 10));
}

interface WordChunk {
  words: WordBoundary[];
  startMs: number;
  endMs: number;
}

/**
 * Group word boundaries into display chunks of N words.
 */
function groupWords(
  wordBoundaries: WordBoundary[],
  wordsPerChunk: number
): WordChunk[] {
  const chunks: WordChunk[] = [];

  for (let i = 0; i < wordBoundaries.length; i += wordsPerChunk) {
    const words = wordBoundaries.slice(i, i + wordsPerChunk);
    if (words.length === 0) continue;

    const startMs = words[0].offset;
    const lastWord = words[words.length - 1];
    const endMs = lastWord.offset + lastWord.duration;

    chunks.push({ words, startMs, endMs });
  }

  return chunks;
}

export interface GenerateAssOptions {
  style?: CaptionStyle;
  font?: CaptionFont;
}

/**
 * Generate ASS subtitle content from word boundaries.
 *
 * Classic: 4 words at a time with karaoke fill highlight (smooth color wipe per word).
 * Bold:    1 word at a time, large font, dramatic pop.
 * Subtitle: 6 words at bottom, current word highlighted.
 */
export function generateAss(
  wordBoundaries: WordBoundary[],
  options: GenerateAssOptions | CaptionStyle = "classic"
): string {
  // Support both old signature (string) and new (object)
  const opts: GenerateAssOptions =
    typeof options === "string" ? { style: options } : options;

  const style = opts.style ?? "classic";
  const font = opts.font ?? "Arial Black";

  if (wordBoundaries.length === 0) {
    return generateEmptyAss(font);
  }

  const cfg = STYLE_CONFIGS[style];
  const boldFlag = cfg.bold ? 1 : 0;

  const header = `[Script Info]
Title: Crayo Captions
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${font},${cfg.fontSize},${cfg.primaryColor},${cfg.highlightColor},${cfg.outlineColor},${cfg.backColor},${boldFlag},0,0,0,100,100,${cfg.spacing},0,1,${cfg.outline},${cfg.shadow},${cfg.alignment},40,40,${cfg.marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const chunks = groupWords(wordBoundaries, cfg.wordsPerChunk);
  const events: string[] = [];

  if (style === "bold") {
    // --- BOLD / HORMOZI STYLE ---
    // One word at a time, full screen, big dramatic text.
    // Each word appears for its spoken duration (with small padding).
    for (const chunk of chunks) {
      for (const word of chunk.words) {
        const startMs = word.offset;
        const endMs = word.offset + word.duration + 50; // small tail
        const start = msToAssTime(startMs);
        const end = msToAssTime(endMs);

        // Pop-in effect: scale from 130% → 100%, flash highlight → white
        const text =
          `{\\fscx130\\fscy130\\t(0,100,\\fscx100\\fscy100)` +
          `\\c${cfg.highlightColor}\\t(80,${Math.min(300, Math.round(word.duration * 0.6))},\\c${cfg.primaryColor})}` +
          `${word.text.toUpperCase()}`;

        events.push(`Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`);
      }
    }
  } else if (style === "classic") {
    // --- CLASSIC KARAOKE STYLE ---
    // Show a chunk of words, use \kf (karaoke fill) to smoothly highlight each word.
    for (const chunk of chunks) {
      const start = msToAssTime(chunk.startMs);
      const end = msToAssTime(chunk.endMs + 100); // small tail buffer

      // Build karaoke text: {\kfN}word for each word
      // \kf = smooth fill from secondary color to primary color over N centiseconds
      // We want: primary = white, secondary = highlight color
      // Actually in ASS, \kf fills FROM PrimaryColour TO SecondaryColour
      // So we set SecondaryColour as the highlight and use \kf for fill
      const parts: string[] = [];
      for (const word of chunk.words) {
        const dur = msToKaraoke(word.duration);
        // Calculate gap before this word (silence between previous word end and this word start)
        const wordIdx = chunk.words.indexOf(word);
        if (wordIdx > 0) {
          const prevWord = chunk.words[wordIdx - 1];
          const gap = word.offset - (prevWord.offset + prevWord.duration);
          if (gap > 50) {
            // Insert invisible karaoke tag for the gap
            parts.push(`{\\kf${msToKaraoke(gap)}} `);
          } else {
            parts.push(" ");
          }
        }
        parts.push(`{\\kf${dur}}${word.text}`);
      }

      events.push(
        `Dialogue: 0,${start},${end},Default,,0,0,0,,${parts.join("")}`
      );
    }
  } else {
    // --- SUBTITLE STYLE ---
    // Show chunk of words at bottom, use \kf karaoke fill for smooth word-by-word
    // gold highlight. One dialogue event per chunk avoids flickering.
    for (const chunk of chunks) {
      const start = msToAssTime(chunk.startMs);
      const end = msToAssTime(chunk.endMs + 100);

      // Build karaoke text with \kf tags, identical to classic approach
      const parts: string[] = [];
      for (let wi = 0; wi < chunk.words.length; wi++) {
        const word = chunk.words[wi];
        const dur = msToKaraoke(word.duration);

        if (wi > 0) {
          const prevWord = chunk.words[wi - 1];
          const gap = word.offset - (prevWord.offset + prevWord.duration);
          if (gap > 50) {
            parts.push(`{\\kf${msToKaraoke(gap)}} `);
          } else {
            parts.push(" ");
          }
        }
        parts.push(`{\\kf${dur}}${word.text}`);
      }

      events.push(
        `Dialogue: 0,${start},${end},Default,,0,0,0,,${parts.join("")}`
      );
    }
  }

  return header + events.join("\n") + "\n";
}

function generateEmptyAss(font: string = "Arial Black"): string {
  return `[Script Info]
Title: Crayo Captions
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${font},52,&H00FFFFFF,&H0000FFFF,&H00000000,&H80000000,1,0,0,0,100,100,1,0,1,5,2,5,40,40,200,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
}
