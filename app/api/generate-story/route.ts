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
      type?: "aita" | "revenge" | "tifu";
      wordCount?: number;
      keywords?: string;
    };

    if (!type || !["aita", "revenge", "tifu"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Use 'aita', 'revenge', or 'tifu'" },
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

    const raw = await generateStory(promptTemplate, { wordCount });
    const genderMatch = raw.match(/^GENDER:\s*(male|female)\s*\n+/i);
    const gender =
      genderMatch && genderMatch[1].toLowerCase() === "male" ? "Male" : "Female";
    const story = genderMatch ? raw.replace(/^GENDER:\s*(male|female)\s*\n+/i, "").trim() : raw;

    return NextResponse.json({ story, gender });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate story";
    console.error("Story generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
