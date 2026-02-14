"use client";

import { useState } from "react";

type CaptionStyle = "classic" | "bold" | "yellow-outline" | "white-outline";
type CaptionFont = "Impact" | "Arial Black" | "Montserrat" | "Comic Sans MS";

const CAPTION_STYLE_LABELS: Record<CaptionStyle, string> = {
  classic: "Classic",
  bold: "Bold",
  "yellow-outline": "Yellow outline",
  "white-outline": "White outline",
};

interface RenderStepProps {
  story: string;
  storyTitle: string;
  backgroundVideo: string;
  voice: string;
  captionStyle: CaptionStyle;
  captionFont: CaptionFont;
  speakingRate?: number;
  onBack: () => void;
  onReset: () => void;
}

type RenderState = "idle" | "rendering" | "done" | "error";

export default function RenderStep({
  story,
  storyTitle,
  backgroundVideo,
  voice,
  captionStyle,
  captionFont,
  speakingRate,
  onBack,
  onReset,
}: RenderStepProps) {
  const [state, setState] = useState<RenderState>("idle");
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [filename, setFilename] = useState("");

  const startRender = async () => {
    setState("rendering");
    setError("");

    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          story,
          backgroundVideo,
          voice,
          captionStyle,
          font: captionFont,
          rate: speakingRate ? `+${speakingRate}%` : undefined,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setState("error");
      } else {
        setDownloadUrl(data.downloadUrl);
        setFilename(data.filename);
        setState("done");
      }
    } catch {
      setError("Failed to connect to render API");
      setState("error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Render & Export</h2>
        <p className="text-[var(--muted-foreground)] text-sm">
          Review your settings and render the final video.
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[var(--muted-foreground)]">Story</p>
            <p className="font-medium truncate" title={storyTitle}>
              {storyTitle || story.slice(0, 60) + "..."}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {story.split(/\s+/).filter(Boolean).length} words
            </p>
          </div>
          <div>
            <p className="text-[var(--muted-foreground)]">Background</p>
            <p className="font-medium">{backgroundVideo}</p>
          </div>
          <div>
            <p className="text-[var(--muted-foreground)]">Voice</p>
            <p className="font-medium">{voice}</p>
          </div>
          <div>
            <p className="text-[var(--muted-foreground)]">Captions</p>
            <p className="font-medium">{CAPTION_STYLE_LABELS[captionStyle]}</p>
          </div>
          <div>
            <p className="text-[var(--muted-foreground)]">Font</p>
            <p className="font-medium">{captionFont}</p>
          </div>
          {speakingRate ? (
            <div>
              <p className="text-[var(--muted-foreground)]">Speed</p>
              <p className="font-medium">+{speakingRate}% faster</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Render area */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
        {state === "idle" && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[var(--primary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">Ready to render</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                This may take 30-90 seconds depending on story length.
              </p>
            </div>
            <button
              onClick={startRender}
              className="px-8 py-3 bg-[var(--primary)] text-white font-bold rounded-lg hover:opacity-90 transition-all text-lg"
            >
              Render Video
            </button>
          </div>
        )}

        {state === "rendering" && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto flex items-center justify-center">
              <svg
                className="animate-spin h-12 w-12 text-[var(--primary)]"
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
            <div>
              <p className="font-medium">Rendering your video...</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Generating speech, creating captions, composing video...
              </p>
            </div>
            {/* Animated progress bar */}
            <div className="max-w-xs mx-auto">
              <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--primary)] rounded-full animate-pulse w-2/3 transition-all" />
              </div>
            </div>
          </div>
        )}

        {state === "done" && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-green-400">Video rendered!</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {filename}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <a
                href={downloadUrl}
                download={filename}
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:opacity-90 transition-all inline-flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download MP4
              </a>
              <button
                onClick={onReset}
                className="px-6 py-3 bg-[var(--secondary)] text-[var(--foreground)] font-medium rounded-lg hover:opacity-80 transition-all"
              >
                Create Another
              </button>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-red-400">Render failed</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {error}
              </p>
            </div>
            <button
              onClick={startRender}
              className="px-6 py-3 bg-[var(--primary)] text-white font-medium rounded-lg hover:opacity-90 transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      {(state === "idle" || state === "error") && (
        <div className="flex justify-start">
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-[var(--secondary)] text-[var(--foreground)] font-medium rounded-lg hover:opacity-80 transition-all"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
