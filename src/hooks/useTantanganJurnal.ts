import {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  checkTantanganJurnal,
  getTantanganJurnal,
  updateTantanganDayStatus,
} from '@/services/tantanganService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {showToast} from '@/utils/toast';
import {toIsoDateOnly} from '@/utils/formatDate';
import type {
  TantanganDayStatus,
  TantanganJurnalItem,
  TantanganJurnalResult,
} from '@/types/tantangan';

export function getTodayIsoDate(): string {
  return toIsoDateOnly(new Date());
}

// Tanggal masa depan tidak pernah dibuka: hari ini adalah batas kanan, sama
// seperti strip tanggal di menu Amalan Harian.
export function resolveJurnalDate(paramDate: string | undefined): string {
  const today = getTodayIsoDate();
  if (!paramDate) {
    return today;
  }
  return paramDate <= today ? paramDate : today;
}

type State = {
  date: string;
  isToday: boolean;
  status: TantanganDayStatus;
  items: TantanganJurnalItem[];
  isLoading: boolean;
  isRefreshing: boolean;
};

type Actions = {
  refresh: () => Promise<void>;
  check: (item: TantanganJurnalItem, value: number | null) => void;
  setDayStatus: (next: {isFasting: boolean; isExcused: boolean}) => void;
};

export function useTantanganJurnal(
  isAuthenticated: boolean,
  date: string,
): State & Actions {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const jurnalKey = queryKeys.tantangan.jurnal(date);

  const jurnalQuery = useQuery({
    queryKey: jurnalKey,
    queryFn: () => getTantanganJurnal(date).then(unwrapResponse),
    enabled: isAuthenticated,
  });

  const result = jurnalQuery.data ?? null;

  // Optimistic dikerjakan lewat cache query, bukan state terpisah: satu sumber
  // kebenaran untuk baris yang dirender, jadi rollback cukup mengembalikan
  // snapshot-nya. Pola yang sama dipakai toggle di useAmalanHome.
  const checkMutation = useMutation({
    mutationFn: (variables: {item: TantanganJurnalItem; value: number | null}) =>
      checkTantanganJurnal(variables.item.challengeId, {
        date,
        value: variables.value,
      }),
    onMutate: async variables => {
      await queryClient.cancelQueries({queryKey: jurnalKey});
      const previous =
        queryClient.getQueryData<TantanganJurnalResult>(jurnalKey);
      queryClient.setQueryData<TantanganJurnalResult>(jurnalKey, current => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          items: current.items.map(item =>
            item.challengeId === variables.item.challengeId
              ? {
                  ...item,
                  isDoneToday: !item.isDoneToday,
                  todayValue: variables.value,
                  // Runtun tebakan sementara; angka sebenarnya datang dari
                  // server di onSuccess.
                  streakDays: item.isDoneToday
                    ? Math.max(0, item.streakDays - 1)
                    : item.streakDays + 1,
                }
              : item,
          ),
        };
      });
      return {previous};
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(jurnalKey, context.previous);
      }
      showToast('Tidak dapat terhubung.');
    },
    onSuccess: (response, variables, context) => {
      if (!response.success) {
        if (context?.previous) {
          queryClient.setQueryData(jurnalKey, context.previous);
        }
        showToast(response.message);
        return;
      }
      // Server yang menentukan runtun sebenarnya — baris hasil tebakan
      // optimistic diganti utuh dengan yang dikirim balik.
      queryClient.setQueryData<TantanganJurnalResult>(jurnalKey, current => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          items: current.items.map(item =>
            item.challengeId === response.data.item.challengeId
              ? response.data.item
              : item,
          ),
        };
      });
      // Bar progres di halaman detail ikut segar tanpa refetch; daftar cukup
      // di-invalidate karena kartunya tidak menampilkan runtun.
      queryClient.setQueryData(
        queryKeys.tantangan.detail(variables.item.challengeId),
        (current: unknown) =>
          current && typeof current === 'object'
            ? {...current, progressPercentage: response.data.progressPercentage}
            : current,
      );
      queryClient.invalidateQueries({queryKey: ['tantangan', 'list']});
    },
  });

  const statusMutation = useMutation({
    mutationFn: (next: {isFasting: boolean; isExcused: boolean}) =>
      updateTantanganDayStatus({date, ...next}),
    onMutate: async next => {
      await queryClient.cancelQueries({queryKey: jurnalKey});
      const previous =
        queryClient.getQueryData<TantanganJurnalResult>(jurnalKey);
      queryClient.setQueryData<TantanganJurnalResult>(jurnalKey, current =>
        current ? {...current, status: {date, ...next}} : current,
      );
      return {previous};
    },
    onError: (_error, _next, context) => {
      if (context?.previous) {
        queryClient.setQueryData(jurnalKey, context.previous);
      }
      showToast('Tidak dapat terhubung.');
    },
    onSuccess: (response, _next, context) => {
      if (!response.success) {
        if (context?.previous) {
          queryClient.setQueryData(jurnalKey, context.previous);
        }
        showToast(response.message);
        return;
      }
      // Menandai "sedang berhalangan" mengubah runtun seluruh baris — daftar
      // hari itu wajib dimuat ulang, bukan cuma chip-nya.
      queryClient.invalidateQueries({queryKey: jurnalKey});
    },
  });

  async function refresh(): Promise<void> {
    setIsRefreshing(true);
    try {
      await queryClient.refetchQueries({queryKey: jurnalKey, exact: true});
    } finally {
      setIsRefreshing(false);
    }
  }

  function check(item: TantanganJurnalItem, value: number | null): void {
    checkMutation.mutate({item, value});
  }

  function setDayStatus(next: {
    isFasting: boolean;
    isExcused: boolean;
  }): void {
    statusMutation.mutate(next);
  }

  return {
    date,
    isToday: date === getTodayIsoDate(),
    status: result?.status ?? {date, isFasting: false, isExcused: false},
    items: result?.items ?? [],
    isLoading: isAuthenticated && jurnalQuery.isPending,
    isRefreshing,
    refresh,
    check,
    setDayStatus,
  };
}
