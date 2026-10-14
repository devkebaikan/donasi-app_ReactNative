import {useInfiniteQuery} from '@tanstack/react-query';
import {getDonasiBersamaBatchContributions} from '@/services/donasiBersamaService';
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
};

export function useDonasiBersamaBatchContributions(
  groupId: string,
  batchId: string,
): State & Actions {
  const listQuery = useInfiniteQuery({
    queryKey: queryKeys.donasiBersama.batchContributions(groupId, batchId),
    queryFn: ({pageParam}) =>
      getDonasiBersamaBatchContributions(groupId, batchId, {
        page: pageParam,
      }).then(unwrapResponse),
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

  return {
    contributions: listQuery.data?.pages.flatMap(page => page.items) ?? [],
    isLoading: listQuery.isPending,
    isLoadingMore: listQuery.isFetchingNextPage,
    hasMore: listQuery.hasNextPage,
    loadMore,
  };
}
