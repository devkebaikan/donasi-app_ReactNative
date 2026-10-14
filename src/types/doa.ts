// Menu Relung Doa — feed doa antar pengguna.
//
// Nama domain sengaja "Doa" (bukan "Prayer"): prefix `prayer*` sudah dipakai
// habis oleh menu jadwal sholat (prayerService, prayerTime, PrayerSettingRow,
// queryKeys.prayer, route PrayerSchedule) dan akan tabrakan.
// Lihat docs/08-features/doa/README.md.

export type DoaTab = 'all' | 'mine' | 'favorite';

// Pilihan di field "Tampilkan Nama". 'anonymous' membuat API mengirim
// author.name = 'Hamba Allah' — client tidak pernah menyusun label itu sendiri.
export type DoaNameVisibility = 'name' | 'anonymous';

export interface DoaAuthor {
  id: string;
  name: string; // sudah final: nama asli ATAU 'Hamba Allah'
  avatarUrl: string | null; // null → Avatar jatuh ke inisial
}

export interface Doa {
  id: string;
  author: DoaAuthor;
  content: string;
  createdAt: string; // ISO — diformat di client jadi "26 Jun 2026 - 14.22"
  isAmiin: boolean; // apakah user yang login sudah mengaamiinkan
  isFavorite: boolean; // apakah user yang login sudah memfavoritkan
  // Ditentukan server, bukan dihitung client dengan membandingkan author.id:
  // untuk doa anonim server sengaja tidak mengirim identitas asli penulisnya.
  isMine: boolean;
  isReported: boolean; // sudah pernah dilaporkan — icon lapor jadi non-aktif
}

export interface DoaListResult {
  items: Doa[];
  hasMore: boolean;
}

// Poster carousel di atas feed. Tipe sendiri, bukan `Banner` dari
// types/banner.ts — banner Home terikat `programId` yang tidak berlaku di sini.
export interface DoaBanner {
  id: string;
  imageUrl: string;
  title: string; // accessibilityLabel, tidak dirender sebagai teks
}

// Response kedua endpoint toggle. Bentuknya sama supaya satu handler di hook
// bisa memperbarui kartu tanpa cabang.
export interface DoaToggleResult {
  id: string;
  isAmiin: boolean;
  isFavorite: boolean;
}

export interface CreateDoaPayload {
  content: string;
  nameVisibility: DoaNameVisibility;
}
