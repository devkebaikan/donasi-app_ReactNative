import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {
  downloadDonationRecap,
  getDonationCategorySummary,
  getDonationDistributions,
  getDonationTransactions,
  getTrackingSummary,
} from '@/services/donationService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {showToast} from '@/utils/toast';
import type {
  CategorySummary,
  DistributedDonation,
  Donation,
  MyDonationsTab,
  TrackingSummary,
} from '@/types/myDonations';

type State = {
  trackingSummary: TrackingSummary | null;
  isLoading: boolean;
  isRefreshing: boolean;
  activeTab: MyDonationsTab;
  transactions: Donation[];
  isTransactionsLoading: boolean;
  distributions: DistributedDonation[];
  isDistributionsLoading: boolean;
  categorySummary: CategorySummary[];
  isRekapLoading: boolean;
  isDownloadingRecap: boolean;
};

type Actions = {
  setActiveTab: (tab: MyDonationsTab) => void;
  refresh: () => Promise<void>;
  downloadRecap: () => Promise<void>;
};

export function useMyDonations(isAuthenticated: boolean): State & Actions {
  const [activeTab, setActiveTab] = useState<MyDonationsTab>('donasi');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDownloadingRecap, setIsDownloadingRecap] = useState(false);

  const summaryQuery = useQuery({
    queryKey: queryKeys.myDonations.summary,
    queryFn: () => getTrackingSummary().then(unwrapResponse),
    enabled: isAuthenticated,
  });

  const transactionsQuery = useQuery({
    queryKey: queryKeys.myDonations.transactions,
    queryFn: () => getDonationTransactions(1).then(unwrapResponse),
    enabled: isAuthenticated,
  });

  const distributionsQuery = useQuery({
    queryKey: queryKeys.myDonations.distributions,
    queryFn: () => getDonationDistributions(1).then(unwrapResponse),
    enabled: isAuthenticated && activeTab === 'penyaluran',
  });

  const rekapQuery = useQuery({
    queryKey: queryKeys.myDonations.rekap,
    queryFn: () => getDonationCategorySummary().then(unwrapResponse),
    enabled: isAuthenticated && activeTab === 'rekap',
  });

  async function refresh(): Promise<void> {
    setIsRefreshing(true);
    try {
      const tasks: Promise<unknown>[] = [summaryQuery.refetch()];
      if (activeTab === 'donasi') {
        tasks.push(transactionsQuery.refetch());
      } else if (activeTab === 'penyaluran') {
        tasks.push(distributionsQuery.refetch());
      } else {
        tasks.push(rekapQuery.refetch());
      }
      await Promise.all(tasks);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function downloadRecap(): Promise<void> {
    setIsDownloadingRecap(true);
    try {
      const response = await downloadDonationRecap();
      showToast(response.message);
    } catch {
      showToast('Tidak dapat terhubung.');
    } finally {
      setIsDownloadingRecap(false);
    }
  }

  return {
    // Digerbang eksplisit oleh `isAuthenticated` (bukan cuma `enabled` di
    // query) — cache query tidak otomatis kosong begitu auth berubah,
    // sengaja dijaga di sini supaya data user sebelumnya tidak sempat
    // kebaca/flash sebelum queryClient.clear() (lihat useAccount.ts &
    // interceptor 401 di apiClient.ts) selesai membersihkan cache.
    trackingSummary: isAuthenticated ? summaryQuery.data ?? null : null,
    isLoading:
      isAuthenticated && (summaryQuery.isPending || transactionsQuery.isPending),
    isRefreshing,
    activeTab,
    transactions: isAuthenticated ? transactionsQuery.data ?? [] : [],
    isTransactionsLoading: isAuthenticated && transactionsQuery.isPending,
    distributions: isAuthenticated ? distributionsQuery.data ?? [] : [],
    isDistributionsLoading: activeTab === 'penyaluran' && distributionsQuery.isPending,
    categorySummary: isAuthenticated ? rekapQuery.data ?? [] : [],
    isRekapLoading: activeTab === 'rekap' && rekapQuery.isPending,
    isDownloadingRecap,
    setActiveTab,
    refresh,
    downloadRecap,
  };
}
