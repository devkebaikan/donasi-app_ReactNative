import {useState} from 'react';
import {useInfiniteQuery, useQueryClient} from '@tanstack/react-query';
import {getDonasiBersamaMyContributions} from '@/services/donasiBersamaService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import type {DonasiBersamaMyContribution} from '@/types/donasiBersama';

type State = {
  contributions: DonasiBersamaMyContribution[];
  totalAmount: number;
  count: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
};

type Actions = {
  loadMore: () => void;
  refresh: () => Promise<void>;
};

export function useDonasiBersamaMyContributions(
  groupId: string,
): State & Actions {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const listKey = queryKeys.donasiBersama.myContributions(groupId);

  const listQuery = useInfiniteQuery({
    queryKey: listKey,
    queryFn: ({pageParam}) =>
      getDonasiBersamaMyContributions(groupId, {page: pageParam}).then(
        unwrapResponse,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
  });

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
    contributions: listQuery.data?.pages.flatMap(page => page.items) ?? [],
    // Ringkasan datang dari halaman mana pun — nilainya sama, dan mencakup
    // seluruh urunan, bukan cuma yang sudah dimuat.
    totalAmount: listQuery.data?.pages[0]?.totalAmount ?? 0,
    count: listQuery.data?.pages[0]?.count ?? 0,
    isLoading: listQuery.isPending,
    isLoadingMore: listQuery.isFetchingNextPage,
    isRefreshing,
    hasMore: listQuery.hasNextPage,
    loadMore,
    refresh,
  };
}
