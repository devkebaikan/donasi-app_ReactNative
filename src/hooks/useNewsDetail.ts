import {useState} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {getNewsDetail, toggleNewsLike} from '@/services/newsService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {showToast} from '@/utils/toast';
import type {ArticleDetail} from '@/types/news';

// Tinggi background image di NewsDetailScreen — dipakai juga sebagai
// threshold scroll untuk header transparent → light (lihat handleScroll).
export const NEWS_DETAIL_IMAGE_HEIGHT = 280;

type State = {
  article: ArticleDetail | null;
  isLoading: boolean;
  isNotFound: boolean;
  isHeaderCollapsed: boolean;
  isLiking: boolean;
};

type Actions = {
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  toggleLike: () => Promise<void>;
};

export function useNewsDetail(
  articleId: string,
  isAuthenticated: boolean,
): State & Actions {
  const queryClient = useQueryClient();
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const detailQuery = useQuery({
    queryKey: queryKeys.news.detail(articleId),
    queryFn: () => getNewsDetail(articleId).then(unwrapResponse),
  });

  const article = detailQuery.data ?? null;

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>): void {
    const scrollY = event.nativeEvent.contentOffset.y;
    const shouldCollapse = scrollY >= NEWS_DETAIL_IMAGE_HEIGHT;
    setIsHeaderCollapsed(prev => (prev === shouldCollapse ? prev : shouldCollapse));
  }

  async function toggleLike(): Promise<void> {
    if (!isAuthenticated || !article || isLiking) {
      return;
    }
    const optimisticIsLiked = !article.isLiked;
    const optimisticLikeCount = Math.max(
      0,
      article.likeCount + (optimisticIsLiked ? 1 : -1),
    );
    // Update optimistic duluan — TIDAK di-rollback kalau request gagal,
    // konsisten dengan pola markAsRead di useNotifications.ts (aksi ringan,
    // eventual consistency diterima, bukan aksi finansial yang butuh rollback
    // ketat).
    queryClient.setQueryData(queryKeys.news.detail(articleId), {
      ...article,
      isLiked: optimisticIsLiked,
      likeCount: optimisticLikeCount,
    });
    setIsLiking(true);
    try {
      const response = await toggleNewsLike(articleId);
      if (!response.success) {
        showToast(response.message);
        return;
      }
      // Sinkron ke angka pasti dari server.
      queryClient.setQueryData(
        queryKeys.news.detail(articleId),
        (current: ArticleDetail | undefined) =>
          current ? {...current, ...response.data} : current,
      );
    } catch {
      showToast('Tidak dapat terhubung.');
    } finally {
      setIsLiking(false);
    }
  }

  return {
    article,
    isLoading: detailQuery.isPending,
    isNotFound: detailQuery.isError,
    isHeaderCollapsed,
    isLiking,
    handleScroll,
    toggleLike,
  };
}
