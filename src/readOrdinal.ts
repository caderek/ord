import mimeLib from "mime";

// OP_IF + len + "ord" + 0101
const ORDINAL_SIGNATURE = new Uint8Array([
  0x63, 0x03, 0x6f, 0x72, 0x64, 0x01, 0x01,
]);
// hex 63 03 6f 72 64 01 01

const OP_FALSE = 0x00;
const OP_PUSHDATA1 = 0x4c;
const OP_PUSHDATA2 = 0x4d;
const OP_PUSHDATA4 = 0x4e;
const OP_ENDIF = 0x68;

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);

  for (let i = 0, j = 0; i < hex.length; i += 2, j++) {
    bytes[j] = parseInt(`${hex[i]}${hex[i + 1]}`, 16);
  }

  return bytes;
}

function numLittleEndian(bytes: Uint8Array) {
  return bytes.reduce((sum, x, i) => sum + x * 256 ** i);
}

function findStartIndex(bytes: Uint8Array, signature: Uint8Array) {
  let temp = [];
  let pointer = 0;

  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === signature[pointer]) {
      temp.push(bytes[i]);
      pointer++;
    } else {
      pointer = 0;
      temp = [];
    }

    if (temp.length === signature.length) {
      return i + 1;
    }
  }

  return -1;
}

function readOrdinal(rawTX: ArrayBuffer | string) {
  const bytes =
    rawTX instanceof ArrayBuffer ? new Uint8Array(rawTX) : hexToBytes(rawTX);

  const startIndex = findStartIndex(bytes, ORDINAL_SIGNATURE);

  if (startIndex === -1) {
    return null;
  }

  let pointer = startIndex;
  let reg = 0;

  const registers: [number, number][][] = [[], []];

  while (pointer < bytes.length) {
    const OPCODE = bytes[pointer];

    switch (OPCODE) {
      case OP_FALSE: {
        reg = 1;
        pointer++;
        break;
      }

      case OP_ENDIF: {
        pointer = Infinity;
        break;
      }

      case OP_PUSHDATA1: {
        pointer++;
        const len = bytes[pointer];
        pointer++;
        registers[reg].push([pointer, len]);
        pointer += len;
        break;
      }

      case OP_PUSHDATA2: {
        pointer++;
        const len = numLittleEndian(bytes.slice(pointer, pointer + 2));
        pointer += 2;
        registers[reg].push([pointer, len]);
        pointer += len;
        break;
      }

      case OP_PUSHDATA4: {
        pointer++;
        const len = numLittleEndian(bytes.slice(pointer, pointer + 4));
        pointer += 4;
        registers[reg].push([pointer, len]);
        pointer += len;
        break;
      }

      default: {
        const len = bytes[pointer];
        pointer++;
        registers[reg].push([pointer, len]);
        pointer += len;
        break;
      }
    }
  }

  const [mimeBuff, dataBuff] = registers.map((register) => {
    const buffSize = register.reduce((total, [_, size]) => total + size, 0);
    const buff = new Uint8Array(buffSize);

    let pointer = 0;

    for (const [from, size] of register) {
      buff.set(bytes.slice(from, from + size), pointer);
      pointer += size;
    }

    return buff;
  });

  const mime = new TextDecoder().decode(mimeBuff);
  const ext =
    mimeLib.getExtension(mime) ??
    (mime.split("/").at(-1)?.split(";").at(0) || "bin");

  const data = new Blob([dataBuff], { type: mime });

  return { data, mime, ext };
}

export default readOrdinal;
