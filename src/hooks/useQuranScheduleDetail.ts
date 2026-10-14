import {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {deleteSchedule, getScheduleDetail} from '@/services/quranService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {showToast} from '@/utils/toast';
import type {Schedule} from '@/types/quran';

type State = {
  schedule: Schedule | null;
  isLoading: boolean;
  isNotFound: boolean;
  isDeleteDialogOpen: boolean;
  isDeleting: boolean;
};

type Actions = {
  openDeleteDialog: () => void;
  closeDeleteDialog: () => void;
  confirmDelete: () => Promise<boolean>;
};

export function useQuranScheduleDetail(scheduleId: string): State & Actions {
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const query = useQuery({
    queryKey: queryKeys.quran.scheduleDetail(scheduleId),
    queryFn: () => getScheduleDetail(scheduleId).then(unwrapResponse),
    retry: false,
  });

  // Progres jadwal ikut naik setelah user membaca, jadi diambil ulang tiap
  // screen kembali fokus — bukan hanya saat mount.
  const refetch = query.refetch;
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const deleteMutation = useMutation({
    mutationFn: () => deleteSchedule(scheduleId).then(unwrapResponse),
    onSuccess: () => {
      showToast('Jadwal dihapus');
      queryClient.invalidateQueries({queryKey: ['quran']});
    },
    onError: (error: Error) => {
      showToast(error.message || 'Tidak dapat terhubung.');
    },
    onSettled: () => setIsDeleteDialogOpen(false),
  });

  async function confirmDelete(): Promise<boolean> {
    try {
      await deleteMutation.mutateAsync();
      return true;
    } catch {
      return false;
    }
  }

  return {
    schedule: query.data ?? null,
    isLoading: query.isPending,
    isNotFound: query.isError,
    isDeleteDialogOpen,
    isDeleting: deleteMutation.isPending,
    openDeleteDialog: () => setIsDeleteDialogOpen(true),
    closeDeleteDialog: () => setIsDeleteDialogOpen(false),
    confirmDelete,
  };
}
