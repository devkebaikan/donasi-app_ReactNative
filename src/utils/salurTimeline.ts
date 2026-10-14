import type {ProjectSalur, ReportSalur, SalurSummary} from '@/types/programDetail';

export function flattenReportSalur(projects: ProjectSalur[]): ReportSalur[] {
  return projects
    .flatMap(project => project.reports)
    .sort(
      (a, b) =>
        new Date(b.distributedAt).getTime() -
        new Date(a.distributedAt).getTime(),
    );
}

export function computeSalurSummary(projects: ProjectSalur[]): SalurSummary {
  return {
    totalProjects: projects.length,
    akanTergalangCount: projects.filter(project => project.status === 'menunggu')
      .length,
    sedangTergalangCount: projects.filter(project => project.status === 'proses')
      .length,
    selesaiCount: projects.filter(project => project.status === 'selesai').length,
    totalBeneficiaryCount: projects.reduce(
      (sum, project) => sum + project.beneficiaryCount,
      0,
    ),
  };
}
