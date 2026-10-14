import {useSearchStore} from '@/stores/searchStore';

type State = {
  recentSearches: string[];
};

type Actions = {
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
};

export function useSearch(): State & Actions {
  const recentSearches = useSearchStore(s => s.recentSearches);
  const addRecentSearch = useSearchStore(s => s.addRecentSearch);
  const clearRecentSearches = useSearchStore(s => s.clearRecentSearches);

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}
