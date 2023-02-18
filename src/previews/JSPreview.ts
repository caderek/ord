import Prism from "prismjs";
import type { Parser } from "prettier";
import { $loading } from "../dom.js";
import type { FileData } from "./types.js";

async function formatCode(code: string) {
  // @ts-ignore
  const prettier = (await import("prettier/esm/standalone")).default;
  // @ts-ignore
  const jsParser = (await import("prettier/esm/parser-babel"))
    .default as Parser;

  try {
    return prettier.format(code, {
      parser: "babel",
      plugins: [jsParser],
    }) as string;
  } catch (e) {
    return code;
  }
}

async function JSPreview({ url, blob, mime, ext, size }: FileData) {
  const iframe = document.createElement("iframe");
  iframe.src = url;

  const text = await blob.text();

  const box = document.createElement("div");
  const pre = document.createElement("pre");

  pre.innerHTML = Prism.highlight(
    text,
    Prism.languages.javascript,
    "javascript",
  );

  const format = document.createElement("li");
  const formatLink = document.createElement("a");

  const formatText = "format";

  formatLink.href = "#";
  formatLink.innerText = formatText;

  format.appendChild(formatLink);

  box.classList.add("viewport");

  box.appendChild(pre);

  let isFormatted = false;

  let nice: string | null = null;

  formatLink.addEventListener("click", async (e) => {
    e.preventDefault();
    $loading.classList.toggle("hidden");

    if (isFormatted) {
      pre.innerHTML = Prism.highlight(
        text,
        Prism.languages.javascript,
        "javascript",
      );
    } else if (nice !== null) {
      pre.innerHTML = Prism.highlight(
        nice,
        Prism.languages.javascript,
        "javascript",
      );
    } else {
      nice = await formatCode(text);
      pre.innerHTML = Prism.highlight(
        nice,
        Prism.languages.javascript,
        "javascript",
      );
    }

    formatLink.innerText = isFormatted ? formatText : "raw";
    isFormatted = !isFormatted;
    $loading.classList.toggle("hidden");
  });

  return { el: box, mime, url, ext, size, actions: [format] };
}

export default JSPreview;
