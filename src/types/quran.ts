export type Revelation = 'MAKKIYAH' | 'MADANIYAH';

// Metadata surah yang sudah tersedia sekarang, dibaca dari JSON bundled.
export interface SurahMeta {
  number: number; // 1..114
  nameLatin: string;
  nameArabic: string;
  meaning: string;
  totalAyah: number;
  revelation: Revelation;
}

export interface Surah extends SurahMeta {
  // Satu surah bisa melewati lebih dari satu juz — Al-Baqarah ada di juz 1-3.
  juzNumbers: number[];
}

// Batas tiap juz. Batas juz tidak selalu jatuh di awal surah, jadi rentangnya
// disimpan sebagai pasangan surah+ayat, bukan daftar surah.
export interface JuzRange {
  juzNumber: number; // 1..30
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  totalAyah: number;
}

export interface Ayah {
  ayahNumber: number;
  juzNumber: number;
  arabic: string;
  latin: string;
  translation: string;
}

export interface SurahAyahs {
  surahNumber: number;
  // true selama isinya masih placeholder generator, belum data mushaf asli.
  isPlaceholder: boolean;
  ayahs: Ayah[];
}

export interface AyahTafsir {
  ayahNumber: number;
  text: string;
}

export type ArabicFontSize = 'small' | 'medium' | 'large' | 'xlarge';

export type Qari =
  | 'alafasy'
  | 'juhany'
  | 'qasim'
  | 'sudais'
  | 'dossari';

export interface ReadingPosition {
  surahNumber: number;
  ayahNumber: number;
  updatedAt: string; // ISO
}

// Ringkasan challenge untuk carousel di Beranda Quran. Detail lengkapnya
// (deskripsi HTML, daftar surah, jumlah peserta) ada di endpoint detail —
// lihat docs/08-features/quran/quran-challenge.md.
export interface ChallengeSummary {
  id: string;
  name: string;
  imageUrl: string;
  isJoined: boolean;
  joinedDayCount: number | null; // null saat belum ikut
  lastReadSurahName: string | null;
  progressPercentage: number; // 0..100
}

export interface Challenge {
  id: string;
  name: string;
  imageUrl: string;
  descriptionHtml: string;
  participantCount: number;
  startDate: string; // ISO date-only
  endDate: string; // ISO date-only
  surahNumbers: number[];
  isJoined: boolean;
  isEnded: boolean; // periode sudah lewat
  joinedDayCount: number | null;
  lastReadSurahName: string | null;
  progressPercentage: number; // 0..100
}

export type ChallengeTab = 'detail' | 'surah';

export interface ChallengeSurahProgress {
  surahNumber: number;
  nameLatin: string;
  totalAyah: number;
  readAyah: number;
  isCompleted: boolean;
}

export interface ChallengeProgress {
  challengeId: string;
  name: string;
  startDate: string;
  endDate: string;
  remainingDays: number; // 0 kalau periode sudah lewat
  isEnded: boolean;
  completedSurahCount: number;
  totalSurahCount: number;
  percentage: number; // 0..100
  surahs: ChallengeSurahProgress[];
}

export interface SurahReadingHistory {
  surahNumber: number;
  surahNameLatin: string;
  surahNameArabic: string;
  lastAyah: number;
  totalAyah: number;
  isCompleted: boolean;
  updatedAt: string; // ISO
}

export interface JuzReadingHistory {
  juzNumber: number; // 1..30
  readAyahCount: number;
  totalAyahCount: number;
  percentage: number; // 0..100
  updatedAt: string | null; // null = juz belum tersentuh
}

export interface ProgressSummary {
  completedSurahCount: number; // dari 114
  completedJuzCount: number; // dari 30
  savedSurahCount: number;
  activeScheduleCount: number;
}

export interface SavedSurah {
  surahNumber: number;
  surahNameLatin: string;
  surahNameArabic: string;
  totalAyah: number;
  savedAt: string; // ISO
}

export type ScheduleStatus =
  | 'DIJADWALKAN'
  | 'BERJALAN'
  | 'SELESAI'
  | 'TERLAMBAT';

export type ScheduleRepeat =
  | 'TIDAK_BERULANG'
  | 'HARIAN'
  | 'MINGGUAN'
  | 'BULANAN';

export interface Schedule {
  id: string;
  date: string; // ISO, tanggal pelaksanaan
  surahNumber: number;
  surahNameLatin: string;
  targetAyah: number;
  readAyah: number; // realisasi dari progres baca
  percentage: number; // 0..100
  status: ScheduleStatus;
  repeat: ScheduleRepeat;
  createdAt: string; // ISO date-only
}

export interface SchedulePayload {
  date: string; // YYYY-MM-DD
  surahNumber: number;
  targetAyah: number;
  repeat: ScheduleRepeat;
}

export type LastReadTab = 'surah' | 'juz' | 'saved';
