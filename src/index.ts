import "./main.css";

import { createDownloadLink, createStandaloneLink } from "./createLinks.js";
import extractTxId from "./extractTxId.js";
import prepareOrdinal from "./prepareOrdinal.js";

const $preview = document.getElementById("preview") as HTMLDivElement;
const $tx = document.getElementById("tx") as HTMLTextAreaElement;
const $load = document.getElementById("load") as HTMLButtonElement;
const $clear = document.getElementById("clear") as HTMLButtonElement;
const $details = document.getElementById("details") as HTMLParagraphElement;
const $download = document.getElementById("download") as HTMLAnchorElement;
const $open = document.getElementById("open") as HTMLAnchorElement;
const $info = document.getElementById("info") as HTMLDivElement;
const $showInfo = document.getElementById("show-info") as HTMLAnchorElement;
const $hideInfo = document.getElementById("hide-info") as HTMLAnchorElement;
const $loading = document.getElementById("loading") as HTMLDivElement;

let $content = document.getElementById("monkey");
let $downloadLink: null | HTMLAnchorElement = null;
let $openLink: null | HTMLAnchorElement = null;
let oldUrl: null | string = null;

if (location.hash) {
  console.log(location.hash);
}

async function load() {
  $details!.innerText = "";

  if ($content) {
    $preview?.removeChild($content);
  }

  if ($downloadLink) {
    $download?.removeChild($downloadLink);
  }

  if ($openLink) {
    $open?.removeChild($openLink);
  }

  if (oldUrl) {
    URL.revokeObjectURL(oldUrl);
  }

  $loading?.classList.remove("hidden");

  const rawVal = $tx!.value?.trim();
  const val = extractTxId(rawVal) ?? rawVal;
  const type = val.length === 64 ? "txId" : "txHex";
  const { el, mime, url, ext, size } = await prepareOrdinal({
    [type]: val,
  });

  $loading?.classList.add("hidden");

  if (el) {
    $content = el;
    $preview?.appendChild($content);
  }

  if (mime) {
    $details.innerText = [mime, size].join(" | ");
  }

  if (url) {
    const name =
      type === "txId"
        ? val
        : new Date().toISOString().replace(/[TZ\-\:\.]/gi, "");

    $downloadLink = createDownloadLink(url, name, ext ?? "bin");
    $openLink = createStandaloneLink(url);
    oldUrl = url;
    $download.appendChild($downloadLink);
    $open.appendChild($openLink);
  } else {
    oldUrl = null;
    $downloadLink = null;
    $openLink = null;
  }
}

/* Register handlers */

$load?.addEventListener("click", load);

$clear?.addEventListener("click", () => {
  $tx.value = "";
});

$showInfo?.addEventListener("click", (e) => {
  e.preventDefault();

  $info?.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

$hideInfo?.addEventListener("click", (e) => {
  e.preventDefault();

  $info?.classList.add("hidden");
});

document.addEventListener("keypress", (e) => {
  // @ts-ignore
  if (e.target && e.target.id === "tx" && e.key === "Enter") {
    load();
    return;
  }
});
