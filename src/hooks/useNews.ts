import {useState} from 'react';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {getFeaturedNews, getNewsList} from '@/services/newsService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import type {Article, NewsFilter} from '@/types/news';

type State = {
  featuredArticles: Article[];
  activeFilter: NewsFilter;
  isSearchActive: boolean;
  searchInput: string;
  searchQuery: string;
  articles: Article[];
  isLoading: boolean;
  isListLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
};

type Actions = {
  changeFilter: (filter: NewsFilter) => void;
  openSearch: () => void;
  setSearchInput: (value: string) => void;
  submitSearch: () => void;
  clearSearch: () => void;
  loadMore: () => void;
  refresh: () => Promise<void>;
};

export function useNews(): State & Actions {
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<NewsFilter>('recommended');
  const [isSearchActive, setIsSearchActive] = useState(false);
  // searchInput: nilai field, update tiap keystroke. searchQuery: nilai yang
  // sudah di-submit (tombol/enter) — cuma searchQuery yang masuk ke query key.
  // Tidak ada debounce di sini (beda dari useAllDonations) karena baik ganti
  // filter maupun search sama-sama aksi eksplisit user, bukan realtime typing.
  const [searchInput, setSearchInputState] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filter = {sort: activeFilter, search: searchQuery};

  const featuredQuery = useQuery({
    queryKey: queryKeys.news.featured,
    queryFn: () => getFeaturedNews().then(unwrapResponse),
  });

  const listQuery = useInfiniteQuery({
    queryKey: queryKeys.news.list(filter),
    queryFn: ({pageParam}) =>
      getNewsList({page: pageParam, ...filter}).then(unwrapResponse),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    // Ganti filter/search sambil list lama masih tampil (bukan blank) selagi
    // halaman pertama untuk filter baru di-fetch — sumber `isListLoading`.
    placeholderData: keepPreviousData,
  });

  const articles = listQuery.data?.pages.flatMap(page => page.items) ?? [];

  function changeFilter(filterValue: NewsFilter): void {
    setActiveFilter(filterValue);
  }

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
      await Promise.all([
        featuredQuery.refetch(),
        // resetQueries (bukan refetch) — pull-to-refresh harus collapse balik
        // ke halaman 1 saja, bukan refetch semua halaman yang sudah dimuat
        // lewat infinite scroll (perilaku refetch() bawaan infinite query).
        queryClient.resetQueries({
          queryKey: queryKeys.news.list(filter),
          exact: true,
        }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }

  return {
    featuredArticles: featuredQuery.data ?? [],
    activeFilter,
    isSearchActive,
    searchInput,
    searchQuery,
    articles,
    isLoading: featuredQuery.isPending || listQuery.isPending,
    isListLoading:
      listQuery.isFetching && !listQuery.isPending && !listQuery.isFetchingNextPage,
    isLoadingMore: listQuery.isFetchingNextPage,
    isRefreshing,
    hasMore: listQuery.hasNextPage,
    changeFilter,
    openSearch,
    setSearchInput,
    submitSearch,
    clearSearch,
    loadMore,
    refresh,
  };
}
