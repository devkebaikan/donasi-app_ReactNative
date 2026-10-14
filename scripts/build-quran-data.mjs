#!/usr/bin/env node
/**
 * Membangun dataset mushaf yang dipakai QuranReaderScreen:
 *
 *   src/assets/quran/ayahs/001.json .. 114.json
 *   src/assets/quran/tafsir/001.json .. 114.json
 *   src/assets/quran/ayahMap.ts        (peta 114 require statis)
 *
 * Metro tidak mendukung require() dengan path dinamis, jadi peta require
 * harus digenerate — lihat docs/05-architecture/adr/ADR-003-quran-offline-data.md.
 *
 * Pemakaian:
 *   node scripts/build-quran-data.mjs                  -> isi placeholder
 *   node scripts/build-quran-data.mjs <source.json>    -> impor data asli
 *
 * Bentuk <source.json> yang diharapkan:
 *   [{ "number": 1,
 *      "ayahs": [{ "number": 1, "arabic": "..", "latin": "..",
 *                  "translation": "..", "tafsir": ".." }] }]
 *
 * Script menolak menulis kalau jumlah ayat tiap surah tidak cocok dengan
 * surahs.json atau totalnya bukan 6236.
 */
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const QURAN_DIR = resolve(ROOT, 'src/assets/quran');
const TOTAL_AYAH = 6236;

// Placeholder sengaja berharakat lengkap — fatha, damma, kasra, sukun,
// syaddah, dan tanwin — supaya rendering vertikal teks arab benar-benar
// teruji sebelum data mushaf asli masuk. Aturan lineHeight = 2x fontSize di
// ADR-005 ada justru karena harakat atas terpotong baris di atasnya; dengan
// placeholder polos, aturan itu tidak pernah terbukti.
// Isinya kalimat "teks ayat tidak tersedia", jelas bukan potongan mushaf.
const PLACEHOLDER = {
  arabic: 'نَصُّ الْآيَةِ غَيْرُ مُتَوَفِّرٍ',
  latin: 'Teks lafal belum tersedia',
  translation: 'Terjemahan belum tersedia',
  tafsir: 'Tafsir belum tersedia untuk ayat ini.',
};

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function pad(surahNumber) {
  return String(surahNumber).padStart(3, '0');
}

const surahs = readJson(resolve(QURAN_DIR, 'surahs.json'));
const juzRanges = readJson(resolve(QURAN_DIR, 'juz.json'));

// Indeks ayat global 1..6236, dipakai untuk menentukan ayat masuk juz berapa.
const globalOffset = new Map();
let running = 0;
for (const surah of surahs) {
  globalOffset.set(surah.number, running);
  running += surah.totalAyah;
}
if (running !== TOTAL_AYAH) {
  throw new Error(`surahs.json berjumlah ${running} ayat, seharusnya ${TOTAL_AYAH}`);
}

const toGlobal = (surahNumber, ayahNumber) =>
  globalOffset.get(surahNumber) + ayahNumber;

const juzBounds = juzRanges.map(juz => ({
  juzNumber: juz.juzNumber,
  start: toGlobal(juz.startSurah, juz.startAyah),
  end: toGlobal(juz.endSurah, juz.endAyah),
}));

function juzOf(surahNumber, ayahNumber) {
  const index = toGlobal(surahNumber, ayahNumber);
  const found = juzBounds.find(juz => index >= juz.start && index <= juz.end);
  if (!found) {
    throw new Error(`Ayat ${surahNumber}:${ayahNumber} tidak masuk juz mana pun`);
  }
  return found.juzNumber;
}

const sourcePath = process.argv[2];
const source = sourcePath ? readJson(resolve(process.cwd(), sourcePath)) : null;
const sourceBySurah = new Map(
  (source ?? []).map(entry => [entry.number, entry.ayahs ?? []]),
);

if (source) {
  for (const surah of surahs) {
    const ayahs = sourceBySurah.get(surah.number);
    if (!ayahs) {
      throw new Error(`Surah ${surah.number} tidak ada di sumber data`);
    }
    if (ayahs.length !== surah.totalAyah) {
      throw new Error(
        `Surah ${surah.number} (${surah.nameLatin}): sumber punya ${ayahs.length} ayat, seharusnya ${surah.totalAyah}`,
      );
    }
  }
}

mkdirSync(resolve(QURAN_DIR, 'ayahs'), {recursive: true});
mkdirSync(resolve(QURAN_DIR, 'tafsir'), {recursive: true});

let writtenAyah = 0;
for (const surah of surahs) {
  const sourceAyahs = sourceBySurah.get(surah.number) ?? [];
  const ayahs = [];
  const tafsir = [];

  for (let ayahNumber = 1; ayahNumber <= surah.totalAyah; ayahNumber += 1) {
    const entry = sourceAyahs[ayahNumber - 1] ?? {};
    ayahs.push({
      ayahNumber,
      juzNumber: juzOf(surah.number, ayahNumber),
      arabic: entry.arabic ?? PLACEHOLDER.arabic,
      latin: entry.latin ?? PLACEHOLDER.latin,
      translation: entry.translation ?? PLACEHOLDER.translation,
    });
    tafsir.push({
      ayahNumber,
      text: entry.tafsir ?? PLACEHOLDER.tafsir,
    });
    writtenAyah += 1;
  }

  writeFileSync(
    resolve(QURAN_DIR, `ayahs/${pad(surah.number)}.json`),
    `${JSON.stringify({surahNumber: surah.number, isPlaceholder: !source, ayahs})}\n`,
  );
  writeFileSync(
    resolve(QURAN_DIR, `tafsir/${pad(surah.number)}.json`),
    `${JSON.stringify({surahNumber: surah.number, isPlaceholder: !source, tafsir})}\n`,
  );
}

if (writtenAyah !== TOTAL_AYAH) {
  throw new Error(`Menulis ${writtenAyah} ayat, seharusnya ${TOTAL_AYAH}`);
}

const ayahEntries = surahs
  .map(s => `  ${s.number}: () => require('./ayahs/${pad(s.number)}.json'),`)
  .join('\n');
const tafsirEntries = surahs
  .map(s => `  ${s.number}: () => require('./tafsir/${pad(s.number)}.json'),`)
  .join('\n');

writeFileSync(
  resolve(QURAN_DIR, 'ayahMap.ts'),
  `// DIGENERATE oleh scripts/build-quran-data.mjs — jangan diedit manual.
//
// Metro tidak mendukung require() dengan path dinamis, jadi 114 file ayat
// tidak bisa diambil pakai variabel. Tiap entri dibungkus fungsi supaya
// file-nya baru di-parse saat surahnya dibuka, bukan seluruhnya saat app
// start — lihat docs/05-architecture/adr/ADR-003-quran-offline-data.md.

export const AYAH_FILES: Record<number, () => unknown> = {
${ayahEntries}
};

export const TAFSIR_FILES: Record<number, () => unknown> = {
${tafsirEntries}
};
`,
);

console.log(
  `${source ? 'Impor' : 'Placeholder'}: ${surahs.length} surah, ${writtenAyah} ayat, peta require ditulis.`,
);
