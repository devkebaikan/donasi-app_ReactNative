import {useCallback, useState} from 'react';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import {
  getDoaBanners,
  getDoaList,
  reportDoa,
  toggleDoaAmiin,
  toggleDoaFavorite,
} from '@/services/doaService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {showToast} from '@/utils/toast';
import type {Doa, DoaBanner, DoaListResult, DoaTab} from '@/types/doa';

const NETWORK_ERROR_MESSAGE = 'Tidak dapat terhubung.';

type ListCache = InfiniteData<DoaListResult, number>;

type State = {
  activeTab: DoaTab;
  banners: DoaBanner[];
  doaList: Doa[];
  isLoading: boolean;
  isListLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  isReporting: boolean;
  hasMore: boolean;
};

type Actions = {
  changeTab: (tab: DoaTab) => void;
  toggleAmiin: (doa: Doa) => void;
  toggleFavorite: (doa: Doa) => void;
  report: (doa: Doa) => Promise<void>;
  loadMore: () => void;
  refresh: () => Promise<void>;
};

// Tab yang butuh login tidak boleh memanggil API sama sekali — screen
// menampilkan auth gate sebagai gantinya. Pola yang sama dipakai
// useNotifications(isAuthenticated).
function isTabQueryEnabled(tab: DoaTab, isAuthenticated: boolean): boolean {
  return tab === 'all' || isAuthenticated;
}

export function useDoaList(
  isAuthenticated: boolean,
  initialTab: DoaTab = 'all',
): State & Actions {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<DoaTab>(initialTab);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const bannersQuery = useQuery({
    queryKey: queryKeys.doa.banners,
    queryFn: () => getDoaBanners().then(unwrapResponse),
  });

  const listQuery = useInfiniteQuery({
    queryKey: queryKeys.doa.list(activeTab),
    queryFn: ({pageParam}) =>
      getDoaList({page: pageParam, tab: activeTab}).then(unwrapResponse),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    enabled: isTabQueryEnabled(activeTab, isAuthenticated),
    // Ganti tab sambil daftar lama masih tampil (bukan blank) selagi halaman
    // pertama tab baru di-fetch — sumber `isListLoading`.
    placeholderData: keepPreviousData,
  });

  const doaList = listQuery.data?.pages.flatMap(page => page.items) ?? [];

  // Perbarui satu kartu di cache tanpa refetch. invalidateQueries tidak dipakai
  // di sini: query ini infinite, invalidate akan menarik ulang SEMUA halaman
  // yang sudah dimuat dan membuat list berkedip.
  function patchDoaInCache(tab: DoaTab, doaId: string, patch: Partial<Doa>): void {
    queryClient.setQueryData<ListCache>(queryKeys.doa.list(tab), current => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        pages: current.pages.map(page => ({
          ...page,
          items: page.items.map(item =>
            item.id === doaId ? {...item, ...patch} : item,
          ),
        })),
      };
    });
  }

  const amiinMutation = useMutation({
    mutationFn: (doa: Doa) => toggleDoaAmiin(doa.id).then(unwrapResponse),
    onMutate: (doa: Doa) => {
      // Optimistic: kartu berubah seketika, request menyusul. Aamiin lumrah
      // ditekan berturut-turut sambil scroll, menunggu round-trip bikin macet.
      const tab = activeTab;
      patchDoaInCache(tab, doa.id, {isAmiin: !doa.isAmiin});
      return {tab, previous: doa.isAmiin};
    },
    onSuccess: (result, doa, context) => {
      // Selaraskan dengan server, bukan dengan tebakan client.
      patchDoaInCache(context?.tab ?? activeTab, doa.id, {
        isAmiin: result.isAmiin,
        isFavorite: result.isFavorite,
      });
    },
    onError: (error, doa, context) => {
      patchDoaInCache(context?.tab ?? activeTab, doa.id, {
        isAmiin: context?.previous ?? doa.isAmiin,
      });
      showToast(error.message || NETWORK_ERROR_MESSAGE);
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: (doa: Doa) => toggleDoaFavorite(doa.id).then(unwrapResponse),
    onMutate: (doa: Doa) => {
      const tab = activeTab;
      // Sengaja hanya menandai, tidak menghapus kartu dari tab "Doa Favorit" —
      // kartunya bertahan sampai refresh berikutnya supaya salah tekan masih
      // bisa dibatalkan.
      patchDoaInCache(tab, doa.id, {isFavorite: !doa.isFavorite});
      return {tab, previous: doa.isFavorite};
    },
    onSuccess: (result, doa, context) => {
      patchDoaInCache(context?.tab ?? activeTab, doa.id, {
        isAmiin: result.isAmiin,
        isFavorite: result.isFavorite,
      });
    },
    onError: (error, doa, context) => {
      patchDoaInCache(context?.tab ?? activeTab, doa.id, {
        isFavorite: context?.previous ?? doa.isFavorite,
      });
      showToast(error.message || NETWORK_ERROR_MESSAGE);
    },
  });

  const reportMutation = useMutation({
    mutationFn: (doa: Doa) => reportDoa(doa.id).then(unwrapResponse),
  });

  // useCallback supaya identitasnya stabil: DoaListScreen memakainya di dalam
  // useEffect yang menyinkronkan tab dari route param.
  const changeTab = useCallback((tab: DoaTab): void => {
    setActiveTab(tab);
  }, []);

  function toggleAmiin(doa: Doa): void {
    amiinMutation.mutate(doa);
  }

  function toggleFavorite(doa: Doa): void {
    favoriteMutation.mutate(doa);
  }

  // Beda dari toggle: pelaporan bukan aksi optimistic — user perlu tahu
  // laporannya benar-benar terkirim, dan pesannya datang dari server.
  async function report(doa: Doa): Promise<void> {
    try {
      await reportMutation.mutateAsync(doa);
      patchDoaInCache(activeTab, doa.id, {isReported: true});
      showToast('Laporan terkirim. Terima kasih sudah membantu.');
    } catch (error) {
      showToast(
        error instanceof Error && error.message
          ? error.message
          : NETWORK_ERROR_MESSAGE,
      );
    }
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
        bannersQuery.refetch(),
        // resetQueries (bukan refetch) — pull-to-refresh harus collapse balik
        // ke halaman 1 saja, bukan refetch semua halaman yang sudah dimuat
        // lewat infinite scroll (perilaku refetch() bawaan infinite query).
        queryClient.resetQueries({
          queryKey: queryKeys.doa.list(activeTab),
          exact: true,
        }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }

  return {
    activeTab,
    banners: bannersQuery.data ?? [],
    doaList,
    isLoading: listQuery.isPending && listQuery.fetchStatus !== 'idle',
    isListLoading:
      listQuery.isFetching &&
      !listQuery.isPending &&
      !listQuery.isFetchingNextPage,
    isLoadingMore: listQuery.isFetchingNextPage,
    isRefreshing,
    isReporting: reportMutation.isPending,
    hasMore: listQuery.hasNextPage,
    changeTab,
    toggleAmiin,
    toggleFavorite,
    report,
    loadMore,
    refresh,
  };
}
