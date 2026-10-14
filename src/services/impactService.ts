import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {
  DistributionReportData,
  ImpactMapData,
} from '@/types/impact';

export async function getImpactMap(): Promise<ApiResponse<ImpactMapData>> {
  const res = await apiClient.get<ApiResponse<ImpactMapData>>('/impact-map');
  return res.data;
}

export async function getDistributionReport(
  period: string | null,
): Promise<ApiResponse<DistributionReportData>> {
  // Query string dirakit manual — URLSearchParams tidak tersedia di runtime
  // React Native/Hermes tanpa polyfill. Lihat komentar yang sama di
  // reflectionService.ts.
  const query = period ? `?period=${encodeURIComponent(period)}` : '';
  const res = await apiClient.get<ApiResponse<DistributionReportData>>(
    `/distribution-reports${query}`,
  );
  return res.data;
}
