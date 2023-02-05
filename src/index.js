import { createDownloadLink, createStandaloneLink } from "./createLinks.js";
import extractTxId from "./extractTxId.js";
import createOrdinalMedia from "./createOrdinalMedia.js";

const preWitness = 188;
const preMime = preWitness + 220;
const mimeSeparator = "004d0802";
const contentEndSeparator = "6821";

const $preview = document.getElementById("preview");
const $tx = document.getElementById("tx");
const $load = document.getElementById("load");
const $clear = document.getElementById("clear");
const $details = document.getElementById("details");
const $download = document.getElementById("download");
const $open = document.getElementById("open");
const $info = document.getElementById("info");
const $showInfo = document.getElementById("show-info");
const $hideInfo = document.getElementById("hide-info");
const $loading = document.getElementById("loading");

let $content = null;
let $downloadLink = null;
let $openLink = null;
let oldUrl = null;

async function load() {
  $details.innerText = "";

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

  const rawVal = $tx?.value?.trim();
  const val = extractTxId(rawVal) ?? rawVal;
  const type = val.length === 64 ? "txId" : "txHex";
  const { el, mime, url, ext, size } = await createOrdinalMedia({
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
    $openLink = createStandaloneLink(url, name, ext ?? "bin");
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
  if (e?.target?.id === "tx" && e.key === "Enter") {
    load();
    return;
  }
});
