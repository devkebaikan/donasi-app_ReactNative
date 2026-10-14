import {useEffect, useMemo, useState} from 'react';
import {
  getProgramMitraSalur,
  getProgramProjects,
} from '@/services/donationService';
import {showToast} from '@/utils/toast';
import {computeSalurSummary, flattenReportSalur} from '@/utils/salurTimeline';
import type {
  MitraSalur,
  ProjectSalur,
  ReportSalur,
  SalurSummary,
} from '@/types/programDetail';

type State = {
  projects: ProjectSalur[];
  reportSalur: ReportSalur[];
  summary: SalurSummary;
  mitraList: MitraSalur[];
  isLoading: boolean;
};

export function useProgramSalur(programId: string): State {
  const [projects, setProjects] = useState<ProjectSalur[]>([]);
  const [mitraList, setMitraList] = useState<MitraSalur[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reportSalur = useMemo(() => flattenReportSalur(projects), [projects]);
  const summary = useMemo(() => computeSalurSummary(projects), [projects]);

  useEffect(() => {
    async function loadData(): Promise<void> {
      setIsLoading(true);
      try {
        const [projectsResponse, mitraResponse] = await Promise.all([
          getProgramProjects(programId),
          getProgramMitraSalur(programId),
        ]);
        if (!projectsResponse.success) {
          showToast(projectsResponse.message);
        } else {
          setProjects(projectsResponse.data);
        }
        if (!mitraResponse.success) {
          showToast(mitraResponse.message);
        } else {
          setMitraList(mitraResponse.data);
        }
      } catch {
        showToast('Tidak dapat terhubung.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [programId]);

  return {projects, reportSalur, summary, mitraList, isLoading};
}
