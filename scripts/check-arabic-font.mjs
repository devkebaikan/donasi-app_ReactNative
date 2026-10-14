#!/usr/bin/env node
/**
 * Memverifikasi file font arab SEBELUM dipasang:
 *
 *   1. Nama internal font (family & PostScript). Nilai inilah yang harus
 *      dipakai di `fontFamily.arabic` — dan Android/iOS memakai nama berbeda,
 *      jebakan klasik yang bikin font "tidak muncul" tanpa error apa pun.
 *   2. Cakupan glif terhadap SELURUH karakter yang benar-benar dipakai teks
 *      mushaf di src/assets/quran/ayahs.
 *
 * Tanpa cek ini, kekurangan satu tanda baca baru ketahuan sebagai kotak
 * kosong di layar, di ayat yang mungkin jarang dibuka.
 *
 * Pemakaian: node scripts/check-arabic-font.mjs src/assets/fonts/<font>.ttf
 */
import {readFileSync, readdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fontArg = process.argv[2];

if (!fontArg) {
  console.error('Pemakaian: node scripts/check-arabic-font.mjs <file.ttf>');
  process.exit(1);
}

const buf = readFileSync(resolve(process.cwd(), fontArg));

function readTableDirectory() {
  const out = new Map();
  const numTables = buf.readUInt16BE(4);
  for (let i = 0; i < numTables; i += 1) {
    const record = 12 + i * 16;
    out.set(buf.toString('ascii', record, record + 4), {
      offset: buf.readUInt32BE(record + 8),
    });
  }
  return out;
}

const tables = readTableDirectory();

/** Nama internal dari tabel `name`. */
function readNames() {
  const table = tables.get('name');
  if (!table) {
    return {};
  }
  const base = table.offset;
  const count = buf.readUInt16BE(base + 2);
  const storage = base + buf.readUInt16BE(base + 4);
  const wanted = {1: 'family', 4: 'full', 6: 'postScript'};
  const out = {};

  for (let i = 0; i < count; i += 1) {
    const record = base + 6 + i * 12;
    const platformId = buf.readUInt16BE(record);
    const nameId = buf.readUInt16BE(record + 6);
    const length = buf.readUInt16BE(record + 8);
    const offset = buf.readUInt16BE(record + 10);
    const key = wanted[nameId];
    if (!key || out[key]) {
      continue;
    }
    const raw = buf.subarray(storage + offset, storage + offset + length);
    // Platform 3 (Windows) menyimpan UTF-16BE, platform 1 (Mac) 1 byte.
    out[key] =
      platformId === 3
        ? Buffer.from(raw).swap16().toString('utf16le').trim()
        : raw.toString('latin1').trim();
  }
  return out;
}

/** Semua codepoint yang punya glif, dari subtabel cmap format 4 dan 12. */
function readCoverage() {
  const covered = new Set();
  const table = tables.get('cmap');
  if (!table) {
    return covered;
  }
  const base = table.offset;
  const numSubtables = buf.readUInt16BE(base + 2);

  for (let i = 0; i < numSubtables; i += 1) {
    const subtable = base + buf.readUInt32BE(base + 4 + i * 8 + 4);
    const format = buf.readUInt16BE(subtable);

    if (format === 4) {
      const segCountX2 = buf.readUInt16BE(subtable + 6);
      const endCodes = subtable + 14;
      const startCodes = endCodes + segCountX2 + 2;
      for (let seg = 0; seg < segCountX2 / 2; seg += 1) {
        const end = buf.readUInt16BE(endCodes + seg * 2);
        const start = buf.readUInt16BE(startCodes + seg * 2);
        if (start === 0xffff) {
          continue;
        }
        for (let cp = start; cp <= end && cp !== 0xffff; cp += 1) {
          covered.add(cp);
        }
      }
    } else if (format === 12) {
      const groupCount = buf.readUInt32BE(subtable + 12);
      for (let group = 0; group < groupCount; group += 1) {
        const record = subtable + 16 + group * 12;
        const start = buf.readUInt32BE(record);
        const end = buf.readUInt32BE(record + 4);
        for (let cp = start; cp <= end; cp += 1) {
          covered.add(cp);
        }
      }
    }
  }
  return covered;
}

/** Karakter yang benar-benar dipakai teks mushaf, beserta frekuensinya. */
function readUsedCharacters() {
  const used = new Map();
  const ayahDir = resolve(ROOT, 'src/assets/quran/ayahs');
  for (const file of readdirSync(ayahDir)) {
    const {ayahs} = JSON.parse(readFileSync(resolve(ayahDir, file), 'utf8'));
    for (const ayah of ayahs) {
      for (const char of ayah.arabic) {
        if (char === ' ') {
          continue;
        }
        const cp = char.codePointAt(0);
        used.set(cp, (used.get(cp) ?? 0) + 1);
      }
    }
  }
  return used;
}

const names = readNames();
const covered = readCoverage();
const used = readUsedCharacters();
const missing = [...used.keys()]
  .filter(cp => !covered.has(cp))
  .sort((a, b) => a - b);

console.log('Nama internal font:');
console.log(`  family     : ${names.family ?? '-'}`);
console.log(`  full       : ${names.full ?? '-'}`);
console.log(`  postScript : ${names.postScript ?? '-'}`);
console.log('');
console.log('Nilai untuk fontFamily.arabic di src/theme/typography.ts:');
console.log('  Android -> nama file .ttf tanpa ekstensi');
console.log(`  iOS     -> "${names.postScript ?? '?'}"`);
console.log(
  '  Samakan nama file dengan PostScript name agar satu nilai cukup.',
);
console.log('');
console.log(
  `Cakupan glif: ${used.size - missing.length}/${used.size} karakter mushaf`,
);

if (missing.length === 0) {
  console.log('  Lengkap. Semua karakter yang dipakai teks ada di font ini.');
} else {
  console.log('  TIDAK LENGKAP. Karakter ini akan tampil sebagai kotak kosong:');
  for (const cp of missing) {
    const hex = cp.toString(16).toUpperCase().padStart(4, '0');
    console.log(`    U+${hex}  dipakai ${used.get(cp)}x`);
  }
  process.exitCode = 1;
}
