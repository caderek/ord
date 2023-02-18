import type { FileData } from "./types.js";

async function PDFPreview({ url, mime, ext, size }: FileData) {
  const iframe = document.createElement("iframe");
  iframe.src = url;
  return { el: iframe, mime, url, ext, size };
}

export default PDFPreview;
