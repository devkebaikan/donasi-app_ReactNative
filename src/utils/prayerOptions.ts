import type {
  CalculationMethod,
  HighLatitudeRule,
  IhtiyatCorrection,
  JuristicMethod,
  PrayerOption,
  PrayerOptions,
} from '@/types/prayerTime';

// Dipakai saat `/prayer-times/options` gagal: layar pengaturan tetap bisa
// dipakai, hanya daftarnya lebih pendek. Ditaruh di satu tempat supaya tidak
// ada dua daftar yang bisa berbeda isi.
export const FALLBACK_PRAYER_OPTIONS: PrayerOptions = {
  calculationMethods: [
    {
      value: 'KEMENAG',
      label: 'SIHAT/KEMENAG',
      description: 'Kementerian Agama RI',
    },
    {value: 'MWL', label: 'Muslim World League', description: null},
  ],
  juristicMethods: [
    {
      value: 'STANDARD',
      label: 'Standard',
      description: "Syafi'i, Maliki & Hambali",
    },
    {value: 'HANAFI', label: 'Hanafi', description: null},
  ],
  highLatitudeRules: [
    {value: 'ANGLE_BASED', label: 'Metode Berbasis Sudut', description: null},
  ],
  muadzins: [{id: 'rizal-armada', name: 'Rizal Armada'}],
};

export const IMSAK_OFFSET_OPTIONS: number[] = [5, 10, 15, 20];

export const HIJRI_OFFSET_OPTIONS: number[] = [-2, -1, 0, 1, 2];

// Batas ±10 menit disengaja: ihtiyat adalah koreksi kecil, dan angka yang
// lebih besar hampir selalu salah ketik, bukan maksud pengguna.
export const IHTIYAT_MIN_MINUTES = -10;
export const IHTIYAT_MAX_MINUTES = 10;

export const IHTIYAT_FIELDS: {key: keyof IhtiyatCorrection; label: string}[] = [
  {key: 'subuh', label: 'Subuh'},
  {key: 'dzuhur', label: 'Dzuhur'},
  {key: 'ashar', label: 'Ashar'},
  {key: 'maghrib', label: 'Maghrib'},
  {key: 'isya', label: 'Isya'},
];

// Urutan ditulis lewat IHTIYAT_FIELDS, bukan Object.values: urutan properti
// objek tidak dijamin, dan salah urut berarti pengguna mengoreksi waktu yang
// berbeda dari yang mereka kira.
export function formatIhtiyat(ihtiyat: IhtiyatCorrection): string {
  return IHTIYAT_FIELDS.map(field => ihtiyat[field.key]).join(', ');
}

export function formatImsakValue(minutes: number): string {
  return `${minutes} Menit`;
}

export function formatImsakDescription(minutes: number): string {
  return `${minutes} menit sebelum subuh`;
}

export function formatHijriOffsetValue(days: number): string {
  return `${days >= 0 ? '+' : ''}${days} Hari`;
}

export function formatHijriOffsetDescription(days: number): string {
  return `${days} hari`;
}

type SelectableValue = CalculationMethod | JuristicMethod | HighLatitudeRule;

// Label baris pengaturan selalu dari daftar opsi; kalau nilainya tidak
// ditemukan (mis. opsi dihapus di server), nilai mentahnya yang ditampilkan
// supaya tidak ada baris kosong tanpa penjelasan.
export function findOptionLabel<T extends SelectableValue>(
  options: PrayerOption<T>[],
  value: T,
): string {
  return options.find(option => option.value === value)?.label ?? value;
}
