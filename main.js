import mime from "https://cdn.skypack.dev/mime";

const preWitness = 188;
const preMime = preWitness + 220;
const mimeSeparator = "004d0802";
const contentEndSeparator = "6821";

const $preview = document.getElementById("preview");
const $tx = document.getElementById("tx");
const $load = document.getElementById("load");
const $clear = document.getElementById("clear");
const $mime = document.getElementById("mime");
const $download = document.getElementById("download");
const $open = document.getElementById("open");
const $info = document.getElementById("info");
const $showInfo = document.getElementById("show-info");
const $hideInfo = document.getElementById("hide-info");

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

  if (mimeString.includes("image")) {
    const img = new Image();
    img.src = url;
    return { el: img, mime, url, ext };
  }

  if (mimeString.includes("text") || mimeString.includes("json")) {
    const text = await blob.text();
    const pre = document.createElement("pre");
    pre.innerText = text;
    return { el: pre, mime, url, ext };
  }

  if (mimeString.includes("audio")) {
    const audio = new Audio(url);
    audio.controls = true;
    return { el: audio, mime, url, ext };
  }

  if (mimeString.includes("video")) {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    return { el: video, mime, url, ext };
  }

  const p = document.createElement("p");
  p.innerText = "Format not supported";
  return { el: p, mime, url, ext };
}

async function fetchTXData(txId) {
  const res = await fetch(`https://mempool.space/api/tx/${txId}/hex`);

  return res.text();
}

async function getOrdinal({ txId, txHex }) {
  console.log({ txHex, txId });

  const tx = txId ? await fetchTXData(txId) : txHex;

  if (tx === null) {
    const p = document.createElement("p");
    p.innerText = "Request failed.";
    return { el: p, mime: null, url: null, ext: null };
  }

  const withoutHeader = tx.slice(preMime);

  const mimeEnd = withoutHeader.indexOf(mimeSeparator);
  const contentStart = mimeEnd + mimeSeparator.length;
  const contentEnd = withoutHeader.lastIndexOf(contentEndSeparator);

  const mimeArea = withoutHeader.slice(0, mimeEnd);

  const mimeStr = hexToText(mimeArea)
    .replace(/./g, (char) => (char.charCodeAt(0) < 32 ? "" : char)) // remove control chars`
    .replace(/\s+/g, ""); // remove whitespace

  const ext = mime.getExtension(mimeStr);

  if (ext === null) {
    const p = document.createElement("p");
    p.innerText = "No data.";
    return { el: p, mime: null, url: null, ext: null };
  }

  const contentArea = withoutHeader
    .slice(contentStart, contentEnd)
    .replaceAll("4d0802", "");

  const content = new Blob([hexToTypedArr(contentArea)], { type: mimeStr });

  return createMedia(content, mimeStr, ext);
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
  const txRegex = /^[0-9a-f]{64}[0-9a-z]{2}$/;

  try {
    const url = new URL(str);

    const txId = url.pathname
      .split("/")
      .filter((chunk) => txRegex.test(chunk))[0];

    return txId ? txId.slice(0, 64) : null;
  } catch (e) {
    return null;
  }
}

let $content = null;
let $downloadLink = null;
let $openLink = null;
let oldUrl = null;

async function load() {
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

  const rawVal = $tx?.value?.trim();
  const val = extractTxId(rawVal) ?? rawVal;
  const type = val.length === 64 ? "txId" : "txHex";
  const { el, mime, url, ext } = await getOrdinal({ [type]: val });

  if (el) {
    $content = el;
    $preview?.appendChild($content);
  }

  $mime.innerText = mime ?? "";

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
