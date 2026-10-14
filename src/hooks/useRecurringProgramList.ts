import {useState} from 'react';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {getDonationList} from '@/services/donationService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import type {Program} from '@/types/program';
import type {SortDirection, SortOption} from '@/types/donationFilter';

type State = {
  sortOption: SortOption;
  sortDirection: SortDirection;
  programs: Program[];
  /** Jumlah program rutin yang cocok dengan filter saat ini (semua halaman). */
  total: number;
  isLoading: boolean;
  isListLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
};

type Actions = {
  setSortOption: (option: SortOption) => void;
  toggleSortDirection: () => void;
  loadMore: () => void;
  refresh: () => Promise<void>;
};

// Katalog program yang mendukung donasi rutin. Memakai pipeline daftar program
// yang sudah ada (getDonationList) dengan satu param tambahan `isRutin`, bukan
// endpoint sendiri — lihat docs/08-features/donasi-rutin/donasi-rutin-list.md.
export function useRecurringProgramList(searchQuery: string): State & Actions {
  const queryClient = useQueryClient();

  const [sortOption, setSortOption] = useState<SortOption>('terbaru');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const listKey = queryKeys.recurring.programs(
    sortOption,
    sortDirection,
    searchQuery,
  );

  const listQuery = useInfiniteQuery({
    queryKey: listKey,
    queryFn: ({pageParam}) =>
      getDonationList({
        page: pageParam,
        categoryId: null,
        sortOption,
        sortDirection,
        search: searchQuery,
        isRutin: true,
      }).then(unwrapResponse),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    // Ganti sort/kata kunci sambil daftar lama masih tampil (bukan blank)
    // selagi halaman pertama hasil baru di-fetch — sumber `isListLoading`.
    placeholderData: keepPreviousData,
  });

  const programs = listQuery.data?.pages.flatMap(page => page.items) ?? [];
  // `total` datang dari halaman pertama. Fallback ke jumlah item yang sudah
  // dimuat supaya banner tidak pernah menampilkan 0 padahal daftarnya berisi —
  // mis. saat cache lama (dari respons yang belum punya field `total`) masih
  // dipakai sesudah Fast Refresh.
  const total = listQuery.data?.pages[0]?.total ?? programs.length;

  function toggleSortDirection(): void {
    setSortDirection(current => (current === 'asc' ? 'desc' : 'asc'));
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
      // resetQueries (bukan refetch) — pull to refresh harus kembali ke
      // halaman 1 saja, bukan memuat ulang semua halaman yang sudah dibuka.
      await queryClient.resetQueries({queryKey: listKey, exact: true});
    } finally {
      setIsRefreshing(false);
    }
  }

  return {
    sortOption,
    sortDirection,
    programs,
    total,
    isLoading: listQuery.isPending,
    isListLoading:
      listQuery.isFetching &&
      !listQuery.isPending &&
      !listQuery.isFetchingNextPage,
    isLoadingMore: listQuery.isFetchingNextPage,
    isRefreshing,
    hasMore: listQuery.hasNextPage,
    setSortOption,
    toggleSortDirection,
    loadMore,
    refresh,
  };
}
