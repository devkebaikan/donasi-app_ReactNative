import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DEFAULT_QARI} from '@/utils/quranAudio';
import type {ArabicFontSize, Qari} from '@/types/quran';

// lineHeight selalu dua kali fontSize — bukan pilihan estetika: di bawah itu
// harakat atas terpotong baris di atasnya. Lihat ADR-005.
export const ARABIC_FONT_SCALE: Record<
  ArabicFontSize,
  {fontSize: number; lineHeight: number}
> = {
  small: {fontSize: 22, lineHeight: 44},
  medium: {fontSize: 26, lineHeight: 52},
  large: {fontSize: 30, lineHeight: 60},
  xlarge: {fontSize: 34, lineHeight: 68},
};

interface QuranSettingState {
  arabicFontSize: ArabicFontSize;
  showLatin: boolean;
  showTranslation: boolean;
  qari: Qari;
  setArabicFontSize: (size: ArabicFontSize) => void;
  setShowLatin: (value: boolean) => void;
  setShowTranslation: (value: boolean) => void;
  setQari: (value: Qari) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  arabicFontSize: 'medium' as ArabicFontSize,
  showLatin: true,
  showTranslation: true,
  qari: DEFAULT_QARI,
};

// Store sendiri, tidak menumpang settingStore — domain berbeda dan direset
// pada momen yang berbeda pula.
export const useQuranSettingStore = create<QuranSettingState>()(
  persist(
    set => ({
      ...INITIAL_STATE,
      setArabicFontSize: (size: ArabicFontSize) =>
        set({arabicFontSize: size}),
      setShowLatin: (value: boolean) => set({showLatin: value}),
      setShowTranslation: (value: boolean) => set({showTranslation: value}),
      setQari: (value: Qari) => set({qari: value}),
      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'quran-setting-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
