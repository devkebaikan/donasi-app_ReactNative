// Menu Tantangan Amal — target amalan berjangka waktu yang dijalani bersama.
// Nama domain sengaja Bahasa Indonesia (`Tantangan`), mengikuti preseden `Doa`,
// `Renungan`, `Infak`, `Zakat`, dan `DonasiBersama`: terjemahan lurusnya
// (`Challenge`) sudah dipakai habis domain Quran di types/quran.ts, dan dua tipe
// `Challenge` yang cuma bisa dibedakan lewat jalur import mahal saat dibaca.
// Seluruh FIELD di bawah tetap Bahasa Inggris.
//
// Menu ini mengumpulkan AMALAN, bukan uang — tidak pernah menerima pembayaran.
// Lihat docs/08-features/tantangan-amal/README.md.

export type TantanganTab = 'popular' | 'new' | 'ending';

export type TantanganMode = 'personal' | 'group';

// Ditentukan server, client tidak menghitungnya dari tanggal:
// 'active'    → masih berjalan, masih bisa diikuti dan dicatat
// 'completed' → target tercapai, periode belum lewat — MASIH bisa dicatat
// 'ended'     → periode lewat — tidak bisa diikuti dan tidak bisa dicatat
//
// Bentuknya kebetulan sama dengan DonasiBersamaStatus, tapi ditulis sendiri —
// dua domain yang tidak saling bergantung tidak boleh terikat lewat tipe.
export type TantanganStatus = 'active' | 'completed' | 'ended';

// Sebagian tantangan bukan tempat mencatat, melainkan pintu ke fitur lain.
// Union bertag, bukan sepasang id nullable: mustahil berada di 'quran' tanpa
// quranChallengeId, dan TypeScript yang menjaganya.
export type TantanganAction =
  | {type: 'journal'}
  | {type: 'quran'; quranChallengeId: string}
  | {type: 'donation'; programId: string}
  | {type: 'donasiBersama'; groupId: string};

export interface TantanganCategory {
  slug: string;
  label: string;
  // App memetakan slug ini ke komponen Solar Icons lewat map lokal dengan
  // fallback — kategori baru dari server tetap tampil tanpa rilis app.
  iconSlug: string;
}

// Potongan peserta untuk tumpukan avatar di kartu — sengaja bukan profil penuh
// supaya payload list tetap ringan. Bentuknya sengaja sama dengan
// DonasiBersamaMemberPreview supaya bisa dioper ke DonasiBersamaAvatarStack.
export interface TantanganParticipantPreview {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Tantangan {
  id: string;
  name: string;
  description: string; // teks polos, dipotong 2 baris di kartu
  coverImageUrl: string | null;
  categorySlug: string;
  mode: TantanganMode;
  status: TantanganStatus;
  daysLeft: number; // 0 saat status 'ended'
  durationDays: number;
  // null → pencatatan biner (satu centang per hari)
  unit: string | null;
  progressPercentage: number; // 0..100, DIHITUNG SERVER
  // Keterangan progres versi domainnya, mis. "26 Juz".
  // null → kartu hanya menampilkan persentase.
  progressLabel: string | null;
  participantCount: number;
  participantPreviews: TantanganParticipantPreview[];
  isJoined: boolean;
  isPublic: boolean;
}

export interface TantanganDetail extends Tantangan {
  descriptionHtml: string; // dirender HtmlContent
  dailyTargetText: string | null; // "Baca 1 juz" — null → "Kapan saja"
  startDate: string; // ISO date-only "YYYY-MM-DD"
  endDate: string;
  doneValue: number; // 26 pada "26 Juz dari 30 Juz"
  targetValue: number; // 30
  action: TantanganAction;
  isCreator: boolean;
}

export interface TantanganLeaderboardEntry {
  id: string;
  name: string;
  avatarUrl: string | null;
  contributionValue: number;
  contributionLabel: string; // sudah dirakit server: "2 Juz", "1.5 Juz"
  // null → peserta belum pernah mencatat; UI menggantinya dengan ajakan mulai
  lastActivityLabel: string | null; // "2 jam lalu", "Hari ini"
  isMe: boolean;
}

export interface TantanganInvite {
  inviteUrl: string;
  inviteCode: string;
}

export interface TantanganPayload {
  name: string;
  categorySlug: string;
  mode: TantanganMode;
  durationDays: number;
  unit: string | null; // null → pencatatan biner
  dailyTargetText: string | null;
  isPublic: boolean; // selalu false saat mode === 'personal'
}

// Bentuk halaman sama dengan /donasi-bersama dan /news.
export interface TantanganListResult {
  items: Tantangan[];
  hasMore: boolean;
}

export interface TantanganLeaderboardResult {
  items: TantanganLeaderboardEntry[];
  // Baris pengguna sendiri, dikirim TERPISAH dari items supaya tetap tampil
  // meski peringkatnya jauh di luar halaman pertama.
  // null → pengguna belum ikut tantangan ini.
  me: TantanganLeaderboardEntry | null;
  hasMore: boolean;
}

// --- Jurnal Kebaikan -------------------------------------------------------

// Status khusus satu hari, milik pengguna — bukan milik tantangan tertentu.
export interface TantanganDayStatus {
  date: string; // ISO date-only
  isFasting: boolean; // penanda saja, tidak mengubah perhitungan apa pun
  isExcused: boolean; // hari ini tidak memutus runtun
}

// Satu baris jurnal = satu tantangan yang sedang diikuti pada tanggal itu.
export interface TantanganJurnalItem {
  challengeId: string;
  name: string;
  categorySlug: string;
  // Baris ber-action 'quran' tidak bisa dicentang di sini — progresnya milik
  // domain Quran. Menekannya membuka menu Quran.
  action: TantanganAction;
  dailyTargetText: string | null;
  unit: string | null;
  todayValue: number | null; // null saat unit null atau belum dicatat
  isDoneToday: boolean;
  isRecommendedToday: boolean;
  streakDays: number; // DIHITUNG SERVER
}

// Isi GET /tantangan/jurnal — status hari dan daftar datang bersama supaya chip
// dan baris tidak pernah menampilkan keadaan dari dua request beda umur.
export interface TantanganJurnalResult {
  status: TantanganDayStatus;
  items: TantanganJurnalItem[];
}

// Isi POST /tantangan/jurnal/:challengeId — baris terbaru + persentase
// tantangan terbaru, supaya bar progres bisa disinkronkan tanpa refetch.
export interface TantanganJurnalCheckResult {
  item: TantanganJurnalItem;
  progressPercentage: number;
}
