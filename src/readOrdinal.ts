import mimeLib from "mime";

const ORDINAL_SIGNATURE = "63036f72640101"; // OP_IF + len + "ord" + 0101

const OP_FALSE = 0x00;
const OP_PUSHDATA1 = 0x4c;
const OP_PUSHDATA2 = 0x4d;
const OP_PUSHDATA4 = 0x4e;
const OP_ENDIF = 0x68;

function toBytes(hex: string): number[] {
  const bytes = new Array(hex.length / 2);

  for (let i = 0, j = 0; i < hex.length; i += 2, j++) {
    bytes[j] = parseInt(`${hex[i]}${hex[i + 1]}`, 16);
  }

  return bytes;
}

function numLittleEndian(bytes: number[]) {
  return bytes.reduce((sum, x, i) => sum + x * 256 ** i);
}

function readOrdinal(txHex: string) {
  const startIndex = txHex.indexOf(ORDINAL_SIGNATURE);

  if (startIndex === -1) {
    return null;
  }

  const bytes = toBytes(txHex.slice(startIndex + ORDINAL_SIGNATURE.length));

  let pointer = 0;
  let reg: 0 | 1 = 0;

  const registers: [number[][], number[][]] = [[], []];

  const readData = (len: number) => {
    const chunk = bytes.slice(pointer, pointer + len);
    registers[reg].push(chunk);
    pointer += len;
  };

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
        readData(len);
        break;
      }

      case OP_PUSHDATA2: {
        pointer++;
        const len = numLittleEndian(bytes.slice(pointer, pointer + 2));
        pointer += 2;
        readData(len);
        break;
      }

      case OP_PUSHDATA4: {
        pointer++;
        const len = numLittleEndian(bytes.slice(pointer, pointer + 4));
        pointer += 4;
        readData(len);
        break;
      }

      default: {
        const len = bytes[pointer];
        pointer++;
        readData(len);
        break;
      }
    }
  }

  const mime = registers[0]
    .flat()
    .map((v) => String.fromCharCode(v))
    .join("");

  const ext =
    mimeLib.getExtension(mime) ??
    (mime.split("/").at(-1)?.split(";").at(0) || "bin");

  const rawData = Uint8Array.from(registers[1].flat());
  const data = new Blob([rawData], { type: mime });

  return { mime, data, ext };
}

export default readOrdinal;
