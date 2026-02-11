"use client";

import { useState } from "react";

type StoryType = "aita" | "reddit-general";

interface StoryStepProps {
  story: string;
  onStoryChange: (story: string) => void;
  onNext: () => void;
}

export default function StoryStep({
  story,
  onStoryChange,
  onNext,
}: StoryStepProps) {
  const [storyType, setStoryType] = useState<StoryType>("aita");
  const [wordCount, setWordCount] = useState(300);
  const [keywords, setKeywords] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: storyType,
          wordCount,
          keywords: keywords.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to generate story");
      }
      onStoryChange(data.story ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate story");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Write Your Story</h2>
        <p className="text-[var(--muted-foreground)] text-sm">
          Generate a story with AI or type/paste your own. Aim for 200+ words
          for a full 90+ second video.
        </p>
      </div>

      {/* Story type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Story Type</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStoryType("aita")}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              storyType === "aita"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            AITA
          </button>
          <button
            type="button"
            onClick={() => setStoryType("reddit-general")}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              storyType === "reddit-general"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            General Reddit
          </button>
        </div>
      </div>

      {/* Parameters */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="wordCount">
            Word count
          </label>
          <input
            id="wordCount"
            type="number"
            min={100}
            max={1000}
            value={wordCount}
            onChange={(e) => setWordCount(Number(e.target.value) || 250)}
            className="w-full max-w-[10rem] bg-[var(--secondary)] text-[var(--foreground)] px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="keywords">
            Keywords / sentences / short descriptions (optional)
          </label>
          <textarea
            id="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. wedding drama, petty neighbor, entitled parent — leave empty for a random story"
            rows={2}
            className="w-full bg-[var(--secondary)] text-[var(--foreground)] px-4 py-3 rounded-xl border border-[var(--border)] text-sm leading-relaxed placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-y"
          />
        </div>
      </div>

      {/* Generate button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full sm:w-auto px-6 py-2.5 bg-[var(--accent)] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isGenerating ? "Generating…" : "Generate Story"}
      </button>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      {/* Story textarea */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Your Story</label>
        <textarea
          value={story}
          onChange={(e) => onStoryChange(e.target.value)}
          placeholder="Generated story appears here, or type/paste your own..."
          rows={12}
          className="w-full bg-[var(--secondary)] text-[var(--foreground)] px-4 py-3 rounded-xl border border-[var(--border)] text-sm leading-relaxed placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all resize-y"
        />
        <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
          <span>
            {story.split(/\s+/).filter(Boolean).length} words
          </span>
          <span>
            ~{Math.round(story.split(/\s+/).filter(Boolean).length / 2.5)}s video
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!story.trim()}
          className="px-6 py-2.5 bg-[var(--primary)] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Next: Choose Background
        </button>
      </div>
    </div>
  );
}
