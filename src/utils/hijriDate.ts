const HIJRI_MONTH_NAMES = [
  'Muharram',
  'Safar',
  'Rabiul Awal',
  'Rabiul Akhir',
  'Jumadil Awal',
  'Jumadil Akhir',
  'Rajab',
  'Syaban',
  'Ramadhan',
  'Syawal',
  'Dzulkaidah',
  'Dzulhijjah',
];

const ISLAMIC_EPOCH_JULIAN_DAY = 1948440;

interface HijriDate {
  year: number;
  month: number;
  day: number;
}

function gregorianToJulianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function julianDayToHijri(julianDay: number): HijriDate {
  let l = julianDay - ISLAMIC_EPOCH_JULIAN_DAY + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return {year, month, day};
}

interface HijriLabelOptions {
  // Penetapan awal bulan bisa berbeda sehari antar daerah, jadi pengguna boleh
  // menggeser tanggalnya lewat Pengaturan Jadwal Sholat.
  offsetDays?: number;
  // Menu Quran memakai akhiran "H", panel jadwal sholat tidak.
  suffix?: boolean;
}

export function getHijriDateLabel(
  date: Date = new Date(),
  options: HijriLabelOptions = {},
): string {
  const {offsetDays = 0, suffix = true} = options;
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + offsetDays);

  const julianDay = gregorianToJulianDay(
    shifted.getFullYear(),
    shifted.getMonth() + 1,
    shifted.getDate(),
  );
  const {year, month, day} = julianDayToHijri(julianDay);
  const monthName = HIJRI_MONTH_NAMES[month - 1] ?? '';
  return `${day} ${monthName} ${year}${suffix ? 'H' : ''}`;
}
