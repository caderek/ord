import prettyBytes from "pretty-bytes";
import Prism from "prismjs";
import type { Parser } from "prettier";
import { $loading } from "./dom.js";

Prism.manual = true;

function formatMime(mimeStr: string) {
  return mimeStr.split(";")[0].split("/").join(" | ").toUpperCase();
}

async function formatCode(code: string) {
  // @ts-ignore
  const prettier = (await import("prettier/esm/standalone")).default;
  // @ts-ignore
  const htmlParser = (await import("prettier/esm/parser-html"))
    .default as Parser;
  // @ts-ignore
  const jsParser = (await import("prettier/esm/parser-babel"))
    .default as Parser;
  // @ts-ignore
  const cssParser = (await import("prettier/esm/parser-postcss"))
    .default as Parser;

  try {
    return prettier.format(code, {
      parser: "html",
      plugins: [htmlParser, jsParser, cssParser],
    }) as string;
  } catch (e) {
    return code;
  }
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
  ext: string,
): Promise<Media> {
  const mime = formatMime(mimeString);
  const url = URL.createObjectURL(blob);
  const size = prettyBytes(blob.size);

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
    const formatText = "format";

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
      $loading.classList.toggle("hidden");
      box.removeChild(isCode ? pre : iframe);
      box.appendChild(isCode ? iframe : pre);
      toggleLink.innerText = isCode ? "code" : runText;
      isCode = !isCode;
      $loading.classList.toggle("hidden");
    });

    let nice: string | null = null;

    formatLink.addEventListener("click", async (e) => {
      e.preventDefault();
      $loading.classList.toggle("hidden");

      if (isFormatted) {
        pre.innerHTML = Prism.highlight(text, Prism.languages.html, "html");
      } else if (nice !== null) {
        pre.innerHTML = Prism.highlight(nice, Prism.languages.html, "html");
      } else {
        nice = await formatCode(text);
        pre.innerHTML = Prism.highlight(nice, Prism.languages.html, "html");
      }

      formatLink.innerText = isFormatted ? formatText : "raw";
      isFormatted = !isFormatted;
      $loading.classList.toggle("hidden");
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
