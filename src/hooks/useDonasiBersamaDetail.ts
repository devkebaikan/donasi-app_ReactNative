import {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {
  getDonasiBersamaDetail,
  joinDonasiBersama,
  leaveDonasiBersama,
} from '@/services/donasiBersamaService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {showToast} from '@/utils/toast';
import type {DonasiBersamaDetail} from '@/types/donasiBersama';

type State = {
  group: DonasiBersamaDetail | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isNotFound: boolean;
  isJoining: boolean;
  isLeaving: boolean;
};

type Actions = {
  refresh: () => Promise<void>;
  joinGroup: () => Promise<boolean>;
  leaveGroup: () => Promise<boolean>;
};

interface Options {
  /**
   * Default true. Dimatikan saat pemanggil belum punya groupId — mis. form
   * grup dalam mode BUAT, yang memakai hook ini hanya untuk mode ubah.
   * Tanpa ini query menembak `/donasi-bersama/` dan selalu gagal.
   */
  enabled?: boolean;
}

export function useDonasiBersamaDetail(
  groupId: string,
  {enabled = true}: Options = {},
): State & Actions {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const detailKey = queryKeys.donasiBersama.detail(groupId);

  const detailQuery = useQuery({
    queryKey: detailKey,
    queryFn: () => getDonasiBersamaDetail(groupId).then(unwrapResponse),
    // Grup privat/tidak ditemukan dijawab success:false — itu jawaban final,
    // bukan gangguan sementara, jadi tidak perlu diulang.
    retry: false,
    enabled,
  });

  // Alur urunan me-replace dirinya dengan PaymentInvoice, jadi kembali ke sini
  // bukan mount baru. Tanpa invalidate saat fokus, nominal terkumpul dan
  // riwayat patungan tertinggal versi lama.
  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return;
      }
      queryClient.invalidateQueries({queryKey: detailKey});
      queryClient.invalidateQueries({
        queryKey: queryKeys.donasiBersama.contributions(groupId),
      });
      // Sengaja hanya dijalankan saat screen kembali fokus.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupId, enabled]),
  );

  async function refresh(): Promise<void> {
    setIsRefreshing(true);
    try {
      await detailQuery.refetch();
    } finally {
      setIsRefreshing(false);
    }
  }

  // join dan leave mengembalikan bentuk yang sama, jadi satu handler cukup.
  async function applyMembership(
    action: 'join' | 'leave',
  ): Promise<boolean> {
    const setBusy = action === 'join' ? setIsJoining : setIsLeaving;
    setBusy(true);
    try {
      const response =
        action === 'join'
          ? await joinDonasiBersama(groupId)
          : await leaveDonasiBersama(groupId);
      if (!response.success) {
        showToast(response.message);
        return false;
      }
      const {isMember, memberCount} = response.data;
      queryClient.setQueryData<DonasiBersamaDetail>(
        detailKey,
        current => current && {...current, isMember, memberCount},
      );
      // Kartu grup di daftar ikut berubah status keanggotaannya.
      queryClient.invalidateQueries({queryKey: ['donasi-bersama', 'list']});
      return true;
    } catch {
      showToast('Tidak dapat terhubung.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  return {
    group: detailQuery.data ?? null,
    isLoading: enabled && detailQuery.isPending,
    isRefreshing,
    isNotFound: enabled && detailQuery.isError,
    isJoining,
    isLeaving,
    refresh,
    joinGroup: () => applyMembership('join'),
    leaveGroup: () => applyMembership('leave'),
  };
}
