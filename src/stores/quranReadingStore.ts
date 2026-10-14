import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {ReadingPosition} from '@/types/quran';

interface QuranReadingState {
  // Posisi baca terakhir per surah, dikunci nomor surah. Sumber kebenaran
  // lokal — dipakai supaya surah bisa dilanjutkan walau sync ke server gagal
  // atau device sedang offline.
  positions: Record<number, ReadingPosition>;
  setPosition: (surahNumber: number, ayahNumber: number) => void;
  getPosition: (surahNumber: number) => ReadingPosition | null;
  reset: () => void;
}

export const useQuranReadingStore = create<QuranReadingState>()(
  persist(
    (set, get) => ({
      positions: {},
      setPosition: (surahNumber: number, ayahNumber: number) =>
        set(state => ({
          positions: {
            ...state.positions,
            [surahNumber]: {
              surahNumber,
              ayahNumber,
              updatedAt: new Date().toISOString(),
            },
          },
        })),
      getPosition: (surahNumber: number) =>
        get().positions[surahNumber] ?? null,
      reset: () => set({positions: {}}),
    }),
    {
      name: 'quran-reading-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
