import {useCallback, useState} from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  deleteAmalan,
  getAmalanDay,
  getAmalanPresets,
  getAmalanSummary,
  toggleAmalanComplete,
} from '@/services/amalanService';
import {ApiError, unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {showToast} from '@/utils/toast';
import {shiftIsoDate, toIsoDateOnly} from '@/utils/formatDate';
import type {
  Amalan,
  AmalanDayResult,
  AmalanPreset,
  AmalanSummary,
} from '@/types/amalan';

const NETWORK_ERROR_MESSAGE = 'Tidak dapat terhubung.';

// Hari ini + 6 hari ke belakang. Tidak ada tanggal masa depan: ini catatan
// amalan yang SUDAH dikerjakan, bukan daftar rencana.
export const AMALAN_STRIP_DAYS = 7;

const EMPTY_SUMMARY = (date: string): AmalanSummary => ({
  date,
  done: 0,
  total: 0,
});

export function getTodayIsoDate(): string {
  return toIsoDateOnly(new Date());
}

// Param `date` dari deep link yang basi diabaikan, bukan dianggap error.
export function resolveInitialDate(paramDate: string | undefined): string {
  const today = getTodayIsoDate();
  if (!paramDate) {
    return today;
  }
  const oldest = shiftIsoDate(today, -(AMALAN_STRIP_DAYS - 1));
  return paramDate >= oldest && paramDate <= today ? paramDate : today;
}

function buildStripRange(today: string): {start: string; end: string} {
  return {start: shiftIsoDate(today, -(AMALAN_STRIP_DAYS - 1)), end: today};
}

// Server selalu mengirim satu item per hari dalam rentang; fallback ini cuma
// dipakai selagi ringkasan belum datang atau saat request-nya gagal, supaya
// strip tetap tampil dan pengguna tetap bisa berpindah hari.
function buildFallbackSummaries(today: string): AmalanSummary[] {
  return Array.from({length: AMALAN_STRIP_DAYS}, (_, index) =>
    EMPTY_SUMMARY(shiftIsoDate(today, index - (AMALAN_STRIP_DAYS - 1))),
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : NETWORK_ERROR_MESSAGE;
}

type State = {
  today: string;
  selectedDate: string;
  summaries: AmalanSummary[];
  summary: AmalanSummary;
  items: Amalan[];
  presets: AmalanPreset[];
  isPresetsError: boolean;
  isLoading: boolean;
  isDayLoading: boolean;
  isRefreshing: boolean;
  isDeleting: boolean;
  summaryRange: {start: string; end: string};
};

type Actions = {
  selectDate: (date: string) => void;
  syncToday: () => void;
  toggleComplete: (amalan: Amalan) => void;
  removeAmalan: (amalan: Amalan) => Promise<void>;
  retryPresets: () => void;
  refresh: () => Promise<void>;
};

export function useAmalanHome(
  isAuthenticated: boolean,
  initialDate: string,
): State & Actions {
  const queryClient = useQueryClient();

  const [today, setToday] = useState(getTodayIsoDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stripRange = buildStripRange(today);

  const dayQuery = useQuery({
    queryKey: queryKeys.amalan.day(selectedDate),
    queryFn: () => getAmalanDay(selectedDate).then(unwrapResponse),
    enabled: isAuthenticated,
    // Ganti tanggal sambil daftar lama masih tampil (bukan blank) selagi data
    // tanggal baru di-fetch — sumber `isDayLoading`.
    placeholderData: keepPreviousData,
  });

  const summaryQuery = useQuery({
    queryKey: queryKeys.amalan.summary(stripRange.start, stripRange.end),
    queryFn: () =>
      getAmalanSummary(stripRange.start, stripRange.end).then(unwrapResponse),
    enabled: isAuthenticated,
  });

  const presetsQuery = useQuery({
    queryKey: queryKeys.amalan.presets,
    queryFn: () => getAmalanPresets().then(unwrapResponse),
    enabled: isAuthenticated,
  });

  function invalidateSummary(): void {
    queryClient.invalidateQueries({
      queryKey: queryKeys.amalan.summary(stripRange.start, stripRange.end),
    });
  }

  function setDayCache(date: string, next: AmalanDayResult): void {
    queryClient.setQueryData(queryKeys.amalan.day(date), next);
  }

  const toggleMutation = useMutation({
    mutationFn: (amalan: Amalan) =>
      toggleAmalanComplete(amalan.id).then(unwrapResponse),
    onMutate: (amalan: Amalan) => {
      // Optimistic: baris dan ring berubah seketika, request menyusul. Menandai
      // amalan lumrah ditekan berturut-turut sambil menyusuri daftar.
      const date = amalan.date;
      const previous = queryClient.getQueryData<AmalanDayResult>(
        queryKeys.amalan.day(date),
      );
      if (previous) {
        const isCompleted = !amalan.isCompleted;
        setDayCache(date, {
          summary: {
            ...previous.summary,
            done: previous.summary.done + (isCompleted ? 1 : -1),
          },
          items: previous.items.map(item =>
            item.id === amalan.id ? {...item, isCompleted} : item,
          ),
        });
      }
      return {date, previous};
    },
    onSuccess: (result, amalan, context) => {
      // Selaraskan dengan server, bukan dengan tebakan client.
      const date = context?.date ?? amalan.date;
      const current = queryClient.getQueryData<AmalanDayResult>(
        queryKeys.amalan.day(date),
      );
      if (current) {
        setDayCache(date, {
          summary: result.summary,
          items: current.items.map(item =>
            item.id === result.item.id ? result.item : item,
          ),
        });
      }
      // Strip boleh terlambat sedetik; ring di depan mata tidak boleh.
      invalidateSummary();
    },
    onError: (error, _amalan, context) => {
      if (context?.previous && context.date) {
        setDayCache(context.date, context.previous);
      }
      showToast(errorMessage(error));
    },
  });

  // Mutasi ini TIDAK memakai unwrapResponse: pesan sukses ikut ditampilkan
  // sebagai toast, dan unwrapResponse membuang `message` begitu
  // `success: true`. Kontrak errornya tetap sama — ApiError dengan message dan
  // data dari response, persis yang dilempar unwrapResponse.
  const deleteMutation = useMutation({
    mutationFn: async (amalan: Amalan) => {
      const response = await deleteAmalan(amalan.id);
      if (!response.success) {
        throw new ApiError(response.message, response.data);
      }
      return response;
    },
  });

  const selectDate = useCallback((date: string): void => {
    setSelectedDate(date);
  }, []);

  // Dipanggil saat screen di-focus. Screen tidak memindahkan hari sendiri
  // selagi terbuka — memindahkannya di bawah jari pengguna yang sedang mencatat
  // lebih buruk daripada label tanggal yang telat semenit.
  const syncToday = useCallback((): void => {
    const currentToday = getTodayIsoDate();
    if (currentToday === today) {
      return;
    }
    // Dua setState berdampingan, BUKAN setSelectedDate di dalam updater
    // setToday: updater state harus murni — React boleh menjalankannya lebih
    // dari sekali, dan efek samping di dalamnya ikut berjalan berkali-kali.
    setToday(currentToday);
    // Pengguna yang masih melihat "hari ini" ikut berpindah ke tanggal baru;
    // yang sedang menengok hari lampau dibiarkan di tempatnya.
    if (selectedDate === today) {
      setSelectedDate(currentToday);
    }
    // Aman dipanggil ulang: begitu `today` sudah mutakhir, pemanggilan
    // berikutnya berhenti di penjaga paling atas.
  }, [today, selectedDate]);

  function toggleComplete(amalan: Amalan): void {
    toggleMutation.mutate(amalan);
  }

  // Beda dari toggle: penghapusan TIDAK optimistic. Menghapus tidak bisa
  // dibatalkan pengguna, jadi barisnya baru hilang setelah server mengonfirmasi.
  async function removeAmalan(amalan: Amalan): Promise<void> {
    try {
      const response = await deleteMutation.mutateAsync(amalan);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.amalan.day(amalan.date),
      });
      invalidateSummary();
      showToast(response.message);
    } catch (error) {
      showToast(errorMessage(error));
    }
  }

  function retryPresets(): void {
    presetsQuery.refetch();
  }

  async function refresh(): Promise<void> {
    setIsRefreshing(true);
    try {
      await Promise.all([dayQuery.refetch(), summaryQuery.refetch()]);
    } finally {
      setIsRefreshing(false);
    }
  }

  const dayData = dayQuery.data;

  return {
    today,
    selectedDate,
    summaries: summaryQuery.data ?? buildFallbackSummaries(today),
    summary: dayData?.summary ?? EMPTY_SUMMARY(selectedDate),
    items: dayData?.items ?? [],
    presets: presetsQuery.data ?? [],
    isPresetsError: presetsQuery.isError,
    isLoading: dayQuery.isPending && dayQuery.fetchStatus !== 'idle',
    isDayLoading: dayQuery.isFetching && !dayQuery.isPending,
    isRefreshing,
    isDeleting: deleteMutation.isPending,
    summaryRange: stripRange,
    selectDate,
    syncToday,
    toggleComplete,
    removeAmalan,
    retryPresets,
    refresh,
  };
}
