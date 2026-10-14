import type {PrayerLocation, PrayerName, PrayerTimeItem} from '@/types/prayerTime';

// Lokasi yang dipakai saat pengguna belum pernah memilih kota dan GPS tidak
// tersedia — perlakuannya sama persis dengan izin lokasi ditolak.
export const DEFAULT_PRAYER_LOCATION: PrayerLocation = {
  id: 'jakarta',
  name: 'Jakarta, DKI Jakarta',
  latitude: -6.2088,
  longitude: 106.8456,
  timezone: 'Asia/Jakarta',
};

const MINUTES_PER_DAY = 24 * 60;
const SECONDS_PER_HOUR = 3600;

export function toMinutes(time: string): number {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

export function minutesNow(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

// Imsak dan Terbit sengaja dilewati: keduanya penanda waktu, bukan waktu
// sholat, jadi tidak pernah jadi "waktu berikutnya" maupun waktu berjalan.
function prayersOnly(times: PrayerTimeItem[]): PrayerTimeItem[] {
  return times.filter(item => item.isPrayer);
}

// Daftar waktu sholat mulai dari yang terdekat di depan `nowMinutes`. Setelah
// Isya lewat, daftarnya kosong — pemanggil yang memutuskan memakai jadwal
// besok, karena hanya dia yang tahu jadwal besok sudah diambil atau belum.
export function getUpcomingPrayers(
  times: PrayerTimeItem[],
  nowMinutes: number,
): PrayerTimeItem[] {
  return prayersOnly(times).filter(item => toMinutes(item.time) > nowMinutes);
}

// Waktu sholat yang sedang berjalan: waktu sholat terakhir yang jamnya sudah
// lewat. Sebelum Subuh tidak ada yang berjalan.
export function findCurrentPrayer(
  times: PrayerTimeItem[],
  nowMinutes: number,
): PrayerTimeItem | null {
  const passed = prayersOnly(times).filter(
    item => toMinutes(item.time) <= nowMinutes,
  );
  return passed[passed.length - 1] ?? null;
}

// Sisa detik menuju sebuah waktu. `isTomorrow` dipakai saat waktu itu berada
// di jadwal hari berikutnya (Subuh besok setelah Isya lewat).
export function getSecondsUntil(
  time: string,
  now: Date,
  isTomorrow: boolean,
): number {
  const target = toMinutes(time) + (isTomorrow ? MINUTES_PER_DAY : 0);
  const current =
    minutesNow(now) * 60 + now.getSeconds() + now.getMilliseconds() / 1000;
  return Math.max(0, Math.round(target * 60 - current));
}

// Di bawah satu jam detik ikut ditampilkan, di atas itu tidak — angka detik
// yang berlari selama berjam-jam tidak menambah informasi apa pun.
export function formatCountdown(remainingSeconds: number): string {
  if (remainingSeconds >= SECONDS_PER_HOUR) {
    const hours = Math.floor(remainingSeconds / SECONDS_PER_HOUR);
    const minutes = Math.floor((remainingSeconds % SECONDS_PER_HOUR) / 60);
    return `± ${hours} jam ${minutes} menit`;
  }
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return `± ${minutes} menit ${seconds} detik`;
}

// Interval tick mengikuti format yang sedang tampil: tidak ada gunanya
// merender tiap detik kalau yang berubah cuma angka menit.
export function getCountdownIntervalMs(remainingSeconds: number): number {
  return remainingSeconds >= SECONDS_PER_HOUR ? 60_000 : 1_000;
}

export function toDateOnly(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export const PRAYER_LABELS: Record<PrayerName, string> = {
  IMSAK: 'Imsak',
  SUBUH: 'Subuh',
  TERBIT: 'Terbit',
  DZUHUR: 'Dzuhur',
  ASHAR: 'Ashar',
  MAGHRIB: 'Maghrib',
  ISYA: 'Isya',
};
