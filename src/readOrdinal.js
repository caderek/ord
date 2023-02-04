const ORDINAL_SIGNATURE = "63036f72640101"; // OP_IF + len + "ord" + 0101

const OP_FALSE = 0x00;
const OP_PUSHDATA1 = 0x4c;
const OP_PUSHDATA2 = 0x4d;
const OP_PUSHDATA4 = 0x4e;
const OP_ENDIF = 0x68;

function toBytes(hex) {
  const bytes = new Array(hex.length / 2);

  for (let i = 0, j = 0; i < hex.length; i += 2, j++) {
    bytes[j] = parseInt(`${hex[i]}${hex[i + 1]}`, 16);
  }

  return bytes;
}

function numLittleEndian(bytes) {
  return bytes.reduce((sum, x, i) => sum + x * 256 ** i);
}

function readOrdinal(txHex) {
  const startIndex = txHex.indexOf(ORDINAL_SIGNATURE);

  if (startIndex === -1) {
    return null;
  }

  const data = toBytes(txHex.slice(startIndex + ORDINAL_SIGNATURE.length));

  let pointer = 0;
  let reg = 0;

  const registers = [[], []];

  const readData = (len) => {
    const chunk = data.slice(pointer, pointer + len);
    registers[reg].push(chunk);
    pointer += len;
  };

  while (pointer < data.length) {
    const OPCODE = data[pointer];

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
        const len = data[pointer];
        pointer++;
        readData(len);
        break;
      }

      case OP_PUSHDATA2: {
        pointer++;
        const len = numLittleEndian(data.slice(pointer, pointer + 2));
        pointer += 2;
        readData(len);
        break;
      }

      case OP_PUSHDATA4: {
        pointer++;
        const len = numLittleEndian(data.slice(pointer, pointer + 4));
        pointer += 4;
        readData(len);
        break;
      }

      default: {
        const len = data[pointer];
        pointer++;
        readData(len);
        break;
      }
    }
  }

  const rawData = Uint8Array.from(registers[1].flat());
  const mime = registers[0]
    .flat()
    .map((v) => String.fromCharCode(v))
    .join("");

  return {
    mime,
    data: new Blob([rawData], { type: mime }),
  };
}

export default readOrdinal;
