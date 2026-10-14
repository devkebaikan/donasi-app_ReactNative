import {useEffect, useState} from 'react';
import {useQueries} from '@tanstack/react-query';
import {
  getBookmarks,
  getHighlightChallenges,
  getJuzReadingHistory,
  getSchedules,
  getSurahReadingHistory,
} from '@/services/quranService';
import {useQuranLocation} from '@/hooks/useQuranLocation';
import {getMe} from '@/services/userService';
import {useAuthStore} from '@/stores/authStore';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {getHijriDateLabel} from '@/utils/hijriDate';
import type {
  ChallengeSummary,
  JuzReadingHistory,
  LastReadTab,
  SavedSurah,
  Schedule,
  SurahReadingHistory,
} from '@/types/quran';

const LAST_READ_LIMIT = 5;
const SCHEDULE_LIMIT = 6;

type State = {
  location: string;
  hijriDate: string;
  userName: string;
  challenges: ChallengeSummary[];
  activeLastReadTab: LastReadTab;
  surahHistory: SurahReadingHistory[];
  juzHistory: JuzReadingHistory[];
  savedSurahs: SavedSurah[];
  schedules: Schedule[];
  isLoading: boolean;
  isLastReadLoading: boolean;
  isRefreshing: boolean;
};

type Actions = {
  changeLastReadTab: (tab: LastReadTab) => void;
  refresh: () => Promise<void>;
};

export function useQuranHome(): State & Actions {
  const [activeLastReadTab, setActiveLastReadTab] =
    useState<LastReadTab>('surah');
  const user = useAuthStore(s => s.user);
  const accessToken = useAuthStore(s => s.accessToken);
  const setUser = useAuthStore(s => s.setUser);
  const location = useQuranLocation();

  // `authStore.user` hanya terisi lewat layar Akun, jadi user yang langsung
  // masuk menu Quran setelah login akan melihat sapaan tanpa nama. Ambil
  // profilnya di sini kalau belum ada.
  useEffect(() => {
    if (accessToken == null || user) {
      return;
    }
    let isActive = true;
    getMe()
      .then(response => {
        if (isActive && response.success) {
          setUser(response.data);
        }
      })
      .catch(() => {
        // Sapaan jatuh ke kata sapaan umum; bukan kegagalan yang perlu toast.
      });
    return () => {
      isActive = false;
    };
  }, [accessToken, user, setUser]);

  // Tab Juz dan Disimpan baru di-fetch saat tabnya pertama kali dibuka —
  // Beranda hanya butuh tab Surah saat mount.
  const [challengesQuery, surahQuery, juzQuery, savedQuery, schedulesQuery] =
    useQueries({
      queries: [
        {
          queryKey: queryKeys.quran.highlightChallenges,
          queryFn: () => getHighlightChallenges().then(unwrapResponse),
        },
        {
          queryKey: queryKeys.quran.readingHistory('surah', LAST_READ_LIMIT),
          queryFn: () =>
            getSurahReadingHistory(LAST_READ_LIMIT).then(unwrapResponse),
        },
        {
          queryKey: queryKeys.quran.readingHistory('juz', LAST_READ_LIMIT),
          queryFn: () =>
            getJuzReadingHistory(LAST_READ_LIMIT).then(unwrapResponse),
          enabled: activeLastReadTab === 'juz',
        },
        {
          queryKey: queryKeys.quran.bookmarks(LAST_READ_LIMIT),
          queryFn: () => getBookmarks(LAST_READ_LIMIT).then(unwrapResponse),
          enabled: activeLastReadTab === 'saved',
        },
        {
          queryKey: queryKeys.quran.schedules(SCHEDULE_LIMIT),
          queryFn: () => getSchedules(SCHEDULE_LIMIT).then(unwrapResponse),
        },
      ],
    });

  const lastReadQuery =
    activeLastReadTab === 'juz'
      ? juzQuery
      : activeLastReadTab === 'saved'
        ? savedQuery
        : surahQuery;

  async function refresh(): Promise<void> {
    await Promise.all([
      challengesQuery.refetch(),
      surahQuery.refetch(),
      schedulesQuery.refetch(),
      activeLastReadTab === 'juz' ? juzQuery.refetch() : Promise.resolve(),
      activeLastReadTab === 'saved' ? savedQuery.refetch() : Promise.resolve(),
    ]);
  }

  return {
    location,
    hijriDate: getHijriDateLabel(),
    userName: user?.name ?? 'Sahabat',
    challenges: challengesQuery.data ?? [],
    activeLastReadTab,
    surahHistory: surahQuery.data ?? [],
    juzHistory: juzQuery.data ?? [],
    savedSurahs: savedQuery.data ?? [],
    schedules: schedulesQuery.data ?? [],
    isLoading: challengesQuery.isPending || surahQuery.isPending,
    isLastReadLoading: lastReadQuery.isPending,
    isRefreshing:
      challengesQuery.isRefetching ||
      surahQuery.isRefetching ||
      schedulesQuery.isRefetching,
    changeLastReadTab: setActiveLastReadTab,
    refresh,
  };
}
