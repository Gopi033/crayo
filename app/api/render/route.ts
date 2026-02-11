import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import { synthesizeToFile } from "@/lib/tts";
import { generateAss } from "@/lib/subtitles";
import {
  composeVideo,
  getAudioDuration,
  getVideoDuration,
  pickRandomVideoStart,
} from "@/lib/ffmpeg";
import type { CaptionStyle, CaptionFont } from "@/lib/subtitles";

const TMP_DIR = path.join(process.cwd(), "tmp");
const OUTPUT_DIR = path.join(process.cwd(), "output");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      story,
      backgroundVideo,
      voice,
      captionStyle = "classic",
      font = "Arial Black",
      rate,
      pitch,
    } = body as {
      story: string;
      backgroundVideo: string; // filename in public/backgrounds/
      voice: string;
      captionStyle?: CaptionStyle;
      font?: CaptionFont;
      rate?: string;
      pitch?: string;
    };

    // Validate inputs
    if (!story || typeof story !== "string") {
      return NextResponse.json({ error: "Story text is required" }, { status: 400 });
    }
    if (!backgroundVideo) {
      return NextResponse.json(
        { error: "Background video is required" },
        { status: 400 }
      );
    }
    if (!voice) {
      return NextResponse.json({ error: "Voice is required" }, { status: 400 });
    }

    // Resolve paths
    const bgPath = path.join(process.cwd(), "public", "backgrounds", backgroundVideo);
    if (!fs.existsSync(bgPath)) {
      return NextResponse.json(
        { error: `Background video not found: ${backgroundVideo}` },
        { status: 404 }
      );
    }

    // Ensure temp and output directories exist
    for (const dir of [TMP_DIR, OUTPUT_DIR]) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    const jobId = `crayo_${Date.now()}`;
    const audioPath = path.join(TMP_DIR, `${jobId}.mp3`);
    const subtitlePath = path.join(TMP_DIR, `${jobId}.ass`);
    const outputPath = path.join(OUTPUT_DIR, `${jobId}.mp4`);

    // Format story: single continuous block (no paragraphs/line breaks) for faster pace
    const formattedStory = story
      .replace(/\r?\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Step 1: Generate TTS audio + word boundaries
    console.log(`[${jobId}] Generating TTS audio...`);
    const wordBoundaries = await synthesizeToFile(formattedStory, audioPath, {
      voice,
      rate,
      pitch,
    });
    console.log(
      `[${jobId}] TTS done: ${wordBoundaries.length} word boundaries`
    );

    // Step 2: Generate ASS subtitles (video duration = TTS audio duration, no padding)
    console.log(`[${jobId}] Generating subtitles...`);
    const assContent = generateAss(wordBoundaries, { style: captionStyle, font });
    fs.writeFileSync(subtitlePath, assContent, "utf-8");

    // Step 3: Pick random start point (min 2 min in) for long background videos
    const audioDuration = await getAudioDuration(audioPath);
    const videoDuration = await getVideoDuration(bgPath);
    const randomStart = pickRandomVideoStart(
      videoDuration,
      audioDuration,
      120
    );
    if (randomStart > 0) {
      console.log(`[${jobId}] Starting background at ${Math.round(randomStart)}s`);
    }

    // Step 4: Compose video with FFmpeg (16:9 center-cropped to 9:16, no rotation)
    console.log(`[${jobId}] Composing video...`);
    await composeVideo({
      backgroundVideoPath: bgPath,
      audioPath,
      subtitlePath,
      outputPath,
      videoStartOffsetSeconds: randomStart,
    });
    console.log(`[${jobId}] Video composed successfully`);

    // Step 5: Clean up temp files
    try {
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      fs.unlinkSync(subtitlePath);
    } catch {
      // Non-critical cleanup error
    }

    // Return download path
    return NextResponse.json({
      success: true,
      filename: `${jobId}.mp4`,
      downloadUrl: `/api/render?file=${jobId}.mp4`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to render video";
    console.error("Render error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/render?file=crayo_xxx.mp4
 * Serves the rendered video for download.
 */
export async function GET(req: NextRequest) {
  try {
    const filename = req.nextUrl.searchParams.get("file");
    if (!filename) {
      return NextResponse.json(
        { error: "File parameter is required" },
        { status: 400 }
      );
    }

    // Sanitize filename to prevent path traversal
    const safeName = path.basename(filename);
    const filePath = path.join(OUTPUT_DIR, safeName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const uint8 = new Uint8Array(fileBuffer);
    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${safeName}"`,
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to serve video";
    console.error("Download error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
