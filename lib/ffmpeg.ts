import ffmpeg from "fluent-ffmpeg";
import path from "node:path";
import fs from "node:fs";

/**
 * Get the duration of an audio file in seconds.
 */
export function getAudioDuration(audioPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) return reject(err);
      const duration = metadata.format.duration;
      if (typeof duration !== "number") {
        return reject(new Error("Could not determine audio duration"));
      }
      resolve(duration);
    });
  });
}

/**
 * Get the duration of a video file in seconds.
 */
export function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);
      const duration = metadata.format.duration;
      if (typeof duration !== "number") {
        return reject(new Error("Could not determine video duration"));
      }
      resolve(duration);
    });
  });
}

export interface ComposeOptions {
  backgroundVideoPath: string;
  audioPath: string;
  subtitlePath: string;
  outputPath: string;
  /** Start reading background video from this timestamp (seconds). Use for random start. */
  videoStartOffsetSeconds?: number;
  /** Called with progress percentage 0-100 */
  onProgress?: (percent: number) => void;
}

const MIN_OUTPUT_DURATION_SECONDS = 90;

/**
 * Pad audio with silence at the end if shorter than minDuration.
 * Returns path to the (possibly new) audio file to use.
 */
export async function ensureMinimumDuration(
  audioPath: string,
  minDurationSeconds: number = MIN_OUTPUT_DURATION_SECONDS
): Promise<{ path: string; duration: number; wasPadded: boolean }> {
  const duration = await getAudioDuration(audioPath);

  if (duration >= minDurationSeconds) {
    return { path: audioPath, duration, wasPadded: false };
  }

  const paddedPath = audioPath.replace(/\.(mp3|m4a|aac)$/i, "_padded.mp3");

  return new Promise((resolve, reject) => {
    ffmpeg(audioPath)
      .audioFilters(`apad=whole_dur=${minDurationSeconds}`)
      .duration(minDurationSeconds)
      .output(paddedPath)
      .on("end", () =>
        resolve({
          path: paddedPath,
          duration: minDurationSeconds,
          wasPadded: true,
        })
      )
      .on("error", (err) =>
        reject(new Error(`Failed to pad audio: ${err.message}`))
      )
      .run();
  });
}

/**
 * Pick a random start time for a long video. At least 2 minutes in
 * (to skip intros/ads), and leaves enough room for the full output duration.
 * Returns 0 if the video is shorter than minStartSeconds.
 */
export function pickRandomVideoStart(
  videoDurationSeconds: number,
  outputDurationSeconds: number,
  minStartSeconds: number = 120
): number {
  if (videoDurationSeconds <= minStartSeconds) {
    return 0;
  }
  const maxStart = Math.max(
    minStartSeconds,
    videoDurationSeconds - outputDurationSeconds - 5
  );
  if (maxStart <= minStartSeconds) {
    return minStartSeconds;
  }
  return Math.floor(
    minStartSeconds + Math.random() * (maxStart - minStartSeconds)
  );
}

/**
 * Compose the final video:
 * 1. Takes the background video, center-crops 16:9 to 9:16 (zoom/cut sides, no rotation)
 * 2. Optionally seeks to random start (e.g. 2+ min in) for long videos
 * 3. Loops background if shorter than audio
 * 4. Burns in ASS subtitles
 * 5. Mixes TTS audio (replaces original audio)
 * 6. Outputs MP4 trimmed to audio length
 */
export async function composeVideo(options: ComposeOptions): Promise<string> {
  const {
    backgroundVideoPath,
    audioPath,
    subtitlePath,
    outputPath,
    videoStartOffsetSeconds = 0,
    onProgress,
  } = options;

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const audioDuration = await getAudioDuration(audioPath);

  // Normalize the subtitle path for FFmpeg on Windows (use forward slashes, escape colons)
  const normalizedSubPath = subtitlePath
    .replace(/\\/g, "/")
    .replace(/:/g, "\\:");

  // Input options for video: seek to start offset (-ss before -i = fast input seek), then loop
  const videoInputOpts: string[] = [];
  if (videoStartOffsetSeconds > 0) {
    videoInputOpts.push("-ss", String(videoStartOffsetSeconds));
  }
  videoInputOpts.push("-stream_loop", "-1");

  return new Promise<string>((resolve, reject) => {
    const command = ffmpeg();

    // Input: background video (seek to random start, loop if needed)
    command.input(backgroundVideoPath).inputOptions(videoInputOpts);

    // Input: TTS audio
    command.input(audioPath);

    // Video filter: scale + center-crop 16:9 -> 9:16 (cut sides, no rotation), burn subtitles
    const videoFilter = [
      "scale=1080:1920:force_original_aspect_ratio=increase",
      "crop=1080:1920:(iw-1080)/2:0", // center crop horizontally
      `ass='${normalizedSubPath}'`,
    ].join(",");

    command
      .outputOptions([
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-vf", videoFilter,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "128k",
        "-shortest",
        "-t", String(audioDuration + 0.5),
        "-movflags", "+faststart",
        "-y",
      ])
      .output(outputPath);

    if (onProgress) {
      command.on("progress", (progress) => {
        if (progress.percent) {
          onProgress(Math.min(100, Math.round(progress.percent)));
        }
      });
    }

    command
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
      .run();
  });
}
