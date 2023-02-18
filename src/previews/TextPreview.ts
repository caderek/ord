import type { FileData } from "./types.js";

async function TextPreview({ url, blob, mime, ext, size }: FileData) {
  const text = await blob.text();
  const pre = document.createElement("pre");
  pre.innerText = text;
  return { el: pre, mime, url, ext, size };
}

export default TextPreview;
