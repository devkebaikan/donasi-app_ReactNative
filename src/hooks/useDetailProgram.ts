import {useMemo, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {
  getProgramDetail,
  getProgramDonatur,
  getProgramProjects,
  getSalesNotif,
} from '@/services/donationService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {flattenReportSalur} from '@/utils/salurTimeline';
import type {
  DonaturSort,
  ProgramDetail,
  ProgramDonatur,
  ProjectSalur,
  ReportSalur,
  SalesNotifItem,
} from '@/types/programDetail';

export type DetailProgramTab = 'about' | 'projects' | 'donatur' | 'reports';

// Referensi stabil supaya `projects` tidak jadi array baru tiap render saat
// query belum punya data — kalau tidak, useMemo(flattenReportSalur) di bawah
// keitung "berubah" tiap render (react-hooks/exhaustive-deps).
const EMPTY_PROJECTS: ProjectSalur[] = [];

type State = {
  program: ProgramDetail | null;
  isLoading: boolean;
  isNotFound: boolean;
  salesNotif: SalesNotifItem[];
  activeTab: DetailProgramTab;
  projects: ProjectSalur[];
  reportSalur: ReportSalur[];
  isProjectsLoading: boolean;
  donatur: ProgramDonatur[];
  donaturSort: DonaturSort;
  isDonaturLoading: boolean;
};

type Actions = {
  setActiveTab: (tab: DetailProgramTab) => void;
  setDonaturSort: (sort: DonaturSort) => void;
};

export function useDetailProgram(link: string): State & Actions {
  const [activeTab, setActiveTab] = useState<DetailProgramTab>('about');
  const [donaturSort, setDonaturSort] = useState<DonaturSort>('terbaru');

  const detailQuery = useQuery({
    queryKey: queryKeys.program.detail(link),
    queryFn: () => getProgramDetail(link).then(unwrapResponse),
  });

  const programId = detailQuery.data?.id ?? null;

  const salesNotifQuery = useQuery({
    queryKey: queryKeys.program.salesNotif(programId),
    // `enabled` menjamin programId sudah terisi saat queryFn benar-benar
    // jalan — cast aman di sini.
    queryFn: () => getSalesNotif(programId as string).then(unwrapResponse),
    enabled: programId != null,
  });

  // Tab "Project Salur" & "Report Salur" berbagi sumber data yang sama
  // (GET /programs/:id/projects) — Report Salur cuma hasil flatten dari
  // reports semua ProjectSalur, jadi cukup 1x fetch untuk kedua tab.
  const isProjectsTabActive = activeTab === 'projects' || activeTab === 'reports';
  const projectsQuery = useQuery({
    queryKey: queryKeys.program.projects(programId),
    queryFn: () => getProgramProjects(programId as string).then(unwrapResponse),
    enabled: programId != null && isProjectsTabActive,
  });

  const donaturQuery = useQuery({
    queryKey: queryKeys.program.donatur(programId, donaturSort),
    queryFn: () =>
      getProgramDonatur(programId as string, donaturSort).then(unwrapResponse),
    enabled: programId != null && activeTab === 'donatur',
  });

  const projects = projectsQuery.data ?? EMPTY_PROJECTS;
  const reportSalur = useMemo(() => flattenReportSalur(projects), [projects]);

  return {
    program: detailQuery.data ?? null,
    isLoading: detailQuery.isPending,
    isNotFound: detailQuery.isError,
    salesNotif: salesNotifQuery.data ?? [],
    activeTab,
    projects,
    reportSalur,
    // Digerbang oleh tab aktif — query yang belum di-enable tetap melapor
    // `isPending: true` di React Query v5 (tidak ada status "idle"), jadi
    // tanpa gerbang ini flag-nya bakal true terus walau tab belum dibuka.
    isProjectsLoading: isProjectsTabActive && projectsQuery.isPending,
    donatur: donaturQuery.data ?? [],
    donaturSort,
    isDonaturLoading: activeTab === 'donatur' && donaturQuery.isPending,
    setActiveTab,
    setDonaturSort,
  };
}
