import mime from "mime";
import createMedia from "./createMedia.js";
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

  const ext =
    mime.getExtension(ord.mime) ??
    (ord.mime.split("/").at(-1)?.split(";").at(0) || "bin");

  console.log();

  return createMedia(ord.data, ord.mime, ext);
}

export default prepareOrdinal;
