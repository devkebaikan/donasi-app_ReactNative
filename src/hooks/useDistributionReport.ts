import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {getDistributionReport} from '@/services/impactService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import type {DistributionReportData} from '@/types/impact';

type State = {
  data: DistributionReportData | null;
  selectedPeriod: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
};

type Actions = {
  selectPeriod: (period: string) => void;
  refresh: () => void;
};

export function useDistributionReport(initialPeriod: string | null): State &
  Actions {
  // Params hanya dibaca sekali lewat nilai awal state ini. Sesudahnya periode
  // milik state lokal — kalau dibaca terus dari params, memilih periode lain
  // akan tertimpa params lama setiap re-render. Pola yang sama dipakai
  // RecurringDonationScreen untuk params.tab.
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(
    initialPeriod,
  );

  // selectedCategory sengaja TIDAK masuk query key: penyaringannya di klien,
  // jadi satu periode cukup satu entri cache. Periode null dipetakan ke
  // 'latest' supaya key-nya tetap stabil.
  const reportQuery = useQuery({
    queryKey: queryKeys.impact.report(selectedPeriod ?? 'latest'),
    queryFn: () => getDistributionReport(selectedPeriod).then(unwrapResponse),
  });

  // Toast sudah ditangani terpusat di queryCache onError
  // (src/services/queryClient.ts) — jangan panggil showToast lagi di sini.
  return {
    data: reportQuery.data ?? null,
    selectedPeriod,
    isLoading: reportQuery.isPending,
    isRefreshing: reportQuery.isRefetching,
    isError: reportQuery.isError,
    selectPeriod: setSelectedPeriod,
    refresh: () => {
      reportQuery.refetch();
    },
  };
}
