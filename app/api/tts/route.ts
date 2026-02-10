import { NextRequest, NextResponse } from "next/server";
import { getVoices, synthesize } from "@/lib/tts";

/**
 * GET /api/tts?locale=en
 * Returns list of available voices, optionally filtered by locale.
 */
export async function GET(req: NextRequest) {
  try {
    const locale = req.nextUrl.searchParams.get("locale") || undefined;
    const voices = await getVoices(locale);

    return NextResponse.json({ voices });
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
