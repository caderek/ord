async function fetchFromMempool(txId: string) {
  try {
    const res = await fetch(`https://mempool.space/api/tx/${txId}/hex`);

    if (!res.ok) {
      return null;
    }

    return res.text();
  } catch (e) {
    return null;
  }
}

async function fetchFromBlockchair(txId: string) {
  try {
    const res = await fetch(
      `https://api.blockchair.com/bitcoin/raw/transaction/${txId}`
    );

    if (!res.ok) {
      return null;
    }

    const tx = await res.json();
    return tx.data[txId]["raw_transaction"];
  } catch (e) {
    return null;
  }
}

const requests = [fetchFromMempool, fetchFromBlockchair];

async function fetchTXData(txId: string) {
  for (const fetchTx of requests) {
    const tx = await fetchTx(txId);

    if (tx !== null) {
      return tx;
    }
  }

  return null;
}

export default fetchTXData;
