// Slug preset dikirim server, bukan union literal di client — daftar preset
// bisa bertambah dari server tanpa rilis app baru. Pemetaan slug -> icon ada di
// client (map lokal dengan fallback), jadi slug tak dikenal tetap tampil.
export type AmalanPresetSlug = string;

export interface AmalanPreset {
  slug: AmalanPresetSlug;
  label: string;
  iconSlug: string;
}

export interface Amalan {
  id: string;
  date: string; // ISO date-only "YYYY-MM-DD"
  presetSlug: AmalanPresetSlug;
  // Label amalan saat dicatat — ditetapkan server dari presetSlug, bukan
  // dirakit client, supaya preset yang berganti nama tidak meninggalkan
  // catatan lama dengan label usang.
  title: string;
  time: string; // "HH:mm" 24 jam — format penyimpanan, BUKAN format tampilan
  note: string | null; // null -> baris catatan tidak dirender
  isCompleted: boolean;
  reminderEnabled: boolean;
}

// Ringkasan satu hari. Dipakai kartu progres dan tiap lingkaran di strip.
export interface AmalanSummary {
  date: string;
  done: number;
  total: number;
}

// Isi GET /amalan — daftar dan ringkasan datang bersama supaya kartu progres
// dan daftar tidak pernah menampilkan angka dari dua request yang beda umur.
export interface AmalanDayResult {
  summary: AmalanSummary;
  items: Amalan[];
}

// Isi POST /amalan/:id/complete — item terbaru + ringkasan terbaru, supaya ring
// persentase bisa disinkronkan tanpa refetch daftar.
export interface AmalanToggleResult {
  item: Amalan;
  summary: AmalanSummary;
}

export interface AmalanPayload {
  date: string;
  presetSlug: AmalanPresetSlug;
  time: string; // "HH:mm"
  note: string | null;
  reminderEnabled: boolean;
}

// Union bertag, bukan sepasang boolean + nullable: mustahil berada di mode
// 'edit' tanpa data amalannya, dan TypeScript yang menjaganya.
export type AmalanSheetMode =
  | {type: 'create'}
  | {type: 'edit'; amalan: Amalan};
