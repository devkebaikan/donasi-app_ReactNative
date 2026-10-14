import {useState} from 'react';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {getDonasiBersamaMembers} from '@/services/donasiBersamaService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import type {DonasiBersamaMember} from '@/types/donasiBersama';

type State = {
  members: DonasiBersamaMember[];
  total: number;
  searchInput: string;
  searchQuery: string;
  isLoading: boolean;
  isListLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
};

type Actions = {
  setSearchInput: (value: string) => void;
  submitSearch: () => void;
  clearSearch: () => void;
  loadMore: () => void;
  refresh: () => Promise<void>;
};

export function useDonasiBersamaMembers(groupId: string): State & Actions {
  const queryClient = useQueryClient();

  // searchInput: nilai field, update tiap keystroke. searchQuery: nilai yang
  // sudah di-submit — cuma searchQuery yang masuk query key.
  const [searchInput, setSearchInputState] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const listKey = queryKeys.donasiBersama.members(groupId, searchQuery);

  const listQuery = useInfiniteQuery({
    queryKey: listKey,
    queryFn: ({pageParam}) =>
      getDonasiBersamaMembers(groupId, {
        page: pageParam,
        search: searchQuery,
      }).then(unwrapResponse),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    placeholderData: keepPreviousData,
  });

  function setSearchInput(value: string): void {
    setSearchInputState(value);
  }

  function submitSearch(): void {
    setSearchQuery(searchInput.trim());
  }

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
      await queryClient.resetQueries({queryKey: listKey, exact: true});
    } finally {
      setIsRefreshing(false);
    }
  }

  return {
    members: listQuery.data?.pages.flatMap(page => page.items) ?? [],
    // Jumlah anggota grup, bukan jumlah item halaman ini — dan sengaja tidak
    // ikut menyusut saat pencarian aktif.
    total: listQuery.data?.pages[0]?.total ?? 0,
    searchInput,
    searchQuery,
    isLoading: listQuery.isPending,
    isListLoading:
      listQuery.isFetching &&
      !listQuery.isPending &&
      !listQuery.isFetchingNextPage,
    isLoadingMore: listQuery.isFetchingNextPage,
    isRefreshing,
    setSearchInput,
    submitSearch,
    clearSearch,
    loadMore,
    refresh,
  };
}
