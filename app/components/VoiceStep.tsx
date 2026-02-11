"use client";

import { useState, useEffect, useRef } from "react";

interface Voice {
  Name: string;
  ShortName: string;
  FriendlyName: string;
  Gender: "Male" | "Female";
  Locale: string;
}

type CaptionStyle = "classic" | "bold" | "subtitle";
type CaptionFont = "Impact" | "Arial Black" | "Montserrat" | "Comic Sans MS";

interface VoiceStepProps {
  selectedVoice: string;
  captionStyle: CaptionStyle;
  captionFont: CaptionFont;
  speakingRate: number;
  onVoiceChange: (voice: string) => void;
  onCaptionStyleChange: (style: CaptionStyle) => void;
  onFontChange: (font: CaptionFont) => void;
  onSpeakingRateChange: (value: number) => void;
  story: string;
  onNext: () => void;
  onBack: () => void;
}

const FONT_OPTIONS: { id: CaptionFont; label: string; description: string }[] = [
  { id: "Impact", label: "Impact", description: "Classic TikTok bold" },
  { id: "Arial Black", label: "Arial Black", description: "Clean and heavy" },
  { id: "Montserrat", label: "Montserrat", description: "Modern and sleek" },
  { id: "Comic Sans MS", label: "Comic Sans", description: "Casual and playful" },
];

const CAPTION_STYLES: { id: CaptionStyle; name: string; description: string }[] = [
  {
    id: "classic",
    name: "Classic",
    description: "White text with yellow word highlight, centered",
  },
  {
    id: "bold",
    name: "Bold",
    description: "One word at a time, large dramatic pop-in",
  },
  {
    id: "subtitle",
    name: "Subtitle",
    description: "Clean bottom subtitles with gold highlight",
  },
];

const POPULAR_LOCALES = ["en", "de", "fr", "es", "pt", "ja", "ko", "zh"];

export default function VoiceStep({
  selectedVoice,
  captionStyle,
  captionFont,
  speakingRate,
  onVoiceChange,
  onCaptionStyleChange,
  onFontChange,
  onSpeakingRateChange,
  story,
  onNext,
  onBack,
}: VoiceStepProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [localeFilter, setLocaleFilter] = useState("en");
  const [genderFilter, setGenderFilter] = useState<"all" | "Male" | "Female">("all");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [search, setSearch] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tts?locale=${localeFilter}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setVoices(data.voices || []);
      })
      .catch(() => setError("Failed to load voices"))
      .finally(() => setLoading(false));
  }, [localeFilter]);

  const filteredVoices = voices.filter((v) => {
    if (genderFilter !== "all" && v.Gender !== genderFilter) return false;
    if (search && !v.FriendlyName.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const previewVoice = async (voiceName: string) => {
    setPreviewLoading(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: story.slice(0, 100) || "Hello! This is a preview of this voice.",
          voice: voiceName,
          rate: speakingRate ? `+${speakingRate}%` : undefined,
        }),
      });
      if (!res.ok) throw new Error("Preview failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
    } catch {
      setError("Failed to preview voice");
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Voice & Captions</h2>
        <p className="text-[var(--muted-foreground)] text-sm">
          Pick a narration voice and caption style for your video.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Caption Style */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Caption Style</label>
        <div className="grid grid-cols-3 gap-3">
          {CAPTION_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => onCaptionStyleChange(s.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                captionStyle === s.id
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--muted-foreground)]"
              }`}
            >
              <p className="font-bold text-sm">{s.name}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                {s.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Font Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Caption Font</label>
        <div className="grid grid-cols-4 gap-2">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => onFontChange(f.id)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                captionFont === f.id
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--muted-foreground)]"
              }`}
            >
              <p
                className="font-bold text-sm leading-tight"
                style={{ fontFamily: f.id }}
              >
                Aa
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                {f.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Speaking Rate */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Speaking Speed</label>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
            <span>Default</span>
            <span>{speakingRate ? `+${speakingRate}% faster` : "Default"}</span>
            <span>+50% faster</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={speakingRate}
            onChange={(e) => onSpeakingRateChange(Number(e.target.value))}
            className="w-full h-2 bg-[var(--secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
          />
        </div>
      </div>

      {/* Voice Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Voice</label>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1 bg-[var(--secondary)] rounded-lg p-1">
            {POPULAR_LOCALES.map((loc) => (
              <button
                key={loc}
                onClick={() => setLocaleFilter(loc)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  localeFilter === loc
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-[var(--secondary)] rounded-lg p-1">
            {(["all", "Male", "Female"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  genderFilter === g
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {g === "all" ? "All" : g}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search voices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[var(--secondary)] text-[var(--foreground)] px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>

        {/* Voice list */}
        <div className="max-h-64 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <svg
                className="animate-spin h-5 w-5 text-[var(--primary)]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          ) : filteredVoices.length === 0 ? (
            <div className="text-center py-8 text-[var(--muted-foreground)] text-sm">
              No voices found
            </div>
          ) : (
            filteredVoices.map((v) => (
              <div
                key={v.ShortName}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all ${
                  selectedVoice === v.ShortName
                    ? "bg-[var(--primary)]/10"
                    : "hover:bg-[var(--secondary)]"
                }`}
                onClick={() => onVoiceChange(v.ShortName)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      selectedVoice === v.ShortName
                        ? "bg-[var(--primary)]"
                        : "bg-transparent"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {v.FriendlyName}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {v.Locale} · {v.Gender}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    previewVoice(v.ShortName);
                  }}
                  disabled={previewLoading}
                  className="flex-shrink-0 p-2 rounded-lg hover:bg-[var(--secondary)] transition-all text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  title="Preview voice"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-[var(--secondary)] text-[var(--foreground)] font-medium rounded-lg hover:opacity-80 transition-all"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedVoice}
          className="px-6 py-2.5 bg-[var(--primary)] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Next: Render Video
        </button>
      </div>
    </div>
  );
}
