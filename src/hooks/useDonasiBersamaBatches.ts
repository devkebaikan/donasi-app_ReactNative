import {useState} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {
  createDonasiBersamaBatch,
  deleteDonasiBersamaBatch,
  getDonasiBersamaBatches,
  startDonasiBersamaBatch,
  updateDonasiBersamaBatch,
} from '@/services/donasiBersamaService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {showToast} from '@/utils/toast';
import type {DonasiBersamaBatch} from '@/types/donasiBersama';
import type {ApiResponse} from '@/types/api';


type State = {
  batches: DonasiBersamaBatch[];
  isLoading: boolean;
  isRefreshing: boolean;
  isMutating: boolean;
  fieldErrors: Record<string, string>;
};

type Actions = {
  refresh: () => Promise<void>;
  createBatch: (label: string) => Promise<boolean>;
  renameBatch: (batchId: string, label: string) => Promise<boolean>;
  startBatch: (batchId: string) => Promise<boolean>;
  deleteBatch: (batchId: string) => Promise<boolean>;
  clearFieldErrors: () => void;
};

export function useDonasiBersamaBatches(groupId: string): State & Actions {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const listKey = queryKeys.donasiBersama.batches(groupId);

  // Batch selalu sedikit — tidak dipaginasi.
  const listQuery = useQuery({
    queryKey: listKey,
    queryFn: () => getDonasiBersamaBatches(groupId).then(unwrapResponse),
  });

  async function refresh(): Promise<void> {
    setIsRefreshing(true);
    try {
      await listQuery.refetch();
    } finally {
      setIsRefreshing(false);
    }
  }

  // Empat aksi batch memakai jalur yang sama: jalankan, tampilkan pesan,
  // segarkan daftar, lalu ikut menyegarkan badge batch di detail grup.
  async function runMutation(
    action: () => Promise<ApiResponse<unknown>>,
  ): Promise<boolean> {
    setIsMutating(true);
    setFieldErrors({});
    try {
      const response = await action();
      const isSuccess =
        response.success === true ||
        (typeof response.status === 'number' && response.status >= 200 && response.status < 300) ||
        (response.success === undefined && response.status === undefined);
      if (!isSuccess) {
        showToast(response.message);

        setFieldErrors(
          (response.data as Record<string, string> | null) ?? {},
        );
        return false;
      }
      await queryClient.invalidateQueries({queryKey: listKey});
      queryClient.invalidateQueries({
        queryKey: queryKeys.donasiBersama.detail(groupId),
      });
      showToast(response.message);
      return true;
    } catch {
      showToast('Tidak dapat terhubung.');
      return false;
    } finally {
      setIsMutating(false);
    }
  }

  return {
    batches: listQuery.data ?? [],
    isLoading: listQuery.isPending,
    isRefreshing,
    isMutating,
    fieldErrors,
    refresh,
    createBatch: label => runMutation(() => createDonasiBersamaBatch(groupId, {label})),
    renameBatch: (batchId, label) =>
      runMutation(() => updateDonasiBersamaBatch(groupId, batchId, {label})),
    startBatch: batchId =>
      runMutation(() => startDonasiBersamaBatch(groupId, batchId)),
    deleteBatch: batchId =>
      runMutation(() => deleteDonasiBersamaBatch(groupId, batchId)),
    clearFieldErrors: () => setFieldErrors({}),
  };
}
