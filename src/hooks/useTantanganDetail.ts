import {useState} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {
  getTantanganDetail,
  joinTantangan,
  leaveTantangan,
} from '@/services/tantanganService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {showToast} from '@/utils/toast';
import type {TantanganDetail} from '@/types/tantangan';

type State = {
  challenge: TantanganDetail | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isNotFound: boolean;
  isJoining: boolean;
  isLeaving: boolean;
};

type Actions = {
  refresh: () => Promise<void>;
  join: () => Promise<boolean>;
  leave: () => Promise<boolean>;
};

export function useTantanganDetail(challengeId: string): State & Actions {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const detailKey = queryKeys.tantangan.detail(challengeId);

  const detailQuery = useQuery({
    queryKey: detailKey,
    queryFn: () => getTantanganDetail(challengeId).then(unwrapResponse),
  });

  async function refresh(): Promise<void> {
    setIsRefreshing(true);
    try {
      await queryClient.refetchQueries({queryKey: detailKey, exact: true});
    } finally {
      setIsRefreshing(false);
    }
  }

  async function join(): Promise<boolean> {
    setIsJoining(true);
    try {
      const response = await joinTantangan(challengeId);
      if (!response.success) {
        showToast(response.message);
        return false;
      }
      showToast(response.message);
      // Response join sudah berisi detail penuh — isi cache langsung dari situ
      // supaya bar progres, jumlah peserta, dan label tombol berubah seketika
      // tanpa memicu refetch untuk data yang sudah ada di tangan.
      queryClient.setQueryData(detailKey, response.data);
      // Kartu di daftar ikut berubah jadi "Lihat Progres", dan baris baru
      // muncul di Jurnal Kebaikan.
      queryClient.invalidateQueries({queryKey: ['tantangan', 'list']});
      queryClient.invalidateQueries({queryKey: ['tantangan', 'jurnal']});
      queryClient.invalidateQueries({
        queryKey: queryKeys.tantangan.leaderboard(challengeId),
      });
      return true;
    } catch {
      showToast('Tidak dapat terhubung.');
      return false;
    } finally {
      setIsJoining(false);
    }
  }

  async function leave(): Promise<boolean> {
    setIsLeaving(true);
    try {
      const response = await leaveTantangan(challengeId);
      if (!response.success) {
        showToast(response.message);
        return false;
      }
      showToast(response.message);
      queryClient.invalidateQueries({queryKey: detailKey});
      queryClient.invalidateQueries({queryKey: ['tantangan', 'list']});
      queryClient.invalidateQueries({queryKey: ['tantangan', 'jurnal']});
      return true;
    } catch {
      showToast('Tidak dapat terhubung.');
      return false;
    } finally {
      setIsLeaving(false);
    }
  }

  return {
    challenge: detailQuery.data ?? null,
    isLoading: detailQuery.isPending,
    isRefreshing,
    isNotFound: detailQuery.isError,
    isJoining,
    isLeaving,
    refresh,
    join,
    leave,
  };
}
