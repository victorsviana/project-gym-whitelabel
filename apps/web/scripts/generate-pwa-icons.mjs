// Gera os ícones genéricos do produto (fallback antes de uma academia carregar o próprio tema/logo —
// ver docs/WHITELABEL.md#pwa-por-academia). Sem lib de imagem: PNG cru via zlib, dumbbell vetorial por pixel.
// Reexecute com `node apps/web/scripts/generate-pwa-icons.mjs` se o design mudar.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/icons');

// Placeholder de marca de apps/web/src/styles/tokens.css — genérico até uma academia aplicar o próprio tema.
const BACKGROUND = [0xe4, 0x02, 0x2e];
const FOREGROUND = [0xff, 0xff, 0xff];

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

function encodePng(width, height, getPixel) {
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 4);
    raw[rowStart] = 0; // sem filtro
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const px = rowStart + 1 + x * 4;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
      raw[px + 3] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function roundedRectContains(x, y, rx, ry, rw, rh, radius) {
  const cx = Math.min(Math.max(x, rx + radius), rx + rw - radius);
  const cy = Math.min(Math.max(y, ry + radius), ry + rh - radius);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= radius * radius;
}

/** Ícone: barra + dois anilhas (dumbbell), dentro de uma zona segura configurável (maskable pede mais margem). */
function drawDumbbell(size, safeZoneFrac) {
  const span = size * safeZoneFrac * 0.78;
  const barH = size * 0.08;
  const plateW = size * 0.15;
  const plateH = size * safeZoneFrac * 0.46;
  const cx = size / 2;
  const cy = size / 2;

  const plateLeft = { x: cx - span / 2, y: cy - plateH / 2, w: plateW, h: plateH, r: plateW * 0.35 };
  const plateRight = { x: cx + span / 2 - plateW, y: cy - plateH / 2, w: plateW, h: plateH, r: plateW * 0.35 };
  const barX = plateLeft.x + plateW * 0.4;
  const bar = { x: barX, y: cy - barH / 2, w: plateRight.x + plateW * 0.6 - barX, h: barH, r: barH / 2 };

  return (x, y) => {
    const inShape =
      roundedRectContains(x, y, bar.x, bar.y, bar.w, bar.h, bar.r) ||
      roundedRectContains(x, y, plateLeft.x, plateLeft.y, plateLeft.w, plateLeft.h, plateLeft.r) ||
      roundedRectContains(x, y, plateRight.x, plateRight.y, plateRight.w, plateRight.h, plateRight.r);
    return inShape ? FOREGROUND : BACKGROUND;
  };
}

function buildIcon(size, safeZoneFrac) {
  const shape = drawDumbbell(size, safeZoneFrac);
  return encodePng(size, size, (x, y) => {
    const [r, g, b] = shape(x + 0.5, y + 0.5);
    return [r, g, b, 255];
  });
}

mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  { file: 'icon-192.png', size: 192, safeZoneFrac: 1 },
  { file: 'icon-512.png', size: 512, safeZoneFrac: 1 },
  { file: 'icon-512-maskable.png', size: 512, safeZoneFrac: 0.72 },
  { file: 'apple-touch-icon.png', size: 180, safeZoneFrac: 0.82 },
  { file: 'favicon-32.png', size: 32, safeZoneFrac: 1 },
];

for (const target of targets) {
  writeFileSync(path.join(OUT_DIR, target.file), buildIcon(target.size, target.safeZoneFrac));
  console.log(`gerado ${target.file}`);
}
