import type {Amalan, AmalanPreset} from '@/types/amalan';
import type {
  DonasiBersamaBatch,
  DonasiBersamaContribution,
  DonasiBersamaDetail,
  DonasiBersamaMember,
} from '@/types/donasiBersama';
import type {Notification} from '@/types/notification';
import type {
  RecurringDonation,
  RecurringDonationDetail,
  RecurringDonationHistoryEntry,
} from '@/types/recurringDonation';
import type {ArticleDetail} from '@/types/news';
import type {Doa} from '@/types/doa';
import type {ReflectionDetail} from '@/types/reflection';
import type {
  TantanganCategory,
  TantanganDayStatus,
  TantanganDetail,
} from '@/types/tantangan';
import type {User} from '@/types/user';
import type {UserSettings} from '@/types/setting';
import {toIsoDateOnly} from '@/utils/formatDate';
import {
  amalanFixture,
  doaFixture,
  donasiBersamaFixture,
  newsFixture,
  notificationsFixture,
  recurringDonationsFixture,
  reflectionsFixture,
  tantanganFixture,
  userFixtures,
} from './fixtures';

// In-memory clones of the seed fixtures. Mutable endpoints (profile update,
// mark-as-read, like/unlike, ...) mutate these instead of the imported JSON
// module, so the bundled fixture files never get written to at runtime.
export const mockUser: User = {...userFixtures.me};

// Preferensi akun disimpan mutable supaya PATCH parsial (satu toggle sekali
// kirim) mengembalikan gambaran utuh, bukan cuma field yang barusan diubah.
export const mockUserSettings: UserSettings = {
  ...(userFixtures.settings as UserSettings),
};

export const mockNotifications: Notification[] = notificationsFixture.map(
  item => ({...item}),
) as unknown as Notification[];

// `news.json` juga punya field `featured` — dipakai routing di mockRouter.ts
// untuk endpoint `?featured=true`, bukan bagian dari tipe `ArticleDetail`
// (client tidak butuh tahu status featured per-item, cuma query param-nya).
export interface MockArticle extends ArticleDetail {
  featured: boolean;
}

export const mockArticles: MockArticle[] = newsFixture.map(item => ({
  ...item,
})) as unknown as MockArticle[];

// Renungan tidak punya endpoint yang memutasi datanya (tidak ada like,
// bookmark, atau progress) — clone di sini semata supaya sumber datanya
// seragam dengan fixture lain, bukan karena ada yang ditulis balik.
export const mockReflections: ReflectionDetail[] = reflectionsFixture.map(
  item => ({...item}),
);

// Relung Doa memutasi datanya (tulis doa, aamiin, favorit, lapor), jadi clone
// ini yang dipakai handler — file fixture-nya tidak pernah ditulis balik.
// Konsekuensinya perubahan hilang saat app di-restart; itu memang perilaku
// mock yang diterima. Lihat docs/08-features/doa/README.md.
export const mockDoaList: Doa[] = doaFixture.map(item => ({
  ...item,
  author: {...item.author},
})) as Doa[];

// Amalan Harian memutasi datanya (tambah, ubah, toggle selesai, hapus), jadi
// clone ini yang dipakai handler — file fixture-nya tidak pernah ditulis balik.
//
// Fixture menyimpan `dayOffset` (0 = hari ini, -1 = kemarin), bukan tanggal
// absolut: seed bertanggal tetap akan tampak kosong beberapa hari setelah
// ditulis dan membuat menu terlihat rusak padahal datanya benar. Offset diubah
// jadi tanggal sekali di sini, saat modul dimuat.
// Lihat docs/08-features/amalan/README.md.
interface AmalanSeed extends Omit<Amalan, 'date'> {
  dayOffset: number;
}

function amalanDateFromOffset(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return toIsoDateOnly(date);
}

export const mockAmalanList: Amalan[] = (
  amalanFixture.items as unknown as AmalanSeed[]
).map(({dayOffset, ...rest}) => ({
  ...rest,
  date: amalanDateFromOffset(dayOffset),
}));

export const mockAmalanPresets: AmalanPreset[] =
  amalanFixture.presets as AmalanPreset[];

// Date.now() saja tidak cukup: dua amalan yang ditambahkan dalam milidetik yang
// sama akan berbagi id dan membuat keyExtractor FlatList bentrok.
let amalanSequence = 0;
export function nextAmalanId(): string {
  amalanSequence += 1;
  return `amalan-${Date.now()}-${amalanSequence}`;
}

// Menu Donasi Bersama memutasi datanya (buat grup, gabung, keluar, urun), jadi
// clone ini yang dipakai handler — file fixture-nya tidak pernah ditulis balik.
//
// Fixture menyimpan `deadlineOffsetDays` dan `createdAtOffsetDays` (relatif hari
// ini), bukan tanggal absolut — pola yang sama dengan `dayOffset` di amalan.json.
// Tanpa itu seed jadi basi beberapa hari setelah ditulis: semua grup tampak
// sudah berakhir dan chip "Segera Berakhir" selalu kosong.
//
// `daysLeft`, `deadline`, dan `status` TIDAK disimpan di sini — ketiganya
// turunan waktu dan dihitung ulang tiap request di mockRouter, supaya app yang
// dibuka besok tidak menampilkan sisa hari kemarin.
export interface MockDonasiBersamaGroup
  extends Omit<DonasiBersamaDetail, 'daysLeft' | 'deadline' | 'status'> {
  deadlineOffsetDays: number;
  createdAtOffsetDays: number;
  // Stabil per grup — bukan diacak tiap request, supaya QR yang sudah
  // dipindai saat pengujian tidak jadi tidak valid.
  inviteCode: string;
}

export const mockDonasiBersamaGroups: MockDonasiBersamaGroup[] = (
  donasiBersamaFixture.groups as unknown as MockDonasiBersamaGroup[]
).map(item => ({
  ...item,
  memberPreviews: item.memberPreviews.map(preview => ({...preview})),
  reminder: {...item.reminder},
}));

// Riwayat patungan per grup. Waktunya disimpan sebagai offset JAM relatif
// (`createdAtOffsetHours`), bukan timestamp absolut — kalau absolut, "2 jam
// lalu" berubah jadi "3 bulan lalu" beberapa waktu setelah fixture ditulis dan
// daftar terlihat mati. Offset diubah jadi ISO sekali saat modul dimuat.
// `isMine` dan `isAnonymous` adalah field MOCK-ONLY — dipakai handler untuk
// menyaring riwayat milik pengguna sendiri, dan tidak pernah ikut ke response
// riwayat publik. Pola yang sama dengan `featured` di MockArticle.
export interface MockDonasiBersamaContribution
  extends DonasiBersamaContribution {
  isMine: boolean;
  isAnonymous: boolean;
  batchId: string;
  // Penaut ke anggota. Urunan anonim TETAP tertaut — pemiliknya harus
  // terhitung saat menilai boleh-tidaknya anggota itu dikeluarkan, meski
  // urunannya tidak pernah ditampilkan atas namanya.
  memberId: string | null;
}

interface DonasiBersamaContributionSeed
  extends Omit<MockDonasiBersamaContribution, 'createdAt'> {
  createdAtOffsetHours: number;
}

function contributionDateFromOffset(offsetHours: number): string {
  const date = new Date();
  date.setHours(date.getHours() + offsetHours);
  return date.toISOString();
}

export const mockDonasiBersamaContributions: Record<
  string,
  MockDonasiBersamaContribution[]
> = Object.fromEntries(
  Object.entries(
    donasiBersamaFixture.contributions as unknown as Record<
      string,
      DonasiBersamaContributionSeed[]
    >,
  ).map(([groupId, items]) => [
    groupId,
    items.map(({createdAtOffsetHours, ...rest}) => ({
      ...rest,
      createdAt: contributionDateFromOffset(createdAtOffsetHours),
    })),
  ]),
);

// Daftar anggota per grup. Mock hanya menyemai sebagian anggota (maks 23 per
// grup) — `total` di response tetap diambil dari `memberCount` grup supaya
// angka di kartu daftar ("+245") dan di baris judul tidak saling bertentangan.
export type MockDonasiBersamaMember = Omit<
  DonasiBersamaMember,
  'hasContributed'
>;

export const mockDonasiBersamaMembers: Record<
  string,
  MockDonasiBersamaMember[]
> =
  Object.fromEntries(
    Object.entries(
      donasiBersamaFixture.members as unknown as Record<
        string,
        MockDonasiBersamaMember[]
      >,
    ).map(([groupId, items]) => [groupId, items.map(item => ({...item}))]),
  );

// Batch per grup. `collectedAmount` dan `contributionCount` TIDAK disimpan di
// sini — keduanya turunan dari daftar kontribusi, dan menyimpannya berarti dua
// sumber kebenaran yang bisa berbeda. Handler menghitungnya saat menjawab.
interface DonasiBersamaBatchSeed
  extends Omit<
    DonasiBersamaBatch,
    | 'createdAt'
    | 'startedAt'
    | 'collectedAmount'
    | 'contributionCount'
    | 'sequence'
  > {
  createdAtOffsetDays: number;
  startedAtOffsetDays: number | null;
}

// `sequence` ikut dikecualikan: sama seperti collectedAmount, nomornya
// turunan urutan pembuatan dan dihitung saat menjawab — bukan disimpan.
export type MockDonasiBersamaBatch = Omit<
  DonasiBersamaBatch,
  'collectedAmount' | 'contributionCount' | 'sequence'
>;

export const mockDonasiBersamaBatches: Record<
  string,
  MockDonasiBersamaBatch[]
> = Object.fromEntries(
  Object.entries(
    donasiBersamaFixture.batches as unknown as Record<
      string,
      DonasiBersamaBatchSeed[]
    >,
  ).map(([groupId, items]) => [
    groupId,
    items.map(({createdAtOffsetDays, startedAtOffsetDays, ...rest}) => ({
      ...rest,
      createdAt: contributionDateFromOffset(createdAtOffsetDays * 24),
      startedAt:
        startedAtOffsetDays === null
          ? null
          : contributionDateFromOffset(startedAtOffsetDays * 24),
    })),
  ]),
);


// --- Tantangan Amal --------------------------------------------------------
//
// Fixture menyimpan tenggat sebagai OFFSET relatif hari ini
// (`deadlineOffsetDays`), bukan tanggal absolut — pola yang sama dengan
// `deadlineOffsetDays` di donasi-bersama.json dan `dayOffset` di amalan.json.
// Tanpa itu seed jadi basi beberapa hari setelah ditulis: semua tantangan
// tampak sudah berakhir dan tab "Segera Berakhir" selalu kosong.
//
// `daysLeft`, `status`, `startDate`, `endDate`, dan `progressPercentage` TIDAK
// disimpan di sini — semuanya turunan waktu atau turunan doneValue/targetValue,
// dan dihitung ulang tiap request di mockRouter supaya app yang dibuka besok
// tidak menampilkan sisa hari kemarin.
export interface MockTantangan
  extends Omit<
    TantanganDetail,
    'daysLeft' | 'status' | 'startDate' | 'endDate' | 'progressPercentage'
  > {
  deadlineOffsetDays: number;
  createdAtOffsetDays: number;
  // Stabil per tantangan — bukan diacak tiap request, supaya QR undangan yang
  // sudah dipindai saat pengujian tidak jadi tidak valid.
  inviteCode: string;
}

export const mockTantanganList: MockTantangan[] = (
  tantanganFixture.challenges as unknown as MockTantangan[]
).map(item => ({
  ...item,
  participantPreviews: item.participantPreviews.map(preview => ({...preview})),
  action: {...item.action},
}));

export const mockTantanganCategories: TantanganCategory[] = (
  tantanganFixture.categories as TantanganCategory[]
).map(item => ({...item}));

// Papan kebaikan per tantangan. `contributionLabel` dan `isMe` TIDAK disimpan
// di seed — keduanya turunan: label dirakit dari satuan tantangan, dan isMe
// dari id. Menyimpannya berarti seed harus ikut diperbarui tiap satuan diubah.
//
// Baris pengguna sendiri memakai id tetap `usr-me`, dan hanya ada di tantangan
// yang sudah diikuti — join yang menambahkannya, leave yang membuangnya.
export const MOCK_TANTANGAN_ME_ID = 'usr-me';

export interface MockTantanganLeaderboardEntry {
  id: string;
  name: string;
  avatarUrl: string | null;
  contributionValue: number;
  lastActivityLabel: string | null;
}

export const mockTantanganLeaderboard: Record<
  string,
  MockTantanganLeaderboardEntry[]
> = Object.fromEntries(
  Object.entries(
    tantanganFixture.leaderboard as unknown as Record<
      string,
      MockTantanganLeaderboardEntry[]
    >,
  ).map(([challengeId, entries]) => [
    challengeId,
    entries.map(entry => ({...entry})),
  ]),
);


// --- Jurnal Kebaikan -------------------------------------------------------
//
// Pencatatan harian disimpan sebagai daftar entri (challengeId + tanggal),
// bukan flag di dalam tantangan: runtun harus bisa dihitung mundur melintasi
// banyak hari, dan itu mustahil kalau yang tersimpan cuma keadaan hari ini.
//
// Fixture menyimpan `jurnalSeed` berupa BERAPA HARI berturut-turut sudah
// dicatat sampai KEMARIN — bukan tanggal absolut, supaya seed tidak basi.
// Hari ini sengaja dibiarkan kosong supaya barisnya masih bisa dicentang.
export interface MockTantanganJurnalEntry {
  challengeId: string;
  date: string; // ISO date-only
  value: number | null; // null → pencatatan biner
}

function shiftIsoDay(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toIsoDateOnly(date);
}

export const mockTantanganJurnalEntries: MockTantanganJurnalEntry[] =
  Object.entries(
    (tantanganFixture.jurnalSeed ?? {}) as Record<string, number>,
  ).flatMap(([challengeId, streakDays]) => {
    const today = toIsoDateOnly(new Date());
    return Array.from({length: streakDays}, (_unused, index) => ({
      challengeId,
      date: shiftIsoDay(today, -(index + 1)),
      value: null,
    }));
  });

// Status khusus per tanggal. Kosong di awal — pengguna yang menyalakannya.
export const mockTantanganDayStatuses: Record<string, TantanganDayStatus> = {};


// --- Donasi Rutin ----------------------------------------------------------
//
// Donasi Rutin memutasi datanya (ubah nominal/jadwal, jeda, aktifkan,
// hentikan), jadi clone ini yang dipakai handler — file fixture-nya tidak
// pernah ditulis balik. Konsekuensinya perubahan hilang saat app di-restart;
// itu memang perilaku mock yang diterima.
//
// Tanggal disimpan sebagai OFFSET hari relatif hari ini, bukan tanggal
// absolut — pola yang sama dengan `dayOffset` di amalan.json. Fixture
// bertanggal absolut akan basi dan membuat demo menampilkan rutinitas yang
// terakhir jalan berbulan-bulan lalu.
// Lihat docs/08-features/donasi-rutin/donasi-rutin-mock.md.

interface RecurringHistorySeed extends Omit<RecurringDonationHistoryEntry, 'amount' | 'executedAt'> {
  dayOffset: number;
  timeOfDay: string;
}

interface RecurringDonationSeed
  extends Omit<RecurringDonation, 'startDate'> {
  startDayOffset: number;
  history: RecurringHistorySeed[];
}

function recurringDateFromOffset(dayOffset: number, timeOfDay: string): string {
  const [hour, minute] = timeOfDay.split(':').map(Number);
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour ?? 0, minute ?? 0, 0, 0);
  return date.toISOString();
}

// Offset internal (`startDayOffset`, `dayOffset`, `timeOfDay`) DIBUANG di sini,
// jadi tidak mungkin bocor ke response: yang tersimpan sudah bentuk akhirnya.
export const mockRecurringDonations: RecurringDonationDetail[] = (
  recurringDonationsFixture.items as unknown as RecurringDonationSeed[]
).map(({startDayOffset, history, ...rest}) => ({
  ...rest,
  startDate: recurringDateFromOffset(startDayOffset, '00:00'),
  history: history.map(({dayOffset, timeOfDay, ...entry}) => ({
    ...entry,
    amount: rest.amount,
    executedAt: recurringDateFromOffset(dayOffset, timeOfDay),
  })),
}));
