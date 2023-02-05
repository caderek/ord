import mime from "mime";
import createMedia from "./createMedia.js";
import readOrdinal from "./readOrdinal.js";
import fetchTXData from "./fetchTXData.js";

async function createOrdinalMedia({ txId, txHex }) {
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

export default createOrdinalMedia;
