import type { FileData } from "./types.js";

async function AudioPreview({ url, mime, ext, size }: FileData) {
  const audio = new Audio(url);
  audio.controls = true;
  return { el: audio, mime, url, ext, size };
}

export default AudioPreview;
