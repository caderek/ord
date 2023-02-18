import type { FileData } from "./types.js";

async function DefaultPreview({ url, mime, ext, size }: FileData) {
  const p = document.createElement("p");
  p.innerText = "Preview not available";
  return { el: p, mime, url, ext, size };
}

export default DefaultPreview;
