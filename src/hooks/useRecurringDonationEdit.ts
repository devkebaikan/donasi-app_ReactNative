import {useEffect, useState} from 'react';
import {formatCurrency} from '@/utils/formatCurrency';
import {
  FREQUENCY_FROM_API,
  FREQUENCY_TO_API,
} from '@/types/recurringDonation';
import type {
  RecurringDonationDetail,
  RecurringFrequency,
  UpdateRecurringDonationPayload,
} from '@/types/recurringDonation';
import type {WeekDay} from '@/types/donasiBersama';

export const MIN_RECURRING_EDIT_AMOUNT = 1_000;

type State = {
  amount: number;
  frequency: RecurringFrequency;
  scheduleDay: number | null;
  weekDay: WeekDay | null;
  scheduleHour: number;
  scheduleMinute: number;
  errors: Record<string, string>;
};

type Actions = {
  setAmount: (amount: number) => void;
  setFrequency: (frequency: RecurringFrequency) => void;
  setScheduleDay: (day: number) => void;
  setWeekDay: (day: WeekDay) => void;
  setScheduleHour: (hour: number) => void;
  setScheduleMinute: (minute: number) => void;
  setErrors: (errors: Record<string, string>) => void;
  buildPayload: () => UpdateRecurringDonationPayload | null;
};

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

// `scheduleDay` mingguan disimpan sebagai indeks 0–6 (Minggu–Sabtu, ikut
// Date.getDay()) mengikuti formatRecurringSchedule yang sudah ada, sedangkan
// DonasiBersamaWeekDayPicker bekerja dengan string. Konversinya di sini, bukan
// dengan mengubah komponen pemilihnya yang sudah dipakai menu lain.
const WEEK_DAYS: WeekDay[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// State form sheet "Ubah Rutinitas". Di-seed ulang setiap kali sheet dibuka —
// bukan sekali saat mount — supaya membuka sheet untuk kedua kalinya tidak
// menampilkan nilai lama yang sudah tidak berlaku.
export function useRecurringDonationEdit(
  detail: RecurringDonationDetail | null,
  isOpen: boolean,
): State & Actions {
  const [amount, setAmount] = useState(0);
  const [frequency, setFrequencyState] = useState<RecurringFrequency>('harian');
  const [scheduleDay, setScheduleDayState] = useState<number | null>(null);
  const [scheduleHour, setScheduleHour] = useState(8);
  const [scheduleMinute, setScheduleMinute] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen || !detail) {
      return;
    }
    const [hour = '08', minute = '00'] = detail.scheduleTime.split(':');
    setAmount(detail.amount);
    setFrequencyState(FREQUENCY_FROM_API[detail.frequency]);
    setScheduleDayState(detail.scheduleDay ?? null);
    setScheduleHour(Number(hour));
    setScheduleMinute(Number(minute));
    setErrors({});
  }, [isOpen, detail]);

  // Angka 5 berarti "Jumat" saat mingguan dan "tanggal 5" saat bulanan.
  // Membawanya menyeberang hampir selalu salah, jadi pilihannya dikosongkan
  // setiap kali frekuensi berpindah kategori.
  function setFrequency(next: RecurringFrequency): void {
    if (next !== frequency) {
      setScheduleDayState(null);
    }
    setFrequencyState(next);
  }

  function setScheduleDay(day: number): void {
    setScheduleDayState(day);
  }

  function setWeekDay(day: WeekDay): void {
    setScheduleDayState(WEEK_DAYS.indexOf(day));
  }

  function validate(): Record<string, string> {
    const nextErrors: Record<string, string> = {};
    if (!Number.isFinite(amount) || amount < MIN_RECURRING_EDIT_AMOUNT) {
      nextErrors.amount = `Nominal minimal ${formatCurrency(
        MIN_RECURRING_EDIT_AMOUNT,
      )}`;
    }
    if (frequency === 'mingguan' && scheduleDay === null) {
      nextErrors.scheduleDay = 'Pilih hari donasi';
    }
    if (frequency === 'bulanan' && scheduleDay === null) {
      nextErrors.scheduleDay = 'Pilih tanggal donasi';
    }
    // JadwalPicker sudah men-clamp keduanya, tapi validasi tidak boleh
    // bergantung pada perilaku satu komponen UI.
    if (scheduleHour < 0 || scheduleHour > 23) {
      nextErrors.scheduleTime = 'Jam tidak valid';
    }
    if (scheduleMinute < 0 || scheduleMinute > 59) {
      nextErrors.scheduleTime = 'Menit tidak valid';
    }
    return nextErrors;
  }

  // null = validasi gagal (errors sudah diisi), stop sebelum memanggil API.
  function buildPayload(): UpdateRecurringDonationPayload | null {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return null;
    }
    return {
      amount,
      frequency: FREQUENCY_TO_API[frequency],
      scheduleTime: `${pad(scheduleHour)}:${pad(scheduleMinute)}`,
      ...(frequency === 'harian' || scheduleDay === null
        ? {}
        : {scheduleDay}),
    };
  }

  const weekDay =
    scheduleDay !== null && scheduleDay >= 0 && scheduleDay < WEEK_DAYS.length
      ? (WEEK_DAYS[scheduleDay] as WeekDay)
      : null;

  return {
    amount,
    frequency,
    scheduleDay,
    weekDay,
    scheduleHour,
    scheduleMinute,
    errors,
    setAmount,
    setFrequency,
    setScheduleDay,
    setWeekDay,
    setScheduleHour,
    setScheduleMinute,
    setErrors,
    buildPayload,
  };
}
