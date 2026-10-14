import {useQuery} from '@tanstack/react-query';
import {getReflectionDetail} from '@/services/reflectionService';
import {ApiError, unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import type {ReflectionDetail} from '@/types/reflection';

type State = {
  reflection: ReflectionDetail | null;
  isLoading: boolean;
  // Dibedakan karena penanganannya beda: renungan yang tidak ada membuat
  // screen ini tidak punya isi sama sekali (kembali ke daftar), sedangkan
  // gagal terhubung masih bisa dicoba ulang di tempat.
  isNotFound: boolean;
  isConnectionError: boolean;
};

type Actions = {
  retry: () => void;
};

export function useReflectionDetail(
  reflectionId: string,
): State & Actions {
  const detailQuery = useQuery({
    queryKey: queryKeys.reflections.detail(reflectionId),
    queryFn: () => getReflectionDetail(reflectionId).then(unwrapResponse),
  });

  // Toast-nya sudah ditangani terpusat di queryCache onError
  // (src/services/queryClient.ts) — jangan panggil showToast lagi di sini,
  // nanti dobel.
  const isNotFound = detailQuery.error instanceof ApiError;

  function retry(): void {
    detailQuery.refetch();
  }

  return {
    reflection: detailQuery.data ?? null,
    isLoading: detailQuery.isPending,
    isNotFound,
    isConnectionError: detailQuery.isError && !isNotFound,
    retry,
  };
}
