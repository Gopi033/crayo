import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { generateStory } from "@/lib/openrouter";

const PROMPTS_DIR = path.join(process.cwd(), "prompts");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      type,
      wordCount = 300,
      keywords = "",
    } = body as {
      type?: "aita" | "reddit-general";
      wordCount?: number;
      keywords?: string;
    };

    if (!type || !["aita", "reddit-general"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Use 'aita' or 'reddit-general'" },
        { status: 400 }
      );
    }

    const promptPath = path.join(PROMPTS_DIR, `${type}.md`);
    if (!fs.existsSync(promptPath)) {
      return NextResponse.json(
        { error: `Prompt file not found: prompts/${type}.md` },
        { status: 404 }
      );
    }

    let promptTemplate = fs.readFileSync(promptPath, "utf-8");
    promptTemplate = promptTemplate
      .replace(/\{\{word_count\}\}/g, String(wordCount))
      .replace(/\{\{wordCount\}\}/g, String(wordCount))
      .replace(/\{\{seed_input\}\}/g, keywords.trim() || "empty")
      .replace(/\{\{keywords\}\}/g, keywords.trim() || "empty");

    const story = await generateStory(promptTemplate, { wordCount });

    return NextResponse.json({ story });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate story";
    console.error("Story generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
