// Prototype: hanya surah 1 (Al-Fatihah) yang dimuat untuk menghemat ukuran bundle.
// Metro mem-bundle semua require statis; dengan hanya memuat Al-Fatihah,
// ukuran JS bundle berkurang drastis (~13MB lebih hemat).

export const AYAH_FILES: Record<number, () => unknown> = {
  1: () => require('./ayahs/001.json'),
};

export const TAFSIR_FILES: Record<number, () => unknown> = {
  1: () => require('./tafsir/001.json'),
};
