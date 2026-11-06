// Генератор placeholder OG-картинки 1200x630 (solid color) → app/opengraph-image.png
// Запуск: node scripts/gen-og-image.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const WIDTH = 1200;
const HEIGHT = 630;
// Warm forest dark (из design system «Утренний свет» — приближённый бренд-фон)
const R = 0x1c;
const G = 0x2a;
const B = 0x22;

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return (~c) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(WIDTH, 0);
ihdr.writeUInt32BE(HEIGHT, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // color type RGB
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter
ihdr[12] = 0; // interlace

// Raw scanlines: filter byte 0 + WIDTH RGB pixels per row
const rowLen = 1 + WIDTH * 3;
const raw = Buffer.alloc(rowLen * HEIGHT);
for (let y = 0; y < HEIGHT; y++) {
  const offset = y * rowLen;
  raw[offset] = 0; // filter none
  for (let x = 1; x < rowLen; x += 3) {
    raw[offset + x] = R;
    raw[offset + x + 1] = G;
    raw[offset + x + 2] = B;
  }
}
const idat = deflateSync(raw);

const png = Buffer.concat([
  sig,
  chunk("IHDR", ihdr),
  chunk("IDAT", idat),
  chunk("IEND", Buffer.alloc(0)),
]);

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, "..", "app", "opengraph-image.png");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, png);
console.log("Wrote", outPath, `(${png.length} bytes)`);
