import {useCallback, useEffect, useState} from 'react';
import {getRecurringDonations} from '@/services/recurringDonationService';
import {showToast} from '@/utils/toast';
import type {
  RecurringDonation,
  RecurringStatusFilter,
} from '@/types/recurringDonation';

type State = {
  donations: RecurringDonation[];
  statusFilter: RecurringStatusFilter;
  isLoading: boolean;
  isRefreshing: boolean;
};

type Actions = {
  setStatusFilter: (filter: RecurringStatusFilter) => void;
  refresh: () => Promise<void>;
  reload: () => Promise<void>;
};

const STATUS_BY_FILTER: Record<
  Exclude<RecurringStatusFilter, 'semua'>,
  RecurringDonation['status']
> = {
  aktif: 'AKTIF',
  jeda: 'JEDA',
};

// Daftar rutinitas milik pengguna. Penyaringan status dan pencarian dikerjakan
// di sisi klien: endpointnya mengembalikan semua rutinitas sekaligus dan
// jumlahnya sedikit, jadi tidak ada gunanya bolak-balik ke server.
//
// `isEnabled` sengaja bukan sekadar "sudah login": data baru dimuat saat tab
// "Rutinitas Saya" benar-benar dibuka, supaya orang yang cuma melihat katalog
// tidak memicu request untuk daftar yang tidak dia lihat.
//
// Dialog "hentikan" TIDAK lagi hidup di sini — aksinya pindah ke menu di header
// DetailDonasiRutinScreen. Lihat docs/08-features/donasi-rutin/README.md.
export function useRecurringDonationList(
  isEnabled: boolean,
  searchQuery: string,
): State & Actions {
  const [donations, setDonations] = useState<RecurringDonation[]>([]);
  const [statusFilter, setStatusFilter] =
    useState<RecurringStatusFilter>('semua');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    try {
      const response = await getRecurringDonations();
      if (!response.success) {
        showToast(response.message);
        return;
      }
      setDonations(response.data);
    } catch {
      showToast('Tidak dapat terhubung.');
    }
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      setDonations([]);
      setIsLoading(false);
      return;
    }
    async function init(): Promise<void> {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    }
    init();
  }, [isEnabled, load]);

  async function refresh(): Promise<void> {
    if (!isEnabled) {
      return;
    }
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  }

  // Muat ulang TANPA menyalakan isRefreshing. Dipakai saat screen kembali
  // fokus: memakai refresh() di sana membuat RefreshControl ikut membuka
  // spinner-nya dan mendorong seluruh daftar turun — terlihat seperti celah
  // kosong besar di bawah header, padahal pengguna tidak menarik apa pun.
  async function reload(): Promise<void> {
    if (!isEnabled) {
      return;
    }
    await load();
  }

  const keyword = searchQuery.trim().toLowerCase();
  const visibleDonations = donations.filter(donation => {
    const matchesStatus =
      statusFilter === 'semua'
        ? true
        : donation.status === STATUS_BY_FILTER[statusFilter];
    const matchesSearch = keyword
      ? donation.programTitle.toLowerCase().includes(keyword)
      : true;
    return matchesStatus && matchesSearch;
  });

  return {
    donations: visibleDonations,
    statusFilter,
    isLoading,
    isRefreshing,
    setStatusFilter,
    refresh,
    reload,
  };
}
