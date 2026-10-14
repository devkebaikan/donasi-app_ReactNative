import {useInfiniteQuery, useQueryClient} from '@tanstack/react-query';
import {getDonasiBersamaContributions} from '@/services/donasiBersamaService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import type {DonasiBersamaContribution} from '@/types/donasiBersama';

type State = {
  contributions: DonasiBersamaContribution[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
};

type Actions = {
  loadMore: () => void;
  refresh: () => Promise<void>;
};

interface Params {
  groupId: string;
  /** Riwayat baru dimuat saat tabnya benar-benar aktif. */
  enabled: boolean;
}

export function useDonasiBersamaContributions({
  groupId,
  enabled,
}: Params): State & Actions {
  const queryClient = useQueryClient();
  const listKey = queryKeys.donasiBersama.contributions(groupId);

  const listQuery = useInfiniteQuery({
    queryKey: listKey,
    queryFn: ({pageParam}) =>
      getDonasiBersamaContributions(groupId, {page: pageParam}).then(
        unwrapResponse,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    enabled,
  });

  // resetQueries (bukan refetch) — pull-to-refresh harus collapse balik ke
  // halaman 1 saja, bukan refetch semua halaman yang sudah dimuat.
  async function refresh(): Promise<void> {
    await queryClient.resetQueries({queryKey: listKey, exact: true});
  }

  function loadMore(): void {
    if (listQuery.isFetchingNextPage || !listQuery.hasNextPage) {
      return;
    }
    listQuery.fetchNextPage();
  }

  return {
    contributions: listQuery.data?.pages.flatMap(page => page.items) ?? [],
    // isPending tetap true selama query disabled — pakai isLoading supaya
    // skeleton tidak tampil di tab yang belum pernah dibuka.
    isLoading: listQuery.isLoading,
    isLoadingMore: listQuery.isFetchingNextPage,
    hasMore: listQuery.hasNextPage,
    loadMore,
    refresh,
  };
}
