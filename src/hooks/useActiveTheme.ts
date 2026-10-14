import {useQuery} from '@tanstack/react-query';
import {getActiveTheme} from '@/services/themeService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import type {Theme} from '@/types/theme';

type State = {
  theme: Theme | null;
  isLoading: boolean;
  isConnectionError: boolean;
};

type Actions = {
  retry: () => void;
};

export function useActiveTheme(): State & Actions {
  const themeQuery = useQuery({
    queryKey: queryKeys.themes.active,
    queryFn: () => getActiveTheme().then(unwrapResponse),
  });

  function retry(): void {
    themeQuery.refetch();
  }

  // Sama seperti useEvent: tidak ada isNotFound, karena tidak ada id yang bisa
  // salah dan "belum ada tema" adalah keadaan sah (data null) yang punya empty
  // state sendiri, bukan error.
  // Toast-nya sudah ditangani terpusat di queryCache onError
  // (src/services/queryClient.ts) — jangan panggil showToast lagi di sini.
  return {
    theme: themeQuery.data ?? null,
    isLoading: themeQuery.isPending,
    isConnectionError: themeQuery.isError,
    retry,
  };
}
