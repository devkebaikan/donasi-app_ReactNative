import {MutationCache, QueryCache, QueryClient} from '@tanstack/react-query';
import {ApiError} from '@/utils/apiError';
import {showToast} from '@/utils/toast';

// Titik sentral error → toast untuk semua query & mutation — hook yang
// dimigrasi ke useQuery/useMutation tidak perlu lagi tulis
// `catch { showToast(...) }` manual, cukup lempar lewat `unwrapResponse`.
function handleQueryError(error: unknown): void {
  showToast(
    error instanceof ApiError ? error.message : 'Tidak dapat terhubung.',
  );
}

// Singleton — diimport oleh App.tsx (Provider) maupun apiClient.ts
// (interceptor 401, lihat komentar di sana) supaya keduanya pegang instance
// cache yang sama tanpa lewat React context.
export const queryClient = new QueryClient({
  queryCache: new QueryCache({onError: handleQueryError}),
  mutationCache: new MutationCache({onError: handleQueryError}),
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});
