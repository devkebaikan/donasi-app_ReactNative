import {useState} from 'react';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {getReflectionList} from '@/services/reflectionService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import type {Reflection} from '@/types/reflection';

type State = {
  searchInput: string;
  searchQuery: string;
  reflections: Reflection[];
  isLoading: boolean;
  isListLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
};

type Actions = {
  setSearchInput: (value: string) => void;
  submitSearch: () => void;
  clearSearch: () => void;
  loadMore: () => void;
  refresh: () => Promise<void>;
};

export function useReflections(): State & Actions {
  const queryClient = useQueryClient();

  // searchInput: nilai field, update tiap keystroke. searchQuery: nilai yang
  // sudah di-submit (tombol cari/enter) — cuma searchQuery yang masuk query
  // key. Tidak ada debounce: pencarian di menu ini aksi eksplisit user.
  const [searchInput, setSearchInputState] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const listQuery = useInfiniteQuery({
    queryKey: queryKeys.reflections.list(searchQuery),
    queryFn: ({pageParam}) =>
      getReflectionList({page: pageParam, search: searchQuery}).then(
        unwrapResponse,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    // Ganti kata kunci sambil daftar lama masih tampil (bukan blank) selagi
    // halaman pertama hasil baru di-fetch — sumber `isListLoading`.
    placeholderData: keepPreviousData,
  });

  const reflections = listQuery.data?.pages.flatMap(page => page.items) ?? [];

  function setSearchInput(value: string): void {
    setSearchInputState(value);
  }

  function submitSearch(): void {
    setSearchQuery(searchInput.trim());
  }

  // Field tidak pernah tersembunyi di screen ini (beda dari NewsScreen yang
  // punya mode search), jadi clear cukup mengosongkan field + query sekaligus.
  function clearSearch(): void {
    setSearchInputState('');
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
      await queryClient.resetQueries({
        queryKey: queryKeys.reflections.list(searchQuery),
        exact: true,
      });
    } finally {
      setIsRefreshing(false);
    }
  }

  return {
    searchInput,
    searchQuery,
    reflections,
    isLoading: listQuery.isPending,
    isListLoading:
      listQuery.isFetching &&
      !listQuery.isPending &&
      !listQuery.isFetchingNextPage,
    isLoadingMore: listQuery.isFetchingNextPage,
    isRefreshing,
    hasMore: listQuery.hasNextPage,
    setSearchInput,
    submitSearch,
    clearSearch,
    loadMore,
    refresh,
  };
}
