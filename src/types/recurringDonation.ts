export type RecurringDonationTab = 'saldo' | 'bayar';

export type RecurringStatusFilter = 'semua' | 'aktif' | 'jeda';

// Dari mana form donasi rutin dibuka — menentukan program mana yang didonasi.
//   program : user memilih sendiri programnya dari katalog
//   pilihan : Aksiberbagi yang memilihkan programnya nanti
//   subuh   : masuk ke program "Donasi Tiap Subuh"
//   jumat   : masuk ke program "Donasi Tiap Jum'at"
// Lihat docs/08-features/donasi-rutin/README.md.
export type RecurringSetupIntent = 'program' | 'pilihan' | 'subuh' | 'jumat';

interface RecurringIntentConfig {
  title: string;
  description: string;
  // Dikirim apa adanya ke API sebagai `programId`. Kosong = biar backend yang
  // menentukan programnya (jenis "pilihan").
  programId: string;
}

export const RECURRING_INTENT: Record<
  Exclude<RecurringSetupIntent, 'program'>,
  RecurringIntentConfig
> = {
  pilihan: {
    title: 'Pilih Tujuan Donasi Rutin',
    description: 'Program dipilihkan Aksiberbagi.com untuk Anda',
    programId: '',
  },
  subuh: {
    title: 'Donasi Tiap Subuh',
    description: 'Donasi rutin masuk ke program Subuh',
    programId: 'donasi-subuh',
  },
  jumat: {
    title: "Donasi Tiap Jum'at",
    description: "Donasi rutin masuk ke program Jum'at",
    programId: 'donasi-jumat',
  },
};

// Frekuensi versi UI — inilah yang dipakai JadwalPicker dan seluruh label di
// layar.
export type RecurringFrequency = 'harian' | 'mingguan' | 'bulanan';

// Frekuensi versi API. Dua-duanya hidup berdampingan; peta di bawah yang
// menjembatani, supaya konversinya tidak ditulis ulang di tiap pemakai.
export type RecurringApiFrequency = 'daily' | 'weekly' | 'monthly';

export const FREQUENCY_TO_API: Record<RecurringFrequency, RecurringApiFrequency> = {
  harian: 'daily',
  mingguan: 'weekly',
  bulanan: 'monthly',
};

export const FREQUENCY_FROM_API: Record<RecurringApiFrequency, RecurringFrequency> = {
  daily: 'harian',
  weekly: 'mingguan',
  monthly: 'bulanan',
};

export interface RecurringDonationPayload {
  programId: string;
  amount: number;
  frequency: RecurringApiFrequency;
  scheduleTime: string;
  onBehalfOf?: string;
  prayer?: string;
}

export interface PrepayRecurringDonationPayload extends RecurringDonationPayload {
  repeatCount: number;
  paymentMethodId: string;
  donaturName: string;
  donaturPhone: string;
}

export interface CreateRecurringDonationResult {
  recurringDonationId: string;
}

// 'BERHENTI' sengaja TIDAK ada di union ini: "hentikan" menghapus rutinitas
// dari daftar, bukan menandainya, jadi status itu tidak pernah sampai ke UI.
// Menyimpannya cuma memancing orang membangun badge untuk keadaan yang tak
// pernah datang. Lihat docs/08-features/donasi-rutin/README.md.
export type RecurringDonationStatus = 'AKTIF' | 'JEDA';

export interface RecurringDonation {
  id: string;
  programTitle: string;
  programImageUrl: string;
  amount: number;
  frequency: RecurringApiFrequency;
  scheduleTime: string;
  scheduleDay?: number; // weekly: 0–6 (Minggu–Sabtu, ikut Date.getDay()); monthly: 1–31
  status: RecurringDonationStatus;
  totalDonated: number;
  startDate: string;
}

export type RecurringDonationHistoryStatus = 'BERHASIL' | 'GAGAL';

export interface RecurringDonationHistoryEntry {
  id: string;
  amount: number;
  executedAt: string;
  status: RecurringDonationHistoryStatus;
}

export interface RecurringDonationDetail extends RecurringDonation {
  history: RecurringDonationHistoryEntry[];
}

export interface UpdateRecurringDonationPayload {
  amount: number;
  frequency: RecurringApiFrequency;
  scheduleTime: string; // "HH:mm", jam & menit sudah di-pad
  scheduleDay?: number; // daily: tidak dikirim
}
