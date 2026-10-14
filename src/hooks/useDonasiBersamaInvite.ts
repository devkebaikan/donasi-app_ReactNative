import {useQuery} from '@tanstack/react-query';
import {getDonasiBersamaInvite} from '@/services/donasiBersamaService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import type {DonasiBersamaInvite} from '@/types/donasiBersama';

type State = {
  invite: DonasiBersamaInvite | null;
  isLoading: boolean;
  isError: boolean;
};

type Actions = {
  retry: () => void;
};

export function useDonasiBersamaInvite(groupId: string): State & Actions {
  const inviteQuery = useQuery({
    queryKey: queryKeys.donasiBersama.invite(groupId),
    queryFn: () => getDonasiBersamaInvite(groupId).then(unwrapResponse),
    // Grup tidak ditemukan adalah jawaban final, bukan gangguan sementara.
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
