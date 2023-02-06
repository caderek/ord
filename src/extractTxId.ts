function extractTxId(str: string) {
  const txRegex = /^[0-9a-f]{64}/;

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

export default extractTxId;
