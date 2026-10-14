import {useMemo, useState} from 'react';
import {searchSurahs} from '@/services/quranContentService';
import {useQuranSearchStore} from '@/stores/quranSearchStore';
import {useDebouncedValue} from '@/hooks/useDebouncedValue';
import type {SurahMeta} from '@/types/quran';

const FILTER_DEBOUNCE_MS = 300;

type State = {
  keyword: string;
  results: SurahMeta[];
  recentSearches: string[];
  isSearching: boolean;
  hasNoResult: boolean;
};

type Actions = {
  setKeyword: (value: string) => void;
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
};

export function useQuranSearch(): State & Actions {
  // Field tampilan: ikut tiap ketikan supaya input tidak terasa berat.
  const [keyword, setKeyword] = useState('');
  // Field sebenarnya: menyusul 300ms setelah ketikan berhenti, dipakai
  // untuk memfilter 114 surah.
  const debouncedKeyword = useDebouncedValue(keyword, FILTER_DEBOUNCE_MS);

  const recentSearches = useQuranSearchStore(s => s.recentSearches);
  const addRecentSearch = useQuranSearchStore(s => s.addRecentSearch);
  const removeRecentSearch = useQuranSearchStore(s => s.removeRecentSearch);
  const clearRecentSearches = useQuranSearchStore(s => s.clearRecentSearches);

  const results = useMemo(
    () => searchSurahs(debouncedKeyword),
    [debouncedKeyword],
  );

  // Dibaca dari keyword mentah, bukan yang ter-debounce, supaya riwayat
  // langsung tersembunyi begitu user mulai mengetik.
  const isSearching = keyword.trim().length > 0;

  return {
    keyword,
    results,
    recentSearches,
    isSearching,
    hasNoResult:
      isSearching && debouncedKeyword.trim().length > 0 && results.length === 0,
    setKeyword,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  };
}
