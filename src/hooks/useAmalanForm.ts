import {useState} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {createAmalan, updateAmalan} from '@/services/amalanService';
import {ApiError} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {showToast} from '@/utils/toast';
import type {AmalanPayload} from '@/types/amalan';

const NETWORK_ERROR_MESSAGE = 'Tidak dapat terhubung.';

// Hasil satu kali simpan. Screen induk butuh membedakan ketiganya: hanya
// 'saved' dan 'missing' yang menutup sheet, dan hanya 'missing' yang berarti
// amalannya memang sudah tidak ada lagi.
export type AmalanSaveResult = 'saved' | 'invalid' | 'missing';

interface AmalanSummaryRange {
  start: string;
  end: string;
}

type State = {
  isSubmitting: boolean;
  fieldErrors: Record<string, string>;
};

type Actions = {
  save: (payload: AmalanPayload, amalanId?: string) => Promise<AmalanSaveResult>;
  clearFieldErrors: () => void;
};

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : NETWORK_ERROR_MESSAGE;
}

// Kunci `data` memakai nama field payload (presetSlug, time, note), jadi
// pemetaannya langsung tanpa tabel penerjemah.
function fieldErrorsFrom(error: unknown): Record<string, string> {
  if (
    error instanceof ApiError &&
    error.data != null &&
    typeof error.data === 'object'
  ) {
    return error.data as Record<string, string>;
  }
  return {};
}

export function useAmalanForm(summaryRange: AmalanSummaryRange): State & Actions {
  const queryClient = useQueryClient();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // TIDAK memakai unwrapResponse: pesan sukses ikut ditampilkan sebagai toast,
  // dan unwrapResponse membuang `message` begitu `success: true`. Kontrak
  // errornya tetap sama — ApiError dengan message dan data dari response,
  // persis yang dilempar unwrapResponse.
  const saveMutation = useMutation({
    mutationFn: async ({
      payload,
      amalanId,
    }: {
      payload: AmalanPayload;
      amalanId?: string;
    }) => {
      const response = amalanId
        ? await updateAmalan(amalanId, payload)
        : await createAmalan(payload);
      if (!response.success) {
        throw new ApiError(response.message, response.data);
      }
      return response;
    },
  });

  async function save(
    payload: AmalanPayload,
    amalanId?: string,
  ): Promise<AmalanSaveResult> {
    // Dikosongkan tiap submit dimulai supaya error lama tidak menempel di field
    // yang sudah diperbaiki.
    setFieldErrors({});
    try {
      const response = await saveMutation.mutateAsync({payload, amalanId});
      await queryClient.invalidateQueries({
        queryKey: queryKeys.amalan.day(response.data.date),
      });
      // Amalan bisa berpindah tanggal lewat payload.date — segarkan tanggal
      // asalnya juga supaya barisnya tidak tertinggal di daftar lama.
      if (amalanId && payload.date !== response.data.date) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.amalan.day(payload.date),
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.amalan.summary(summaryRange.start, summaryRange.end),
      });
      showToast(response.message);
      return 'saved';
    } catch (error) {
      showToast(errorMessage(error));
      const errors = fieldErrorsFrom(error);
      setFieldErrors(errors);

      // Mode ubah yang ditolak server TANPA error per field berarti amalannya
      // sudah tidak ada lagi (dihapus di perangkat lain) — tidak ada yang bisa
      // diperbaiki di form, jadi sheet ditutup dan daftar disegarkan.
      // Throw jaringan bukan ApiError, jadi tidak masuk ke sini: isian
      // pengguna tetap aman di sheet yang terbuka.
      if (
        amalanId &&
        error instanceof ApiError &&
        Object.keys(errors).length === 0
      ) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.amalan.day(payload.date),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.amalan.summary(
            summaryRange.start,
            summaryRange.end,
          ),
        });
        return 'missing';
      }
      return 'invalid';
    }
  }

  function clearFieldErrors(): void {
    setFieldErrors({});
  }

  return {
    isSubmitting: saveMutation.isPending,
    fieldErrors,
    save,
    clearFieldErrors,
  };
}
