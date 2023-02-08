import "./main.css";
import "./prism.css";

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
const $links = document.getElementById("links") as HTMLUListElement;

let $content = document.getElementById("monkey");
let $downloadLink: null | HTMLAnchorElement = null;
let $actions: null | HTMLLIElement[] = null;
let $openLink: null | HTMLAnchorElement = null;
let oldUrl: null | string = null;

const load = (getValue: () => string) => async () => {
  $details!.innerText = "";

  if ($content) {
    $preview.removeChild($content);
    $content = null;
  }

  if ($downloadLink) {
    $download.removeChild($downloadLink);
    $downloadLink = null;
  }

  if ($openLink) {
    $open.removeChild($openLink);
    $openLink = null;
  }

  if ($actions) {
    $actions.forEach((action) => $links.removeChild(action));
    $actions = null;
  }

  if (oldUrl) {
    URL.revokeObjectURL(oldUrl);
    oldUrl = null;
  }

  $loading?.classList.remove("hidden");

  const rawVal = getValue();
  const val = extractTxId(rawVal) ?? rawVal;
  const type = val.length === 64 ? "txId" : "txHex";
  const { el, mime, url, ext, size, actions } = await prepareOrdinal({
    [type]: val,
  });

  $loading?.classList.add("hidden");

  if (el) {
    $content = el;
    $preview.appendChild($content);
  }

  if (actions) {
    actions.forEach((action) => $links.appendChild(action));
    $actions = actions;
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
  }
};

const loadFromForm = load(() => $tx!.value?.trim());
const loadFromHash = load(() => location.hash.slice(1));

/* Fetch txId from url hash */

if (location.hash.length >= 65) {
  loadFromHash();
}

/* Register handlers */

$load.addEventListener("click", loadFromForm);

$clear.addEventListener("click", () => {
  $tx.value = "";
});

$showInfo.addEventListener("click", (e) => {
  e.preventDefault();

  $info.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

$hideInfo.addEventListener("click", (e) => {
  e.preventDefault();

  $info.classList.add("hidden");
});

document.addEventListener("keypress", (e) => {
  // @ts-ignore
  if (e.target && e.target.id === "tx" && e.key === "Enter") {
    loadFromForm();
    return;
  }
});
