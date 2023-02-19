import type { FileData } from "./types.js";

async function VideoPreview({ url, mime, ext, size }: FileData) {
  const video = document.createElement("video");
  video.controls = true;
  return { el: video, mime, url, ext, size };
}

export default VideoPreview;
