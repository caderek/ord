import createMedia, { Media } from "./createMedia.js";
import readOrdinal from "./readOrdinal.js";
import fetchTXData from "./fetchTXData.js";

type TxInput = {
  txId?: string;
  txHex?: string;
};

async function prepareOrdinal({ txId, txHex }: TxInput) {
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

  return createMedia(ord.data, ord.mime, ord.ext);
}

export default prepareOrdinal;
