import { NextRequest, NextResponse } from "next/server";
import { generateStory } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = body.prompt as string | undefined;

    const story = await generateStory(prompt);

    return NextResponse.json({ story });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate story";
    console.error("Story generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
