import {useQuery} from '@tanstack/react-query';
import {getEvent} from '@/services/eventService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import type {Event} from '@/types/event';

type State = {
  event: Event | null;
  isLoading: boolean;
  isConnectionError: boolean;
};

type Actions = {
  retry: () => void;
};

export function useEvent(): State & Actions {
  const eventQuery = useQuery({
    queryKey: queryKeys.event,
    queryFn: () => getEvent().then(unwrapResponse),
  });

  function retry(): void {
    eventQuery.refetch();
  }

  // Tidak ada padanan isNotFound seperti di useReflectionDetail: tidak ada id
  // yang bisa salah, dan "belum ada event" adalah keadaan sah (data null) yang
  // punya empty state sendiri, bukan error.
  // Toast-nya sudah ditangani terpusat di queryCache onError
  // (src/services/queryClient.ts) — jangan panggil showToast lagi di sini.
  return {
    event: eventQuery.data ?? null,
    isLoading: eventQuery.isPending,
    isConnectionError: eventQuery.isError,
    retry,
  };
}
