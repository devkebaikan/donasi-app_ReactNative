// Bentuk ringkas waktu sholat berikutnya untuk card di Beranda menu utama.
// Dipakai homeService, useHome, SaldoCard, dan MuslimDailyCard.
export interface PrayerTime {
  name: string;
  time: string;
}

export type PrayerName =
  | 'IMSAK'
  | 'SUBUH'
  | 'TERBIT'
  | 'DZUHUR'
  | 'ASHAR'
  | 'MAGHRIB'
  | 'ISYA';

export interface PrayerTimeItem {
  key: PrayerName;
  label: string; // label siap tampil, tidak dirakit ulang di UI
  time: string; // "04:27", format HH:mm 24 jam
  isPrayer: boolean; // false untuk IMSAK dan TERBIT
}

export interface PrayerLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface PrayerSchedule {
  date: string; // ISO date-only
  dateLabel: string; // "Jumat, 26 Juni 2026"
  hijriLabel: string; // "11 Muharram 1448"
  location: PrayerLocation;
  times: PrayerTimeItem[]; // selalu 7 item, urut Imsak -> Isya
}

export type CalculationMethod =
  | 'KEMENAG'
  | 'MWL'
  | 'MAKKAH'
  | 'EGYPT'
  | 'KARACHI'
  | 'ISNA';

export type JuristicMethod = 'STANDARD' | 'HANAFI';

export type HighLatitudeRule =
  | 'ANGLE_BASED'
  | 'MIDNIGHT'
  | 'ONE_SEVENTH'
  | 'NONE';

// Koreksi menit per waktu sholat — di UI tampil sebagai "2, 3, 2, 2, 2".
export interface IhtiyatCorrection {
  subuh: number;
  dzuhur: number;
  ashar: number;
  maghrib: number;
  isya: number;
}

export interface Muadzin {
  id: string;
  name: string;
}

// Satu opsi di layar pengaturan. Label datang dari server supaya menambah
// metode perhitungan tidak perlu rilis app baru.
export interface PrayerOption<T extends string> {
  value: T;
  label: string;
  description: string | null;
}

export interface PrayerOptions {
  calculationMethods: PrayerOption<CalculationMethod>[];
  juristicMethods: PrayerOption<JuristicMethod>[];
  highLatitudeRules: PrayerOption<HighLatitudeRule>[];
  muadzins: Muadzin[];
}
