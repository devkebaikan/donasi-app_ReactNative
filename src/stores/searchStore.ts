import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_RECENT_SEARCHES = 10;

interface SearchState {
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      recentSearches: [],
      addRecentSearch: (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) {
          return;
        }
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
      clearRecentSearches: () => set({recentSearches: []}),
      reset: () => set({recentSearches: []}),
    }),
    {
      name: 'search-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
