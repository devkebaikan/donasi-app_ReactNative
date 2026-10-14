import {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {getChallengeDetail, joinChallenge} from '@/services/quranService';
import {getSurahByNumber} from '@/services/quranContentService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {showToast} from '@/utils/toast';
import type {Challenge, ChallengeTab, Surah} from '@/types/quran';

type State = {
  challenge: Challenge | null;
  surahs: Surah[];
  activeTab: ChallengeTab;
  isLoading: boolean;
  isNotFound: boolean;
  isJoining: boolean;
};

type Actions = {
  changeTab: (tab: ChallengeTab) => void;
  join: () => Promise<boolean>;
};

export function useQuranChallenge(challengeId: string): State & Actions {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ChallengeTab>('detail');

  const query = useQuery({
    queryKey: queryKeys.quran.challengeDetail(challengeId),
    queryFn: () => getChallengeDetail(challengeId).then(unwrapResponse),
    retry: false,
  });

  const challenge = query.data ?? null;

  // Nama surah diambil dari data mushaf offline; server hanya mengirim
  // daftar nomor surah yang masuk challenge.
  const surahs = (challenge?.surahNumbers ?? [])
    .map(getSurahByNumber)
    .filter((surah): surah is Surah => surah != null);

  const joinMutation = useMutation({
    mutationFn: () => joinChallenge(challengeId).then(unwrapResponse),
    onSuccess: () => {
      showToast('Kamu bergabung di challenge ini');
      queryClient.invalidateQueries({
        queryKey: queryKeys.quran.challengeDetail(challengeId),
      });
      // Carousel di Beranda dan tab Surah ikut berubah begitu user bergabung.
      queryClient.invalidateQueries({
        queryKey: queryKeys.quran.highlightChallenges,
      });
    },
    onError: (error: Error) => {
      showToast(error.message || 'Tidak dapat terhubung.');
    },
  });

  async function join(): Promise<boolean> {
    try {
      await joinMutation.mutateAsync();
      return true;
    } catch {
      return false;
    }
  }

  return {
    challenge,
    surahs,
    activeTab,
    isLoading: query.isPending,
    isNotFound: query.isError,
    isJoining: joinMutation.isPending,
    changeTab: setActiveTab,
    join,
  };
}
