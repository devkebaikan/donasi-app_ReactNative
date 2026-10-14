import {useState} from 'react';
import {useMutation, useQueries, useQueryClient} from '@tanstack/react-query';
import {
  deleteSchedule,
  getBookmarks,
  getJuzReadingHistory,
  getProgressSummary,
  getSchedules,
  getSurahReadingHistory,
  removeBookmark,
} from '@/services/quranService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {showToast} from '@/utils/toast';
import type {QuranProgressTab} from '@/types/navigation';
import type {
  JuzReadingHistory,
  ProgressSummary,
  SavedSurah,
  Schedule,
  SurahReadingHistory,
} from '@/types/quran';

// Screen ini menampilkan daftar penuh, bukan ringkasan seperti di Beranda.
const ALL_SURAH = 114;
const ALL_JUZ = 30;
const ALL_ITEMS = 100;

export interface DeleteTarget {
  type: 'bookmark' | 'schedule';
  id: string;
  label: string;
}

type State = {
  summary: ProgressSummary | null;
  activeTab: QuranProgressTab;
  surahHistory: SurahReadingHistory[];
  juzHistory: JuzReadingHistory[];
  savedSurahs: SavedSurah[];
  schedules: Schedule[];
  isTabLoading: boolean;
  isRefreshing: boolean;
  deleteTarget: DeleteTarget | null;
  isDeleting: boolean;
};

type Actions = {
  changeTab: (tab: QuranProgressTab) => void;
  refresh: () => Promise<void>;
  askDelete: (target: DeleteTarget) => void;
  cancelDelete: () => void;
  confirmDelete: () => Promise<void>;
};

export function useQuranProgress(
  initialTab: QuranProgressTab = 'surah',
): State & Actions {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<QuranProgressTab>(initialTab);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Tiap tab baru di-fetch saat tabnya pertama kali aktif, bukan semuanya
  // saat mount.
  const [summaryQuery, surahQuery, juzQuery, savedQuery, scheduleQuery] =
    useQueries({
      queries: [
        {
          queryKey: queryKeys.quran.progressSummary,
          queryFn: () => getProgressSummary().then(unwrapResponse),
        },
        {
          queryKey: queryKeys.quran.readingHistory('surah', ALL_SURAH),
          queryFn: () =>
            getSurahReadingHistory(ALL_SURAH).then(unwrapResponse),
          enabled: activeTab === 'surah',
        },
        {
          queryKey: queryKeys.quran.readingHistory('juz', ALL_JUZ),
          queryFn: () => getJuzReadingHistory(ALL_JUZ).then(unwrapResponse),
          enabled: activeTab === 'juz',
        },
        {
          queryKey: queryKeys.quran.bookmarks(ALL_ITEMS),
          queryFn: () => getBookmarks(ALL_ITEMS).then(unwrapResponse),
          enabled: activeTab === 'saved',
        },
        {
          queryKey: queryKeys.quran.schedules(ALL_ITEMS),
          queryFn: () => getSchedules(ALL_ITEMS).then(unwrapResponse),
          enabled: activeTab === 'schedule',
        },
      ],
    });

  const activeQuery =
    activeTab === 'juz'
      ? juzQuery
      : activeTab === 'saved'
        ? savedQuery
        : activeTab === 'schedule'
          ? scheduleQuery
          : surahQuery;

  const deleteMutation = useMutation({
    mutationFn: (target: DeleteTarget) =>
      (target.type === 'bookmark'
        ? removeBookmark(Number(target.id))
        : deleteSchedule(target.id)
      ).then(unwrapResponse),
    onSuccess: (_data, target) => {
      showToast(
        target.type === 'bookmark'
          ? 'Surah dihapus dari daftar simpan'
          : 'Jadwal dihapus',
      );
      queryClient.invalidateQueries({queryKey: ['quran']});
    },
    onError: (error: Error) => {
      // Item dikembalikan ke daftar lewat refetch dari invalidate di atas
      // tidak jalan pada kasus gagal, jadi cukup beri tahu user.
      showToast(error.message || 'Tidak dapat terhubung.');
    },
    onSettled: () => setDeleteTarget(null),
  });

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(deleteTarget);
    } catch {
      // Sudah ditangani di onError.
    }
  }

  async function refresh(): Promise<void> {
    await Promise.all([summaryQuery.refetch(), activeQuery.refetch()]);
  }

  return {
    summary: summaryQuery.data ?? null,
    activeTab,
    surahHistory: surahQuery.data ?? [],
    // Seluruh 30 juz ditampilkan urut nomor, termasuk yang belum tersentuh —
    // supaya terbaca sebagai peta perjalanan, bukan sekadar riwayat.
    juzHistory: [...(juzQuery.data ?? [])].sort(
      (a, b) => a.juzNumber - b.juzNumber,
    ),
    savedSurahs: savedQuery.data ?? [],
    schedules: scheduleQuery.data ?? [],
    isTabLoading: activeQuery.isPending,
    isRefreshing: activeQuery.isRefetching || summaryQuery.isRefetching,
    deleteTarget,
    isDeleting: deleteMutation.isPending,
    changeTab: setActiveTab,
    refresh,
    askDelete: setDeleteTarget,
    cancelDelete: () => setDeleteTarget(null),
    confirmDelete,
  };
}
