"use client";

import { useState, useEffect } from "react";

interface BackgroundVideo {
  filename: string;
  name: string;
  url: string;
}

interface BackgroundStepProps {
  selected: string;
  onSelect: (filename: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BackgroundStep({
  selected,
  onSelect,
  onNext,
  onBack,
}: BackgroundStepProps) {
  const [videos, setVideos] = useState<BackgroundVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/backgrounds")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setVideos(data.videos || []);
        }
      })
      .catch(() => setError("Failed to load backgrounds"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose Background</h2>
        <p className="text-[var(--muted-foreground)] text-sm">
          Select a background video. Drop MP4 files into{" "}
          <code className="bg-[var(--secondary)] px-1.5 py-0.5 rounded text-xs">
            public/backgrounds/
          </code>{" "}
          to add more.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <svg
            className="animate-spin h-6 w-6 text-[var(--primary)]"
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
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {!loading && videos.length === 0 && !error && (
        <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-xl">
          <div className="text-4xl mb-3">🎬</div>
          <p className="text-[var(--muted-foreground)] text-sm">
            No background videos found.
          </p>
          <p className="text-[var(--muted-foreground)] text-xs mt-1">
            Add .mp4 files to{" "}
            <code className="bg-[var(--secondary)] px-1 rounded">
              public/backgrounds/
            </code>
          </p>
        </div>
      )}

      {/* Video grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {videos.map((video) => (
          <button
            key={video.filename}
            onClick={() => onSelect(video.filename)}
            className={`relative group rounded-xl overflow-hidden border-2 transition-all aspect-[9/16] ${
              selected === video.filename
                ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/30"
                : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
            }`}
          >
            <video
              src={video.url}
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white text-sm font-medium truncate">
                {video.name}
              </p>
            </div>
            {selected === video.filename && (
              <div className="absolute top-2 right-2 bg-[var(--primary)] rounded-full p-1">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
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
          disabled={!selected}
          className="px-6 py-2.5 bg-[var(--primary)] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Next: Choose Voice
        </button>
      </div>
    </div>
  );
}
