import type {ApiResponse} from '@/types/api';

// Dilempar di dalam queryFn/mutationFn saat response.success === false, supaya
// TanStack Query mencatatnya sebagai error state (query.error/mutation.error)
// alih-alih diam-diam kembali dengan data kosong. `data` menyimpan payload
// error asli dari response (mis. field errors) untuk kebutuhan lanjutan.
export class ApiError extends Error {
  readonly data: unknown;

  constructor(message: string, data: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.data = data;
  }
}

// Helper wajib dipakai di tiap queryFn/mutationFn yang manggil service —
// `someService.getSomething().then(unwrapResponse)` — supaya kontrak
// {success, message, data} otomatis terhubung ke error state React Query.
export function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new ApiError(response.message, response.data);
  }
  return response.data;
}
