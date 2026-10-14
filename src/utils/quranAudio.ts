import type {Qari} from '@/types/quran';

const AYAH_AUDIO_BASE = 'https://cdn.equran.id/audio-partial';
const SURAH_AUDIO_BASE = 'https://cdn.equran.id/audio-full';

interface QariOption {
  value: Qari;
  label: string;
  /** Nama folder di CDN. */
  slug: string;
}

const FALLBACK_QARI: QariOption = {
  value: 'alafasy',
  label: 'Misyari Rasyid Al-Afasi',
  slug: 'Misyari-Rasyid-Al-Afasi',
};

export const QARI_OPTIONS: QariOption[] = [
  FALLBACK_QARI,
  {value: 'juhany', label: 'Abdullah Al-Juhany', slug: 'Abdullah-Al-Juhany'},
  {value: 'qasim', label: 'Abdul Muhsin Al-Qasim', slug: 'Abdul-Muhsin-Al-Qasim'},
  {value: 'sudais', label: 'Abdurrahman as-Sudais', slug: 'Abdurrahman-as-Sudais'},
  {value: 'dossari', label: 'Ibrahim Al-Dossari', slug: 'Ibrahim-Al-Dossari'},
];

export const DEFAULT_QARI: Qari = 'alafasy';

function pad3(value: number): string {
  return String(value).padStart(3, '0');
}

/**
 * URL audio satu ayat. TIDAK disimpan di dataset — polanya bisa diturunkan
 * dari nomor surah dan ayat (`{surah:3}{ayat:3}.mp3`), jadi 6236 URL tidak
 * perlu ikut membesarkan bundle, dan ganti qari cukup menukar satu slug.
 */
export function getAyahAudioUrl(
  surahNumber: number,
  ayahNumber: number,
  qari: Qari,
): string {
  const option =
    QARI_OPTIONS.find(item => item.value === qari) ?? FALLBACK_QARI;
  return `${AYAH_AUDIO_BASE}/${option.slug}/${pad3(surahNumber)}${pad3(ayahNumber)}.mp3`;
}

/** URL murottal satu surah penuh dalam satu berkas. */
export function getSurahAudioUrl(surahNumber: number, qari: Qari): string {
  const option =
    QARI_OPTIONS.find(item => item.value === qari) ?? FALLBACK_QARI;
  return `${SURAH_AUDIO_BASE}/${option.slug}/${pad3(surahNumber)}.mp3`;
}

export function getQariLabel(qari: Qari): string {
  return QARI_OPTIONS.find(item => item.value === qari)?.label ?? '';
}
