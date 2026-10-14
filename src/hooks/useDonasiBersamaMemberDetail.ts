import {useState} from 'react';
import {useInfiniteQuery, useQueryClient} from '@tanstack/react-query';
import {
  getDonasiBersamaMemberContributions,
  removeDonasiBersamaMember,
} from '@/services/donasiBersamaService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {showToast} from '@/utils/toast';
import type {DonasiBersamaContribution} from '@/types/donasiBersama';

type State = {
  contributions: DonasiBersamaContribution[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  isRemoving: boolean;
};

type Actions = {
  loadMore: () => void;
  removeMember: () => Promise<boolean>;
};

export function useDonasiBersamaMemberDetail(
  groupId: string,
  memberId: string,
): State & Actions {
  const queryClient = useQueryClient();
  const [isRemoving, setIsRemoving] = useState(false);

  const listQuery = useInfiniteQuery({
    queryKey: queryKeys.donasiBersama.memberContributions(groupId, memberId),
    queryFn: ({pageParam}) =>
      getDonasiBersamaMemberContributions(groupId, memberId, {
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

  async function removeMember(): Promise<boolean> {
    setIsRemoving(true);
    try {
      const response = await removeDonasiBersamaMember(groupId, memberId);
      if (!response.success) {
        showToast(response.message);
        return false;
      }
      // Daftar anggota dan jumlah anggota di detail grup sama-sama berubah.
      queryClient.invalidateQueries({queryKey: ['donasi-bersama', 'members']});
      queryClient.invalidateQueries({
        queryKey: queryKeys.donasiBersama.detail(groupId),
      });
      showToast(response.message);
      return true;
    } catch {
      showToast('Tidak dapat terhubung.');
      return false;
    } finally {
      setIsRemoving(false);
    }
  }

  return {
    contributions: listQuery.data?.pages.flatMap(page => page.items) ?? [],
    isLoading: listQuery.isPending,
    isLoadingMore: listQuery.isFetchingNextPage,
    hasMore: listQuery.hasNextPage,
    isRemoving,
    loadMore,
    removeMember,
  };
}
