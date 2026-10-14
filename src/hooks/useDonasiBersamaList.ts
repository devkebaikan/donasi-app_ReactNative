import {useState} from 'react';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {getDonasiBersamaList} from '@/services/donasiBersamaService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import type {
  DonasiBersamaGroup,
  DonasiBersamaTab,
} from '@/types/donasiBersama';

type State = {
  activeTab: DonasiBersamaTab;
  isSearchActive: boolean;
  searchInput: string;
  searchQuery: string;
  groups: DonasiBersamaGroup[];
  isLoading: boolean;
  isListLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
};

type Actions = {
  setActiveTab: (tab: DonasiBersamaTab) => void;
  openSearch: () => void;
  setSearchInput: (value: string) => void;
  submitSearch: () => void;
  clearSearch: () => void;
  loadMore: () => void;
  refresh: () => Promise<void>;
};

export function useDonasiBersamaList(): State & Actions {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<DonasiBersamaTab>('popular');
  const [isSearchActive, setIsSearchActive] = useState(false);
  // searchInput: nilai field, update tiap keystroke. searchQuery: nilai yang
  // sudah di-submit (tombol cari/enter) — cuma searchQuery yang masuk query
  // key. Tidak ada debounce: pencarian di menu ini aksi eksplisit user.
  const [searchInput, setSearchInputState] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const listKey = queryKeys.donasiBersama.list(activeTab, searchQuery);

  const listQuery = useInfiniteQuery({
    queryKey: listKey,
    queryFn: ({pageParam}) =>
      getDonasiBersamaList({
        page: pageParam,
        tab: activeTab,
        search: searchQuery,
      }).then(unwrapResponse),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    // Ganti chip/kata kunci sambil daftar lama masih tampil (bukan blank)
    // selagi halaman pertama hasil baru di-fetch — sumber `isListLoading`.
    placeholderData: keepPreviousData,
  });

  const groups = listQuery.data?.pages.flatMap(page => page.items) ?? [];

  function openSearch(): void {
    setIsSearchActive(true);
  }

  function setSearchInput(value: string): void {
    setSearchInputState(value);
  }

  function submitSearch(): void {
    setSearchQuery(searchInput.trim());
  }

  // Field masih ada isinya → dikosongkan dulu, mode search tetap aktif.
  // Field sudah kosong → tutup mode search, kembalikan ke hasil non-search.
  // Perilaku yang sama dengan useNews, karena field-nya juga NewsHeader.
  function clearSearch(): void {
    if (searchInput) {
      setSearchInputState('');
      return;
    }
    setIsSearchActive(false);
    setSearchQuery('');
  }

  function loadMore(): void {
    if (listQuery.isFetchingNextPage || !listQuery.hasNextPage) {
      return;
    }
    listQuery.fetchNextPage();
  }

  async function refresh(): Promise<void> {
    setIsRefreshing(true);
    try {
      // resetQueries (bukan refetch) — pull-to-refresh harus collapse balik ke
      // halaman 1 saja, bukan refetch semua halaman yang sudah dimuat lewat
      // infinite scroll (perilaku refetch() bawaan infinite query).
      await queryClient.resetQueries({queryKey: listKey, exact: true});
    } finally {
      setIsRefreshing(false);
    }
  }

  return {
    activeTab,
    isSearchActive,
    searchInput,
    searchQuery,
    groups,
    isLoading: listQuery.isPending,
    isListLoading:
      listQuery.isFetching &&
      !listQuery.isPending &&
      !listQuery.isFetchingNextPage,
    isLoadingMore: listQuery.isFetchingNextPage,
    isRefreshing,
    hasMore: listQuery.hasNextPage,
    setActiveTab,
    openSearch,
    setSearchInput,
    submitSearch,
    clearSearch,
    loadMore,
    refresh,
  };
}
