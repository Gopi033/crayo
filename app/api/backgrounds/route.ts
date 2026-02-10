import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const BACKGROUNDS_DIR = path.join(process.cwd(), "public", "backgrounds");

export async function GET() {
  try {
    if (!fs.existsSync(BACKGROUNDS_DIR)) {
      fs.mkdirSync(BACKGROUNDS_DIR, { recursive: true });
    }

    const files = fs.readdirSync(BACKGROUNDS_DIR);
    const videos = files
      .filter((f) => {
        const ext = path.extname(f).toLowerCase();
        return [".mp4", ".webm", ".mov"].includes(ext);
      })
      .map((f) => ({
        filename: f,
        name: path.parse(f).name,
        url: `/backgrounds/${f}`,
      }));

    return NextResponse.json({ videos });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list backgrounds";
    console.error("Backgrounds error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
