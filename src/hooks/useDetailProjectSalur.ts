import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {
  getProjectSalurDetail,
  getProjectSalurDonatur,
} from '@/services/donationService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import type {
  DonaturSort,
  ProgramDonatur,
  ProjectSalurDetail,
} from '@/types/programDetail';

export type DetailProjectSalurTab = 'report' | 'donatur';

type State = {
  project: ProjectSalurDetail | null;
  isLoading: boolean;
  isNotFound: boolean;
  activeTab: DetailProjectSalurTab;
  donatur: ProgramDonatur[];
  donaturSort: DonaturSort;
  isDonaturLoading: boolean;
};

type Actions = {
  setActiveTab: (tab: DetailProjectSalurTab) => void;
  setDonaturSort: (sort: DonaturSort) => void;
};

export function useDetailProjectSalur(projectSalurId: string): State & Actions {
  const [activeTab, setActiveTab] = useState<DetailProjectSalurTab>('report');
  const [donaturSort, setDonaturSort] = useState<DonaturSort>('terbaru');

  const detailQuery = useQuery({
    queryKey: queryKeys.projectSalur.detail(projectSalurId),
    queryFn: () =>
      getProjectSalurDetail(projectSalurId).then(unwrapResponse),
  });

  // Lazy — sama pola dengan tab Donatur di useDetailProgram, cuma di-fetch
  // saat tab Donatur pertama kali aktif.
  const donaturQuery = useQuery({
    queryKey: queryKeys.projectSalur.donatur(projectSalurId, donaturSort),
    queryFn: () =>
      getProjectSalurDonatur(projectSalurId, donaturSort).then(unwrapResponse),
    enabled: activeTab === 'donatur',
  });

  return {
    project: detailQuery.data ?? null,
    isLoading: detailQuery.isPending,
    isNotFound: detailQuery.isError,
    activeTab,
    donatur: donaturQuery.data ?? [],
    donaturSort,
    isDonaturLoading: activeTab === 'donatur' && donaturQuery.isPending,
    setActiveTab,
    setDonaturSort,
  };
}
