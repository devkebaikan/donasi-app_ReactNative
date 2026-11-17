import type {ProjectSalur, ReportSalur, SalurSummary} from '@/types/programDetail';

export function flattenReportSalur(projects: ProjectSalur[]): ReportSalur[] {
  if (!Array.isArray(projects)) {
    return [];
  }
  return projects
    .flatMap(project => (project && Array.isArray(project.reports) ? project.reports : []))
    .filter(Boolean)
    .sort((a, b) => {
      const timeB = b?.distributedAt ? new Date(b.distributedAt).getTime() : 0;
      const timeA = a?.distributedAt ? new Date(a.distributedAt).getTime() : 0;
      return (Number.isFinite(timeB) ? timeB : 0) - (Number.isFinite(timeA) ? timeA : 0);
    });
}

export function computeSalurSummary(projects: ProjectSalur[]): SalurSummary {
  if (!Array.isArray(projects)) {
    return {
      totalProjects: 0,
      akanTergalangCount: 0,
      sedangTergalangCount: 0,
      selesaiCount: 0,
      totalBeneficiaryCount: 0,
    };
  }
  return {
    totalProjects: projects.length,
    akanTergalangCount: projects.filter(project => project?.status === 'menunggu')
      .length,
    sedangTergalangCount: projects.filter(project => project?.status === 'proses')
      .length,
    selesaiCount: projects.filter(project => project?.status === 'selesai').length,
    totalBeneficiaryCount: projects.reduce(
      (sum, project) => sum + (Number(project?.beneficiaryCount) || 0),
      0,
    ),
  };
}
