import {useQuery} from '@tanstack/react-query';
import {getTantanganInvite} from '@/services/tantanganService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import type {TantanganInvite} from '@/types/tantangan';

type State = {
  invite: TantanganInvite | null;
  isLoading: boolean;
  isError: boolean;
};

type Actions = {
  retry: () => void;
};

export function useTantanganInvite(challengeId: string): State & Actions {
  const inviteQuery = useQuery({
    queryKey: queryKeys.tantangan.invite(challengeId),
    queryFn: () => getTantanganInvite(challengeId).then(unwrapResponse),
    // Tantangan tidak ditemukan — atau tertutup untuk diajak karena mode
    // personal — adalah jawaban final, bukan gangguan sementara.
    retry: false,
  });

  return {
    invite: inviteQuery.data ?? null,
    isLoading: inviteQuery.isPending,
    isError: inviteQuery.isError,
    retry: () => {
      inviteQuery.refetch();
    },
  };
}
