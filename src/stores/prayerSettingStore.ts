import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  CalculationMethod,
  HighLatitudeRule,
  IhtiyatCorrection,
  JuristicMethod,
  PrayerLocation,
  PrayerName,
} from '@/types/prayerTime';

// Pengaturan jadwal sholat & adzan. Disimpan lokal per perangkat, bukan per
// akun — lihat docs/05-architecture/adr/ADR-008-prayer-setting-storage.md.
//
// Store ini SENGAJA tidak ikut direset saat logout, berbeda dari store lain:
// menu Sholat boleh dipakai tanpa login, jadi mereset di sini berarti
// menghapus milik pengguna yang bahkan tidak pernah masuk.
interface PrayerSettingState {
  showOnHome: boolean;
  useDeviceLocation: boolean;
  location: PrayerLocation | null; // null = belum pernah dipilih
  calculationMethod: CalculationMethod;
  ihtiyat: IhtiyatCorrection;
  juristicMethod: JuristicMethod;
  highLatitudeRule: HighLatitudeRule;
  imsakOffsetMinutes: number;
  hijriOffsetDays: number;
  muadzinId: string;
  fridayDzuhurAdzan: boolean;
  reminders: Record<PrayerName, boolean>;

  setShowOnHome: (value: boolean) => void;
  setLocation: (location: PrayerLocation | null, useDevice: boolean) => void;
  setCalculationMethod: (value: CalculationMethod) => void;
  setIhtiyat: (value: IhtiyatCorrection) => void;
  setJuristicMethod: (value: JuristicMethod) => void;
  setHighLatitudeRule: (value: HighLatitudeRule) => void;
  setImsakOffsetMinutes: (value: number) => void;
  setHijriOffsetDays: (value: number) => void;
  setMuadzinId: (value: string) => void;
  setFridayDzuhurAdzan: (value: boolean) => void;
  setReminder: (prayer: PrayerName, value: boolean) => void;
  reset: () => void;
}

const DEFAULT_REMINDERS: Record<PrayerName, boolean> = {
  IMSAK: false,
  SUBUH: true,
  TERBIT: false,
  DZUHUR: true,
  ASHAR: true,
  MAGHRIB: true,
  ISYA: true,
};

// KEMENAG jadi bawaan karena penggunanya di Indonesia; ihtiyat 2,3,2,2,2
// mengikuti design di docs/08-features/sholat/design/.
const INITIAL_STATE = {
  showOnHome: true,
  useDeviceLocation: true,
  location: null,
  calculationMethod: 'KEMENAG' as CalculationMethod,
  ihtiyat: {subuh: 2, dzuhur: 3, ashar: 2, maghrib: 2, isya: 2},
  juristicMethod: 'STANDARD' as JuristicMethod,
  highLatitudeRule: 'ANGLE_BASED' as HighLatitudeRule,
  imsakOffsetMinutes: 10,
  hijriOffsetDays: 0,
  muadzinId: 'rizal-armada',
  fridayDzuhurAdzan: false,
  reminders: DEFAULT_REMINDERS,
};

export const usePrayerSettingStore = create<PrayerSettingState>()(
  persist(
    set => ({
      ...INITIAL_STATE,

      setShowOnHome: (value: boolean) => set({showOnHome: value}),
      setLocation: (location: PrayerLocation | null, useDevice: boolean) =>
        set({location, useDeviceLocation: useDevice}),
      setCalculationMethod: (value: CalculationMethod) =>
        set({calculationMethod: value}),
      setIhtiyat: (value: IhtiyatCorrection) => set({ihtiyat: value}),
      setJuristicMethod: (value: JuristicMethod) => set({juristicMethod: value}),
      setHighLatitudeRule: (value: HighLatitudeRule) =>
        set({highLatitudeRule: value}),
      setImsakOffsetMinutes: (value: number) =>
        set({imsakOffsetMinutes: value}),
      setHijriOffsetDays: (value: number) => set({hijriOffsetDays: value}),
      setMuadzinId: (value: string) => set({muadzinId: value}),
      setFridayDzuhurAdzan: (value: boolean) =>
        set({fridayDzuhurAdzan: value}),
      setReminder: (prayer: PrayerName, value: boolean) =>
        set(state => ({reminders: {...state.reminders, [prayer]: value}})),
      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'prayer-setting-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
