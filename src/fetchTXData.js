async function fetchTXData(txId) {
  const res = await fetch(`https://mempool.space/api/tx/${txId}/hex`);

  return res.text();
}

export default fetchTXData;
