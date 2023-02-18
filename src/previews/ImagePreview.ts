import type { FileData } from "./types.js";

async function ImagePreview({ url, mime, rawMime, ext, size }: FileData) {
  const img = new Image();
  img.src = url;

  if (rawMime.includes("svg")) {
    img.classList.add("svg");
  }

  return { el: img, mime, url, ext, size };
}

export default ImagePreview;
