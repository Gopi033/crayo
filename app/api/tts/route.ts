import { NextRequest, NextResponse } from "next/server";
import { getVoices, synthesize } from "@/lib/tts";

/** Allowed voice ShortNames only (Liam, Andrew, Guy | Jenny, Aria, Libby, Michelle, Ava) */
const ALLOWED_VOICE_SHORT_NAMES = new Set([
  "en-CA-LiamNeural",       // Male - Canada
  "en-US-AndrewNeural",      // Male - US
  "en-US-GuyNeural",         // Male - US
  "en-US-JennyNeural",       // Female - US
  "en-US-AriaNeural",        // Female - US
  "en-GB-LibbyNeural",       // Female - UK
  "en-US-MichelleNeural",     // Female - US
  "en-US-AvaNeural",         // Female - US
]);

/**
 * GET /api/tts
 * Returns list of allowed voices only (8 voices: 3 male, 5 female).
 */
export async function GET(req: NextRequest) {
  try {
    const voices = await getVoices(undefined, ["en-US", "en-CA", "en-GB"]);
    const filtered = voices.filter((v) => ALLOWED_VOICE_SHORT_NAMES.has(v.ShortName));

    return NextResponse.json({ voices: filtered });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get voices";
    console.error("TTS voices error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/tts
 * Body: { text: string, voice?: string, rate?: string, pitch?: string }
 * Returns audio preview as MP3.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice, rate, pitch } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Limit preview to first 200 characters
    const previewText = text.slice(0, 200);

    const result = await synthesize(previewText, { voice, rate, pitch });

    // Convert Node.js Buffer to Uint8Array for NextResponse compatibility
    const uint8 = new Uint8Array(result.audioBuffer);

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(uint8.length),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to synthesize speech";
    console.error("TTS synthesis error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
