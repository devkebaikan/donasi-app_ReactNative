import {useState} from 'react';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getDonationCategories,
  getFeaturedDonations,
  getDonationList,
} from '@/services/donationService';
import {useDebouncedValue} from '@/hooks/useDebouncedValue';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import type {Category} from '@/types/category';
import type {Program} from '@/types/program';
import type {SortDirection, SortOption, ViewMode} from '@/types/donationFilter';

const LIST_RELOAD_DEBOUNCE_MS = 400;
// Tier "static" — kategori & program unggulan jarang berubah, boleh dianggap
// segar lebih lama daripada default global (5 menit).
const STATIC_STALE_TIME_MS = 1000 * 60 * 30;

type State = {
  categories: Category[];
  selectedCategoryId: number | null;
  featuredPrograms: Program[];
  sortOption: SortOption;
  sortDirection: SortDirection;
  viewMode: ViewMode;
  donations: Program[];
  isLoading: boolean;
  isRefreshing: boolean;
  isListLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
};

type Actions = {
  selectCategory: (category: Category) => void;
  setSortOption: (option: SortOption) => void;
  toggleSortDirection: () => void;
  setViewMode: (mode: ViewMode) => void;
  loadMore: () => void;
  refresh: () => Promise<void>;
};

export function useAllDonations(
  searchQuery: string,
  initialCategoryId: number | null = null,
): State & Actions {
  const queryClient = useQueryClient();

  // Display state: updates immediately so the UI (selection highlight,
  // dropdown label, sort icon) never waits on the network.
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    initialCategoryId,
  );
  const [sortOption, setSortOption] = useState<SortOption>('terbaru');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // API state: settles only after the display state stops changing for
  // LIST_RELOAD_DEBOUNCE_MS — masuk ke query key, jadi rapid taps tidak
  // spawn query baru tiap huruf/tap.
  const apiCategoryId = useDebouncedValue(
    selectedCategoryId,
    LIST_RELOAD_DEBOUNCE_MS,
  );
  const apiSortOption = useDebouncedValue(sortOption, LIST_RELOAD_DEBOUNCE_MS);
  const apiSortDirection = useDebouncedValue(
    sortDirection,
    LIST_RELOAD_DEBOUNCE_MS,
  );

  const filter = {
    categoryId: apiCategoryId,
    sortOption: apiSortOption,
    sortDirection: apiSortDirection,
    search: searchQuery,
  };

  const categoriesQuery = useQuery({
    queryKey: queryKeys.donations.categories,
    queryFn: () => getDonationCategories().then(unwrapResponse),
    staleTime: STATIC_STALE_TIME_MS,
  });

  const featuredQuery = useQuery({
    queryKey: queryKeys.donations.featured,
    queryFn: () => getFeaturedDonations().then(unwrapResponse),
    staleTime: STATIC_STALE_TIME_MS,
  });

  const listQuery = useInfiniteQuery({
    queryKey: queryKeys.donations.list(filter),
    queryFn: ({pageParam}) =>
      getDonationList({page: pageParam, ...filter}).then(unwrapResponse),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    // Ganti kategori/sort/search sambil list lama masih tampil (bukan blank)
    // selagi halaman pertama utk filter baru di-fetch — sumber `isListLoading`.
    placeholderData: keepPreviousData,
  });

  const donations = listQuery.data?.pages.flatMap(page => page.items) ?? [];

  function selectCategory(category: Category): void {
    setSelectedCategoryId(prev => (prev === category.id ? null : category.id));
  }

  function toggleSortDirection(): void {
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
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
      await Promise.all([
        categoriesQuery.refetch(),
        featuredQuery.refetch(),
        // resetQueries (bukan refetch) — pull-to-refresh harus collapse balik
        // ke halaman 1 saja, bukan refetch semua halaman yang sudah termuat
        // lewat "Load More" (perilaku refetch() bawaan infinite query).
        queryClient.resetQueries({
          queryKey: queryKeys.donations.list(filter),
          exact: true,
        }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }

  return {
    categories: categoriesQuery.data ?? [],
    selectedCategoryId,
    featuredPrograms: featuredQuery.data ?? [],
    sortOption,
    sortDirection,
    viewMode,
    donations,
    isLoading:
      categoriesQuery.isPending || featuredQuery.isPending || listQuery.isPending,
    isRefreshing,
    isListLoading:
      listQuery.isFetching && !listQuery.isPending && !listQuery.isFetchingNextPage,
    isLoadingMore: listQuery.isFetchingNextPage,
    hasMore: listQuery.hasNextPage,
    selectCategory,
    setSortOption,
    toggleSortDirection,
    setViewMode,
    loadMore,
    refresh,
  };
}
