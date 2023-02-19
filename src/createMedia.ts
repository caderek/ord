import prettyBytes from "pretty-bytes";
import Prism from "prismjs";
import AudioPreview from "./previews/AudioPreview.js";
import DefaultPreview from "./previews/DefaultPreview.js";
import HTMLPreview from "./previews/HTMLPreview.js";
import ImagePreview from "./previews/ImagePreview.js";
import JSPreview from "./previews/JSPreview.js";
import ModelPreview from "./previews/ModelPreview.js";
import PDFPreview from "./previews/PDFPreview.js";
import TextPreview from "./previews/TextPreview.js";
import VideoPreview from "./previews/VideoPreview.js";

Prism.manual = true;

function formatMime(mimeStr: string) {
  return mimeStr.split(";")[0].split("/").join(" | ").toUpperCase();
}

type Media = {
  el: HTMLElement;
  mime: string | null;
  url: string | null;
  ext: string | null;
  size: string | null;
  actions?: HTMLLIElement[];
};

async function createMedia(
  blob: Blob,
  rawMime: string,
  ext: string,
): Promise<Media> {
  const mime = formatMime(rawMime);
  const url = URL.createObjectURL(blob);
  const size = prettyBytes(blob.size);

  const fileData = { url, blob, mime, rawMime, ext, size };

  if (rawMime.includes("image")) {
    return ImagePreview(fileData);
  }

  if (rawMime.startsWith("text/html")) {
    return HTMLPreview(fileData);
  }

  if (
    rawMime.startsWith("application/javascript") ||
    rawMime.startsWith("text/javascript")
  ) {
    return JSPreview(fileData);
  }

  if (rawMime.includes("text") || rawMime.includes("json")) {
    return TextPreview(fileData);
  }

  if (rawMime.includes("audio")) {
    return AudioPreview(fileData);
  }

  if (rawMime.includes("video")) {
    return VideoPreview(fileData);
  }

  if (rawMime.startsWith("application/pdf")) {
    return PDFPreview(fileData);
  }

  if (["glb", "gltf"].includes(ext)) {
    return ModelPreview(fileData);
  }

  return DefaultPreview(fileData);
}

export default createMedia;
