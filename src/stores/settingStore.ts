import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {AppFontSize, DonationReminderFrequency} from '@/types/setting';

// Pengali ukuran font untuk seluruh teks aplikasi. Nilainya sengaja rapat
// (0,9–1,3): di atas 1,3 label dua baris pada baris menu dan tab bar mulai
// terpotong, dan itu merugikan justru pengguna yang paling butuh huruf besar.
// Lihat docs/05-architecture/adr/ADR-010-app-font-scale.md.
export const APP_FONT_SCALE: Record<AppFontSize, number> = {
  small: 0.9,
  medium: 1,
  large: 1.15,
  xlarge: 1.3,
};

interface SettingState {
  appFontSize: AppFontSize;
  isHideName: boolean;
  isHideNominal: boolean;
  isContactable: boolean;
  isReminderEnabled: boolean;
  reminderFrequency: DonationReminderFrequency;
  reminderTime: string;
  setAppFontSize: (value: AppFontSize) => void;
  setHideName: (value: boolean) => void;
  setHideNominal: (value: boolean) => void;
  setContactable: (value: boolean) => void;
  setReminderEnabled: (value: boolean) => void;
  setReminderFrequency: (value: DonationReminderFrequency) => void;
  setReminderTime: (value: string) => void;
  reset: () => void;
}

// Preferensi yang menempel pada AKUN — ikut dibersihkan saat logout, karena
// pengguna berikutnya di perangkat yang sama tidak mewarisi pilihan orang lain.
const ACCOUNT_PREFERENCES = {
  isHideName: false,
  isHideNominal: false,
  isContactable: false,
  isReminderEnabled: false,
  reminderFrequency: 'daily' as DonationReminderFrequency,
  reminderTime: '05:00',
};

// Ukuran font TIDAK ikut di-reset saat logout: ini preferensi aksesibilitas
// milik perangkat, bukan milik akun. Orang yang memperbesar huruf karena sulit
// membaca tidak boleh kehilangan pengaturannya hanya karena keluar akun.
const INITIAL_STATE = {
  appFontSize: 'medium' as AppFontSize,
  ...ACCOUNT_PREFERENCES,
};

export const useSettingStore = create<SettingState>()(
  persist(
    set => ({
      ...INITIAL_STATE,
      setAppFontSize: (value: AppFontSize) => set({appFontSize: value}),
      setHideName: (value: boolean) => set({isHideName: value}),
      setHideNominal: (value: boolean) => set({isHideNominal: value}),
      setContactable: (value: boolean) => set({isContactable: value}),
      setReminderEnabled: (value: boolean) => set({isReminderEnabled: value}),
      setReminderFrequency: (value: DonationReminderFrequency) =>
        set({reminderFrequency: value}),
      setReminderTime: (value: string) => set({reminderTime: value}),
      reset: () => set({...ACCOUNT_PREFERENCES}),
    }),
    {
      name: 'setting-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
