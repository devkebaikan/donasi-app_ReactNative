import {useMemo, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {
  getProgramDetail,
  getProgramDonatur,
  getProgramFundraisers,
  getProgramProjects,
  getProgramReport,
  getSalesNotif,
} from '@/services/donationService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {flattenReportSalur} from '@/utils/salurTimeline';
import type {
  DonaturSort,
  ProgramDetail,
  ProgramDonatur,
  ProgramFundraiser,
  ProjectSalur,
  ReportSalur,
  SalesNotifItem,
} from '@/types/programDetail';

export type DetailProgramTab = 'about' | 'projects' | 'donatur' | 'reports';

const EMPTY_PROJECTS: ProjectSalur[] = [];
const EMPTY_DONATUR: ProgramDonatur[] = [];
const EMPTY_FUNDRAISER: ProgramFundraiser[] = [];
const EMPTY_SALES_NOTIF: SalesNotifItem[] = [];

export interface ProgramFullData {
  detail: ProgramDetail | null;
  salesNotif: SalesNotifItem[];
  projects: ProjectSalur[];
  report: ReportSalur | null;
  reportSalur: ReportSalur[];
  donatur: ProgramDonatur[];
  fundraisers: ProgramFundraiser[];
}

export interface UseDetailProgramReturn {
  data: ProgramFullData;
  isLoading: boolean;
  isNotFound: boolean;
  isProjectsLoading: boolean;
  isDonaturLoading: boolean;
  isFundraisersLoading: boolean;
  activeTab: DetailProgramTab;
  donaturSort: DonaturSort;
  setActiveTab: (tab: DetailProgramTab) => void;
  setDonaturSort: (sort: DonaturSort) => void;
}

export function useDetailProgram(link: string): UseDetailProgramReturn {
  const [activeTab, setActiveTab] = useState<DetailProgramTab>('about');
  const [donaturSort, setDonaturSort] = useState<DonaturSort>('terbaru');

  const detailQuery = useQuery({
    queryKey: queryKeys.program.detail(link),
    queryFn: () => getProgramDetail(link).then(unwrapResponse),
  });

  const programId = detailQuery.data?.id ?? null;
  const programLink = detailQuery.data?.link ?? link;

  const salesNotifQuery = useQuery({
    queryKey: queryKeys.program.salesNotif(programId),
    queryFn: () => getSalesNotif(programId as string).then(unwrapResponse),
    enabled: programId != null,
  });

  const isProjectsTabActive = activeTab === 'projects';
  const reportQuery = useQuery({
    queryKey: queryKeys.program.report(programLink),
    queryFn: () => getProgramReport(programLink).then(unwrapResponse),
    enabled: Boolean(programLink) && isProjectsTabActive,
  });

  const projectsQuery = useQuery({
    queryKey: queryKeys.program.projects(programId, programLink),
    queryFn: () =>
      getProgramProjects(programId as string, programLink).then(unwrapResponse),
    enabled: programId != null && isProjectsTabActive,
  });

  const donaturQuery = useQuery({
    queryKey: queryKeys.program.donatur(programId, donaturSort, programLink),
    queryFn: () =>
      getProgramDonatur(programId as string, donaturSort, programLink).then(
        unwrapResponse,
      ),
    enabled: programId != null && activeTab === 'donatur',
  });

  const fundraisersQuery = useQuery({
    queryKey: queryKeys.program.fundraiser(programLink),
    queryFn: () =>
      getProgramFundraisers(programLink).then(unwrapResponse),
    enabled: Boolean(programLink) && activeTab === 'reports',
  });

  const report = reportQuery.data ?? null;
  const projects = projectsQuery.data ?? EMPTY_PROJECTS;
  const reportSalur = useMemo(() => flattenReportSalur(projects), [projects]);

  const data: ProgramFullData = useMemo(
    () => ({
      detail: detailQuery.data ?? null,
      salesNotif: salesNotifQuery.data ?? EMPTY_SALES_NOTIF,
      projects,
      report,
      reportSalur,
      donatur: donaturQuery.data ?? EMPTY_DONATUR,
      fundraisers: fundraisersQuery.data ?? EMPTY_FUNDRAISER,
    }),
    [
      detailQuery.data,
      salesNotifQuery.data,
      projects,
      report,
      reportSalur,
      donaturQuery.data,
      fundraisersQuery.data,
    ],
  );

  return {
    data,
    isLoading: detailQuery.isPending,
    isNotFound: detailQuery.isError || (!detailQuery.isPending && !detailQuery.data),
    isProjectsLoading:
      isProjectsTabActive && (reportQuery.isPending || projectsQuery.isPending),
    isDonaturLoading: activeTab === 'donatur' && donaturQuery.isPending,
    isFundraisersLoading: activeTab === 'reports' && fundraisersQuery.isPending,
    activeTab,
    donaturSort,
    setActiveTab,
    setDonaturSort,
  };
}
