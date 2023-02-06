import prettyBytes from "pretty-bytes";
import Prism from "prismjs";
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
  toggle?: HTMLLIElement;
};

async function createMedia(
  blob: Blob,
  mimeString: string,
  ext: string
): Promise<Media> {
  const mime = formatMime(mimeString);
  const url = URL.createObjectURL(blob);
  const size = prettyBytes(blob.size);

  console.log(mimeString);

  if (mimeString.includes("image")) {
    const img = new Image();
    img.src = url;
    return { el: img, mime, url, ext, size };
  }

  if (mimeString.startsWith("text/html")) {
    const iframe = document.createElement("iframe");
    iframe.src = url;

    const text = await blob.text();

    const box = document.createElement("div");
    const pre = document.createElement("pre");

    pre.innerHTML = Prism.highlight(text, Prism.languages.html, "html");

    const toggle = document.createElement("li");
    const link = document.createElement("a");

    const runText = "RUN";

    link.href = "#";
    link.innerText = runText;

    toggle.appendChild(link);

    box.classList.add("viewport");

    box.appendChild(pre);

    let isCode = true;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      box.removeChild(isCode ? pre : iframe);
      box.appendChild(isCode ? iframe : pre);
      link.innerText = isCode ? "show code" : runText;
      isCode = !isCode;
    });

    return { el: box, mime, url, ext, size, toggle };
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
