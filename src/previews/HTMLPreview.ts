import Prism from "prismjs";
import type { Parser } from "prettier";
import { $loading } from "../dom.js";
import type { FileData } from "./types.js";

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

async function HTMLPreview({ url, blob, mime, ext, size }: FileData) {
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

export default HTMLPreview;
