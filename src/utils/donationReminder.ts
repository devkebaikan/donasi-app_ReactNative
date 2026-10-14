import type {DonationReminderFrequency} from '@/types/setting';

interface FrequencyOption {
  value: DonationReminderFrequency;
  label: string;
  description: string;
}

export const REMINDER_FREQUENCY_OPTIONS: FrequencyOption[] = [
  {value: 'daily', label: 'Setiap hari', description: 'Sekali setiap hari'},
  {value: 'weekly', label: 'Setiap minggu', description: 'Sekali setiap Jumat'},
  {
    value: 'monthly',
    label: 'Setiap bulan',
    description: 'Sekali di tanggal 1 setiap bulan',
  },
];

// Rentang jam pengingat: 04.00–21.30 dengan langkah 30 menit. Di luar rentang
// itu notifikasi jatuh saat orang tidur, dan pengingat yang datang tengah
// malam lebih besar peluang dimatikan daripada dibuka.
const REMINDER_START_HOUR = 4;
const REMINDER_END_HOUR = 21;
const MINUTE_STEPS = [0, 30];

export const REMINDER_TIME_OPTIONS: string[] = Array.from(
  {length: REMINDER_END_HOUR - REMINDER_START_HOUR + 1},
  (_, index) => REMINDER_START_HOUR + index,
).flatMap(hour =>
  MINUTE_STEPS.map(
    minute =>
      `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
  ),
);

export function findReminderFrequencyLabel(
  value: DonationReminderFrequency,
): string {
  return (
    REMINDER_FREQUENCY_OPTIONS.find(option => option.value === value)?.label ??
    ''
  );
}

export function formatReminderTime(time: string): string {
  return `${time} WIB`;
}
