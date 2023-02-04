import fs from "fs";

const txId = process.argv[2];

{
  const res = await fetch(`https://ordinals.com/content/${txId}i0`);
  const data = await res.arrayBuffer();
  const hex = Buffer.from(data).toString("hex");

  fs.writeFileSync("data/content.txt", hex);
}

{
  const res = await fetch(`https://mempool.space/api/tx/${txId}/hex`);
  const data = await res.text();

  fs.writeFileSync("data/full.txt", data);
}
