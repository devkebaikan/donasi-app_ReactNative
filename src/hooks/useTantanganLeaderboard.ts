import {useInfiniteQuery} from '@tanstack/react-query';
import {getTantanganLeaderboard} from '@/services/tantanganService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import type {TantanganLeaderboardEntry} from '@/types/tantangan';

type State = {
  entries: TantanganLeaderboardEntry[];
  /**
   * Baris pengguna sendiri, dirender terpisah di bawah daftar. null saat
   * pengguna belum ikut, ATAU saat barisnya sudah ikut termuat di `entries` —
   * menampilkannya dua kali lebih membingungkan daripada tidak sama sekali.
   */
  me: TantanganLeaderboardEntry | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
};

type Actions = {
  loadMore: () => void;
};

interface Options {
  /** Dimatikan untuk tantangan mode personal — di sana tidak ada papan kebaikan. */
  enabled?: boolean;
}

export function useTantanganLeaderboard(
  challengeId: string,
  {enabled = true}: Options = {},
): State & Actions {
  const leaderboardQuery = useInfiniteQuery({
    queryKey: queryKeys.tantangan.leaderboard(challengeId),
    queryFn: ({pageParam}) =>
      getTantanganLeaderboard({challengeId, page: pageParam}).then(
        unwrapResponse,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    enabled,
  });

  const pages = leaderboardQuery.data?.pages ?? [];
  const entries = pages.flatMap(page => page.items);
  // `me` selalu dikirim server, tapi hanya dirender terpisah kalau barisnya
  // BELUM ada di halaman yang termuat.
  const rawMe = pages[0]?.me ?? null;
  const me =
    rawMe && !entries.some(entry => entry.id === rawMe.id) ? rawMe : null;

  function loadMore(): void {
    if (leaderboardQuery.isFetchingNextPage || !leaderboardQuery.hasNextPage) {
      return;
    }
    leaderboardQuery.fetchNextPage();
  }

  return {
    entries,
    me,
    isLoading: enabled && leaderboardQuery.isPending,
    isLoadingMore: leaderboardQuery.isFetchingNextPage,
    hasMore: leaderboardQuery.hasNextPage,
    loadMore,
  };
}
