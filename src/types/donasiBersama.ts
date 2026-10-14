// Menu Donasi Bersama — donasi patungan berbasis grup.
// Nama domain sengaja Bahasa Indonesia (`DonasiBersama`), mengikuti preseden
// `Doa`, `Renungan`, `Infak`, dan `Zakat`: terjemahan lurusnya (`GroupDonation`)
// menabrak domain donasi program yang sudah memakai kata `Donation` habis-habisan.
// Seluruh FIELD di bawah tetap Bahasa Inggris.
// Lihat docs/08-features/donasi-bersama/README.md.

export type DonasiBersamaTab = 'popular' | 'new' | 'ending';

export type DonasiBersamaDetailTab = 'contributions' | 'about';

// Ditentukan server, client tidak menghitungnya sendiri:
// 'active'    → masih bisa diurun
// 'completed' → target tercapai, tenggat belum lewat — MASIH bisa diurun
// 'ended'     → tenggat lewat — tidak bisa diurun lagi
export type DonasiBersamaStatus = 'active' | 'completed' | 'ended';

export type ReminderFrequency = 'daily' | 'weekly' | 'monthly';

export type WeekDay = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export interface ReminderSetting {
  isEnabled: boolean;
  frequency: ReminderFrequency;
  weekDay: WeekDay | null; // hanya terisi saat frequency === 'weekly'
  time: string; // "HH:mm" 24 jam, mis. "05:00"
}

// Potongan anggota untuk tumpukan avatar di kartu list — sengaja bukan
// DonasiBersamaMember penuh supaya payload list tetap ringan.
export interface DonasiBersamaMemberPreview {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface DonasiBersamaGroup {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string | null;
  targetAmount: number;
  collectedAmount: number;
  // Keterangan progres versi domain grup, mis. "26 Juz" pada grup khatam.
  // null → kartu hanya menampilkan persentase.
  progressLabel: string | null;
  daysLeft: number;
  memberCount: number;
  memberPreviews: DonasiBersamaMemberPreview[];
  isMember: boolean;
  isPublic: boolean;
  status: DonasiBersamaStatus;
}

export interface DonasiBersamaDetail extends DonasiBersamaGroup {
  location: string | null; // "Desa Kajen, Pati" — null → baris lokasi tidak dirender
  batchLabel: string | null; // "BATCH 2" — null → badge tidak dirender
  about: string; // HTML, dirender HtmlContent
  deadline: string; // ISO "YYYY-MM-DD"
  programId: string;
  programTitle: string;
  isCreator: boolean;
  reminder: ReminderSetting;
}

export interface DonasiBersamaContribution {
  id: string;
  donaturName: string; // sudah final: nama asli ATAU 'Hamba Allah'
  avatarUrl: string | null;
  amount: number;
  createdAt: string; // ISO — diformat formatRelativeTime jadi "2 jam lalu"
}

// Batch = putaran urunan di dalam satu grup. Grup selalu punya tepat satu
// batch aktif; urunan baru otomatis masuk ke sana. `batchLabel` di detail grup
// adalah label batch yang sedang aktif.
// 'draft'  → sudah dibuat tapi belum dimulai; belum menerima urunan, dan
//             satu-satunya status yang boleh dihapus
// 'active' → sedang berjalan; urunan baru masuk ke sini. Hanya boleh ada satu
// 'ended'  → sudah ditutup karena batch berikutnya dimulai
export type DonasiBersamaBatchStatus = 'draft' | 'active' | 'ended';

export interface DonasiBersamaBatch {
  id: string;
  // Nomor urut berdasarkan waktu dibuat, dihitung server. Bukan turunan posisi
  // di daftar (daftar diurut terbaru dulu) dan bukan turunan nama — nama batch
  // bebas diubah kreator, jadi "Batch Ramadan" pun tetap punya nomor urut.
  sequence: number;
  label: string; // "Batch 2"
  status: DonasiBersamaBatchStatus;
  collectedAmount: number;
  contributionCount: number;
  createdAt: string; // ISO
  startedAt: string | null; // null selama masih draft
}

export interface BatchPayload {
  label: string;
}

// Dipakai bersama oleh create, update, dan start supaya satu handler di hook
// bisa memperbarui cache tanpa cabang.
export interface BatchMutationResult {
  batch: DonasiBersamaBatch;
  // Label batch yang sedang berjalan setelah operasi ini — dipakai memperbarui
  // badge di detail grup tanpa memuat ulang seluruh detail. null kalau belum
  // ada batch yang dimulai.
  activeBatchLabel: string | null;
}

// Riwayat urunan MILIK pengguna sendiri. Sengaja tipe terpisah dari
// DonasiBersamaContribution: di riwayat publik yang penting siapa penyumbangnya
// (dan anonim disamarkan jadi "Hamba Allah"), sedangkan di riwayat sendiri
// nama tidak perlu — yang berguna justru penanda mana yang dikirim anonim.
export interface DonasiBersamaMyContribution {
  id: string;
  amount: number;
  createdAt: string; // ISO
  isAnonymous: boolean;
}

export interface DonasiBersamaMyContributionListResult {
  items: DonasiBersamaMyContribution[];
  hasMore: boolean;
  // Ringkasan seluruh urunan pengguna di grup ini — bukan cuma halaman ini.
  totalAmount: number;
  count: number;
}

export interface DonasiBersamaMember {
  id: string;
  name: string;
  avatarUrl: string | null;
  roleLabel: string; // "Kreator Grup" | "Penderma Aktif" | "Anggota" | "Anggota Baru"
  badgeLabel: string | null; // "Donatur Teraktif" | "Inspirator Kebaikan" | null
  isCreator: boolean;
  // TERMASUK urunan anonim — dipakai sebagai gerbang "boleh dikeluarkan".
  // Sengaja beda cakupan dengan riwayat urunan anggota yang MENYEMBUNYIKAN
  // urunan anonim: melindungi penyumbang lebih penting daripada menutup
  // kemungkinan menebak. Lihat donasi-bersama-members.md.
  hasContributed: boolean;
}

export interface RemoveMemberResult {
  memberCount: number;
}

export interface DonasiBersamaInvite {
  inviteUrl: string;
  inviteCode: string;
}

export interface DonasiBersamaListResult {
  items: DonasiBersamaGroup[];
  hasMore: boolean;
}

export interface DonasiBersamaMemberListResult {
  items: DonasiBersamaMember[];
  hasMore: boolean;
  total: number; // jumlah anggota grup — bukan items.length, dan tidak ikut menyusut saat pencarian aktif
}

export interface DonasiBersamaContributionListResult {
  items: DonasiBersamaContribution[];
  hasMore: boolean;
}

export interface UploadCoverResult {
  coverImageUrl: string;
}

// Dipakai bersama oleh join dan leave supaya satu handler di hook bisa
// memperbarui cache tanpa cabang.
export interface JoinGroupResult {
  isMember: boolean;
  memberCount: number;
}

export interface CreateDonasiBersamaPayload {
  name: string;
  programId: string;
  targetAmount: number;
  deadline: string; // "YYYY-MM-DD"
  isPublic: boolean;
  coverImageUrl: string | null;
  reminder: ReminderSetting;
}

export interface CreateContributionPayload {
  amount: number;
  paymentMethodId: string;
  isAnonymous: boolean;
}
