import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_RECENT_SEARCHES = 10;

interface QuranSearchState {
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  reset: () => void;
}

// Riwayat pencarian surah, terpisah dari searchStore milik pencarian donasi —
// dua domain berbeda, dan riwayatnya tidak boleh saling tercampur.
export const useQuranSearchStore = create<QuranSearchState>()(
  persist(
    (set, get) => ({
      recentSearches: [],
      addRecentSearch: (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) {
          return;
        }
        // Duplikat dipindah ke atas, bukan digandakan.
        const withoutDuplicate = get().recentSearches.filter(
          item => item.toLowerCase() !== trimmed.toLowerCase(),
        );
        set({
          recentSearches: [trimmed, ...withoutDuplicate].slice(
            0,
            MAX_RECENT_SEARCHES,
          ),
        });
      },
      removeRecentSearch: (query: string) =>
        set(state => ({
          recentSearches: state.recentSearches.filter(item => item !== query),
        })),
      clearRecentSearches: () => set({recentSearches: []}),
      reset: () => set({recentSearches: []}),
    }),
    {
      name: 'quran-search-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
