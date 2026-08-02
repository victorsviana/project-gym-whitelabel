// Desempacota o bundle de artifact `Academia Whitelabel - Demo.html` em fontes legíveis.
//
// O arquivo .html é um bundle: o app real está gzipado + base64 dentro de um
// <script type="__bundler/manifest"> e o markup está em <script type="__bundler/template">.
// Este script regenera a pasta extracted/ a partir do bundle original.
//
// Uso:  node prototype/unpack.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'extracted');
mkdirSync(out, { recursive: true });

const html = readFileSync(join(here, 'Academia Whitelabel - Demo.html'), 'utf8');
const lines = html.split('\n');

/** Lê o conteúdo do <script type="__bundler/<name>"> como texto bruto. */
function sectionAfter(marker) {
  // A tag precisa ser casada inteira: o loader do bundler menciona esses mesmos
  // nomes dentro de strings JS mais acima no arquivo.
  const tag = `<script type="__bundler/${marker}">`;
  const i = lines.findIndex((l) => l.trim() === tag);
  if (i === -1) throw new Error(`seção não encontrada: ${marker}`);
  return lines[i + 1];
}

const manifest = JSON.parse(sectionAfter('manifest'));
const template = JSON.parse(sectionAfter('template'));

// --- markup + lógica -------------------------------------------------------
const scriptStart = template.indexOf('<script type="text/x-dc"');
const scriptOpenEnd = template.indexOf('>', template.indexOf('data-props=')) + 1;
const scriptEnd = template.lastIndexOf('</script>');

writeFileSync(
  join(out, 'template.html'),
  template.slice(0, scriptStart).trimEnd() + '\n',
  'utf8',
);
writeFileSync(
  join(out, 'logic.js'),
  template.slice(scriptOpenEnd, scriptEnd).trim() + '\n',
  'utf8',
);

// --- scaffold da moldura de iPhone (apenas preview, não faz parte do app) ---
for (const [id, asset] of Object.entries(manifest)) {
  if (asset.mime !== 'text/jsx') continue;
  let buf = Buffer.from(asset.data, 'base64');
  if (asset.compressed) buf = gunzipSync(buf);
  writeFileSync(join(out, 'ios-frame.jsx'), buf);
  console.log(`ios-frame.jsx  <- ${id}  (${buf.length} bytes)`);
}

console.log('template.html  markup do app');
console.log('logic.js       classe Component (estado + regras + handlers)');
