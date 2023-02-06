import prettyBytes from "pretty-bytes";

function formatMime(mimeStr: string) {
  if (typeof mimeStr !== "string") {
    return null;
  }

  return mimeStr.split(";")[0].split("/").join(" | ").toUpperCase();
}

async function createMedia(blob: Blob, mimeString: string, ext: string) {
  const mime = formatMime(mimeString);
  const url = URL.createObjectURL(blob);
  const size = prettyBytes(blob.size);

  if (mimeString.includes("image")) {
    const img = new Image();
    img.src = url;
    return { el: img, mime, url, ext, size };
  }

  if (mimeString.includes("text") || mimeString.includes("json")) {
    const text = await blob.text();
    const pre = document.createElement("pre");
    pre.innerText = text;
    return { el: pre, mime, url, ext, size };
  }

  if (mimeString.includes("audio")) {
    const audio = new Audio(url);
    audio.controls = true;
    return { el: audio, mime, url, ext, size };
  }

  if (mimeString.includes("video")) {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    return { el: video, mime, url, ext, size };
  }

  const p = document.createElement("p");
  p.innerText = "Format not supported";
  return { el: p, mime, url, ext, size };
}

export default createMedia;
