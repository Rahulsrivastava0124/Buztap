const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const crcTable = new Uint32Array(256);

for (let index = 0; index < 256; index += 1) {
  let value = index;

  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) === 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }

  crcTable[index] = value >>> 0;
}

function crc32(buffer) {
  let value = 0xffffffff;

  for (const byte of buffer) {
    value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  }

  return (value ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const chunkType = Buffer.from(type, "ascii");
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([chunkType, data])), 0);

  return Buffer.concat([length, chunkType, data, checksum]);
}

function createSolidPng(width, height, rgba) {
  const signature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  const stride = width * 4 + 1;
  const bitmap = Buffer.alloc(stride * height);

  for (let row = 0; row < height; row += 1) {
    const rowOffset = row * stride;
    bitmap[rowOffset] = 0;

    for (let column = 0; column < width; column += 1) {
      const pixelOffset = rowOffset + 1 + column * 4;
      bitmap[pixelOffset] = rgba[0];
      bitmap[pixelOffset + 1] = rgba[1];
      bitmap[pixelOffset + 2] = rgba[2];
      bitmap[pixelOffset + 3] = rgba[3];
    }
  }

  const compressed = zlib.deflateSync(bitmap);

  return Buffer.concat([
    signature,
    createChunk("IHDR", header),
    createChunk("IDAT", compressed),
    createChunk("IEND", Buffer.alloc(0)),
  ]);
}

const assets = [
  { name: "icon.png", width: 1024, height: 1024, rgba: [22, 163, 74, 255] },
  {
    name: "adaptive-icon.png",
    width: 1024,
    height: 1024,
    rgba: [22, 163, 74, 255],
  },
  { name: "splash.png", width: 1242, height: 2436, rgba: [255, 255, 255, 255] },
  { name: "favicon.png", width: 48, height: 48, rgba: [22, 163, 74, 255] },
];

for (const asset of assets) {
  const outputPath = path.join(__dirname, asset.name);
  fs.writeFileSync(
    outputPath,
    createSolidPng(asset.width, asset.height, asset.rgba),
  );
}
