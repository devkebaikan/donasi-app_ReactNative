import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AppState} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useQueries} from '@tanstack/react-query';
import {getPrayerSchedule} from '@/services/prayerService';
import type {PrayerScheduleParams} from '@/services/prayerService';
import {usePrayerLocation} from '@/hooks/usePrayerLocation';
import {usePrayerSettingStore} from '@/stores/prayerSettingStore';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {
  addDays,
  findCurrentPrayer,
  formatCountdown,
  getCountdownIntervalMs,
  getSecondsUntil,
  getUpcomingPrayers,
  minutesNow,
  toDateOnly,
} from '@/utils/prayerTime';
import type {
  PrayerName,
  PrayerSchedule,
  PrayerTimeItem,
} from '@/types/prayerTime';

const UPCOMING_PREVIEW_COUNT = 2;

interface NextPrayer {
  item: PrayerTimeItem;
  isTomorrow: boolean;
}

type State = {
  schedule: PrayerSchedule | null;
  nextPrayer: NextPrayer | null;
  upcomingPrayers: PrayerTimeItem[];
  currentPrayerKey: PrayerName | null;
  countdown: string;
  reminders: Record<PrayerName, boolean>;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
};

type Actions = {
  toggleReminder: (prayer: PrayerName) => void;
  refresh: () => Promise<void>;
};

export function usePrayerSchedule(): State & Actions {
  const {location} = usePrayerLocation();

  const calculationMethod = usePrayerSettingStore(s => s.calculationMethod);
  const juristicMethod = usePrayerSettingStore(s => s.juristicMethod);
  const highLatitudeRule = usePrayerSettingStore(s => s.highLatitudeRule);
  const imsakOffsetMinutes = usePrayerSettingStore(s => s.imsakOffsetMinutes);
  const hijriOffsetDays = usePrayerSettingStore(s => s.hijriOffsetDays);
  const ihtiyat = usePrayerSettingStore(s => s.ihtiyat);
  const reminders = usePrayerSettingStore(s => s.reminders);
  const setReminder = usePrayerSettingStore(s => s.setReminder);

  const [today, setToday] = useState<string>(() => toDateOnly(new Date()));
  const [now, setNow] = useState<Date>(() => new Date());

  const todayParams: PrayerScheduleParams = useMemo(
    () => ({
      lat: location.latitude,
      lng: location.longitude,
      date: today,
      method: calculationMethod,
      juristic: juristicMethod,
      highLat: highLatitudeRule,
      imsak: imsakOffsetMinutes,
      // Urutan ditulis eksplisit, bukan dari Object.values — urutan properti
      // objek tidak dijamin, dan salah urut di sini berarti pengguna
      // mengoreksi waktu yang berbeda dari yang mereka kira.
      ihtiyat: [
        ihtiyat.subuh,
        ihtiyat.dzuhur,
        ihtiyat.ashar,
        ihtiyat.maghrib,
        ihtiyat.isya,
      ].join(','),
      hijriOffset: hijriOffsetDays,
    }),
    [
      location.latitude,
      location.longitude,
      today,
      calculationMethod,
      juristicMethod,
      highLatitudeRule,
      imsakOffsetMinutes,
      ihtiyat,
      hijriOffsetDays,
    ],
  );

  const tomorrowParams: PrayerScheduleParams = useMemo(
    () => ({...todayParams, date: toDateOnly(addDays(new Date(today), 1))}),
    [todayParams, today],
  );

  // Jadwal besok baru diambil setelah seluruh waktu sholat hari ini lewat.
  const [needsTomorrow, setNeedsTomorrow] = useState<boolean>(false);

  const [todayQuery, tomorrowQuery] = useQueries({
    queries: [
      {
        queryKey: queryKeys.prayer.schedule(todayParams),
        queryFn: () => getPrayerSchedule(todayParams).then(unwrapResponse),
      },
      {
        queryKey: queryKeys.prayer.schedule(tomorrowParams),
        queryFn: () => getPrayerSchedule(tomorrowParams).then(unwrapResponse),
        enabled: needsTomorrow,
      },
    ],
  });

  const schedule = todayQuery.data ?? null;
  const times = useMemo(() => schedule?.times ?? [], [schedule]);
  const nowMinutes = minutesNow(now);

  const upcomingToday = useMemo(
    () => getUpcomingPrayers(times, nowMinutes),
    [times, nowMinutes],
  );

  useEffect(() => {
    setNeedsTomorrow(times.length > 0 && upcomingToday.length === 0);
  }, [times.length, upcomingToday.length]);

  const tomorrowPrayers = useMemo(
    () => (tomorrowQuery.data?.times ?? []).filter(item => item.isPrayer),
    [tomorrowQuery.data],
  );

  // Setelah Isya lewat, deretnya disambung ke jadwal besok supaya waktu
  // berikutnya dan dua waktu sesudahnya tidak pernah kosong.
  const nextPrayer: NextPrayer | null = useMemo(() => {
    const first = upcomingToday[0];
    if (first) {
      return {item: first, isTomorrow: false};
    }
    const tomorrowFirst = tomorrowPrayers[0];
    return tomorrowFirst ? {item: tomorrowFirst, isTomorrow: true} : null;
  }, [upcomingToday, tomorrowPrayers]);

  const upcomingPrayers = useMemo(
    () =>
      [...upcomingToday.slice(1), ...tomorrowPrayers].slice(
        0,
        UPCOMING_PREVIEW_COUNT,
      ),
    [upcomingToday, tomorrowPrayers],
  );

  const currentPrayerKey = useMemo(
    () => findCurrentPrayer(times, nowMinutes)?.key ?? null,
    [times, nowMinutes],
  );

  const remainingSeconds = nextPrayer
    ? getSecondsUntil(nextPrayer.item.time, now, nextPrayer.isTomorrow)
    : 0;

  // Interval tick dibaca dari ref, bukan dari dependency, supaya effect-nya
  // tidak dipasang ulang tiap detik hanya karena angkanya berubah.
  const remainingSecondsRef = useRef<number>(remainingSeconds);
  remainingSecondsRef.current = remainingSeconds;

  // Satu timer untuk seluruh layar, dan berhenti saat screen tidak fokus:
  // hitung mundur yang jalan di balik layar lain hanya menghabiskan baterai.
  useFocusEffect(
    useCallback(() => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      let isActive = true;

      function tick(): void {
        if (!isActive) {
          return;
        }
        const current = new Date();
        setNow(current);

        const currentDate = toDateOnly(current);
        setToday(previous =>
          previous === currentDate ? previous : currentDate,
        );

        timeoutId = setTimeout(
          tick,
          getCountdownIntervalMs(remainingSecondsRef.current),
        );
      }

      tick();
      return () => {
        isActive = false;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }, []),
  );

  // Aplikasi yang dibuka lagi setelah lewat tengah malam harus langsung
  // menampilkan jadwal hari yang baru, bukan jadwal kemarin.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', status => {
      if (status !== 'active') {
        return;
      }
      const current = new Date();
      setNow(current);
      setToday(toDateOnly(current));
    });
    return () => subscription.remove();
  }, []);

  async function refresh(): Promise<void> {
    await Promise.all([
      todayQuery.refetch(),
      needsTomorrow ? tomorrowQuery.refetch() : Promise.resolve(),
    ]);
  }

  return {
    schedule,
    nextPrayer,
    upcomingPrayers,
    currentPrayerKey,
    countdown: nextPrayer ? formatCountdown(remainingSeconds) : '',
    reminders,
    isLoading: todayQuery.isPending,
    isRefreshing: todayQuery.isRefetching,
    isError: todayQuery.isError,
    toggleReminder: (prayer: PrayerName) =>
      setReminder(prayer, !reminders[prayer]),
    refresh,
  };
}
