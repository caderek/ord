import mime from "mime";
import prettyBytes from "pretty-bytes";
import readOrdinal from "./readOrdinal.js";

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

function hexToTypedArr(hexString) {
  const arr = new Uint8Array(hexString.length / 2);

  for (let i = 0, j = 0; i < hexString.length; i += 2, j++) {
    arr[j] = parseInt(hexString[i] + (hexString[i + 1] ?? ""), 16);
  }

  return arr;
}

function hexToText(hexString) {
  let text = "";
  for (let i = 0; i < hexString.length; i += 2) {
    const charCode = parseInt(hexString[i] + (hexString[i + 1] ?? ""), 16);
    text += String.fromCharCode(charCode);
  }

  return text;
}

function formatMime(mimeStr) {
  if (typeof mimeStr !== "string") {
    return null;
  }

  return mimeStr.split(";")[0].split("/").join(" | ").toUpperCase();
}

async function createMedia(blob, mimeString, ext) {
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

async function fetchTXData(txId) {
  const res = await fetch(`https://mempool.space/api/tx/${txId}/hex`);

  return res.text();
}

async function getOrdinal({ txId, txHex }) {
  const tx = txId ? await fetchTXData(txId) : txHex;

  if (tx === null) {
    const p = document.createElement("p");
    p.innerText = "Request failed.";
    return { el: p, mime: null, url: null, ext: null, size: null };
  }

  const ord = readOrdinal(tx);

  if (ord === null) {
    const p = document.createElement("p");
    p.innerText = "No data.";
    return { el: p, mime: null, url: null, ext: null, size: null };
  }

  const ext = mime.getExtension(ord.mime);

  console.log();

  return createMedia(ord.data, ord.mime, ext);
}

function createDownloadLink(url, name, ext) {
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}.${ext}`;
  link.target = "_blank";
  link.innerText = "download";
  return link;
}

function createStandaloneLink(url, name, ext) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.innerText = "open";
  return link;
}

function extractTxId(str) {
  const txRegex = /^[0-9a-f]{64}/;

  if (str.length)
    try {
      const url = new URL(str);

      if (url.host === "") {
        throw new Error();
      }

      const txId = url.pathname
        .split("/")
        .filter((chunk) => txRegex.test(chunk))[0];

      return txId ? txId.slice(0, 64) : null;
    } catch (e) {
      if (!/^[0-9a-f]+$/.test(str) && txRegex.test(str)) {
        return str.slice(0, 64);
      }

      return null;
    }
}

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
  const { el, mime, url, ext, size } = await getOrdinal({ [type]: val });

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
