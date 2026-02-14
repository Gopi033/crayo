import type { WordBoundary } from "./tts";

export type CaptionStyle = "classic" | "bold" | "yellow-outline" | "white-outline";
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
  alignment: number; // 5 = center
  marginV: number;
  wordsPerChunk: number;
  bold: boolean;
  spacing: number;
}

const STYLE_CONFIGS: Record<CaptionStyle, StyleConfig> = {
  classic: {
    fontSize: 90,
    primaryColor: "&H00FFFFFF",   // white
    highlightColor: "&H0000FFFF", // yellow (BGR)
    outlineColor: "&H00000000",   // black
    backColor: "&H00000000",
    outline: 6,
    shadow: 3,
    alignment: 5,                 // center
    marginV: 200,
    wordsPerChunk: 1,
    bold: true,
    spacing: 2,
  },
  bold: {
    fontSize: 90,
    primaryColor: "&H00FFFFFF",   // white
    highlightColor: "&H001478FF", // orange-red (BGR)
    outlineColor: "&H00000000",   // black
    backColor: "&H00000000",
    outline: 6,
    shadow: 3,
    alignment: 5,                 // center
    marginV: 200,
    wordsPerChunk: 1,
    bold: true,
    spacing: 2,
  },
  "yellow-outline": {
    fontSize: 90,
    primaryColor: "&H0000FFFF",   // yellow (BGR)
    highlightColor: "&H0000FFFF",
    outlineColor: "&H00FFFFFF",   // white
    backColor: "&H00000000",
    outline: 6,
    shadow: 3,
    alignment: 5,             // center
    marginV: 200,
    wordsPerChunk: 1,
    bold: true,
    spacing: 2,
  },
  "white-outline": {
    fontSize: 90,
    primaryColor: "&H00FFFFFF",   // white
    highlightColor: "&H00FFFFFF",
    outlineColor: "&H00000000",   // black
    backColor: "&H00000000",
    outline: 6,
    shadow: 3,
    alignment: 5,                 // center
    marginV: 200,
    wordsPerChunk: 1,
    bold: true,
    spacing: 2,
  },
};

/** CSS hex colors for caption preview: [primary, highlight] */
export const STYLE_PREVIEW_COLORS: Record<CaptionStyle, { primary: string; highlight: string }> = {
  classic: { primary: "#FFFFFF", highlight: "#FFFF00" },
  bold: { primary: "#FFFFFF", highlight: "#FF7814" },
  "yellow-outline": { primary: "#FFFF00", highlight: "#FFFF00" },
  "white-outline": { primary: "#FFFFFF", highlight: "#FFFFFF" },
};

/** Styles with static color (no highlight-to-primary transition) */
const STATIC_COLOR_STYLES: Set<CaptionStyle> = new Set(["yellow-outline", "white-outline"]);

export function getStyleWordsPerChunk(style: CaptionStyle): number {
  return STYLE_CONFIGS[style].wordsPerChunk;
}

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

/** Keep only letters (A-Za-z) and numbers (0-9) for caption display. */
function sanitizeCaptionText(raw: string): string {
  return raw.replace(/[^A-Za-z0-9]/g, "");
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
 * All styles: big, bold, centered, 1 or 2 words at a time with pop-in effect.
 * Classic: white + yellow highlight. Bold: white + orange-red highlight.
 */
export function generateAss(
  wordBoundaries: WordBoundary[],
  options: GenerateAssOptions | CaptionStyle = "classic"
): string {
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
  const items: { word: WordBoundary; displayText: string }[] = [];
  for (const chunk of chunks) {
    for (const word of chunk.words) {
      const displayText = sanitizeCaptionText(word.text);
      if (displayText) items.push({ word, displayText });
    }
  }

  const events: string[] = [];
  const isStaticColor = STATIC_COLOR_STYLES.has(style);

  for (let i = 0; i < items.length; i++) {
    const { word, displayText } = items[i];
    const startMs = word.offset;
    const endMs = i + 1 < items.length ? items[i + 1].word.offset : word.offset + word.duration + 50;
    const start = msToAssTime(startMs);
    const end = msToAssTime(endMs);

    const scaleEffect = `{\\fscx130\\fscy130\\t(0,100,\\fscx100\\fscy100)}`;
    const colorEffect = isStaticColor
      ? ""
      : `\\c${cfg.highlightColor}\\t(80,${Math.min(300, Math.round(word.duration * 0.6))},\\c${cfg.primaryColor})`;

    const text = scaleEffect + colorEffect + displayText.toUpperCase();

    events.push(`Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`);
  }

  return header + events.join("\n") + "\n";
}

function generateEmptyAss(font: string = "Arial Black"): string {
  const cfg = STYLE_CONFIGS.classic;
  return `[Script Info]
Title: Crayo Captions
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${font},${cfg.fontSize},${cfg.primaryColor},${cfg.highlightColor},${cfg.outlineColor},${cfg.backColor},1,0,0,0,100,100,${cfg.spacing},0,1,${cfg.outline},${cfg.shadow},${cfg.alignment},40,40,${cfg.marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
}
