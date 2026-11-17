import type {DonaturSort} from '@/types/programDetail';
import type {SortDirection, SortOption} from '@/types/donationFilter';
import type {NewsFilter} from '@/types/news';
import type {DoaTab} from '@/types/doa';
import type {DonasiBersamaTab} from '@/types/donasiBersama';
import type {TantanganTab} from '@/types/tantangan';
import type {PrayerScheduleParams} from '@/services/prayerService';

export interface NewsListFilter {
  sort: NewsFilter;
  search: string;
}

export interface DonationListFilter {
  categoryId: number | null;
  sortOption: SortOption;
  sortDirection: SortDirection;
  search: string;
}

// Satu sumber kebenaran untuk semua query key TanStack Query — factory
// function untuk key yang butuh parameter (id, sort, filter) supaya tidak ada
// key yang salah ketik/tidak konsisten antar hook. Ditambah incremental per
// fase migrasi — lihat docs/09-fixing/fixing_006_caching_data.md.
export const queryKeys = {
  home: ['home'] as const,
  program: {
    detail: (link: string) => ['program', 'detail', link] as const,
    salesNotif: (programId: string | null) =>
      ['program', 'sales-notif', programId] as const,
    projects: (programId: string | null, programLink?: string | null) =>
      ['program', 'projects', programId, programLink] as const,
    report: (programLink: string | null) =>
      ['program', 'report', programLink] as const,
    donatur: (programId: string | null, sort: DonaturSort, programLink?: string | null) =>
      ['program', 'donatur', programId, sort, programLink] as const,
    fundraiser: (programLink: string | null) =>
      ['program', 'fundraiser', programLink] as const,
  },
  projectSalur: {
    detail: (projectSalurId: string) =>
      ['project-salur', 'detail', projectSalurId] as const,
    donatur: (projectSalurId: string, sort: DonaturSort) =>
      ['project-salur', 'donatur', projectSalurId, sort] as const,
  },
  donations: {
    categories: ['donations', 'categories'] as const,
    featured: ['donations', 'featured'] as const,
    list: (filter: DonationListFilter) => ['donations', 'list', filter] as const,
  },
  myDonations: {
    summary: ['my-donations', 'summary'] as const,
    transactions: ['my-donations', 'transactions'] as const,
    distributions: ['my-donations', 'distributions'] as const,
    rekap: ['my-donations', 'rekap'] as const,
  },
  tracking: {
    detail: (donationId: string) => ['tracking', 'detail', donationId] as const,
  },
  quran: {
    progressSummary: ['quran', 'progress', 'summary'] as const,
    highlightChallenges: ['quran', 'challenges', 'highlight'] as const,
    challengeDetail: (challengeId: string) =>
      ['quran', 'challenges', 'detail', challengeId] as const,
    challengeProgress: (challengeId: string) =>
      ['quran', 'challenges', 'progress', challengeId] as const,
    readingHistory: (type: 'surah' | 'juz', limit: number) =>
      ['quran', 'reading-history', type, limit] as const,
    bookmarks: (limit: number) => ['quran', 'bookmarks', limit] as const,
    schedules: (limit: number) => ['quran', 'schedules', limit] as const,
    scheduleDetail: (scheduleId: string) =>
      ['quran', 'schedules', 'detail', scheduleId] as const,
    bookmarkStatus: (surahNumber: number) =>
      ['quran', 'bookmark-status', surahNumber] as const,
  },
  prayer: {
    // Seluruh parameter perhitungan ikut jadi bagian key: ganti metode atau
    // koreksi ihtiyat berarti key berbeda, sehingga jadwal lama tidak dipakai
    // ulang untuk pengaturan yang sudah berubah.
    schedule: (params: PrayerScheduleParams) =>
      ['prayer', 'schedule', params] as const,
    nearestLocation: (latitude: number, longitude: number) =>
      ['prayer', 'location', latitude, longitude] as const,
    options: ['prayer', 'options'] as const,
    locationSearch: (keyword: string) =>
      ['prayer', 'location-search', keyword] as const,
  },
  news: {
    featured: ['news', 'featured'] as const,
    list: (filter: NewsListFilter) => ['news', 'list', filter] as const,
    detail: (articleId: string) => ['news', 'detail', articleId] as const,
  },
  doa: {
    // Tab jadi satu-satunya pembeda list — Relung Doa tidak punya search,
    // filter, atau sort.
    list: (tab: DoaTab) => ['doa', 'list', tab] as const,
    banners: ['doa', 'banners'] as const,
  },
  amalan: {
    // Tanggal jadi satu-satunya pembeda daftar — menu Amalan Harian tidak punya
    // tab, filter, atau pencarian.
    day: (date: string) => ['amalan', 'day', date] as const,
    summary: (start: string, end: string) =>
      ['amalan', 'summary', start, end] as const,
    presets: ['amalan', 'presets'] as const,
  },
  donasiBersama: {
    // Tab dan kata kunci sama-sama membedakan list — ganti salah satunya
    // memuat ulang dari halaman 1, dan hasilnya di-cache terpisah.
    list: (tab: DonasiBersamaTab, search: string) =>
      ['donasi-bersama', 'list', tab, search] as const,
    detail: (groupId: string) => ['donasi-bersama', 'detail', groupId] as const,
    contributions: (groupId: string) =>
      ['donasi-bersama', 'contributions', groupId] as const,
    members: (groupId: string, search: string) =>
      ['donasi-bersama', 'members', groupId, search] as const,
    invite: (groupId: string) => ['donasi-bersama', 'invite', groupId] as const,
    memberContributions: (groupId: string, memberId: string) =>
      ['donasi-bersama', 'member-contributions', groupId, memberId] as const,
    myContributions: (groupId: string) =>
      ['donasi-bersama', 'my-contributions', groupId] as const,
    batches: (groupId: string) =>
      ['donasi-bersama', 'batches', groupId] as const,
    batchContributions: (groupId: string, batchId: string) =>
      ['donasi-bersama', 'batch-contributions', groupId, batchId] as const,
  },
  impact: {
    map: () => ['impact', 'map'] as const,
    // Periode membedakan cache. Kategori TIDAK masuk key: penyaringannya di
    // klien, jadi satu periode cukup satu entri cache.
    report: (period: string) => ['impact', 'report', period] as const,
  },
  tantangan: {
    // Tab dan kata kunci sama-sama membedakan list — ganti salah satunya
    // memuat ulang dari halaman 1, dan hasilnya di-cache terpisah.
    list: (tab: TantanganTab, search: string) =>
      ['tantangan', 'list', tab, search] as const,
    detail: (challengeId: string) =>
      ['tantangan', 'detail', challengeId] as const,
    leaderboard: (challengeId: string) =>
      ['tantangan', 'leaderboard', challengeId] as const,
    invite: (challengeId: string) =>
      ['tantangan', 'invite', challengeId] as const,
    categories: ['tantangan', 'categories'] as const,
    jurnal: (date: string) => ['tantangan', 'jurnal', date] as const,
  },
  recurring: {
    // Katalog program rutin: sort, arah sort, dan kata kunci sama-sama
    // membedakan hasil — ganti salah satunya memuat ulang dari halaman 1.
    programs: (sortOption: SortOption, sortDirection: SortDirection, search: string) =>
      ['recurring', 'programs', sortOption, sortDirection, search] as const,
  },
  reflections: {
    // Cuma kata kunci yang jadi pembeda — menu Renungan tidak punya filter
    // atau sort seperti Berita.
    list: (search: string) => ['reflections', 'list', search] as const,
    detail: (reflectionId: string) =>
      ['reflections', 'detail', reflectionId] as const,
  },
  // Menu Event cuma punya satu endpoint tanpa parameter apa pun, jadi key-nya
  // konstanta — bukan fungsi seperti key lain di file ini.
  event: ['event'] as const,
  themes: {
    // Tema aktif tidak punya parameter — key-nya konstanta, sama seperti event.
    active: ['themes', 'active'] as const,
  },
} as const;
