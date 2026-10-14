import surahsFixture from '@/assets/quran/surahs.json';
import juzFixture from '@/assets/quran/juz.json';
import {AYAH_FILES, TAFSIR_FILES} from '@/assets/quran/ayahMap';
import type {
  Ayah,
  AyahTafsir,
  JuzRange,
  Surah,
  SurahAyahs,
} from '@/types/quran';

// Konten mushaf: statis, sama untuk semua pengguna, dan dibutuhkan justru
// saat tidak ada koneksi. Karena itu dibaca dari JSON yang ikut di-bundle,
// TIDAK lewat apiClient dan tidak mengembalikan ApiResponse —
// lihat docs/05-architecture/adr/ADR-003-quran-offline-data.md.

let cachedSurahs: Surah[] | null = null;
let cachedJuz: JuzRange[] | null = null;

export function getSurahs(): Surah[] {
  if (!cachedSurahs) {
    cachedSurahs = surahsFixture as Surah[];
  }
  return cachedSurahs;
}

export function getSurahByNumber(surahNumber: number): Surah | null {
  return getSurahs().find(surah => surah.number === surahNumber) ?? null;
}

export function getJuzList(): JuzRange[] {
  if (!cachedJuz) {
    cachedJuz = juzFixture as JuzRange[];
  }
  return cachedJuz;
}

// Nama surah ditulis bermacam-macam: "Al-Kahfi", "al kahfi", "alkahfi".
// Tanda hubung, apostrof, dan spasi dibuang supaya ketiganya sama.
export function normalizeSurahKeyword(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Hanya mencari nama surah dan artinya — tidak menyentuh teks arab, lafal
// latin ayat, maupun terjemahan. Lihat docs/08-features/quran/quran-search.md.
export function searchSurahs(keyword: string): Surah[] {
  const normalized = normalizeSurahKeyword(keyword);
  if (!normalized) {
    return [];
  }

  // Keyword berupa angka dicocokkan ke nomor surah: "18" -> Al-Kahfi.
  if (/^\d+$/.test(normalized)) {
    const byNumber = getSurahByNumber(Number(normalized));
    return byNumber ? [byNumber] : [];
  }

  return getSurahs().filter(
    surah =>
      normalizeSurahKeyword(surah.nameLatin).includes(normalized) ||
      normalizeSurahKeyword(surah.meaning).includes(normalized),
  );
}

// Cache LRU kecil: menahan beberapa surah terakhir supaya bolak-balik
// next/prev tidak mem-parse ulang JSON, tanpa menahan seluruh mushaf di
// memori pada perangkat kelas bawah.
const AYAH_CACHE_LIMIT = 3;
const ayahCache = new Map<number, SurahAyahs>();
const tafsirCache = new Map<number, AyahTafsir[]>();

function putInCache<T>(cache: Map<number, T>, key: number, value: T): void {
  cache.set(key, value);
  if (cache.size > AYAH_CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) {
      cache.delete(oldest);
    }
  }
}

export function getSurahAyahs(surahNumber: number): SurahAyahs | null {
  const cached = ayahCache.get(surahNumber);
  if (cached) {
    return cached;
  }
  const load = AYAH_FILES[surahNumber];
  if (!load) {
    return null;
  }
  const loaded = load() as SurahAyahs;
  putInCache(ayahCache, surahNumber, loaded);
  return loaded;
}

export function getAyahs(surahNumber: number): Ayah[] {
  return getSurahAyahs(surahNumber)?.ayahs ?? [];
}

export function getTafsir(
  surahNumber: number,
  ayahNumber: number,
): string | null {
  let entries = tafsirCache.get(surahNumber);
  if (!entries) {
    const load = TAFSIR_FILES[surahNumber];
    if (!load) {
      return null;
    }
    entries = (load() as {tafsir: AyahTafsir[]}).tafsir;
    putInCache(tafsirCache, surahNumber, entries);
  }
  return entries.find(item => item.ayahNumber === ayahNumber)?.text ?? null;
}

export function getJuzOfAyah(
  surahNumber: number,
  ayahNumber: number,
): number | null {
  return (
    getAyahs(surahNumber).find(ayah => ayah.ayahNumber === ayahNumber)
      ?.juzNumber ?? null
  );
}
