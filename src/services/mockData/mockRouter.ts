import {
  authFixtures,
  bannersFixture,
  doaBannersFixture,
  categoriesFixture,
  eventFixture,
  themeFixture,
  faqsFixture,
  homeFixture,
  impactFixture,
  locationsFixture,
  organizationsFixture,
  prayerTimesFixture,
  programDataFixture,
  programsFixture,
  promoPopupFixture,
  quranFixture,
  userFixtures,
  vouchersFixture,
  walletFixture,
} from './fixtures';
import {isProgramRutin, seedFromLink} from './programSeed';
import {
  nextAmalanId,
  mockAmalanList,
  mockAmalanPresets,
  mockArticles,
  mockDoaList,
  mockDonasiBersamaBatches,
  mockDonasiBersamaContributions,
  mockDonasiBersamaMembers,
  mockDonasiBersamaGroups,
  mockNotifications,
  mockRecurringDonations,
  mockReflections,
  MOCK_TANTANGAN_ME_ID,
  mockTantanganCategories,
  mockTantanganDayStatuses,
  mockTantanganJurnalEntries,
  mockTantanganLeaderboard,
  mockTantanganList,
  mockUser,
  mockUserSettings,
} from './mockState';
import surahsFixture from '@/assets/quran/surahs.json';
import juzFixture from '@/assets/quran/juz.json';
import type {
  RecurringDonation,
  RecurringDonationDetail,
  RecurringDonationStatus,
} from '@/types/recurringDonation';
import type {
  MockArticle,
  MockDonasiBersamaBatch,
  MockDonasiBersamaContribution,
  MockDonasiBersamaGroup,
  MockTantangan,
  MockTantanganLeaderboardEntry,
} from './mockState';
import type {Doa} from '@/types/doa';
import type {
  DistributionReportData,
  ImpactMapData,
} from '@/types/impact';
import type {
  Tantangan,
  TantanganDayStatus,
  TantanganDetail,
  TantanganJurnalItem,
  TantanganLeaderboardEntry,
  TantanganMode,
  TantanganStatus,
  TantanganTab,
} from '@/types/tantangan';
import type {Amalan, AmalanSummary} from '@/types/amalan';
import type {
  DonasiBersamaBatch,
  DonasiBersamaContribution,
  DonasiBersamaDetail,
  DonasiBersamaGroup,
  DonasiBersamaStatus,
  DonasiBersamaTab,
  ReminderSetting,
} from '@/types/donasiBersama';
import {formatFullDate, shiftIsoDate, toIsoDateOnly} from '@/utils/formatDate';
import {getHijriDateLabel} from '@/utils/hijriDate';
import type {
  PrayerLocation,
  PrayerName,
  PrayerSchedule,
  PrayerTimeItem,
} from '@/types/prayerTime';

// In-memory router that answers every request the app used to send to the
// dev `json-server` mock, using the fixtures bundled under
// mobile/src/assets/json. This is what lets a built APK run with no backend
// reachable — see docs/PRD_JSON.md for the full endpoint catalog and the
// migration plan back to a real API.

export interface MockResponse {
  status: number;
  data: unknown;
}

interface ParsedUrl {
  path: string;
  query: Record<string, string>;
}

interface ProgramListItem {
  id: number;
  title: string;
  link: string;
  image: string;
  time_target: number | null;
  nominal_target: number;
  nominal_achieved: number | string;
  progress_achieved: number | string;
  remaining_days: number | null;
  mitra: {id: number; name: string; image: string; location: string};
  category: {id: number; name: string; slug: string; image: string};
  tipe?: {id: number; name: string; slug: string; description: string};
  cta_color?: string | null;
  nearest_projects?: unknown[];
}

interface LoginBody {
  password?: string;
}
interface OtpBody {
  otp?: string;
}
interface CreatePasswordBody {
  password?: string;
  password_confirmation?: string;
}
interface ProfileBody {
  name?: string;
  email?: string;
}
interface SettingsBody {
  hideNominal?: boolean;
  hideName?: boolean;
  contactable?: boolean;
  reminderEnabled?: boolean;
  reminderFrequency?: 'daily' | 'weekly' | 'monthly';
  reminderTime?: string;
}
interface TopupBody {
  amount?: number;
  paymentMethodId?: string;
}
interface VoucherBody {
  code?: string;
}
interface CreateDoaBody {
  content?: string;
  nameVisibility?: string;
}

const NOTIFICATION_PAGE_SIZE = 10;
const NOTIFICATION_TYPE_BY_FILTER: Record<string, string> = {
  news: 'ORGANIZATION_NEWS',
  donation: 'DONATION_INFO',
};

const NEWS_PAGE_SIZE = 10;
const NEWS_FEATURED_LIMIT = 5;
const REFLECTION_PAGE_SIZE = 10;
const DOA_PAGE_SIZE = 10;
const DONASI_BERSAMA_PAGE_SIZE = 10;
const DONASI_BERSAMA_INVITE_BASE_URL = 'https://aksiberbagi.com/grup';
// Kembaran BANK_TRANSFER_MIN_AMOUNT di @/utils/paymentMethodGroup — mock tidak
// mengimpor dari service supaya tidak ada siklus (service → apiClient → mock).
const DONASI_BERSAMA_MIN_CONTRIBUTION = 1000;
const DONASI_BERSAMA_GROUP_NOT_FOUND =
  'Grup tidak ditemukan atau bersifat privat';
// Samakan dengan validasi di DoaCreateScreen kalau batasnya berubah.
const DOA_CONTENT_MIN_LENGTH = 10;
// Date.now() saja tidak cukup: dua doa yang dikirim dalam milidetik yang sama
// akan berbagi id dan membuat keyExtractor FlatList bentrok.
let doaSequence = 0;

function parseUrl(url: string): ParsedUrl {
  const [path = '', queryString = ''] = url.split('?');
  const query: Record<string, string> = {};
  queryString.split('&').forEach(pair => {
    if (!pair) {
      return;
    }
    const [key = '', value = ''] = pair.split('=');
    if (key) {
      query[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  });
  return {path, query};
}

function ok(data: unknown): MockResponse {
  return {status: 200, data};
}

function asRecord(body: unknown): Record<string, unknown> {
  return body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
}

function titleCaseFromLink(link: string): string {
  return link.replaceAll('-', ' ').replace(/\b\w/g, character => character.toUpperCase());
}

// 'recommended' belum punya logika personalisasi di mock — fallback ke urutan
// yang sama dengan 'newest' (terbaru dulu). 'popular' urut dari like terbanyak.
function sortArticles(articles: MockArticle[], sort: string): MockArticle[] {
  const sorted = [...articles];
  if (sort === 'popular') {
    sorted.sort((a, b) => b.likeCount - a.likeCount);
    return sorted;
  }
  sorted.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  return sorted;
}

function buildProgramDetail(base: ProgramListItem | null, link: string): unknown {
  const seed = base ? base.id : seedFromLink(link);
  const nominalAchieved = base
    ? Number(base.nominal_achieved) || (seed % 10) * 1500000
    : (seed % 10) * 1500000;
  const nominalUsed = Math.round(nominalAchieved * 0.35);
  const fallbackTitle = titleCaseFromLink(link);

  return {
    id: base ? base.id : 900 + (seed % 100),
    title: base ? base.title : fallbackTitle,
    link,
    image: base
      ? base.image
      : 'https://cdn.aksiberbagi.com/settings/home-banner-1777532258.jpeg',
    images: [],
    video: '',
    status: 'PUBLISH',
    content: programDataFixture.detailContent,
    description: base ? base.title : fallbackTitle,
    time_target: base ? base.time_target : null,
    nominal_target:
      base && base.nominal_target > 0
        ? base.nominal_target
        : seed % 3 === 0
          ? null
          : 50000000,
    nominal_achieved: String(nominalAchieved),
    nominal_used: String(nominalUsed),
    nominal_by_news: '0',
    progress_achieved: base ? String(base.progress_achieved) : String(seed % 100),
    remaining_nominal: '0',
    remaining_days:
      base && base.remaining_days !== null
        ? base.remaining_days
        : seed % 2 === 0
          ? null
          : 10 + (seed % 30),
    total_beneficiery: 0,
    beneficiery_by_news: 0,
    total_donaturs: seed * 37,
    is_rutin: isProgramRutin(seed),
    is_favorit: false,
    created_at: '2026-05-05T06:42:54.649024+02:00',
    updated_at: '2026-06-18T05:16:22.456177+02:00',
    mitra: base
      ? base.mitra
      : {
          id: 11,
          name: 'Aksiberbagi',
          image: 'https://cdn.aksiberbagi.com/mitra-logo/logo-1737686881.png',
          location: 'Jalan Tentara Pelajar RT 5 RW 27 Guwosari Jebres',
        },
    category: base
      ? base.category
      : {
          id: 8,
          name: 'Sosial & Kemanusiaan',
          slug: 'sosial-kemanusiaan',
          image: 'https://cdn.aksiberbagi.com/categories/image-1736219661.png',
        },
    tipe:
      base && base.tipe
        ? base.tipe
        : {id: 3, name: 'INFAK', slug: 'infaq', description: 'infak'},
    last_news: null,
    last_two_projects: [],
    jenis_nominal: seed % 2 === 0 ? 'paket' : 'biasa',
    nominal_presets: programDataFixture.detailDefaults.nominalPresets,
    packages: programDataFixture.detailDefaults.packages,
    cta_color: base && base.cta_color ? base.cta_color : null,
    nearest_projects:
      base && base.nearest_projects
        ? base.nearest_projects
        : programDataFixture.detailDefaults.nearestProjects,
  };
}

interface QuranScheduleFixture {
  id: string;
  dayOffset: number;
  surahNumber: number;
  surahNameLatin: string;
  targetAyah: number;
  readAyah: number;
  repeat: string;
}

interface QuranCityFixture {
  name: string;
  latitude: number;
  longitude: number;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_CITY = 'Jakarta';

interface QuranChallengeFixture {
  id: string;
  name: string;
  imageUrl: string;
  descriptionHtml: string;
  participantCount: number;
  startDayOffset: number;
  endDayOffset: number;
  surahNumbers: number[];
  defaultJoined: boolean;
}

// Riwayat bacaan disimpan sebagai list in-memory karena bisa direset dari
// Pengaturan Quran. Semua turunannya — progres juz, progres challenge, dan
// progres jadwal — membaca dari sini, jadi satu reset merambat ke semuanya.
const readingHistory: SurahHistoryFixture[] = [
  ...(quranFixture.surahHistory as SurahHistoryFixture[]),
];

interface JuzRangeFixture {
  juzNumber: number;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  totalAyah: number;
}

interface SurahHistoryFixture {
  surahNumber: number;
  lastAyah: number;
  totalAyah: number;
  isCompleted: boolean;
  updatedAt: string;
}

// Keikutsertaan challenge disimpan di memori supaya "Ikuti Challenge"
// langsung terlihat pengaruhnya di Beranda. Kembali ke isi fixture tiap app
// di-restart.
const joinedChallenges = new Set<string>(
  (quranFixture.challengeCatalog as QuranChallengeFixture[])
    .filter(challenge => challenge.defaultJoined)
    .map(challenge => challenge.id),
);

// Indeks ayat global 1..6236 — dipakai memetakan ayat yang sudah dibaca ke
// juz mana. Batas juz tidak jatuh di awal surah, jadi progres juz harus
// dihitung per ayat, bukan per surah.
const GLOBAL_AYAH_OFFSET = new Map<number, number>();
(() => {
  let running = 0;
  for (const surah of surahsFixture as SurahMetaFixture[]) {
    GLOBAL_AYAH_OFFSET.set(surah.number, running);
    running += surah.totalAyah;
  }
})();

function toGlobalAyah(surahNumber: number, ayahNumber: number): number {
  return (GLOBAL_AYAH_OFFSET.get(surahNumber) ?? 0) + ayahNumber;
}

// Progres tiap juz diturunkan dari riwayat bacaan: membaca sampai ayat N
// berarti ayat 1..N surah itu sudah terbaca. Seluruh 30 juz selalu
// dikembalikan, termasuk yang belum tersentuh (0%).
function computeJuzProgress(): {
  juzNumber: number;
  readAyahCount: number;
  totalAyahCount: number;
  percentage: number;
  updatedAt: string | null;
}[] {
  const history = readingHistory;

  return (juzFixture as JuzRangeFixture[]).map(juz => {
    const start = toGlobalAyah(juz.startSurah, juz.startAyah);
    const end = toGlobalAyah(juz.endSurah, juz.endAyah);

    let readAyahCount = 0;
    let updatedAt: string | null = null;

    for (const item of history) {
      const readStart = toGlobalAyah(item.surahNumber, 1);
      const readEnd = toGlobalAyah(item.surahNumber, item.lastAyah);
      const overlap =
        Math.min(readEnd, end) - Math.max(readStart, start) + 1;
      if (overlap > 0) {
        readAyahCount += overlap;
        if (!updatedAt || item.updatedAt > updatedAt) {
          updatedAt = item.updatedAt;
        }
      }
    }

    return {
      juzNumber: juz.juzNumber,
      readAyahCount,
      totalAyahCount: juz.totalAyah,
      percentage:
        juz.totalAyah > 0
          ? Math.round((readAyahCount / juz.totalAyah) * 100)
          : 0,
      updatedAt,
    };
  });
}

// Satu perhitungan dipakai bersama oleh ringkasan (carousel Beranda) dan
// detail progres, supaya persentase di dua tempat tidak pernah bertentangan.
// Progres challenge = jumlah surah SELESAI dibagi total surah dalam
// challenge — bukan rata-rata progres per surah. Surah yang baru terbaca
// separuh tidak menambah persentase.
function computeChallengeProgress(fixture: QuranChallengeFixture): {
  completedSurahCount: number;
  totalSurahCount: number;
  percentage: number;
  lastReadSurahName: string | null;
  surahs: {
    surahNumber: number;
    nameLatin: string;
    totalAyah: number;
    readAyah: number;
    isCompleted: boolean;
  }[];
} {
  const history = readingHistory;
  const historyBySurah = new Map(history.map(item => [item.surahNumber, item]));
  const surahMeta = new Map(
    (surahsFixture as SurahMetaFixture[]).map(surah => [surah.number, surah]),
  );

  const surahs = fixture.surahNumbers.map(surahNumber => {
    const meta = surahMeta.get(surahNumber);
    const read = historyBySurah.get(surahNumber);
    return {
      surahNumber,
      nameLatin: meta?.nameLatin ?? `Surah ${surahNumber}`,
      totalAyah: meta?.totalAyah ?? 0,
      readAyah: read?.lastAyah ?? 0,
      isCompleted: read?.isCompleted ?? false,
    };
  });

  const completedSurahCount = surahs.filter(s => s.isCompleted).length;
  const totalSurahCount = surahs.length;

  // Surah yang paling baru dibaca di antara surah challenge ini.
  const lastRead = history
    .filter(item => fixture.surahNumbers.includes(item.surahNumber))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

  return {
    completedSurahCount,
    totalSurahCount,
    percentage:
      totalSurahCount > 0
        ? Math.round((completedSurahCount / totalSurahCount) * 100)
        : 0,
    lastReadSurahName: lastRead
      ? surahNamesOf(lastRead.surahNumber).surahNameLatin
      : null,
    surahs,
  };
}

// Hari ke-N dihitung dari tanggal user bergabung. Fixture menyamakannya
// dengan tanggal mulai challenge; backend asli memakai tanggal join.
function joinedDayCountOf(fixture: QuranChallengeFixture): number {
  return Math.max(1, -fixture.startDayOffset + 1);
}

function buildChallenge(fixture: QuranChallengeFixture): unknown {
  const isJoined = joinedChallenges.has(fixture.id);
  const progress = computeChallengeProgress(fixture);
  return {
    id: fixture.id,
    name: fixture.name,
    imageUrl: fixture.imageUrl,
    descriptionHtml: fixture.descriptionHtml,
    participantCount: fixture.participantCount,
    startDate: toDateOnly(startOfToday() + fixture.startDayOffset * DAY_IN_MS),
    endDate: toDateOnly(startOfToday() + fixture.endDayOffset * DAY_IN_MS),
    surahNumbers: fixture.surahNumbers,
    isJoined,
    isEnded: fixture.endDayOffset < 0,
    joinedDayCount: isJoined ? joinedDayCountOf(fixture) : null,
    lastReadSurahName: isJoined ? progress.lastReadSurahName : null,
    progressPercentage: isJoined ? progress.percentage : 0,
  };
}

function buildChallengeSummary(fixture: QuranChallengeFixture): unknown {
  const isJoined = joinedChallenges.has(fixture.id);
  const progress = computeChallengeProgress(fixture);
  return {
    id: fixture.id,
    name: fixture.name,
    imageUrl: fixture.imageUrl,
    isJoined,
    joinedDayCount: isJoined ? joinedDayCountOf(fixture) : null,
    lastReadSurahName: isJoined ? progress.lastReadSurahName : null,
    progressPercentage: isJoined ? progress.percentage : 0,
  };
}

// Bookmark disimpan di memori supaya toggle simpan/hapus terasa nyata dalam
// satu sesi app. Kembali ke isi fixture tiap app di-restart.
interface SurahMetaFixture {
  number: number;
  nameLatin: string;
  nameArabic: string;
  totalAyah: number;
}

// Nama surah selalu diambil dari surahs.json, tidak disalin ke fixture lain.
// Nama arabnya berharakat, dan harakat itu cuma perlu dijaga di satu tempat.
function surahNamesOf(surahNumber: number): {
  surahNameLatin: string;
  surahNameArabic: string;
} {
  const meta = (surahsFixture as SurahMetaFixture[]).find(
    surah => surah.number === surahNumber,
  );
  return {
    surahNameLatin: meta?.nameLatin ?? `Surah ${surahNumber}`,
    surahNameArabic: meta?.nameArabic ?? '',
  };
}

const bookmarkedSurahs = new Set<number>(
  (quranFixture.bookmarks as {surahNumber: number}[]).map(b => b.surahNumber),
);

function startOfToday(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

// Tanggal jadwal dikirim date-only (YYYY-MM-DD), bukan ISO timestamp penuh.
// toISOString() menggeser tanggal ke UTC — di WIB (UTC+7) tengah malam lokal
// jadi jam 17:00 hari sebelumnya, sehingga jadwal "hari ini" terbaca kemarin.
function toDateOnly(timestamp: number): string {
  const date = new Date(timestamp);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// Status jadwal seluruhnya turunan dari tanggal + progres baca, tidak pernah
// diset manual. SELESAI menang atas TERLAMBAT: jadwal yang tuntas setelah
// tanggalnya lewat tetap dihitung selesai —
// lihat docs/08-features/quran/quran-schedule.md.
function resolveScheduleStatus(
  date: string,
  readAyah: number,
  targetAyah: number,
): string {
  // SELESAI menang atas TERLAMBAT: jadwal yang tuntas setelah tanggalnya
  // lewat tetap dihitung selesai.
  if (readAyah >= targetAyah) {
    return 'SELESAI';
  }
  const today = toDateOnly(startOfToday());
  if (date === today) {
    return 'BERJALAN';
  }
  return date < today ? 'TERLAMBAT' : 'DIJADWALKAN';
}

interface ScheduleRecord {
  id: string;
  date: string; // YYYY-MM-DD
  surahNumber: number;
  targetAyah: number;
  repeat: string;
  createdAt: string;
}

// Jadwal disimpan sebagai list in-memory supaya buat/ubah/hapus terasa nyata
// dalam satu sesi app. Kembali ke isi fixture tiap app di-restart.
const scheduleRecords: ScheduleRecord[] = (
  quranFixture.schedules as QuranScheduleFixture[]
).map(fixture => ({
  id: fixture.id,
  date: toDateOnly(startOfToday() + fixture.dayOffset * DAY_IN_MS),
  surahNumber: fixture.surahNumber,
  targetAyah: fixture.targetAyah,
  repeat: fixture.repeat,
  createdAt: toDateOnly(startOfToday() + (fixture.dayOffset - 2) * DAY_IN_MS),
}));

let scheduleSequence = scheduleRecords.length;

// readAyah TIDAK disimpan: diturunkan dari riwayat bacaan surah tersebut,
// sesuai aturan "progres jadwal terisi otomatis dari progres membaca".
// Dengan begitu status jadwal tidak pernah bertentangan dengan progres baca.
function buildSchedule(record: ScheduleRecord): unknown {
  const history = readingHistory.find(
    item => item.surahNumber === record.surahNumber,
  );
  const readAyah = Math.min(history?.lastAyah ?? 0, record.targetAyah);
  const surahMeta = (surahsFixture as SurahMetaFixture[]).find(
    surah => surah.number === record.surahNumber,
  );

  return {
    id: record.id,
    date: record.date,
    surahNumber: record.surahNumber,
    surahNameLatin: surahMeta?.nameLatin ?? `Surah ${record.surahNumber}`,
    targetAyah: record.targetAyah,
    readAyah,
    percentage:
      record.targetAyah > 0
        ? Math.min(100, Math.round((readAyah / record.targetAyah) * 100))
        : 0,
    status: resolveScheduleStatus(record.date, readAyah, record.targetAyah),
    repeat: record.repeat,
    createdAt: record.createdAt,
  };
}

// Urutan tampil: yang sedang berjalan dulu, sisanya tanggal terbaru di atas.
const SCHEDULE_STATUS_ORDER: Record<string, number> = {
  BERJALAN: 0,
  TERLAMBAT: 1,
  DIJADWALKAN: 2,
  SELESAI: 3,
};

function parseLimit(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

// Berdiri di tempat reverse geocoding backend. Ambil kota terdekat secara
// kasar dari daftar fixture; kalau koordinatnya tidak masuk akal, jatuh ke
// DEFAULT_CITY seperti perilaku saat izin lokasi ditolak.
function resolveCity(latitude: number, longitude: number): string {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return DEFAULT_CITY;
  }
  const cities = quranFixture.cities as QuranCityFixture[];
  let nearest = DEFAULT_CITY;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const city of cities) {
    const distance =
      Math.abs(city.latitude - latitude) + Math.abs(city.longitude - longitude);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = city.name;
    }
  }
  return nearest;
}

// --- Jadwal sholat -----------------------------------------------------------
//
// Berdiri di tempat backend yang menghitung waktu sholat. `baseTimes` di
// prayer-times.json dihitung sekali untuk tanggal acuan memakai parameter
// Kemenag (fajr 20 derajat, isya 18 derajat, ashar bayangan 1x), lalu di sini
// hanya digeser oleh ihtiyat dan selisih imsak.
//
// Batasnya jujur disebut: jam dasarnya TIDAK berubah menurut tanggal, dan
// metode perhitungan belum mengubah hasil. Keduanya baru benar saat mesin
// hitung sungguhan dipakai — lihat Opsi 2 di
// docs/05-architecture/adr/ADR-006-prayer-time-calculation.md. Yang perlu
// diganti nanti hanya fungsi buildPrayerTimes di bawah.

interface PrayerLocationFixture {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

type BaseTimeKey = Exclude<PrayerName, 'IMSAK'>;

const PRAYER_LABELS: Record<PrayerName, string> = {
  IMSAK: 'Imsak',
  SUBUH: 'Subuh',
  TERBIT: 'Terbit',
  DZUHUR: 'Dzuhur',
  ASHAR: 'Ashar',
  MAGHRIB: 'Maghrib',
  ISYA: 'Isya',
};

const NON_PRAYER_KEYS: PrayerName[] = ['IMSAK', 'TERBIT'];

function prayerLocations(): PrayerLocationFixture[] {
  return locationsFixture as PrayerLocationFixture[];
}

function defaultPrayerLocation(): PrayerLocationFixture {
  const fallbackId = prayerTimesFixture.defaultLocationId;
  const found = prayerLocations().find(item => item.id === fallbackId);
  return found ?? (prayerLocations()[0] as PrayerLocationFixture);
}

// Berdiri di tempat reverse geocoding backend: ambil kota terdekat secara
// kasar. Koordinat yang tidak masuk akal jatuh ke kota default, sama seperti
// perilaku saat izin lokasi ditolak.
function resolvePrayerLocation(
  latitude: number,
  longitude: number,
): PrayerLocationFixture {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return defaultPrayerLocation();
  }
  let nearest = defaultPrayerLocation();
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const city of prayerLocations()) {
    const distance =
      Math.abs(city.latitude - latitude) + Math.abs(city.longitude - longitude);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = city;
    }
  }
  return nearest;
}

function timeToMinutes(time: string): number {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

function minutesToTime(totalMinutes: number): string {
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = String(Math.floor(wrapped / 60)).padStart(2, '0');
  const minutes = String(wrapped % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// "2,3,2,2,2" -> koreksi menit urut subuh, dzuhur, ashar, maghrib, isya.
function parseIhtiyat(raw: string): Record<BaseTimeKey, number> {
  const parts = raw.split(',').map(value => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  });
  return {
    SUBUH: parts[0] ?? 0,
    TERBIT: 0, // terbit penanda posisi matahari, tidak ikut dimundurkan
    DZUHUR: parts[1] ?? 0,
    ASHAR: parts[2] ?? 0,
    MAGHRIB: parts[3] ?? 0,
    ISYA: parts[4] ?? 0,
  };
}

function buildPrayerTimes(
  locationId: string,
  ihtiyatRaw: string,
  imsakOffsetMinutes: number,
): PrayerTimeItem[] {
  const baseTimes = prayerTimesFixture.baseTimes as Record<
    string,
    Record<BaseTimeKey, string>
  >;
  const base =
    baseTimes[locationId] ?? baseTimes[prayerTimesFixture.defaultLocationId];
  const ihtiyat = parseIhtiyat(ihtiyatRaw);

  const corrected = {} as Record<BaseTimeKey, number>;
  (Object.keys(ihtiyat) as BaseTimeKey[]).forEach(key => {
    corrected[key] = timeToMinutes(base?.[key] ?? '00:00') + ihtiyat[key];
  });

  // Imsak selalu dihitung dari Subuh yang sudah terkoreksi, bukan dari jam
  // dasarnya — kalau tidak, jaraknya tidak lagi sesuai yang dipilih pengguna.
  const imsakMinutes = corrected.SUBUH - imsakOffsetMinutes;

  const ordered: [PrayerName, number][] = [
    ['IMSAK', imsakMinutes],
    ['SUBUH', corrected.SUBUH],
    ['TERBIT', corrected.TERBIT],
    ['DZUHUR', corrected.DZUHUR],
    ['ASHAR', corrected.ASHAR],
    ['MAGHRIB', corrected.MAGHRIB],
    ['ISYA', corrected.ISYA],
  ];

  return ordered.map(([key, minutes]) => ({
    key,
    label: PRAYER_LABELS[key],
    time: minutesToTime(minutes),
    isPrayer: !NON_PRAYER_KEYS.includes(key),
  }));
}

function toPrayerLocation(fixture: PrayerLocationFixture): PrayerLocation {
  return {
    id: fixture.id,
    name: fixture.name,
    latitude: fixture.latitude,
    longitude: fixture.longitude,
    timezone: fixture.timezone,
  };
}

function buildPrayerSchedule(query: Record<string, string>): PrayerSchedule {
  const location = resolvePrayerLocation(
    Number(query.lat),
    Number(query.lng),
  );
  const requestedDate = query.date ? new Date(query.date) : new Date();
  const date = Number.isNaN(requestedDate.getTime())
    ? new Date()
    : requestedDate;
  const imsakOffset = Number(query.imsak);
  const hijriOffset = Number(query.hijriOffset);

  return {
    date: date.toISOString().slice(0, 10),
    dateLabel: formatFullDate(date.toISOString()),
    hijriLabel: getHijriDateLabel(date, {
      offsetDays: Number.isFinite(hijriOffset) ? hijriOffset : 0,
      suffix: false,
    }),
    location: toPrayerLocation(location),
    times: buildPrayerTimes(
      location.id,
      query.ihtiyat ?? '',
      Number.isFinite(imsakOffset) ? imsakOffset : 10,
    ),
  };
}

const AMALAN_NOTE_MAX_LENGTH = 200;
const AMALAN_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function summarizeAmalan(date: string): AmalanSummary {
  const items = mockAmalanList.filter(item => item.date === date);
  return {
    date,
    done: items.filter(item => item.isCompleted).length,
    total: items.length,
  };
}

function normalizeAmalanNote(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  const note = String(value).trim();
  return note === '' ? null : note;
}

// Validasi ini kembaran dari validasi client — ada di sini supaya jalur
// `success: false` bisa dicoba tanpa backend, bukan supaya client boleh
// melewatkan validasinya sendiri.
function validateAmalanBody(
  body: Record<string, unknown>,
): {success: false; message: string; data: Record<string, string>} | null {
  const presetSlug = String(body.presetSlug ?? '');
  if (!mockAmalanPresets.some(item => item.slug === presetSlug)) {
    return {
      success: false,
      message: 'Amalan gagal disimpan',
      data: {presetSlug: 'Pilih jenis amalan'},
    };
  }
  if (!AMALAN_TIME_PATTERN.test(String(body.time ?? ''))) {
    return {
      success: false,
      message: 'Amalan gagal disimpan',
      data: {time: 'Format waktu tidak valid'},
    };
  }
  const note = normalizeAmalanNote(body.note);
  if (note != null && note.length > AMALAN_NOTE_MAX_LENGTH) {
    return {
      success: false,
      message: 'Amalan gagal disimpan',
      data: {note: `Catatan maksimal ${AMALAN_NOTE_MAX_LENGTH} karakter`},
    };
  }
  return null;
}

// --- Tantangan Amal --------------------------------------------------------
//
// Sama seperti Donasi Bersama, fixture menyimpan tenggat sebagai OFFSET hari
// (`deadlineOffsetDays`), jadi `daysLeft` memang sama persis dengan offsetnya
// dan seed tidak pernah basi. Offset negatif = periode sudah lewat.
//
// Sisa hari dan persentase tetap datang dari server (di sini: mock), bukan
// dihitung client — dua perangkat dengan zona waktu berbeda akan menghasilkan
// angka berbeda untuk tantangan yang sama.

const TANTANGAN_PAGE_SIZE = 10;
// Samakan dengan batas di useTantanganForm kalau berubah.
const TANTANGAN_NAME_MIN_LENGTH = 3;
const TANTANGAN_NAME_MAX_LENGTH = 60;
const TANTANGAN_UNIT_MAX_LENGTH = 20;
const TANTANGAN_TARGET_TEXT_MAX_LENGTH = 200;
const TANTANGAN_NOT_FOUND = 'Tantangan tidak ditemukan atau bersifat tertutup';

function tantanganDaysLeft(challenge: MockTantangan): number {
  return Math.max(0, challenge.deadlineOffsetDays);
}

function tantanganStatus(challenge: MockTantangan): TantanganStatus {
  if (challenge.deadlineOffsetDays <= 0) {
    return 'ended';
  }
  return challenge.doneValue >= challenge.targetValue ? 'completed' : 'active';
}

// Persentase dihitung SERVER dan dikirim jadi — client tidak menghitung ulang,
// hanya membulatkan ke bawah saat menampilkan.
function tantanganPercentage(challenge: MockTantangan): number {
  if (challenge.targetValue <= 0) {
    return 0;
  }
  return Math.min(100, (challenge.doneValue / challenge.targetValue) * 100);
}

// Kartu di daftar cuma butuh sebagian field detail. Memilih field secara
// eksplisit di sini menjaga payload list tetap ringan dan mencegah field
// internal seed (offset hari, kode undangan) ikut bocor ke response.
function toTantanganListItem(challenge: MockTantangan): Tantangan {
  return {
    id: challenge.id,
    name: challenge.name,
    description: challenge.description,
    coverImageUrl: challenge.coverImageUrl,
    categorySlug: challenge.categorySlug,
    mode: challenge.mode,
    status: tantanganStatus(challenge),
    daysLeft: tantanganDaysLeft(challenge),
    durationDays: challenge.durationDays,
    unit: challenge.unit,
    progressPercentage: tantanganPercentage(challenge),
    progressLabel: challenge.progressLabel,
    participantCount: challenge.participantCount,
    participantPreviews: challenge.participantPreviews,
    isJoined: challenge.isJoined,
    isPublic: challenge.isPublic,
  };
}

// Response detail = field list + field yang cuma ada di halaman detail.
// Dipakai juga oleh POST/PUT supaya form tidak perlu request ulang data yang
// baru saja dikirimnya sendiri.
function toTantanganDetail(challenge: MockTantangan): TantanganDetail {
  return {
    ...toTantanganListItem(challenge),
    descriptionHtml: challenge.descriptionHtml,
    dailyTargetText: challenge.dailyTargetText,
    startDate: shiftIsoDate(
      toIsoDateOnly(new Date()),
      challenge.createdAtOffsetDays,
    ),
    endDate: shiftIsoDate(
      toIsoDateOnly(new Date()),
      challenge.deadlineOffsetDays,
    ),
    doneValue: challenge.doneValue,
    targetValue: challenge.targetValue,
    action: challenge.action,
    isCreator: challenge.isCreator,
  };
}

// Kembaran dari validasi client di useTantanganForm — supaya jalur
// `success: false` bisa dicoba tanpa backend.
function validateTantanganPayload(
  body: Record<string, unknown>,
): Record<string, string> | null {
  const errors: Record<string, string> = {};
  const name = String(body.name ?? '').trim();
  const unit = String(body.unit ?? '').trim();
  const dailyTargetText = String(body.dailyTargetText ?? '').trim();

  if (name.length < TANTANGAN_NAME_MIN_LENGTH) {
    errors.name = `Nama tantangan minimal ${TANTANGAN_NAME_MIN_LENGTH} karakter`;
  } else if (name.length > TANTANGAN_NAME_MAX_LENGTH) {
    errors.name = `Nama tantangan maksimal ${TANTANGAN_NAME_MAX_LENGTH} karakter`;
  }
  if (!body.categorySlug) {
    errors.categorySlug = 'Pilih kategori dulu';
  } else if (
    !mockTantanganCategories.some(item => item.slug === body.categorySlug)
  ) {
    errors.categorySlug = 'Kategori tidak dikenal';
  }
  if (!body.durationDays) {
    errors.durationDays = 'Pilih lama hari dulu';
  }
  if (unit.length > TANTANGAN_UNIT_MAX_LENGTH) {
    errors.unit = `Satuan maksimal ${TANTANGAN_UNIT_MAX_LENGTH} karakter`;
  }
  if (dailyTargetText.length > TANTANGAN_TARGET_TEXT_MAX_LENGTH) {
    errors.dailyTargetText = `Deskripsi maksimal ${TANTANGAN_TARGET_TEXT_MAX_LENGTH} karakter`;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

// `contributionLabel` dirakit di sini, bukan disimpan di seed: satuannya milik
// tantangan, jadi mengubah satuan lewat form ubah otomatis ikut terbawa.
function toTantanganLeaderboardEntry(
  entry: MockTantanganLeaderboardEntry,
  challenge: MockTantangan,
): TantanganLeaderboardEntry {
  return {
    id: entry.id,
    name: entry.name,
    avatarUrl: entry.avatarUrl,
    contributionValue: entry.contributionValue,
    contributionLabel: `${entry.contributionValue} ${challenge.unit ?? 'hari'}`,
    lastActivityLabel: entry.lastActivityLabel,
    isMe: entry.id === MOCK_TANTANGAN_ME_ID,
  };
}

// --- Jurnal Kebaikan -------------------------------------------------------

const MAX_STREAK_LOOKBACK_DAYS = 400;

function tantanganDayStatus(date: string): TantanganDayStatus {
  return (
    mockTantanganDayStatuses[date] ?? {date, isFasting: false, isExcused: false}
  );
}

function isTantanganDoneOn(challengeId: string, date: string): boolean {
  return mockTantanganJurnalEntries.some(
    entry => entry.challengeId === challengeId && entry.date === date,
  );
}

// Runtun dihitung SERVER, mundur dari tanggal yang diminta.
//
// Dua aturan yang membuatnya tidak sesederhana "hitung mundur sampai bolong":
// 1. Hari yang ditandai "sedang berhalangan" DILEWATI — tidak menambah runtun,
//    tapi juga tidak memutusnya.
// 2. Hari pertama (tanggal yang diminta) yang belum dicatat TIDAK memutus
//    runtun — harinya belum selesai. Runtun baru putus di hari terlewat
//    berikutnya.
function tantanganStreak(challengeId: string, date: string): number {
  let streak = 0;
  let cursor = date;
  let isFirstDay = true;

  for (let step = 0; step < MAX_STREAK_LOOKBACK_DAYS; step += 1) {
    if (tantanganDayStatus(cursor).isExcused) {
      cursor = shiftIsoDate(cursor, -1);
      isFirstDay = false;
      continue;
    }
    if (isTantanganDoneOn(challengeId, cursor)) {
      streak += 1;
      cursor = shiftIsoDate(cursor, -1);
      isFirstDay = false;
      continue;
    }
    if (isFirstDay) {
      cursor = shiftIsoDate(cursor, -1);
      isFirstDay = false;
      continue;
    }
    break;
  }

  return streak;
}

function toTantanganJurnalItem(
  challenge: MockTantangan,
  date: string,
  isRecommended: boolean,
): TantanganJurnalItem {
  const entry = mockTantanganJurnalEntries.find(
    item => item.challengeId === challenge.id && item.date === date,
  );
  return {
    challengeId: challenge.id,
    name: challenge.name,
    categorySlug: challenge.categorySlug,
    action: challenge.action,
    dailyTargetText: challenge.dailyTargetText,
    unit: challenge.unit,
    todayValue: entry?.value ?? null,
    isDoneToday: entry != null,
    isRecommendedToday: isRecommended,
    streakDays: tantanganStreak(challenge.id, date),
  };
}

// Jurnal hanya berisi tantangan yang SEDANG diikuti dan belum berakhir.
function activeTantanganForJurnal(): MockTantangan[] {
  return mockTantanganList.filter(
    item => item.isJoined && tantanganStatus(item) !== 'ended',
  );
}

// Yang disarankan: runtun terpanjang yang hari itu BELUM dicatat — runtun
// paling panjang adalah yang paling rugi kalau sampai putus. Semua sudah
// dicatat berarti tidak ada yang perlu disarankan.
function recommendedTantanganId(
  challenges: MockTantangan[],
  date: string,
): string | null {
  const pending = challenges.filter(
    item =>
      !isTantanganDoneOn(item.id, date) && item.action.type !== 'quran',
  );
  if (pending.length === 0) {
    return null;
  }
  return pending.reduce((best, item) =>
    tantanganStreak(item.id, date) > tantanganStreak(best.id, date)
      ? item
      : best,
  ).id;
}

// Date.now() saja tidak cukup: dua tantangan yang dibuat dalam milidetik yang
// sama akan berbagi id dan membuat keyExtractor FlatList bentrok.
let tantanganSequence = 0;

function nextTantanganId(): string {
  tantanganSequence += 1;
  return `tnt-new-${Date.now()}-${tantanganSequence}`;
}

function sortTantangan(
  challenges: MockTantangan[],
  tab: TantanganTab,
): MockTantangan[] {
  const sorted = [...challenges];
  if (tab === 'new') {
    // createdAtOffsetDays makin mendekati 0 = makin baru.
    return sorted.sort((a, b) => b.createdAtOffsetDays - a.createdAtOffsetDays);
  }
  if (tab === 'ending') {
    return sorted.sort(
      (a, b) => a.deadlineOffsetDays - b.deadlineOffsetDays,
    );
  }
  return sorted.sort(
    (a, b) =>
      b.participantCount - a.participantCount ||
      tantanganPercentage(b) - tantanganPercentage(a),
  );
}

// --- Donasi Bersama --------------------------------------------------------
//
// Fixture menyimpan tenggat sebagai OFFSET relatif hari ini
// (`deadlineOffsetDays`), bukan tanggal absolut — pola yang sama dengan
// `dayOffset` di amalan.json. Konsekuensinya `daysLeft` memang sama persis
// dengan offsetnya, dan seed tidak pernah basi: grup ber-offset 40 selalu
// bersisa 40 hari, kapan pun mock dijalankan. Offset negatif = tenggat lewat.
//
// Sisa hari tetap datang dari server (di sini: mock), bukan dihitung client
// dari `deadline` — dua perangkat dengan zona waktu berbeda akan menghasilkan
// angka berbeda untuk grup yang sama.

function donasiBersamaDaysLeft(group: MockDonasiBersamaGroup): number {
  return group.deadlineOffsetDays;
}

function donasiBersamaStatus(
  group: MockDonasiBersamaGroup,
): DonasiBersamaStatus {
  if (donasiBersamaDaysLeft(group) <= 0) {
    return 'ended';
  }
  return group.collectedAmount >= group.targetAmount ? 'completed' : 'active';
}

// Kartu di daftar cuma butuh sebagian field detail. Memilih field secara
// eksplisit di sini menjaga payload list tetap ringan dan mencegah field
// internal seed (offset hari) ikut bocor ke response.
function toDonasiBersamaListItem(
  group: MockDonasiBersamaGroup,
): DonasiBersamaGroup {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    coverImageUrl: group.coverImageUrl,
    targetAmount: group.targetAmount,
    collectedAmount: group.collectedAmount,
    progressLabel: group.progressLabel,
    daysLeft: donasiBersamaDaysLeft(group),
    memberCount: group.memberCount,
    memberPreviews: group.memberPreviews,
    isMember: group.isMember,
    isPublic: group.isPublic,
    status: donasiBersamaStatus(group),
  };
}

function donasiBersamaDeadline(group: MockDonasiBersamaGroup): string {
  return shiftIsoDate(toIsoDateOnly(new Date()), group.deadlineOffsetDays);
}

// Response detail = field list + field yang cuma ada di halaman detail.
// Dipakai POST /donasi-bersama supaya screen sukses tidak perlu request lagi.
function toDonasiBersamaDetail(
  group: MockDonasiBersamaGroup,
): DonasiBersamaDetail {
  return {
    ...toDonasiBersamaListItem(group),
    location: group.location,
    // Turunan batch aktif, bukan teks lepas. Grup yang masih di batch pertama
    // tidak menampilkan badge sama sekali.
    batchLabel:
      (mockDonasiBersamaBatches[group.id]?.length ?? 0) > 1
        ? (activeBatch(group.id)?.label ?? null)
        : null,
    about: group.about,
    deadline: donasiBersamaDeadline(group),
    programId: group.programId,
    programTitle: group.programTitle,
    isCreator: group.isCreator,
    reminder: group.reminder,
  };
}

// Selisih hari kalender dari hari ini. Dipakai mengubah `deadline` yang
// dikirim client jadi offset yang dipakai seed — supaya grup baru ikut aturan
// "tidak pernah basi" yang sama dengan fixture.
const BATCH_NOT_FOUND = 'Batch tidak ditemukan';
const BATCH_LABEL_MIN_LENGTH = 3;

// Otorisasi kreator dicek di server untuk SEMUA mutasi batch, bukan cuma
// disembunyikan di UI.
function requireBatchCreator(groupId: string): MockResponse | null {
  const group = mockDonasiBersamaGroups.find(item => item.id === groupId);
  if (!group) {
    return ok({
      success: false,
      message: DONASI_BERSAMA_GROUP_NOT_FOUND,
      data: null,
    });
  }
  if (!group.isCreator) {
    return ok({
      success: false,
      message: 'Hanya kreator grup yang dapat mengelola batch',
      data: null,
    });
  }
  return null;
}

function batchMutationResult(
  groupId: string,
  batch: MockDonasiBersamaBatch,
): {batch: DonasiBersamaBatch; activeBatchLabel: string | null} {
  return {
    batch: toBatchResponse(groupId, batch),
    activeBatchLabel: activeBatch(groupId)?.label ?? null,
  };
}

function activeBatch(groupId: string): MockDonasiBersamaBatch | null {
  return (
    mockDonasiBersamaBatches[groupId]?.find(
      batch => batch.status === 'active',
    ) ?? null
  );
}

// collectedAmount & contributionCount dihitung dari daftar kontribusi, bukan
// disimpan di batch — supaya tidak ada dua sumber kebenaran yang bisa selisih.
function toBatchResponse(
  groupId: string,
  batch: MockDonasiBersamaBatch,
): DonasiBersamaBatch {
  const contributions = (mockDonasiBersamaContributions[groupId] ?? []).filter(
    item => item.batchId === batch.id,
  );
  // Nomor urut dihitung dari urutan pembuatan, bukan dari posisi di response
  // (yang diurut terbaru dulu). Menghapus batch draft membuat nomor setelahnya
  // menutup celah — itu memang yang diinginkan: nomor selalu rapat 1..n.
  const sequence =
    [...(mockDonasiBersamaBatches[groupId] ?? [])]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .findIndex(item => item.id === batch.id) + 1;
  return {
    ...batch,
    sequence,
    collectedAmount: contributions.reduce((sum, item) => sum + item.amount, 0),
    contributionCount: contributions.length,
  };
}

// Field mock-only (isMine/isAnonymous/batchId) dibuang dari riwayat publik.
function toPublicContribution(
  contribution: MockDonasiBersamaContribution,
): DonasiBersamaContribution {
  return {
    id: contribution.id,
    donaturName: contribution.donaturName,
    avatarUrl: contribution.avatarUrl,
    amount: contribution.amount,
    createdAt: contribution.createdAt,
  };
}

// Menghitung SELURUH urunan anggota, termasuk yang anonim — gerbang
// "boleh dikeluarkan" tidak boleh keliru membolehkan penyumbang dikeluarkan
// hanya karena urunannya tidak tampil atas namanya.
function hasMemberContributed(groupId: string, memberId: string): boolean {
  return (mockDonasiBersamaContributions[groupId] ?? []).some(
    item => item.memberId === memberId,
  );
}

function daysFromToday(isoDate: string): number {
  const today = new Date(`${toIsoDateOnly(new Date())}T00:00:00`);
  const target = new Date(`${isoDate}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

const DONASI_BERSAMA_NAME_MIN_LENGTH = 3;
const DONASI_BERSAMA_NAME_MAX_LENGTH = 60;
const DONASI_BERSAMA_MIN_TARGET = 100000;

// Kembaran dari validasi client — ada di sini supaya jalur `success: false`
// bisa dicoba tanpa backend, bukan supaya client boleh melewatkan validasinya.
function validateCreateDonasiBersama(
  body: Record<string, unknown>,
): Record<string, string> | null {
  const errors: Record<string, string> = {};
  const name = String(body.name ?? '').trim();
  const targetAmount = Number(body.targetAmount ?? 0);
  const deadline = String(body.deadline ?? '');

  if (name.length < DONASI_BERSAMA_NAME_MIN_LENGTH) {
    errors.name = `Nama grup minimal ${DONASI_BERSAMA_NAME_MIN_LENGTH} karakter`;
  } else if (name.length > DONASI_BERSAMA_NAME_MAX_LENGTH) {
    errors.name = `Nama grup maksimal ${DONASI_BERSAMA_NAME_MAX_LENGTH} karakter`;
  }
  if (!body.programId) {
    errors.programId = 'Pilih program tujuan';
  }
  if (!Number.isFinite(targetAmount) || targetAmount < DONASI_BERSAMA_MIN_TARGET) {
    errors.targetAmount = 'Target nominal minimal Rp 100.000';
  }
  if (!deadline) {
    errors.deadline = 'Tenggat wajib dipilih';
  } else if (daysFromToday(deadline) < 1) {
    errors.deadline = 'Tenggat minimal besok';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

let donasiBersamaSequence = 0;

function sortDonasiBersamaGroups(
  groups: MockDonasiBersamaGroup[],
  tab: DonasiBersamaTab,
): MockDonasiBersamaGroup[] {
  const sorted = [...groups];
  if (tab === 'new') {
    // createdAtOffsetDays makin mendekati 0 = makin baru.
    return sorted.sort((a, b) => b.createdAtOffsetDays - a.createdAtOffsetDays);
  }
  if (tab === 'ending') {
    return sorted.sort(
      (a, b) => donasiBersamaDaysLeft(a) - donasiBersamaDaysLeft(b),
    );
  }
  return sorted.sort(
    (a, b) =>
      b.memberCount - a.memberCount || b.collectedAmount - a.collectedAmount,
  );
}

// --- Donasi Rutin ----------------------------------------------------------

// Daftar tidak membawa riwayat: yang butuh riwayat cuma layar detail, dan
// mengirimnya di daftar berarti memindahkan data yang tidak dipakai.
function toRecurringDonation(detail: RecurringDonationDetail): RecurringDonation {
  const donation: RecurringDonation & {history?: unknown} = {...detail};
  delete donation.history;
  return donation;
}

const RECURRING_STATUS_ORDER: Record<RecurringDonationStatus, number> = {
  AKTIF: 0,
  JEDA: 1,
};

const RECURRING_NOT_FOUND = {
  success: false,
  message: 'Donasi rutin tidak ditemukan',
  data: null,
};

function validateRecurringBody(
  body: Record<string, unknown>,
): {success: false; message: string; data: Record<string, string>} | null {
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < 1000) {
    return {
      success: false,
      message: 'Nominal donasi belum benar',
      data: {amount: 'Nominal minimal Rp 1.000'},
    };
  }
  const frequency = String(body.frequency ?? '');
  if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
    return {
      success: false,
      message: 'Frekuensi tidak dikenal',
      data: {frequency: 'Pilih frekuensi donasi'},
    };
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(body.scheduleTime ?? ''))) {
    return {
      success: false,
      message: 'Jam donasi belum benar',
      data: {scheduleTime: 'Jam tidak valid'},
    };
  }
  const scheduleDay =
    body.scheduleDay === undefined || body.scheduleDay === null
      ? null
      : Number(body.scheduleDay);
  if (frequency === 'weekly' && (scheduleDay === null || scheduleDay < 0 || scheduleDay > 6)) {
    return {
      success: false,
      message: 'Hari donasi belum dipilih',
      data: {scheduleDay: 'Pilih hari donasi'},
    };
  }
  if (frequency === 'monthly' && (scheduleDay === null || scheduleDay < 1 || scheduleDay > 31)) {
    return {
      success: false,
      message: 'Tanggal donasi belum dipilih',
      data: {scheduleDay: 'Pilih tanggal donasi'},
    };
  }
  return null;
}

// --- Jejak Kebaikan --------------------------------------------------------
//
// Periode data disimpan sebagai OFFSET bulan supaya fixture tidak basi; yang
// keluar ke response sudah berupa label bulan Indonesia. Offset internal
// (dataMonthOffset) tidak ikut dikembalikan.
const IMPACT_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

function impactMonthLabelFromOffset(monthOffset: number): string {
  const date = new Date();
  // Tanggal dipatok ke 1 dulu: setMonth pada tanggal 31 bisa melompat ke bulan
  // berikutnya untuk bulan yang cuma punya 30 hari.
  date.setDate(1);
  date.setMonth(date.getMonth() + monthOffset);
  return `${IMPACT_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function buildImpactMap(): ImpactMapData {
  const {dataMonthOffset, ...rest} = impactFixture.map;
  return {
    ...rest,
    asnaf: rest.asnaf as ImpactMapData['asnaf'],
    dataPeriodLabel: impactMonthLabelFromOffset(dataMonthOffset),
  };
}


function impactPeriodFromOffset(monthOffset: number): {
  value: string;
  label: string;
} {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + monthOffset);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return {
    value: `${date.getFullYear()}-${month}`,
    label: `${IMPACT_MONTHS[date.getMonth()]} ${date.getFullYear()}`,
  };
}

function impactDateFromOffset(dayOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// Periode terbaru = monthOffset terbesar. availablePeriods selalu dikirim
// lengkap, termasuk saat periode yang diminta tidak ada — supaya pengguna
// tetap bisa berpindah ke periode lain dari layar yang kosong.
function buildDistributionReport(requested: string | undefined): DistributionReportData {
  const entries = [...impactFixture.reports].sort(
    (a, b) => b.monthOffset - a.monthOffset,
  );
  const availablePeriods = entries.map(entry =>
    impactPeriodFromOffset(entry.monthOffset),
  );

  const matched = requested
    ? entries.find(
        entry => impactPeriodFromOffset(entry.monthOffset).value === requested,
      )
    : entries[0];

  // Periode tak dikenal BUKAN kesalahan pengguna: kembalikan periode kosong
  // dengan success true, empty state yang menjelaskan.
  if (!matched) {
    const fallbackLabel = availablePeriods[0]?.label ?? '';
    return {
      period: requested ?? '',
      periodLabel: requested ?? fallbackLabel,
      availablePeriods,
      summary: {
        incomingAmount: 0,
        distributedAmount: 0,
        remainingAmount: 0,
        operationalAmount: 0,
      },
      programs: [],
    };
  }

  const period = impactPeriodFromOffset(matched.monthOffset);
  return {
    period: period.value,
    periodLabel: period.label,
    availablePeriods,
    summary: matched.summary,
    programs: matched.programs.map(program => ({
      ...program,
      categories: program.categories as DistributionReportData['programs'][number]['categories'],
      details: program.details.map(({dayOffset, ...rest}) => ({
        ...rest,
        date: impactDateFromOffset(dayOffset),
      })),
    })),
  };
}

export function resolveMockRequest(method: string, url: string, body: unknown): MockResponse {
  const {path, query} = parseUrl(url);
  const httpMethod = method.toUpperCase();
  const requestBody = asRecord(body);
  const programList = programDataFixture.list as unknown as ProgramListItem[];

  const programDetailMatch = path.match(/^\/programs\/link\/([^/]+)$/);
  if (httpMethod === 'GET' && programDetailMatch) {
    const link = decodeURIComponent(programDetailMatch[1] ?? '');
    // Mock menoleransi id numerik sebagai link supaya entry point lama
    // (banner/notifikasi/tracking) yang belum punya link tetap berfungsi.
    const base =
      programList.find(program => program.link === link) ||
      programList.find(program => String(program.id) === link) ||
      null;
    if (!base && link === 'not-found') {
      return ok({success: false, message: 'Program tidak tersedia', data: null});
    }
    return ok({success: true, message: '', data: buildProgramDetail(base, link)});
  }

  const organizationProgramsMatch = path.match(/^\/organizations\/([^/]+)\/programs$/);
  if (httpMethod === 'GET' && organizationProgramsMatch) {
    const id = organizationProgramsMatch[1] ?? '';
    const programs = programList.filter(program => String(program.mitra.id) === id);
    return ok({
      success: true,
      message: 'Berhasil mengambil daftar program lembaga',
      data: programs,
    });
  }

  const organizationReportsMatch = path.match(/^\/organizations\/([^/]+)\/reports$/);
  if (httpMethod === 'GET' && organizationReportsMatch) {
    const id = organizationReportsMatch[1] ?? '';
    const reports = (organizationsFixture.reports as Record<string, unknown>)[id] ?? [];
    return ok({
      success: true,
      message: 'Berhasil mengambil daftar laporan lembaga',
      data: reports,
    });
  }

  const organizationMatch = path.match(/^\/organizations\/([^/]+)$/);
  if (httpMethod === 'GET' && organizationMatch) {
    const id = organizationMatch[1] ?? '';
    const organization = (organizationsFixture.organizations as Record<string, unknown>)[id];
    if (!organization) {
      return ok({success: false, message: 'Lembaga tidak ditemukan', data: null});
    }
    const totalPrograms = programList.filter(program => String(program.mitra.id) === id).length;
    return ok({
      success: true,
      message: '',
      data: {...(organization as Record<string, unknown>), total_programs: totalPrograms},
    });
  }

  if (httpMethod === 'POST' && path === '/auth/login') {
    const {password} = requestBody as LoginBody;
    return ok(password === 'password123' ? authFixtures.login.success : authFixtures.login.failure);
  }

  if (httpMethod === 'POST' && path === '/auth/login-otp') {
    return ok(authFixtures.loginOtp.success);
  }

  if (httpMethod === 'POST' && path === '/auth/validate-login-otp') {
    const {otp} = requestBody as OtpBody;
    return ok(
      otp === '123456' ? authFixtures.validateLoginOtp.success : authFixtures.validateLoginOtp.failure,
    );
  }

  if (httpMethod === 'POST' && path === '/auth/request-reset-password') {
    return ok(authFixtures.requestResetPassword.success);
  }

  if (httpMethod === 'POST' && path === '/auth/validate-reset-password') {
    const {otp} = requestBody as OtpBody;
    return ok(
      otp === '123456'
        ? authFixtures.validateResetPassword.success
        : authFixtures.validateResetPassword.failure,
    );
  }

  if (httpMethod === 'POST' && path === '/auth/create-password') {
    const {password, password_confirmation: confirmation} = requestBody as CreatePasswordBody;
    return ok(
      password !== confirmation ? authFixtures.createPassword.failure : authFixtures.createPassword.success,
    );
  }

  if (httpMethod === 'POST' && path === '/auth/request-otp') {
    return ok(authFixtures.requestOtp.success);
  }

  if (httpMethod === 'POST' && path === '/auth/otp') {
    const {otp} = requestBody as OtpBody;
    return ok(otp === '123456' ? authFixtures.otp.success : authFixtures.otp.failure);
  }

  if (httpMethod === 'POST' && path === '/auth/set-password') {
    const {password, password_confirmation: confirmation} = requestBody as CreatePasswordBody;
    return ok(
      password !== confirmation ? authFixtures.setPassword.failure : authFixtures.setPassword.success,
    );
  }

  if (httpMethod === 'POST' && path === '/auth/logout') {
    return ok(authFixtures.logout.success);
  }

  if (httpMethod === 'GET' && path === '/users/me') {
    return ok({success: true, message: 'Berhasil mengambil data user', data: mockUser});
  }

  if (httpMethod === 'PATCH' && path === '/users/me') {
    const {name, email} = requestBody as ProfileBody;
    const errors: Record<string, string> = {};
    if (!name || !name.trim()) {
      errors.name = userFixtures.updateProfile.errors.name;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = userFixtures.updateProfile.errors.email;
    }
    if (Object.keys(errors).length > 0) {
      return ok({success: false, message: userFixtures.updateProfile.failureMessage, data: errors});
    }
    mockUser.name = name ?? mockUser.name;
    mockUser.email = email ?? mockUser.email;
    return ok({
      success: true,
      message: userFixtures.updateProfile.successMessage,
      data: {name: mockUser.name, email: mockUser.email},
    });
  }

  if (httpMethod === 'PATCH' && path === '/users/me/avatar') {
    mockUser.avatarUrl = userFixtures.updateAvatar.mockAvatarUrl;
    return ok({
      success: true,
      message: userFixtures.updateAvatar.successMessage,
      data: {avatarUrl: mockUser.avatarUrl},
    });
  }

  if (httpMethod === 'PATCH' && path === '/users/me/settings') {
    const settingsBody = requestBody as SettingsBody;
    if (settingsBody.hideNominal !== undefined) {
      mockUserSettings.isHideNominal = settingsBody.hideNominal;
    }
    if (settingsBody.hideName !== undefined) {
      mockUserSettings.isHideName = settingsBody.hideName;
    }
    if (settingsBody.contactable !== undefined) {
      mockUserSettings.isContactable = settingsBody.contactable;
    }
    if (settingsBody.reminderEnabled !== undefined) {
      mockUserSettings.isReminderEnabled = settingsBody.reminderEnabled;
    }
    if (settingsBody.reminderFrequency !== undefined) {
      mockUserSettings.reminderFrequency = settingsBody.reminderFrequency;
    }
    if (settingsBody.reminderTime !== undefined) {
      mockUserSettings.reminderTime = settingsBody.reminderTime;
    }
    return ok({
      success: true,
      message: userFixtures.updateSettings.successMessage,
      data: {
        hideNominal: mockUserSettings.isHideNominal,
        hideName: mockUserSettings.isHideName,
        contactable: mockUserSettings.isContactable,
        reminderEnabled: mockUserSettings.isReminderEnabled,
        reminderFrequency: mockUserSettings.reminderFrequency,
        reminderTime: mockUserSettings.reminderTime,
      },
    });
  }

  if (httpMethod === 'GET' && path === '/banners') {
    return ok({success: true, message: 'Berhasil mengambil daftar banner', data: bannersFixture});
  }

  if (httpMethod === 'GET' && path === '/categories') {
    return ok({success: true, message: 'Berhasil mengambil daftar kategori', data: categoriesFixture});
  }

  if (httpMethod === 'GET' && path === '/programs') {
    return ok({success: true, message: 'Berhasil mengambil daftar program', data: programsFixture});
  }

  if (httpMethod === 'GET' && path === '/wallet/balance') {
    return ok({success: true, message: 'Berhasil mengambil saldo', data: walletFixture.balance});
  }

  if (httpMethod === 'POST' && path === '/wallet/topup') {
    const {amount, paymentMethodId} = requestBody as TopupBody;
    const {topup} = walletFixture;
    if (!amount || amount < topup.minAmount) {
      return ok({success: false, message: topup.minAmountFailureMessage, data: {}});
    }
    const methodId = paymentMethodId ?? '';
    const isBankTransfer = methodId.startsWith('bank-');
    const methodNames = topup.methodNames as Record<string, string>;
    return ok({
      success: true,
      message: topup.successMessage,
      data: {
        topupId: `topup-${Date.now()}`,
        invoiceId: `INV-${Date.now()}`,
        paymentMethod: methodNames[methodId] ?? methodId,
        accountNumber: isBankTransfer ? topup.mockBankAccountNumber : undefined,
        bankName: isBankTransfer ? methodNames[methodId] : undefined,
        amount,
        adminFee: topup.adminFee,
        totalAmount: amount + topup.adminFee,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  }

  if (httpMethod === 'POST' && path === '/vouchers/apply') {
    const {code} = requestBody as VoucherBody;
    const normalizedCode = (code ?? '').toUpperCase();
    const validVouchers = vouchersFixture.valid as Record<string, number>;
    const discountAmount = validVouchers[normalizedCode];
    if (!discountAmount) {
      return ok({success: false, message: vouchersFixture.failureMessage, data: {}});
    }
    return ok({
      success: true,
      message: vouchersFixture.successMessage,
      data: {code: normalizedCode, discountAmount},
    });
  }

  if (httpMethod === 'GET' && path === '/prayer-times') {
    return ok({
      success: true,
      message: 'Berhasil mengambil jadwal sholat',
      data: buildPrayerSchedule(query),
    });
  }

  if (httpMethod === 'GET' && path === '/prayer-times/options') {
    return ok({
      success: true,
      message: 'Berhasil mengambil opsi perhitungan',
      data: prayerTimesFixture.options,
    });
  }

  if (httpMethod === 'GET' && path === '/locations/nearest') {
    return ok({
      success: true,
      message: 'Berhasil mengambil lokasi',
      data: toPrayerLocation(
        resolvePrayerLocation(Number(query.lat), Number(query.lng)),
      ),
    });
  }

  if (httpMethod === 'GET' && path === '/locations') {
    const keyword = (query.q ?? '').trim().toLowerCase();
    const matches = prayerLocations()
      .filter(item => item.name.toLowerCase().includes(keyword))
      .map(toPrayerLocation);
    return ok({
      success: true,
      message: 'Berhasil mengambil daftar kota',
      data: matches,
    });
  }

  if (httpMethod === 'GET' && path === '/promos/popup') {
    return ok({success: true, message: 'Berhasil mengambil promo', data: promoPopupFixture});
  }

  if (httpMethod === 'GET' && path === '/faqs') {
    return ok({success: true, message: 'Berhasil mengambil daftar FAQ', data: faqsFixture});
  }

  if (httpMethod === 'GET' && path === '/notifications') {
    const type = query.type ?? 'all';
    const page = parseInt(query.page ?? '1', 10) || 1;
    const filtered =
      type === 'all'
        ? mockNotifications
        : mockNotifications.filter(item => item.type === NOTIFICATION_TYPE_BY_FILTER[type]);
    const start = (page - 1) * NOTIFICATION_PAGE_SIZE;
    const pageItems = filtered.slice(start, start + NOTIFICATION_PAGE_SIZE);
    return ok({success: true, message: 'Berhasil mengambil daftar notifikasi', data: pageItems});
  }

  if (httpMethod === 'GET' && path === '/notifications/unread-count') {
    const unreadCount = mockNotifications.filter(item => !item.isRead).length;
    return ok({
      success: true,
      message: 'Berhasil mengambil jumlah notifikasi belum dibaca',
      data: unreadCount,
    });
  }

  if (httpMethod === 'POST' && path === '/notifications/read-all') {
    mockNotifications.forEach(item => {
      item.isRead = true;
    });
    return ok({success: true, message: 'Semua notifikasi ditandai sudah dibaca', data: null});
  }

  const notificationReadMatch = path.match(/^\/notifications\/([^/]+)\/read$/);
  if (httpMethod === 'POST' && notificationReadMatch) {
    const id = notificationReadMatch[1] ?? '';
    const notification = mockNotifications.find(item => item.id === id);
    if (notification) {
      notification.isRead = true;
    }
    return ok({success: true, message: 'Notifikasi ditandai sudah dibaca', data: null});
  }

  if (httpMethod === 'GET' && path === '/news') {
    if (query.featured === 'true') {
      const limit = parseInt(query.limit ?? '', 10) || NEWS_FEATURED_LIMIT;
      const featured = sortArticles(
        mockArticles.filter(article => article.featured),
        'newest',
      ).slice(0, limit);
      return ok({success: true, message: 'Berhasil mengambil berita utama', data: featured});
    }

    const sort = query.sort || 'recommended';
    const page = parseInt(query.page ?? '1', 10) || 1;
    const search = (query.search ?? '').trim().toLowerCase();

    const filtered = search
      ? mockArticles.filter(article => article.title.toLowerCase().includes(search))
      : mockArticles;
    const sorted = sortArticles(filtered, sort);
    const start = (page - 1) * NEWS_PAGE_SIZE;
    const items = sorted.slice(start, start + NEWS_PAGE_SIZE);
    const hasMore = start + items.length < sorted.length;

    return ok({
      success: true,
      message: 'Berhasil mengambil daftar berita',
      data: {items, hasMore},
    });
  }

  const newsDetailMatch = path.match(/^\/news\/([^/]+)$/);
  if (httpMethod === 'GET' && newsDetailMatch) {
    const articleId = decodeURIComponent(newsDetailMatch[1] ?? '');
    const article = mockArticles.find(item => item.id === articleId);
    if (!article) {
      return ok({success: false, message: 'Berita tidak ditemukan', data: null});
    }
    return ok({success: true, message: '', data: article});
  }

  const newsLikeMatch = path.match(/^\/news\/([^/]+)\/like$/);
  if (httpMethod === 'POST' && newsLikeMatch) {
    const articleId = decodeURIComponent(newsLikeMatch[1] ?? '');
    const article = mockArticles.find(item => item.id === articleId);
    if (!article) {
      return ok({success: false, message: 'Berita tidak ditemukan', data: null});
    }
    article.isLiked = !article.isLiked;
    article.likeCount = Math.max(0, article.likeCount + (article.isLiked ? 1 : -1));
    return ok({
      success: true,
      message: article.isLiked ? 'Berita disukai' : 'Batal menyukai berita',
      data: {likeCount: article.likeCount, isLiked: article.isLiked},
    });
  }

  // --- Relung Doa ------------------------------------------------------------
  //
  // Kembaran dari blok yang sama di json-server/middleware.js — dua sumber mock
  // ini WAJIB memberi hasil yang sama. Lihat docs/08-features/doa/README.md.
  //
  // `/doa/banners` sengaja dicek sebelum pola `/doa/:doaId/...` supaya
  // 'banners' tidak tertangkap sebagai id doa.
  if (httpMethod === 'POST' && path === '/doa') {
    const doaBody = asRecord(body) as CreateDoaBody;
    const content = (doaBody.content ?? '').trim();

    // Validasi ini kembaran dari validasi client — ada di sini supaya jalur
    // `success: false` bisa dicoba tanpa backend, bukan supaya client boleh
    // melewatkan validasinya sendiri.
    if (content.length < DOA_CONTENT_MIN_LENGTH) {
      return ok({
        success: false,
        message: 'Doa gagal dikirim',
        data: {content: `Tulis doa minimal ${DOA_CONTENT_MIN_LENGTH} karakter`},
      });
    }

    // Nama anonim disusun di sini, bukan di client: client cuma mengirim
    // nameVisibility supaya identitas asli penulis anonim tidak ikut terkirim.
    const isAnonymous = doaBody.nameVisibility === 'anonymous';
    const doa: Doa = {
      id: `doa-${Date.now()}-${(doaSequence += 1)}`,
      author: {
        id: mockUser.id,
        name: isAnonymous ? 'Hamba Allah' : mockUser.name,
        avatarUrl: isAnonymous ? null : mockUser.avatarUrl ?? null,
      },
      content,
      createdAt: new Date().toISOString(),
      isAmiin: false,
      isFavorite: false,
      isMine: true,
      isReported: false,
    };
    mockDoaList.unshift(doa);

    return ok({success: true, message: 'Doa berhasil dikirim', data: doa});
  }

  if (httpMethod === 'GET' && path === '/doa/banners') {
    return ok({success: true, message: '', data: doaBannersFixture});
  }

  if (httpMethod === 'GET' && path === '/doa') {
    const page = parseInt(query.page ?? '1', 10) || 1;
    const tab = query.tab ?? 'all';

    const filtered =
      tab === 'mine'
        ? mockDoaList.filter(item => item.isMine)
        : tab === 'favorite'
          ? mockDoaList.filter(item => item.isFavorite)
          : mockDoaList;
    // Selalu terbaru di atas — Relung Doa tidak punya opsi sort.
    const sorted = [...filtered].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    const start = (page - 1) * DOA_PAGE_SIZE;
    const items = sorted.slice(start, start + DOA_PAGE_SIZE);
    const hasMore = start + items.length < sorted.length;

    return ok({
      success: true,
      message: 'Berhasil mengambil daftar doa',
      data: {items, hasMore},
    });
  }

  const doaAmiinMatch = path.match(/^\/doa\/([^/]+)\/amiin$/);
  if (httpMethod === 'POST' && doaAmiinMatch) {
    const doaId = decodeURIComponent(doaAmiinMatch[1] ?? '');
    const doa = mockDoaList.find(item => item.id === doaId);
    if (!doa) {
      return ok({success: false, message: 'Doa tidak ditemukan', data: null});
    }
    doa.isAmiin = !doa.isAmiin;
    return ok({
      success: true,
      message: doa.isAmiin ? 'Doa diaamiinkan' : 'Batal mengaamiinkan doa',
      data: {id: doa.id, isAmiin: doa.isAmiin, isFavorite: doa.isFavorite},
    });
  }

  const doaFavoriteMatch = path.match(/^\/doa\/([^/]+)\/favorite$/);
  if (httpMethod === 'POST' && doaFavoriteMatch) {
    const doaId = decodeURIComponent(doaFavoriteMatch[1] ?? '');
    const doa = mockDoaList.find(item => item.id === doaId);
    if (!doa) {
      return ok({success: false, message: 'Doa tidak ditemukan', data: null});
    }
    doa.isFavorite = !doa.isFavorite;
    return ok({
      success: true,
      message: doa.isFavorite
        ? 'Doa ditambahkan ke favorit'
        : 'Doa dihapus dari favorit',
      data: {id: doa.id, isAmiin: doa.isAmiin, isFavorite: doa.isFavorite},
    });
  }

  const doaReportMatch = path.match(/^\/doa\/([^/]+)\/report$/);
  if (httpMethod === 'POST' && doaReportMatch) {
    const doaId = decodeURIComponent(doaReportMatch[1] ?? '');
    const doa = mockDoaList.find(item => item.id === doaId);
    if (!doa) {
      return ok({success: false, message: 'Doa tidak ditemukan', data: null});
    }
    doa.isReported = true;
    return ok({
      success: true,
      message: 'Laporan terkirim. Terima kasih sudah membantu.',
      data: null,
    });
  }

  // --- Donasi Bersama --------------------------------------------------------
  //
  // Kembaran dari blok yang sama di json-server/middleware.js — dua sumber mock
  // ini WAJIB memberi hasil yang sama.
  // Lihat docs/08-features/donasi-bersama/README.md.

  // Dicek sebelum pola /donasi-bersama/:groupId supaya 'cover' tidak dianggap
  // id grup.
  if (httpMethod === 'POST' && path === '/donasi-bersama/cover') {
    // Mock tidak benar-benar menyimpan berkas — cukup kembalikan URL statis
    // supaya alur unggah di client bisa diuji ujung ke ujung.
    return ok({
      success: true,
      message: 'Foto berhasil diunggah',
      data: {
        coverImageUrl: `https://picsum.photos/seed/donasi-bersama-cover-${Date.now()}/800/500`,
      },
    });
  }

  if (httpMethod === 'POST' && path === '/donasi-bersama') {
    const errors = validateCreateDonasiBersama(requestBody);
    if (errors) {
      return ok({success: false, message: 'Grup gagal dibuat', data: errors});
    }

    donasiBersamaSequence += 1;
    const deadline = String(requestBody.deadline ?? '');
    const group: MockDonasiBersamaGroup = {
      id: `grp-${Date.now()}-${donasiBersamaSequence}`,
      name: String(requestBody.name ?? '').trim(),
      description: '',
      coverImageUrl: (requestBody.coverImageUrl as string | null) ?? null,
      targetAmount: Number(requestBody.targetAmount ?? 0),
      collectedAmount: 0,
      progressLabel: null,
      memberCount: 1,
      memberPreviews: [
        {id: mockUser.id, name: mockUser.name, avatarUrl: mockUser.avatarUrl ?? null},
      ],
      isMember: true,
      isPublic: requestBody.isPublic !== false,
      location: null,
      batchLabel: null,
      about: '',
      programId: String(requestBody.programId ?? ''),
      programTitle: String(requestBody.programTitle ?? 'Donasi Umum'),
      isCreator: true,
      reminder: requestBody.reminder as ReminderSetting,
      deadlineOffsetDays: daysFromToday(deadline),
      createdAtOffsetDays: 0,
      inviteCode: `g${donasiBersamaSequence}${Date.now().toString(36).slice(-4)}`,
    };
    mockDonasiBersamaGroups.unshift(group);

    return ok({
      success: true,
      message: 'Grup berhasil dibuat',
      data: toDonasiBersamaDetail(group),
    });
  }

  const donasiBersamaJoinMatch = path.match(
    /^\/donasi-bersama\/([^/]+)\/join$/,
  );
  if (httpMethod === 'POST' && donasiBersamaJoinMatch) {
    const groupId = decodeURIComponent(donasiBersamaJoinMatch[1] ?? '');
    const group = mockDonasiBersamaGroups.find(item => item.id === groupId);
    if (!group) {
      return ok({
        success: false,
        message: DONASI_BERSAMA_GROUP_NOT_FOUND,
        data: null,
      });
    }
    if (!group.isMember) {
      group.isMember = true;
      group.memberCount += 1;
    }
    // Mengembalikan state terbaru, bukan null — kartu di daftar perlu
    // menyelaraskan diri tanpa refetch seluruh halaman.
    return ok({
      success: true,
      message: 'Berhasil bergabung ke grup',
      data: {isMember: group.isMember, memberCount: group.memberCount},
    });
  }

  const donasiBersamaLeaveMatch = path.match(
    /^\/donasi-bersama\/([^/]+)\/leave$/,
  );
  if (httpMethod === 'POST' && donasiBersamaLeaveMatch) {
    const groupId = decodeURIComponent(donasiBersamaLeaveMatch[1] ?? '');
    const group = mockDonasiBersamaGroups.find(item => item.id === groupId);
    if (!group) {
      return ok({
        success: false,
        message: DONASI_BERSAMA_GROUP_NOT_FOUND,
        data: null,
      });
    }
    if (group.isCreator) {
      return ok({
        success: false,
        message: 'Kreator grup tidak dapat keluar dari grupnya sendiri',
        data: null,
      });
    }
    if (group.isMember) {
      group.isMember = false;
      group.memberCount = Math.max(0, group.memberCount - 1);
    }
    return ok({
      success: true,
      message: 'Kamu sudah keluar dari grup',
      data: {isMember: group.isMember, memberCount: group.memberCount},
    });
  }

  const donasiBersamaCreateContributionMatch = path.match(
    /^\/donasi-bersama\/([^/]+)\/contributions$/,
  );
  if (httpMethod === 'POST' && donasiBersamaCreateContributionMatch) {
    const groupId = decodeURIComponent(
      donasiBersamaCreateContributionMatch[1] ?? '',
    );
    const group = mockDonasiBersamaGroups.find(item => item.id === groupId);
    if (!group) {
      return ok({
        success: false,
        message: DONASI_BERSAMA_GROUP_NOT_FOUND,
        data: null,
      });
    }
    if (donasiBersamaStatus(group) === 'ended') {
      return ok({
        success: false,
        message: 'Grup sudah berakhir dan tidak menerima urunan baru',
        data: null,
      });
    }

    const amount = Number(requestBody.amount ?? 0);
    if (!Number.isFinite(amount) || amount < DONASI_BERSAMA_MIN_CONTRIBUTION) {
      return ok({
        success: false,
        message: `Nominal urunan minimal Rp ${DONASI_BERSAMA_MIN_CONTRIBUTION.toLocaleString('id-ID')}`,
        data: null,
      });
    }

    // Label anonim disusun DI SINI, bukan di client — client cuma mengirim
    // isAnonymous supaya identitas asli penyumbang anonim tidak ikut terkirim.
    // Urunan selalu masuk batch yang sedang berjalan. Grup tanpa batch aktif
    // (semua masih draft) belum siap menerima urunan.
    const currentBatchId = activeBatch(groupId)?.id;
    if (!currentBatchId) {
      return ok({
        success: false,
        message: 'Grup ini belum memulai batch, urunan belum bisa dikirim',
        data: null,
      });
    }

    const isAnonymous = requestBody.isAnonymous === true;
    donasiBersamaSequence += 1;
    const contribution: MockDonasiBersamaContribution = {
      id: `contrib-${Date.now()}-${donasiBersamaSequence}`,
      donaturName: isAnonymous ? 'Hamba Allah' : mockUser.name,
      avatarUrl: isAnonymous ? null : (mockUser.avatarUrl ?? null),
      amount,
      createdAt: new Date().toISOString(),
      isMine: true,
      isAnonymous,
      batchId: currentBatchId,
      // Urunan dari alur urun selalu milik pengguna yang login. Di mock,
      // anggota yang mewakilinya adalah baris pertama daftar anggota grup.
      memberId: mockDonasiBersamaMembers[groupId]?.[0]?.id ?? null,
    };

    // Riwayat patungan DAN progres grup sama-sama ikut naik. Kalau mock cuma
    // menjawab sukses tanpa ini, alurnya terlihat berhasil tapi detail grup
    // tidak berubah sedikit pun.
    mockDonasiBersamaContributions[groupId] = [
      contribution,
      ...(mockDonasiBersamaContributions[groupId] ?? []),
    ];
    group.collectedAmount += amount;

    return ok({
      success: true,
      message: 'Urunan berhasil dicatat',
      data: contribution,
    });
  }

  // Dicek sebelum pola /contributions supaya '/contributions/mine' tidak
  // tertangkap sebagai riwayat publik.
  // Dicek sebelum pola /batches supaya '/batches/:batchId/contributions'
  // tidak tertangkap sebagai daftar batch.
  const donasiBersamaBatchContributionsMatch = path.match(
    /^\/donasi-bersama\/([^/]+)\/batches\/([^/]+)\/contributions$/,
  );
  if (httpMethod === 'GET' && donasiBersamaBatchContributionsMatch) {
    const groupId = decodeURIComponent(
      donasiBersamaBatchContributionsMatch[1] ?? '',
    );
    const batchId = decodeURIComponent(
      donasiBersamaBatchContributionsMatch[2] ?? '',
    );
    const page = parseInt(query.page ?? '1', 10) || 1;
    const all = (mockDonasiBersamaContributions[groupId] ?? [])
      .filter(item => item.batchId === batchId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const start = (page - 1) * DONASI_BERSAMA_PAGE_SIZE;
    const items = all
      .slice(start, start + DONASI_BERSAMA_PAGE_SIZE)
      .map(toPublicContribution);

    return ok({
      success: true,
      message: 'Berhasil mengambil urunan batch',
      data: {items, hasMore: start + items.length < all.length},
    });
  }

  const donasiBersamaBatchesMatch = path.match(
    /^\/donasi-bersama\/([^/]+)\/batches$/,
  );
  if (httpMethod === 'GET' && donasiBersamaBatchesMatch) {
    const groupId = decodeURIComponent(donasiBersamaBatchesMatch[1] ?? '');
    // Batch selalu sedikit — tidak dipaginasi, batch terbaru di atas.
    const batches = [...(mockDonasiBersamaBatches[groupId] ?? [])]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(batch => toBatchResponse(groupId, batch));

    return ok({
      success: true,
      message: 'Berhasil mengambil daftar batch',
      data: batches,
    });
  }

  if (httpMethod === 'POST' && donasiBersamaBatchesMatch) {
    const groupId = decodeURIComponent(donasiBersamaBatchesMatch[1] ?? '');
    const guard = requireBatchCreator(groupId);
    if (guard) {
      return guard;
    }

    const existing = mockDonasiBersamaBatches[groupId] ?? [];
    const label =
      String(requestBody.label ?? '').trim() || `Batch ${existing.length + 1}`;
    // Batch baru selalu lahir sebagai draft — belum menerima urunan sampai
    // kreator menekan "Mulai".
    const batch: MockDonasiBersamaBatch = {
      id: `batch-${groupId}-${Date.now()}`,
      label,
      status: 'draft',
      createdAt: new Date().toISOString(),
      startedAt: null,
    };
    mockDonasiBersamaBatches[groupId] = [...existing, batch];

    return ok({
      success: true,
      message: 'Batch baru dibuat',
      data: batchMutationResult(groupId, batch),
    });
  }

  const donasiBersamaBatchStartMatch = path.match(
    /^\/donasi-bersama\/([^/]+)\/batches\/([^/]+)\/start$/,
  );
  if (httpMethod === 'POST' && donasiBersamaBatchStartMatch) {
    const groupId = decodeURIComponent(donasiBersamaBatchStartMatch[1] ?? '');
    const batchId = decodeURIComponent(donasiBersamaBatchStartMatch[2] ?? '');
    const guard = requireBatchCreator(groupId);
    if (guard) {
      return guard;
    }
    const batch = mockDonasiBersamaBatches[groupId]?.find(
      item => item.id === batchId,
    );
    if (!batch) {
      return ok({success: false, message: BATCH_NOT_FOUND, data: null});
    }
    if (batch.status !== 'draft') {
      return ok({
        success: false,
        message: 'Batch ini sudah pernah dimulai',
        data: null,
      });
    }

    // Hanya boleh ada satu batch berjalan: yang sedang aktif ditutup.
    mockDonasiBersamaBatches[groupId]?.forEach(item => {
      if (item.status === 'active') {
        item.status = 'ended';
      }
    });
    batch.status = 'active';
    batch.startedAt = new Date().toISOString();

    return ok({
      success: true,
      message: `${batch.label} dimulai`,
      data: batchMutationResult(groupId, batch),
    });
  }

  const donasiBersamaBatchItemMatch = path.match(
    /^\/donasi-bersama\/([^/]+)\/batches\/([^/]+)$/,
  );
  if (httpMethod === 'PUT' && donasiBersamaBatchItemMatch) {
    const groupId = decodeURIComponent(donasiBersamaBatchItemMatch[1] ?? '');
    const batchId = decodeURIComponent(donasiBersamaBatchItemMatch[2] ?? '');
    const guard = requireBatchCreator(groupId);
    if (guard) {
      return guard;
    }
    const batch = mockDonasiBersamaBatches[groupId]?.find(
      item => item.id === batchId,
    );
    if (!batch) {
      return ok({success: false, message: BATCH_NOT_FOUND, data: null});
    }
    const label = String(requestBody.label ?? '').trim();
    if (label.length < BATCH_LABEL_MIN_LENGTH) {
      return ok({
        success: false,
        message: 'Nama batch gagal disimpan',
        data: {label: `Nama batch minimal ${BATCH_LABEL_MIN_LENGTH} karakter`},
      });
    }
    // Mengubah nama boleh kapan saja — tidak mengubah urunan yang sudah masuk.
    batch.label = label;

    return ok({
      success: true,
      message: 'Nama batch diperbarui',
      data: batchMutationResult(groupId, batch),
    });
  }

  if (httpMethod === 'DELETE' && donasiBersamaBatchItemMatch) {
    const groupId = decodeURIComponent(donasiBersamaBatchItemMatch[1] ?? '');
    const batchId = decodeURIComponent(donasiBersamaBatchItemMatch[2] ?? '');
    const guard = requireBatchCreator(groupId);
    if (guard) {
      return guard;
    }
    const batch = mockDonasiBersamaBatches[groupId]?.find(
      item => item.id === batchId,
    );
    if (!batch) {
      return ok({success: false, message: BATCH_NOT_FOUND, data: null});
    }
    // Batch yang sudah dimulai memuat riwayat urunan — menghapusnya berarti
    // menghapus jejak uang yang sudah masuk.
    if (batch.status !== 'draft') {
      return ok({
        success: false,
        message: 'Batch yang sudah dimulai tidak dapat dihapus',
        data: null,
      });
    }
    mockDonasiBersamaBatches[groupId] = (
      mockDonasiBersamaBatches[groupId] ?? []
    ).filter(item => item.id !== batchId);

    return ok({success: true, message: 'Batch dihapus', data: null});
  }

  const donasiBersamaMyContributionsMatch = path.match(
    /^\/donasi-bersama\/([^/]+)\/contributions\/mine$/,
  );
  if (httpMethod === 'GET' && donasiBersamaMyContributionsMatch) {
    const groupId = decodeURIComponent(
      donasiBersamaMyContributionsMatch[1] ?? '',
    );
    const page = parseInt(query.page ?? '1', 10) || 1;
    const mine = [...(mockDonasiBersamaContributions[groupId] ?? [])]
      .filter(item => item.isMine)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const start = (page - 1) * DONASI_BERSAMA_PAGE_SIZE;
    const items = mine
      .slice(start, start + DONASI_BERSAMA_PAGE_SIZE)
      .map(item => ({
        id: item.id,
        amount: item.amount,
        createdAt: item.createdAt,
        isAnonymous: item.isAnonymous,
      }));

    return ok({
      success: true,
      message: 'Berhasil mengambil riwayat urunan saya',
      data: {
        items,
        hasMore: start + items.length < mine.length,
        // Ringkasan seluruh urunan, bukan cuma halaman ini.
        totalAmount: mine.reduce((sum, item) => sum + item.amount, 0),
        count: mine.length,
      },
    });
  }

  const donasiBersamaContributionsMatch = path.match(
    /^\/donasi-bersama\/([^/]+)\/contributions$/,
  );
  if (httpMethod === 'GET' && donasiBersamaContributionsMatch) {
    const groupId = decodeURIComponent(donasiBersamaContributionsMatch[1] ?? '');
    const page = parseInt(query.page ?? '1', 10) || 1;
    const all = [...(mockDonasiBersamaContributions[groupId] ?? [])].sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt),
    );
    const start = (page - 1) * DONASI_BERSAMA_PAGE_SIZE;
    const items = all
      .slice(start, start + DONASI_BERSAMA_PAGE_SIZE)
      .map(toPublicContribution);

    return ok({
      success: true,
      message: 'Berhasil mengambil riwayat patungan',
      data: {items, hasMore: start + items.length < all.length},
    });
  }

  const donasiBersamaInviteMatch = path.match(
    /^\/donasi-bersama\/([^/]+)\/invite$/,
  );
  if (httpMethod === 'GET' && donasiBersamaInviteMatch) {
    const groupId = decodeURIComponent(donasiBersamaInviteMatch[1] ?? '');
    const group = mockDonasiBersamaGroups.find(item => item.id === groupId);
    if (!group) {
      return ok({
        success: false,
        message: DONASI_BERSAMA_GROUP_NOT_FOUND,
        data: null,
      });
    }
    // Tautan disusun server dari kode undangan — client tidak pernah
    // merangkainya sendiri dari groupId.
    return ok({
      success: true,
      message: '',
      data: {
        inviteUrl: `${DONASI_BERSAMA_INVITE_BASE_URL}/${group.inviteCode}`,
        inviteCode: group.inviteCode,
      },
    });
  }

  // Dicek sebelum pola /members supaya '/members/:id/...' tidak tertangkap
  // sebagai daftar anggota.
  const donasiBersamaMemberContributionsMatch = path.match(
    /^\/donasi-bersama\/([^/]+)\/members\/([^/]+)\/contributions$/,
  );
  if (httpMethod === 'GET' && donasiBersamaMemberContributionsMatch) {
    const groupId = decodeURIComponent(
      donasiBersamaMemberContributionsMatch[1] ?? '',
    );
    const memberId = decodeURIComponent(
      donasiBersamaMemberContributionsMatch[2] ?? '',
    );
    const page = parseInt(query.page ?? '1', 10) || 1;
    // Urunan anonim TIDAK pernah ditampilkan di sini. Menampilkannya berarti
    // membatalkan pilihan anonim penyumbangnya — di riwayat publik ia tampil
    // "Hamba Allah", jadi halaman ini tidak boleh jadi celah pembukanya.
    const all = (mockDonasiBersamaContributions[groupId] ?? [])
      .filter(item => item.memberId === memberId && !item.isAnonymous)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const start = (page - 1) * DONASI_BERSAMA_PAGE_SIZE;
    const items = all
      .slice(start, start + DONASI_BERSAMA_PAGE_SIZE)
      .map(toPublicContribution);

    return ok({
      success: true,
      message: 'Berhasil mengambil riwayat urunan anggota',
      data: {items, hasMore: start + items.length < all.length},
    });
  }

  const donasiBersamaMemberItemMatch = path.match(
    /^\/donasi-bersama\/([^/]+)\/members\/([^/]+)$/,
  );
  if (httpMethod === 'DELETE' && donasiBersamaMemberItemMatch) {
    const groupId = decodeURIComponent(donasiBersamaMemberItemMatch[1] ?? '');
    const memberId = decodeURIComponent(donasiBersamaMemberItemMatch[2] ?? '');
    const group = mockDonasiBersamaGroups.find(item => item.id === groupId);
    if (!group) {
      return ok({
        success: false,
        message: DONASI_BERSAMA_GROUP_NOT_FOUND,
        data: null,
      });
    }
    if (!group.isCreator) {
      return ok({
        success: false,
        message: 'Hanya kreator grup yang dapat mengeluarkan anggota',
        data: null,
      });
    }
    const member = mockDonasiBersamaMembers[groupId]?.find(
      item => item.id === memberId,
    );
    if (!member) {
      return ok({
        success: false,
        message: 'Anggota tidak ditemukan',
        data: null,
      });
    }
    if (member.isCreator) {
      return ok({
        success: false,
        message: 'Kreator grup tidak dapat dikeluarkan',
        data: null,
      });
    }
    if (hasMemberContributed(groupId, memberId)) {
      return ok({
        success: false,
        message: 'Anggota yang sudah pernah urun tidak dapat dikeluarkan',
        data: null,
      });
    }

    mockDonasiBersamaMembers[groupId] = (
      mockDonasiBersamaMembers[groupId] ?? []
    ).filter(item => item.id !== memberId);
    group.memberCount = Math.max(0, group.memberCount - 1);

    return ok({
      success: true,
      message: `${member.name} dikeluarkan dari grup`,
      data: {memberCount: group.memberCount},
    });
  }

  const donasiBersamaMembersMatch = path.match(
    /^\/donasi-bersama\/([^/]+)\/members$/,
  );
  if (httpMethod === 'GET' && donasiBersamaMembersMatch) {
    const groupId = decodeURIComponent(donasiBersamaMembersMatch[1] ?? '');
    const page = parseInt(query.page ?? '1', 10) || 1;
    const search = (query.search ?? '').trim().toLowerCase();
    const group = mockDonasiBersamaGroups.find(item => item.id === groupId);
    const all = mockDonasiBersamaMembers[groupId] ?? [];

    const filtered = search
      ? all.filter(item => item.name.toLowerCase().includes(search))
      : all;
    const start = (page - 1) * DONASI_BERSAMA_PAGE_SIZE;
    const items = filtered
      .slice(start, start + DONASI_BERSAMA_PAGE_SIZE)
      .map(member => ({
        ...member,
        hasContributed: hasMemberContributed(groupId, member.id),
      }));

    return ok({
      success: true,
      message: 'Berhasil mengambil daftar anggota',
      data: {
        items,
        hasMore: start + items.length < filtered.length,
        // Jumlah anggota grup, BUKAN jumlah hasil pencarian — baris judul
        // bicara soal grup, bukan soal filter yang sedang aktif.
        total: group?.memberCount ?? all.length,
      },
    });
  }

  const donasiBersamaUpdateMatch = path.match(/^\/donasi-bersama\/([^/]+)$/);
  if (httpMethod === 'PUT' && donasiBersamaUpdateMatch) {
    const groupId = decodeURIComponent(donasiBersamaUpdateMatch[1] ?? '');
    const group = mockDonasiBersamaGroups.find(item => item.id === groupId);
    if (!group) {
      return ok({
        success: false,
        message: DONASI_BERSAMA_GROUP_NOT_FOUND,
        data: null,
      });
    }
    if (!group.isCreator) {
      return ok({
        success: false,
        message: 'Hanya kreator grup yang dapat mengubah detail grup',
        data: null,
      });
    }

    const errors = validateCreateDonasiBersama(requestBody);
    if (errors) {
      return ok({success: false, message: 'Grup gagal disimpan', data: errors});
    }

    group.name = String(requestBody.name ?? '').trim();
    group.targetAmount = Number(requestBody.targetAmount ?? 0);
    group.isPublic = requestBody.isPublic !== false;
    group.coverImageUrl = (requestBody.coverImageUrl as string | null) ?? null;
    group.programId = String(requestBody.programId ?? group.programId);
    group.reminder = requestBody.reminder as ReminderSetting;
    group.deadlineOffsetDays = daysFromToday(
      String(requestBody.deadline ?? ''),
    );

    return ok({
      success: true,
      message: 'Detail grup diperbarui',
      data: toDonasiBersamaDetail(group),
    });
  }

  const donasiBersamaDetailMatch = path.match(/^\/donasi-bersama\/([^/]+)$/);
  if (httpMethod === 'GET' && donasiBersamaDetailMatch) {
    const groupId = decodeURIComponent(donasiBersamaDetailMatch[1] ?? '');
    const group = mockDonasiBersamaGroups.find(item => item.id === groupId);
    // Pesan yang sama untuk grup yang tidak ada dan grup privat yang bukan
    // miliknya — supaya keberadaan grup privat tidak bisa ditebak dari beda
    // pesan error.
    if (!group || (!group.isPublic && !group.isMember)) {
      return ok({
        success: false,
        message: DONASI_BERSAMA_GROUP_NOT_FOUND,
        data: null,
      });
    }
    return ok({success: true, message: '', data: toDonasiBersamaDetail(group)});
  }

  if (httpMethod === 'GET' && path === '/donasi-bersama') {
    const page = parseInt(query.page ?? '1', 10) || 1;
    const tab = (query.tab ?? 'popular') as DonasiBersamaTab;
    const search = (query.search ?? '').trim().toLowerCase();

    // Grup privat tidak pernah muncul di daftar publik — satu-satunya jalan
    // masuk ke sana adalah tautan undangan.
    let filtered = mockDonasiBersamaGroups.filter(item => item.isPublic);
    if (search) {
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search),
      );
    }
    // Chip "Segera Berakhir" hanya berisi grup yang masih bisa diurun —
    // grup yang tenggatnya lewat tidak lagi mendesak, cuma selesai.
    if (tab === 'ending') {
      filtered = filtered.filter(item => donasiBersamaStatus(item) !== 'ended');
    }

    const sorted = sortDonasiBersamaGroups(filtered, tab);
    const start = (page - 1) * DONASI_BERSAMA_PAGE_SIZE;
    const items = sorted
      .slice(start, start + DONASI_BERSAMA_PAGE_SIZE)
      .map(toDonasiBersamaListItem);
    const hasMore = start + items.length < sorted.length;

    return ok({
      success: true,
      message: 'Berhasil mengambil daftar grup',
      data: {items, hasMore},
    });
  }

  // --- Tantangan Amal --------------------------------------------------------
  //
  // Kembaran dari blok yang sama di json-server/middleware.js — dua sumber mock
  // ini WAJIB memberi hasil yang sama.
  // Lihat docs/08-features/tantangan-amal/README.md.
  //
  // `/tantangan/categories` sengaja dicek SEBELUM pola `/tantangan/:id` supaya
  // 'categories' tidak tertangkap sebagai id tantangan — pola yang sama dengan
  // `/doa/banners` dan `/amalan/presets`.
  if (httpMethod === 'GET' && path === '/tantangan/categories') {
    return ok({
      success: true,
      message: '',
      data: mockTantanganCategories,
    });
  }

  if (httpMethod === 'GET' && path === '/tantangan') {
    const page = parseInt(query.page ?? '1', 10) || 1;
    const tab = (query.tab ?? 'popular') as TantanganTab;
    const search = (query.search ?? '').trim().toLowerCase();

    // Tantangan tertutup tidak pernah muncul di daftar publik — satu-satunya
    // jalan masuk ke sana adalah tautan undangan.
    let filtered = mockTantanganList.filter(item => item.isPublic);
    if (search) {
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search),
      );
    }
    // Tab "Segera Berakhir" hanya berisi tantangan yang masih bisa dijalani —
    // yang periodenya lewat tidak lagi mendesak, cuma selesai.
    if (tab === 'ending') {
      filtered = filtered.filter(item => tantanganStatus(item) !== 'ended');
    }

    const sorted = sortTantangan(filtered, tab);
    const start = (page - 1) * TANTANGAN_PAGE_SIZE;
    const items = sorted
      .slice(start, start + TANTANGAN_PAGE_SIZE)
      .map(toTantanganListItem);
    const hasMore = start + items.length < sorted.length;

    return ok({
      success: true,
      message: 'Berhasil mengambil daftar tantangan',
      data: {items, hasMore},
    });
  }

  if (httpMethod === 'POST' && path === '/tantangan') {
    const errors = validateTantanganPayload(requestBody);
    if (errors) {
      return ok({
        success: false,
        message: 'Periksa kembali isian kamu',
        data: errors,
      });
    }

    const mode = requestBody.mode === 'group' ? 'group' : ('personal' as TantanganMode);
    const durationDays = Number(requestBody.durationDays);
    const unit = String(requestBody.unit ?? '').trim() || null;
    const created: MockTantangan = {
      id: nextTantanganId(),
      name: String(requestBody.name).trim(),
      description: String(requestBody.dailyTargetText ?? '').trim(),
      coverImageUrl: null,
      categorySlug: String(requestBody.categorySlug),
      mode,
      durationDays,
      unit,
      doneValue: 0,
      // Tanpa satuan, target = jumlah hari: progresnya hari tercentang dibagi
      // durasi. Dengan satuan, target belum diketahui sampai pencatatan
      // pertama, jadi dipakai durasi juga sebagai batas awal yang masuk akal.
      targetValue: durationDays,
      progressLabel: unit ? `0 ${unit}` : null,
      participantCount: 1,
      participantPreviews: [],
      isJoined: true,
      // Tantangan personal tidak pernah publik, apa pun kiriman client.
      isPublic: mode === 'group' ? Boolean(requestBody.isPublic) : false,
      descriptionHtml: `<p>${String(requestBody.dailyTargetText ?? '').trim()}</p>`,
      dailyTargetText: String(requestBody.dailyTargetText ?? '').trim() || null,
      // Form hanya bisa menghasilkan tantangan jurnal — yang menunjuk ke Quran
      // atau donasi dikurasi server. Lihat docs/08-features/tantangan-amal.
      action: {type: 'journal'},
      isCreator: true,
      deadlineOffsetDays: durationDays,
      createdAtOffsetDays: 0,
      inviteCode: `t${tantanganSequence}${Date.now().toString(36).slice(-3)}`,
    };
    mockTantanganList.unshift(created);

    return ok({
      success: true,
      message: 'Tantangan berhasil dibuat',
      data: toTantanganDetail(created),
    });
  }

  // Sub-path /leaderboard, /join, dan /leave dicek SEBELUM pola
  // /tantangan/:challengeId supaya tidak tertangkap sebagai id.
  const tantanganLeaderboardMatch = path.match(
    /^\/tantangan\/([^/]+)\/leaderboard$/,
  );
  if (httpMethod === 'GET' && tantanganLeaderboardMatch) {
    const challenge = mockTantanganList.find(
      item => item.id === tantanganLeaderboardMatch[1],
    );
    if (!challenge) {
      return ok({success: false, message: TANTANGAN_NOT_FOUND, data: null});
    }

    const page = parseInt(query.page ?? '1', 10) || 1;
    const seed = mockTantanganLeaderboard[challenge.id] ?? [];
    const sorted = [...seed].sort(
      (a, b) => b.contributionValue - a.contributionValue,
    );
    const start = (page - 1) * TANTANGAN_PAGE_SIZE;
    const items = sorted
      .slice(start, start + TANTANGAN_PAGE_SIZE)
      .map(entry => toTantanganLeaderboardEntry(entry, challenge));
    const hasMore = start + items.length < sorted.length;
    // `me` dikirim TERPISAH dari items supaya pengguna yang peringkatnya jauh
    // di bawah tetap melihat barisnya sendiri tanpa menggulir berhalaman-halaman.
    const meSeed = challenge.isJoined
      ? sorted.find(entry => entry.id === MOCK_TANTANGAN_ME_ID)
      : undefined;

    return ok({
      success: true,
      message: '',
      data: {
        items,
        me: meSeed ? toTantanganLeaderboardEntry(meSeed, challenge) : null,
        hasMore,
      },
    });
  }

  // `/tantangan/jurnal` dan `/tantangan/jurnal/...` dicek SEBELUM pola
  // `/tantangan/:challengeId` supaya 'jurnal' tidak tertangkap sebagai id.
  // `/jurnal/status` juga dicek sebelum `/jurnal/:challengeId` supaya 'status'
  // tidak dianggap id tantangan.
  if (httpMethod === 'GET' && path === '/tantangan/jurnal') {
    const date = query.date ?? toIsoDateOnly(new Date());
    const challenges = activeTantanganForJurnal();
    const recommendedId = recommendedTantanganId(challenges, date);

    return ok({
      success: true,
      message: '',
      data: {
        status: tantanganDayStatus(date),
        items: challenges.map(challenge =>
          toTantanganJurnalItem(challenge, date, challenge.id === recommendedId),
        ),
      },
    });
  }

  if (httpMethod === 'PUT' && path === '/tantangan/jurnal/status') {
    const date = String(requestBody.date ?? '');
    if (!date) {
      return ok({success: false, message: 'Tanggal wajib diisi', data: null});
    }
    const next: TantanganDayStatus = {
      date,
      isFasting: requestBody.isFasting === true,
      isExcused: requestBody.isExcused === true,
    };
    mockTantanganDayStatuses[date] = next;

    return ok({success: true, message: 'Status hari tersimpan', data: next});
  }

  const tantanganJurnalCheckMatch = path.match(
    /^\/tantangan\/jurnal\/([^/]+)$/,
  );
  if (httpMethod === 'POST' && tantanganJurnalCheckMatch) {
    const challenge = mockTantanganList.find(
      item => item.id === tantanganJurnalCheckMatch[1],
    );
    if (!challenge) {
      return ok({success: false, message: TANTANGAN_NOT_FOUND, data: null});
    }
    if (!challenge.isJoined) {
      return ok({
        success: false,
        message: 'Kamu belum mengikuti tantangan ini',
        data: null,
      });
    }
    // Tantangan bacaan progresnya milik domain Quran — client memang tidak
    // pernah mengirim POST untuk baris ini, ini pengaman lapis kedua.
    if (challenge.action.type === 'quran') {
      return ok({
        success: false,
        message: 'Progres tantangan ini dicatat dari menu Quran',
        data: null,
      });
    }

    const date = String(requestBody.date ?? toIsoDateOnly(new Date()));
    const today = toIsoDateOnly(new Date());
    if (date > today) {
      return ok({
        success: false,
        message: 'Belum bisa mencatat untuk tanggal yang belum tiba',
        data: null,
      });
    }

    const rawValue = requestBody.value;
    const value = typeof rawValue === 'number' ? rawValue : null;
    if (value != null && value < 0) {
      return ok({
        success: false,
        message: 'Periksa kembali isian kamu',
        data: {value: 'Nilai tidak boleh negatif'},
      });
    }

    const existingIndex = mockTantanganJurnalEntries.findIndex(
      entry => entry.challengeId === challenge.id && entry.date === date,
    );
    if (existingIndex >= 0) {
      const existing = mockTantanganJurnalEntries[existingIndex];
      if (value == null) {
        // Pencatatan biner: tekan sekali lagi berarti membatalkan.
        mockTantanganJurnalEntries.splice(existingIndex, 1);
        challenge.doneValue = Math.max(0, challenge.doneValue - 1);
      } else {
        // Pencatatan bernilai: nilainya diganti, selisihnya masuk ke total.
        challenge.doneValue = Math.max(
          0,
          challenge.doneValue - (existing?.value ?? 0) + value,
        );
        mockTantanganJurnalEntries[existingIndex] = {
          challengeId: challenge.id,
          date,
          value,
        };
      }
    } else {
      mockTantanganJurnalEntries.push({challengeId: challenge.id, date, value});
      challenge.doneValue += value ?? 1;
    }
    challenge.progressLabel = challenge.unit
      ? `${challenge.doneValue} ${challenge.unit}`
      : null;

    const challenges = activeTantanganForJurnal();
    const recommendedId = recommendedTantanganId(challenges, date);

    return ok({
      success: true,
      message: '',
      data: {
        item: toTantanganJurnalItem(
          challenge,
          date,
          challenge.id === recommendedId,
        ),
        progressPercentage: tantanganPercentage(challenge),
      },
    });
  }

  const tantanganInviteMatch = path.match(/^\/tantangan\/([^/]+)\/invite$/);
  if (httpMethod === 'GET' && tantanganInviteMatch) {
    const challenge = mockTantanganList.find(
      item => item.id === tantanganInviteMatch[1],
    );
    if (!challenge) {
      return ok({success: false, message: TANTANGAN_NOT_FOUND, data: null});
    }
    // Tantangan personal tidak untuk diikuti orang lain — item menu "Ajak
    // Teman" memang tidak pernah muncul di sana, ini pengaman lapis kedua
    // kalau route-nya dipanggil langsung.
    if (challenge.mode !== 'group') {
      return ok({
        success: false,
        message: 'Tantangan personal tidak bisa dibagikan undangannya',
        data: null,
      });
    }

    return ok({
      success: true,
      message: '',
      data: {
        // Tautan dirakit server, bukan client — perubahan formatnya tidak
        // boleh menuntut rilis app baru.
        inviteUrl: `https://aksiberbagi.com/t/${challenge.inviteCode}`,
        inviteCode: challenge.inviteCode,
      },
    });
  }

  const tantanganJoinMatch = path.match(/^\/tantangan\/([^/]+)\/join$/);
  if (httpMethod === 'POST' && tantanganJoinMatch) {
    const challenge = mockTantanganList.find(
      item => item.id === tantanganJoinMatch[1],
    );
    if (!challenge) {
      return ok({success: false, message: TANTANGAN_NOT_FOUND, data: null});
    }
    // Server tetap menolak walau tombolnya sudah disabled — jam perangkat bisa
    // salah atau sengaja diubah, jadi UI bukan satu-satunya pengaman.
    if (tantanganStatus(challenge) === 'ended') {
      return ok({
        success: false,
        message: 'Tantangan ini sudah berakhir',
        data: null,
      });
    }
    if (challenge.isJoined) {
      return ok({
        success: false,
        message: 'Kamu sudah mengikuti tantangan ini',
        data: null,
      });
    }

    challenge.isJoined = true;
    challenge.participantCount += 1;
    const board = mockTantanganLeaderboard[challenge.id] ?? [];
    if (!board.some(entry => entry.id === MOCK_TANTANGAN_ME_ID)) {
      board.push({
        id: MOCK_TANTANGAN_ME_ID,
        name: 'Rizky',
        avatarUrl: null,
        contributionValue: 0,
        lastActivityLabel: null,
      });
    }
    mockTantanganLeaderboard[challenge.id] = board;

    return ok({
      success: true,
      message: 'Kamu bergabung di tantangan ini',
      data: toTantanganDetail(challenge),
    });
  }

  const tantanganLeaveMatch = path.match(/^\/tantangan\/([^/]+)\/leave$/);
  if (httpMethod === 'POST' && tantanganLeaveMatch) {
    const challenge = mockTantanganList.find(
      item => item.id === tantanganLeaveMatch[1],
    );
    if (!challenge) {
      return ok({success: false, message: TANTANGAN_NOT_FOUND, data: null});
    }
    if (!challenge.isJoined) {
      return ok({
        success: false,
        message: 'Kamu belum mengikuti tantangan ini',
        data: null,
      });
    }
    // Pembuat tidak bisa keluar dari tantangannya sendiri — itemnya memang
    // disembunyikan di menu, ini pengaman lapis kedua.
    if (challenge.isCreator) {
      return ok({
        success: false,
        message: 'Pembuat tantangan tidak bisa keluar dari tantangannya',
        data: null,
      });
    }

    challenge.isJoined = false;
    challenge.participantCount = Math.max(0, challenge.participantCount - 1);
    mockTantanganLeaderboard[challenge.id] = (
      mockTantanganLeaderboard[challenge.id] ?? []
    ).filter(entry => entry.id !== MOCK_TANTANGAN_ME_ID);

    return ok({
      success: true,
      message: 'Kamu keluar dari tantangan ini',
      data: {challengeId: challenge.id},
    });
  }

  const tantanganUpdateMatch = path.match(/^\/tantangan\/([^/]+)$/);
  if (httpMethod === 'PUT' && tantanganUpdateMatch) {
    const challenge = mockTantanganList.find(
      item => item.id === tantanganUpdateMatch[1],
    );
    if (!challenge) {
      return ok({success: false, message: TANTANGAN_NOT_FOUND, data: null});
    }
    // Pengaman lapis kedua: tombol "Ubah Tantangan" memang tidak pernah muncul
    // untuk yang bukan pembuatnya.
    if (!challenge.isCreator) {
      return ok({
        success: false,
        message: 'Hanya pembuat tantangan yang bisa mengubahnya',
        data: null,
      });
    }

    const errors = validateTantanganPayload(requestBody);
    if (errors) {
      return ok({
        success: false,
        message: 'Periksa kembali isian kamu',
        data: errors,
      });
    }

    const mode = requestBody.mode === 'group' ? 'group' : ('personal' as TantanganMode);
    const unit = String(requestBody.unit ?? '').trim() || null;
    challenge.name = String(requestBody.name).trim();
    challenge.categorySlug = String(requestBody.categorySlug);
    // Mode dikunci di client saat sudah ada peserta lain; server menahannya
    // juga supaya papan kebaikan tidak hilang lewat request langsung.
    challenge.mode = challenge.participantCount > 1 ? challenge.mode : mode;
    challenge.durationDays = Number(requestBody.durationDays);
    challenge.unit = unit;
    challenge.progressLabel = unit ? `${challenge.doneValue} ${unit}` : null;
    challenge.dailyTargetText =
      String(requestBody.dailyTargetText ?? '').trim() || null;
    challenge.description = challenge.dailyTargetText ?? challenge.description;
    challenge.isPublic =
      challenge.mode === 'group' ? Boolean(requestBody.isPublic) : false;

    return ok({
      success: true,
      message: 'Perubahan tersimpan',
      data: toTantanganDetail(challenge),
    });
  }

  const tantanganDetailMatch = path.match(/^\/tantangan\/([^/]+)$/);
  if (httpMethod === 'GET' && tantanganDetailMatch) {
    const challenge = mockTantanganList.find(
      item => item.id === tantanganDetailMatch[1],
    );
    if (!challenge) {
      return ok({success: false, message: TANTANGAN_NOT_FOUND, data: null});
    }
    return ok({
      success: true,
      message: '',
      data: toTantanganDetail(challenge),
    });
  }

  // --- Amalan Harian ---------------------------------------------------------
  //
  // Kembaran dari blok yang sama di json-server/middleware.js — dua sumber mock
  // ini WAJIB memberi hasil yang sama. Lihat docs/08-features/amalan/README.md.
  //
  // `/amalan/presets` dan `/amalan/summary` sengaja dicek sebelum pola
  // `/amalan/:amalanId` supaya keduanya tidak tertangkap sebagai id amalan.
  if (httpMethod === 'GET' && path === '/recurring-donations') {
    // Urutan ditetapkan server: AKTIF dulu lalu JEDA, masing-masing yang
    // terbaru di atas. Klien tidak mengurutkan ulang.
    const sorted = [...mockRecurringDonations].sort((a, b) => {
      const byStatus =
        RECURRING_STATUS_ORDER[a.status] - RECURRING_STATUS_ORDER[b.status];
      return byStatus !== 0 ? byStatus : b.startDate.localeCompare(a.startDate);
    });
    return ok({
      success: true,
      message: 'Berhasil mengambil donasi rutin',
      data: sorted.map(toRecurringDonation),
    });
  }

  // /pause dan /resume dicek SEBELUM pola /:id, supaya "pause" tidak pernah
  // dianggap sebagai id rutinitas. Alasan yang sama sudah dicatat untuk
  // /doa/banners di file ini.
  const recurringPauseMatch = path.match(/^\/recurring-donations\/([^/]+)\/pause$/);
  if (httpMethod === 'PATCH' && recurringPauseMatch) {
    const recurringId = decodeURIComponent(recurringPauseMatch[1] ?? '');
    const donation = mockRecurringDonations.find(item => item.id === recurringId);
    if (!donation) {
      return ok(RECURRING_NOT_FOUND);
    }
    donation.status = 'JEDA';
    return ok({
      success: true,
      message: 'Donasi rutin dijeda',
      data: toRecurringDonation(donation),
    });
  }

  const recurringResumeMatch = path.match(/^\/recurring-donations\/([^/]+)\/resume$/);
  if (httpMethod === 'PATCH' && recurringResumeMatch) {
    const recurringId = decodeURIComponent(recurringResumeMatch[1] ?? '');
    const donation = mockRecurringDonations.find(item => item.id === recurringId);
    if (!donation) {
      return ok(RECURRING_NOT_FOUND);
    }
    donation.status = 'AKTIF';
    return ok({
      success: true,
      message: 'Donasi rutin diaktifkan kembali',
      data: toRecurringDonation(donation),
    });
  }

  const recurringDetailMatch = path.match(/^\/recurring-donations\/([^/]+)$/);
  if (httpMethod === 'GET' && recurringDetailMatch) {
    const recurringId = decodeURIComponent(recurringDetailMatch[1] ?? '');
    const donation = mockRecurringDonations.find(item => item.id === recurringId);
    if (!donation) {
      return ok(RECURRING_NOT_FOUND);
    }
    return ok({
      success: true,
      message: 'Berhasil mengambil detail donasi rutin',
      data: {
        ...donation,
        history: [...donation.history].sort((a, b) =>
          b.executedAt.localeCompare(a.executedAt),
        ),
      },
    });
  }

  if (httpMethod === 'PUT' && recurringDetailMatch) {
    const recurringId = decodeURIComponent(recurringDetailMatch[1] ?? '');
    const donation = mockRecurringDonations.find(item => item.id === recurringId);
    if (!donation) {
      return ok(RECURRING_NOT_FOUND);
    }
    const invalid = validateRecurringBody(requestBody);
    if (invalid) {
      return ok(invalid);
    }
    donation.amount = Number(requestBody.amount);
    donation.frequency = String(
      requestBody.frequency,
    ) as RecurringDonation['frequency'];
    donation.scheduleTime = String(requestBody.scheduleTime);
    // Harian tidak punya hari/tanggal — nilai lama dibuang supaya tidak ikut
    // terbawa kalau frekuensinya diganti lagi nanti.
    if (donation.frequency === 'daily') {
      delete donation.scheduleDay;
    } else {
      donation.scheduleDay = Number(requestBody.scheduleDay);
    }
    return ok({
      success: true,
      message: 'Rutinitas berhasil diperbarui',
      data: toRecurringDonation(donation),
    });
  }

  if (httpMethod === 'DELETE' && recurringDetailMatch) {
    const recurringId = decodeURIComponent(recurringDetailMatch[1] ?? '');
    const index = mockRecurringDonations.findIndex(item => item.id === recurringId);
    if (index === -1) {
      return ok(RECURRING_NOT_FOUND);
    }
    mockRecurringDonations.splice(index, 1);
    return ok({success: true, message: 'Donasi rutin dihentikan', data: null});
  }

  if (httpMethod === 'GET' && path === '/amalan/presets') {
    return ok({success: true, message: '', data: mockAmalanPresets});
  }

  if (httpMethod === 'GET' && path === '/amalan/summary') {
    const start = query.start ?? toIsoDateOnly(new Date());
    const end = query.end ?? toIsoDateOnly(new Date());
    const days: AmalanSummary[] = [];
    // Batas 31 iterasi supaya rentang yang salah kirim tidak jadi loop tak
    // berujung di dalam mock.
    for (
      let cursor = start, guard = 0;
      cursor <= end && guard < 31;
      cursor = shiftIsoDate(cursor, 1), guard += 1
    ) {
      days.push(summarizeAmalan(cursor));
    }
    return ok({success: true, message: '', data: days});
  }

  if (httpMethod === 'GET' && path === '/amalan') {
    const date = query.date ?? toIsoDateOnly(new Date());
    const items = mockAmalanList
      .filter(item => item.date === date)
      // "HH:mm" bisa dibandingkan sebagai string — tidak perlu parsing tanggal.
      .sort((a, b) => a.time.localeCompare(b.time));
    return ok({
      success: true,
      message: 'Berhasil mengambil amalan hari ini',
      data: {summary: summarizeAmalan(date), items},
    });
  }

  if (httpMethod === 'POST' && path === '/amalan') {
    const invalid = validateAmalanBody(requestBody);
    if (invalid) {
      return ok(invalid);
    }
    const presetSlug = String(requestBody.presetSlug ?? '');
    const preset = mockAmalanPresets.find(item => item.slug === presetSlug);
    const amalan: Amalan = {
      id: nextAmalanId(),
      date: String(requestBody.date ?? toIsoDateOnly(new Date())),
      presetSlug,
      // Label ditetapkan di sini, bukan dikirim client — supaya catatan tidak
      // pernah menyimpan label di luar daftar preset.
      title: preset?.label ?? presetSlug,
      time: String(requestBody.time ?? ''),
      note: normalizeAmalanNote(requestBody.note),
      isCompleted: false,
      reminderEnabled: Boolean(requestBody.reminderEnabled),
    };
    mockAmalanList.push(amalan);
    return ok({success: true, message: 'Amalan berhasil dicatat', data: amalan});
  }

  const amalanCompleteMatch = path.match(/^\/amalan\/([^/]+)\/complete$/);
  if (httpMethod === 'POST' && amalanCompleteMatch) {
    const amalanId = decodeURIComponent(amalanCompleteMatch[1] ?? '');
    const amalan = mockAmalanList.find(item => item.id === amalanId);
    if (!amalan) {
      return ok({success: false, message: 'Amalan tidak ditemukan', data: null});
    }
    amalan.isCompleted = !amalan.isCompleted;
    return ok({
      success: true,
      message: amalan.isCompleted
        ? 'Amalan ditandai selesai'
        : 'Tanda selesai dibatalkan',
      // Ringkasan ikut dikirim supaya ring persentase bisa disinkronkan tanpa
      // refetch daftar.
      data: {item: amalan, summary: summarizeAmalan(amalan.date)},
    });
  }

  const amalanUpdateMatch = path.match(/^\/amalan\/([^/]+)$/);
  if (httpMethod === 'PUT' && amalanUpdateMatch) {
    const amalanId = decodeURIComponent(amalanUpdateMatch[1] ?? '');
    const amalan = mockAmalanList.find(item => item.id === amalanId);
    if (!amalan) {
      return ok({success: false, message: 'Amalan tidak ditemukan', data: null});
    }
    // Validasi sama persis dengan POST — kalau berbeda, satu jalur akan
    // meloloskan data yang ditolak jalur lain.
    const invalid = validateAmalanBody(requestBody);
    if (invalid) {
      return ok(invalid);
    }
    const presetSlug = String(requestBody.presetSlug ?? '');
    const preset = mockAmalanPresets.find(item => item.slug === presetSlug);
    amalan.presetSlug = presetSlug;
    amalan.title = preset?.label ?? presetSlug;
    amalan.time = String(requestBody.time ?? '');
    amalan.note = normalizeAmalanNote(requestBody.note);
    amalan.reminderEnabled = Boolean(requestBody.reminderEnabled);
    // isCompleted sengaja tidak disentuh: mengubah jam sebuah amalan tidak
    // boleh membatalkan tanda selesainya.
    return ok({
      success: true,
      message: 'Amalan berhasil diperbarui',
      data: amalan,
    });
  }

  const amalanDeleteMatch = path.match(/^\/amalan\/([^/]+)$/);
  if (httpMethod === 'DELETE' && amalanDeleteMatch) {
    const amalanId = decodeURIComponent(amalanDeleteMatch[1] ?? '');
    const index = mockAmalanList.findIndex(item => item.id === amalanId);
    if (index < 0) {
      return ok({success: false, message: 'Amalan tidak ditemukan', data: null});
    }
    mockAmalanList.splice(index, 1);
    return ok({success: true, message: 'Amalan dihapus', data: null});
  }

  // Tema donasi aktif: satu objek, bukan koleksi. Belum ada tema = data null
  // dengan success true, sama seperti /event.
  if (httpMethod === 'GET' && path === '/themes/active') {
    return ok({success: true, message: '', data: themeFixture});
  }

  // Menu Event: satu objek, bukan koleksi. Tidak ada event yang sedang dibuka
  // dikembalikan sebagai data null dengan success true — bukan success false,
  // supaya tidak memicu toast error untuk keadaan yang sah.
  if (httpMethod === 'GET' && path === '/event') {
    return ok({success: true, message: '', data: eventFixture});
  }

  // --- Jejak Kebaikan ------------------------------------------------------
  //
  // Baca-saja, tidak ada mutasi — karena itu TIDAK ada clone di mockState.ts,
  // beda dari donasi rutin dan amalan. Lihat
  // docs/08-features/jejak-kebaikan/jejak-kebaikan-mock.md.
  if (httpMethod === 'GET' && path === '/impact-map') {
    return ok({
      success: true,
      message: 'Berhasil mengambil peta sebaran manfaat',
      data: buildImpactMap(),
    });
  }

  if (httpMethod === 'GET' && path === '/distribution-reports') {
    return ok({
      success: true,
      message: 'Berhasil mengambil laporan penyaluran',
      data: buildDistributionReport(query.period),
    });
  }

  if (httpMethod === 'GET' && path === '/reflections') {
    const page = parseInt(query.page ?? '1', 10) || 1;
    const search = (query.search ?? '').trim().toLowerCase();

    const filtered = search
      ? mockReflections.filter(item =>
          item.title.toLowerCase().includes(search),
        )
      : mockReflections;
    // Selalu terbaru di atas — menu Renungan tidak punya opsi sort.
    const sorted = [...filtered].sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt),
    );
    const start = (page - 1) * REFLECTION_PAGE_SIZE;
    const items = sorted.slice(start, start + REFLECTION_PAGE_SIZE);
    const hasMore = start + items.length < sorted.length;

    return ok({
      success: true,
      message: 'Berhasil mengambil daftar renungan',
      data: {items, hasMore},
    });
  }

  const reflectionDetailMatch = path.match(/^\/reflections\/([^/]+)$/);
  if (httpMethod === 'GET' && reflectionDetailMatch) {
    const reflectionId = decodeURIComponent(reflectionDetailMatch[1] ?? '');
    const reflection = mockReflections.find(item => item.id === reflectionId);
    if (!reflection) {
      return ok({
        success: false,
        message: 'Renungan tidak ditemukan',
        data: null,
      });
    }
    return ok({success: true, message: '', data: reflection});
  }

  if (httpMethod === 'GET' && path === '/pages/program-categories') {
    return ok({
      success: true,
      message: 'berhasil get categories',
      data: programDataFixture.categories,
      program_list: programDataFixture.list,
    });
  }

  if (httpMethod === 'GET' && path === '/quran/challenges/highlight') {
    const catalog = quranFixture.challengeCatalog as QuranChallengeFixture[];
    // Sudah ikut challenge -> tampilkan yang diikuti. Belum ikut sama sekali
    // -> 3 challenge utama yang masih berjalan, dengan isJoined: false.
    const joined = catalog.filter(challenge =>
      joinedChallenges.has(challenge.id),
    );
    const source =
      joined.length > 0
        ? joined
        : catalog.filter(challenge => challenge.endDayOffset >= 0).slice(0, 3);
    return ok({
      success: true,
      message: 'Data retrieved successfully',
      data: source.map(buildChallengeSummary),
    });
  }

  const challengeProgressMatch = path.match(
    /^\/quran\/challenges\/([^/]+)\/progress$/,
  );
  if (httpMethod === 'GET' && challengeProgressMatch) {
    const fixture = (
      quranFixture.challengeCatalog as QuranChallengeFixture[]
    ).find(challenge => challenge.id === challengeProgressMatch[1]);
    if (!fixture) {
      return ok({
        success: false,
        message: 'Challenge tidak ditemukan',
        data: null,
      });
    }
    const progress = computeChallengeProgress(fixture);
    return ok({
      success: true,
      message: 'Data retrieved successfully',
      data: {
        challengeId: fixture.id,
        name: fixture.name,
        startDate: toDateOnly(
          startOfToday() + fixture.startDayOffset * DAY_IN_MS,
        ),
        endDate: toDateOnly(startOfToday() + fixture.endDayOffset * DAY_IN_MS),
        // Tidak pernah negatif: challenge yang sudah lewat sisa harinya 0.
        remainingDays: Math.max(0, fixture.endDayOffset),
        isEnded: fixture.endDayOffset < 0,
        completedSurahCount: progress.completedSurahCount,
        totalSurahCount: progress.totalSurahCount,
        percentage: progress.percentage,
        surahs: progress.surahs,
      },
    });
  }

  const challengeLeaveMatch = path.match(
    /^\/quran\/challenges\/([^/]+)\/leave$/,
  );
  if (httpMethod === 'POST' && challengeLeaveMatch) {
    const challengeId = challengeLeaveMatch[1] ?? '';
    if (!joinedChallenges.has(challengeId)) {
      return ok({
        success: false,
        message: 'Kamu tidak sedang mengikuti challenge ini',
        data: null,
      });
    }
    // Keluar challenge hanya mencabut keikutsertaan. Progres membaca ada di
    // surahHistory dan sengaja tidak disentuh.
    joinedChallenges.delete(challengeId);
    return ok({
      success: true,
      message: 'Kamu keluar dari challenge',
      data: {challengeId},
    });
  }

  const challengeJoinMatch = path.match(/^\/quran\/challenges\/([^/]+)\/join$/);
  if (httpMethod === 'POST' && challengeJoinMatch) {
    const challengeId = challengeJoinMatch[1] ?? '';
    const fixture = (
      quranFixture.challengeCatalog as QuranChallengeFixture[]
    ).find(challenge => challenge.id === challengeId);
    if (!fixture) {
      return ok({
        success: false,
        message: 'Challenge tidak ditemukan',
        data: null,
      });
    }
    if (fixture.endDayOffset < 0) {
      return ok({
        success: false,
        message: 'Challenge ini sudah berakhir',
        data: null,
      });
    }
    joinedChallenges.add(challengeId);
    return ok({
      success: true,
      message: 'Kamu bergabung di challenge ini',
      data: {challengeId, joinedAt: new Date().toISOString()},
    });
  }

  const challengeDetailMatch = path.match(/^\/quran\/challenges\/([^/]+)$/);
  if (httpMethod === 'GET' && challengeDetailMatch) {
    const fixture = (
      quranFixture.challengeCatalog as QuranChallengeFixture[]
    ).find(challenge => challenge.id === challengeDetailMatch[1]);
    if (!fixture) {
      return ok({
        success: false,
        message: 'Challenge tidak ditemukan',
        data: null,
      });
    }
    return ok({
      success: true,
      message: 'Data retrieved successfully',
      data: buildChallenge(fixture),
    });
  }

  if (httpMethod === 'GET' && path === '/quran/reading-history') {
    const limit = parseLimit(query.limit, 5);
    if (query.type === 'juz') {
      // Yang pernah dibaca di atas (terbaru dulu), sisanya urut nomor juz.
      // Dengan begitu limit kecil dari Beranda menghasilkan "juz terakhir
      // dibaca", sementara tab Progres mengambil semuanya.
      const juzProgress = computeJuzProgress().sort((a, b) => {
        if (a.updatedAt && b.updatedAt) {
          return b.updatedAt.localeCompare(a.updatedAt);
        }
        if (a.updatedAt) {
          return -1;
        }
        if (b.updatedAt) {
          return 1;
        }
        return a.juzNumber - b.juzNumber;
      });
      return ok({
        success: true,
        message: 'Data retrieved successfully',
        data: juzProgress.slice(0, limit),
      });
    }
    return ok({
      success: true,
      message: 'Data retrieved successfully',
      data: readingHistory.slice(0, limit).map(item => ({
        ...item,
        ...surahNamesOf(item.surahNumber),
      })),
    });
  }

  if (httpMethod === 'DELETE' && path === '/quran/progress') {
    // Yang dihapus hanya riwayat bacaan. Surah tersimpan, jadwal, dan
    // keikutsertaan challenge disimpan terpisah dan sengaja tidak disentuh —
    // progres challenge ikut nol karena turunan riwayat, bukan karena
    // keanggotaannya dicabut.
    readingHistory.length = 0;
    return ok({
      success: true,
      message: 'Progres bacaan direset',
      data: null,
    });
  }

  if (httpMethod === 'GET' && path === '/quran/progress/summary') {
    const history = readingHistory;
    const juzProgress = computeJuzProgress();
    const schedules = scheduleRecords.map(buildSchedule) as {status: string}[];
    return ok({
      success: true,
      message: 'Data retrieved successfully',
      data: {
        completedSurahCount: history.filter(item => item.isCompleted).length,
        completedJuzCount: juzProgress.filter(juz => juz.percentage >= 100)
          .length,
        savedSurahCount: bookmarkedSurahs.size,
        activeScheduleCount: schedules.filter(
          schedule => schedule.status !== 'SELESAI',
        ).length,
      },
    });
  }

  if (httpMethod === 'GET' && path === '/quran/bookmarks' && query.surahNumber) {
    const surahNumber = Number(query.surahNumber);
    return ok({
      success: true,
      message: 'Data retrieved successfully',
      data: {surahNumber, isSaved: bookmarkedSurahs.has(surahNumber)},
    });
  }

  if (httpMethod === 'GET' && path === '/quran/bookmarks') {
    const limit = parseLimit(query.limit, 5);
    const fixtureBySurah = new Map(
      quranFixture.bookmarks.map(bookmark => [bookmark.surahNumber, bookmark]),
    );
    // Surah yang baru disimpan lewat POST belum ada di fixture, jadi entrinya
    // dibangun dari metadata surah supaya langsung muncul di daftar Disimpan.
    const saved = [...bookmarkedSurahs]
      .map(surahNumber => {
        const meta = (surahsFixture as SurahMetaFixture[]).find(
          surah => surah.number === surahNumber,
        );
        if (!meta) {
          return null;
        }
        const existing = fixtureBySurah.get(surahNumber);
        return {
          surahNumber,
          ...surahNamesOf(surahNumber),
          totalAyah: meta.totalAyah,
          savedAt: existing?.savedAt ?? new Date().toISOString(),
        };
      })
      .filter((bookmark): bookmark is NonNullable<typeof bookmark> =>
        Boolean(bookmark),
      )
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt));

    return ok({
      success: true,
      message: 'Data retrieved successfully',
      data: saved.slice(0, limit),
    });
  }

  if (httpMethod === 'POST' && path === '/quran/bookmarks') {
    const surahNumber = Number(requestBody.surahNumber);
    if (!Number.isFinite(surahNumber) || surahNumber < 1 || surahNumber > 114) {
      return ok({
        success: false,
        message: 'Surah tidak valid',
        data: {surahNumber: 'Nomor surah tidak dikenali'},
      });
    }
    bookmarkedSurahs.add(surahNumber);
    return ok({
      success: true,
      message: 'Surah disimpan',
      data: {surahNumber, isSaved: true},
    });
  }

  const bookmarkDeleteMatch = path.match(/^\/quran\/bookmarks\/(\d+)$/);
  if (httpMethod === 'DELETE' && bookmarkDeleteMatch) {
    const surahNumber = Number(bookmarkDeleteMatch[1]);
    bookmarkedSurahs.delete(surahNumber);
    return ok({
      success: true,
      message: 'Surah dihapus dari daftar simpan',
      data: {surahNumber, isSaved: false},
    });
  }

  if (httpMethod === 'POST' && path === '/quran/reading-progress') {
    // Progres baca hanya diterima; perhitungan ulang progres challenge dan
    // jadwal jadi urusan backend asli.
    return ok({
      success: true,
      message: 'Progres bacaan tersimpan',
      data: null,
    });
  }

  // Validasi payload jadwal dipakai bersama oleh POST dan PUT. Bentuk
  // errornya mengikuti kontrak API: `data` berisi pesan per field.
  function validateSchedulePayload(): Record<string, string> | null {
    const errors: Record<string, string> = {};
    const date = String(requestBody.date ?? '').slice(0, 10);
    const surahNumber = Number(requestBody.surahNumber);
    const targetAyah = Number(requestBody.targetAyah);
    const repeat = String(requestBody.repeat ?? '');

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.date = 'Tanggal wajib diisi';
    }
    const surahMeta = (surahsFixture as SurahMetaFixture[]).find(
      surah => surah.number === surahNumber,
    );
    if (!surahMeta) {
      errors.surahNumber = 'Pilih surah terlebih dahulu';
    }
    if (!Number.isFinite(targetAyah) || targetAyah < 1) {
      errors.targetAyah = 'Target ayat wajib diisi';
    } else if (surahMeta && targetAyah > surahMeta.totalAyah) {
      errors.targetAyah = `Surah ini hanya punya ${surahMeta.totalAyah} ayat`;
    }
    if (
      !['TIDAK_BERULANG', 'HARIAN', 'MINGGUAN', 'BULANAN'].includes(repeat)
    ) {
      errors.repeat = 'Pengulangan tidak dikenali';
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  if (httpMethod === 'POST' && path === '/quran/schedules') {
    const errors = validateSchedulePayload();
    if (errors) {
      return ok({success: false, message: 'Jadwal gagal disimpan', data: errors});
    }
    scheduleSequence += 1;
    const record: ScheduleRecord = {
      id: `sch-${String(scheduleSequence).padStart(3, '0')}`,
      date: String(requestBody.date).slice(0, 10),
      surahNumber: Number(requestBody.surahNumber),
      targetAyah: Number(requestBody.targetAyah),
      repeat: String(requestBody.repeat),
      createdAt: toDateOnly(startOfToday()),
    };
    scheduleRecords.push(record);
    return ok({
      success: true,
      message: 'Jadwal dibuat',
      data: buildSchedule(record),
    });
  }

  const scheduleUpdateMatch = path.match(/^\/quran\/schedules\/([^/]+)$/);
  if (httpMethod === 'PUT' && scheduleUpdateMatch) {
    const record = scheduleRecords.find(
      schedule => schedule.id === scheduleUpdateMatch[1],
    );
    if (!record) {
      return ok({
        success: false,
        message: 'Jadwal tidak ditemukan',
        data: null,
      });
    }
    const errors = validateSchedulePayload();
    if (errors) {
      return ok({success: false, message: 'Jadwal gagal disimpan', data: errors});
    }
    record.date = String(requestBody.date).slice(0, 10);
    record.surahNumber = Number(requestBody.surahNumber);
    record.targetAyah = Number(requestBody.targetAyah);
    record.repeat = String(requestBody.repeat);
    return ok({
      success: true,
      message: 'Jadwal diperbarui',
      data: buildSchedule(record),
    });
  }

  const scheduleDetailMatch = path.match(/^\/quran\/schedules\/([^/]+)$/);
  if (httpMethod === 'GET' && scheduleDetailMatch) {
    const record = scheduleRecords.find(
      schedule => schedule.id === scheduleDetailMatch[1],
    );
    if (!record) {
      return ok({
        success: false,
        message: 'Jadwal tidak ditemukan',
        data: null,
      });
    }
    return ok({
      success: true,
      message: 'Data retrieved successfully',
      data: buildSchedule(record),
    });
  }

  const scheduleDeleteMatch = path.match(/^\/quran\/schedules\/([^/]+)$/);
  if (httpMethod === 'DELETE' && scheduleDeleteMatch) {
    const scheduleId = scheduleDeleteMatch[1] ?? '';
    const index = scheduleRecords.findIndex(
      schedule => schedule.id === scheduleId,
    );
    if (index === -1) {
      return ok({
        success: false,
        message: 'Jadwal tidak ditemukan',
        data: null,
      });
    }
    scheduleRecords.splice(index, 1);
    return ok({
      success: true,
      message: 'Jadwal dihapus',
      data: {id: scheduleId},
    });
  }

  if (httpMethod === 'GET' && path === '/quran/schedules') {
    const limit = parseLimit(query.limit, 6);
    const schedules = scheduleRecords
      .map(buildSchedule)
      .sort((a, b) => {
        const first = a as {status: string; date: string};
        const second = b as {status: string; date: string};
        const statusDiff =
          (SCHEDULE_STATUS_ORDER[first.status] ?? 9) -
          (SCHEDULE_STATUS_ORDER[second.status] ?? 9);
        if (statusDiff !== 0) {
          return statusDiff;
        }
        return second.date.localeCompare(first.date);
      });
    return ok({
      success: true,
      message: 'Data retrieved successfully',
      data: schedules.slice(0, limit),
    });
  }

  if (httpMethod === 'GET' && path === '/quran/location') {
    return ok({
      success: true,
      message: 'Data retrieved successfully',
      data: {city: resolveCity(Number(query.lat), Number(query.lng))},
    });
  }

  if (httpMethod === 'GET' && path === '/pages/home') {
    return ok({
      success: true,
      message: 'Data retrieved successfully',
      data: {
        ...homeFixture,
        program_category: programDataFixture.categories,
        program_list: programDataFixture.list,
      },
    });
  }

  return {
    status: 404,
    data: {
      success: false,
      message: `Mock endpoint not found: ${httpMethod} ${path}`,
      data: null,
    },
  };
}
