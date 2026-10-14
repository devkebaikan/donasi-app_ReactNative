const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

// "Jumat, 26 Juni 2026" — nama hari + tanggal lengkap tanpa jam.
export function formatFullDate(isoDate: string): string {
  const date = new Date(isoDate);
  return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  const day = DAYS[date.getDay()];
  const month = SHORT_MONTHS[date.getMonth()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}, ${date.getDate()} ${month} ${date.getFullYear()} ${hours}:${minutes}`;
}

// "26 Jun 2026 - 14.22" — format waktu kiriman doa di Relung Doa.
// formatDateTime terlalu panjang (ada nama hari) dan formatShortDateTime tidak
// menyertakan tahun, jadi keduanya tidak bisa dipakai ulang di sini.
export function formatDoaTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  const month = SHORT_MONTHS[date.getMonth()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${date.getDate()} ${month} ${date.getFullYear()} - ${hours}.${minutes}`;
}

export function formatShortDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  const month = SHORT_MONTHS[date.getMonth()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${date.getDate()} ${month} · ${hours}:${minutes}`;
}

export function formatDateTimeWib(isoDate: string): string {
  const date = new Date(isoDate);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${formatDate(isoDate)} • ${hours}:${minutes} WIB`;
}

export function formatMonthYear(isoDate: string): string {
  const date = new Date(isoDate);
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function formatRelativeDate(isoDate: string): string {
  const diffDays = Math.floor((Date.now() - new Date(isoDate).getTime()) / MS_PER_DAY);
  if (diffDays <= 0) {
    return 'Hari ini';
  }
  if (diffDays === 1) {
    return 'Kemarin';
  }
  if (diffDays < 7) {
    return `${diffDays} Hari yang lalu`;
  }
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) {
    return `${diffWeeks} Minggu yang lalu`;
  }
  return formatDate(isoDate);
}

interface RecurringSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  scheduleTime: string;
  scheduleDay?: number;
}

export function formatRecurringSchedule(schedule: RecurringSchedule): string {
  const time = `${schedule.scheduleTime} WIB`;
  if (schedule.frequency === 'daily') {
    return `Setiap Hari, ${time}`;
  }
  if (schedule.frequency === 'weekly') {
    const dayName = schedule.scheduleDay != null ? DAYS[schedule.scheduleDay % 7] : null;
    return dayName ? `Setiap ${dayName}, ${time}` : `Mingguan, ${time}`;
  }
  const day = schedule.scheduleDay ?? 1;
  return `Tanggal ${day}, ${time}`;
}

// "05:30" -> "05.30". Amalan menyimpan waktu sebagai "HH:mm" (format data) dan
// menampilkannya dengan titik, seragam dengan formatDoaTimestamp. Jadwal sholat
// sengaja tetap memakai titik dua — jangan samakan keduanya di sini.
export function formatAmalanTime(time: string): string {
  return time.replace(':', '.');
}

// "2026-06-26" -> Date lokal tanggal itu. new Date(isoDate) memparse string
// date-only sebagai UTC, sehingga tanggalnya bisa mundur sehari saat diformat
// ke waktu lokal — lihat komentar sejenis di QuranScheduleCard.
export function toLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) {
    return new Date();
  }
  return new Date(year, month - 1, day);
}

// Kebalikan toLocalDate: Date -> "YYYY-MM-DD" memakai komponen lokal. Bukan
// toISOString().slice(0, 10) — itu memakai UTC dan menggeser tanggal satu hari
// di WIB untuk jam 00:00–07:00.
export function toIsoDateOnly(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// Geser tanggal date-only sejumlah hari, tetap di zona waktu lokal.
export function shiftIsoDate(isoDate: string, days: number): string {
  const date = toLocalDate(isoDate);
  date.setDate(date.getDate() + days);
  return toIsoDateOnly(date);
}
