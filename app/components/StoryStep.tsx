"use client";

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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Write Your Story</h2>
        <p className="text-[var(--muted-foreground)] text-sm">
          Type or paste your story below. Aim for 200+ words for a full 90+
          second video (short stories get silent padding at the end).
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Your Story</label>
        <textarea
          value={story}
          onChange={(e) => onStoryChange(e.target.value)}
          placeholder="Type or paste your story here..."
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
