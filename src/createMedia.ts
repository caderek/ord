import prettyBytes from "pretty-bytes";
// @ts-ignore
import prettier from "prettier/esm/standalone";
// @ts-ignore
import htmlParser from "prettier/esm/parser-html";
// @ts-ignore
import jsParser from "prettier/esm/parser-babel";
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
  actions?: HTMLLIElement[];
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
    const toggleLink = document.createElement("a");

    const format = document.createElement("li");
    const formatLink = document.createElement("a");

    const runText = "run";
    const formatText = "format code";

    toggleLink.href = "#";
    toggleLink.innerText = runText;
    formatLink.href = "#";
    formatLink.innerText = formatText;

    toggle.appendChild(toggleLink);
    format.appendChild(formatLink);

    box.classList.add("viewport");

    box.appendChild(pre);

    let isCode = true;
    let isFormatted = false;

    toggleLink.addEventListener("click", (e) => {
      e.preventDefault();
      box.removeChild(isCode ? pre : iframe);
      box.appendChild(isCode ? iframe : pre);
      toggleLink.innerText = isCode ? "show code" : runText;
      isCode = !isCode;
    });

    formatLink.addEventListener("click", async (e) => {
      e.preventDefault();

      if (isFormatted) {
        pre.innerHTML = Prism.highlight(text, Prism.languages.html, "html");
      } else {
        const nice = prettier.format(text, {
          parser: "html",
          plugins: [htmlParser, jsParser],
        });

        pre.innerHTML = Prism.highlight(nice, Prism.languages.html, "html");
      }

      formatLink.innerText = isFormatted ? formatText : "show original";
      isFormatted = !isFormatted;
    });

    return { el: box, mime, url, ext, size, actions: [format, toggle] };
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
