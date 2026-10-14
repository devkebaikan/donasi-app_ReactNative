import {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {getChallengeProgress, leaveChallenge} from '@/services/quranService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {showToast} from '@/utils/toast';
import type {ChallengeProgress} from '@/types/quran';

type State = {
  progress: ChallengeProgress | null;
  isLoading: boolean;
  isNotFound: boolean;
  isAllCompleted: boolean;
  isLeaveDialogOpen: boolean;
  isLeaving: boolean;
};

type Actions = {
  openLeaveDialog: () => void;
  closeLeaveDialog: () => void;
  confirmLeave: () => Promise<boolean>;
};

export function useQuranMyChallenge(challengeId: string): State & Actions {
  const queryClient = useQueryClient();
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  const query = useQuery({
    queryKey: queryKeys.quran.challengeProgress(challengeId),
    queryFn: () => getChallengeProgress(challengeId).then(unwrapResponse),
    retry: false,
  });

  // User biasanya sampai ke sini tepat setelah membaca, jadi progres diambil
  // ulang tiap screen kembali fokus — bukan hanya saat mount.
  const refetch = query.refetch;
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const leaveMutation = useMutation({
    mutationFn: () => leaveChallenge(challengeId).then(unwrapResponse),
    onSuccess: () => {
      showToast('Kamu keluar dari challenge');
      queryClient.invalidateQueries({
        queryKey: queryKeys.quran.highlightChallenges,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.quran.challengeDetail(challengeId),
      });
    },
    onError: (error: Error) => {
      showToast(error.message || 'Tidak dapat terhubung.');
    },
  });

  async function confirmLeave(): Promise<boolean> {
    try {
      await leaveMutation.mutateAsync();
      return true;
    } catch {
      return false;
    } finally {
      setIsLeaveDialogOpen(false);
    }
  }

  const progress = query.data ?? null;

  return {
    progress,
    isLoading: query.isPending,
    isNotFound: query.isError,
    isAllCompleted:
      progress != null &&
      progress.totalSurahCount > 0 &&
      progress.completedSurahCount === progress.totalSurahCount,
    isLeaveDialogOpen,
    isLeaving: leaveMutation.isPending,
    openLeaveDialog: () => setIsLeaveDialogOpen(true),
    closeLeaveDialog: () => setIsLeaveDialogOpen(false),
    confirmLeave,
  };
}
