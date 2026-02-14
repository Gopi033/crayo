"use client";

import { useState, useMemo } from "react";
import StoryStep from "./components/StoryStep";
import BackgroundStep from "./components/BackgroundStep";
import VoiceStep from "./components/VoiceStep";
import RenderStep from "./components/RenderStep";

type CaptionStyle = "classic" | "bold" | "yellow-outline" | "white-outline";
type CaptionFont = "Impact" | "Arial Black" | "Montserrat" | "Comic Sans MS";

const STEPS = [
  { id: 1, label: "Story" },
  { id: 2, label: "Background" },
  { id: 3, label: "Voice" },
  { id: 4, label: "Render" },
];

export default function Home() {
  const [step, setStep] = useState(1);
  const [story, setStory] = useState("");
  const [backgroundVideo, setBackgroundVideo] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>("classic");
  const [captionFont, setCaptionFont] = useState<CaptionFont>("Arial Black");
  const [speakingRate, setSpeakingRate] = useState(0);
  const [storytellerGender, setStorytellerGender] = useState<"Male" | "Female">("Female");

  const storyTitle = useMemo(
    () => story.trim().split("\n")[0]?.trim() || story.slice(0, 80) || "",
    [story]
  );

  const reset = () => {
    setStep(1);
    setStory("");
    setBackgroundVideo("");
    setSelectedVoice("");
    setCaptionStyle("classic");
    setCaptionFont("Arial Black");
    setSpeakingRate(0);
    setStorytellerGender("Female");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
                />
              </svg>
            </div>
            <h1 className="text-lg font-bold">Crayo</h1>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Reddit Story Video Generator
          </p>
        </div>
      </header>

      {/* Stepper */}
      <div className="max-w-4xl mx-auto px-6 py-6 w-full">
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all flex-shrink-0 ${
                    step >= s.id
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {step > s.id ? (
                    <svg
                      className="w-4 h-4"
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
                  ) : (
                    s.id
                  )}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:inline ${
                    step >= s.id
                      ? "text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 rounded transition-all ${
                    step > s.id
                      ? "bg-[var(--primary)]"
                      : "bg-[var(--border)]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="max-w-2xl mx-auto">
          {step === 1 && (
            <StoryStep
              story={story}
              onStoryChange={setStory}
              storytellerGender={storytellerGender}
              onGenderChange={setStorytellerGender}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <BackgroundStep
              selected={backgroundVideo}
              onSelect={setBackgroundVideo}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <VoiceStep
              selectedVoice={selectedVoice}
              captionStyle={captionStyle}
              captionFont={captionFont}
              speakingRate={speakingRate}
              onVoiceChange={setSelectedVoice}
              onCaptionStyleChange={setCaptionStyle}
              onFontChange={setCaptionFont}
              onSpeakingRateChange={setSpeakingRate}
              story={story}
              storyTitle={storyTitle}
              storytellerGender={storytellerGender}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <RenderStep
              story={story}
              storyTitle={storyTitle}
              backgroundVideo={backgroundVideo}
              voice={selectedVoice}
              captionStyle={captionStyle}
              captionFont={captionFont}
              speakingRate={speakingRate}
              onBack={() => setStep(3)}
              onReset={reset}
            />
          )}
        </div>
      </div>
    </div>
  );
}
