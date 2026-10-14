const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

export function formatRelativeTime(isoDate: string): string {
  const elapsed = Date.now() - new Date(isoDate).getTime();

  if (!Number.isFinite(elapsed) || elapsed < MINUTE_MS) {
    return 'Baru saja';
  }
  if (elapsed < HOUR_MS) {
    return `${Math.floor(elapsed / MINUTE_MS)} menit lalu`;
  }
  if (elapsed < DAY_MS) {
    return `${Math.floor(elapsed / HOUR_MS)} jam lalu`;
  }
  if (elapsed < WEEK_MS) {
    return `${Math.floor(elapsed / DAY_MS)} hari lalu`;
  }
  if (elapsed < MONTH_MS) {
    return `${Math.floor(elapsed / WEEK_MS)} minggu lalu`;
  }
  if (elapsed < YEAR_MS) {
    return `${Math.floor(elapsed / MONTH_MS)} bulan lalu`;
  }
  return `${Math.floor(elapsed / YEAR_MS)} tahun lalu`;
}
