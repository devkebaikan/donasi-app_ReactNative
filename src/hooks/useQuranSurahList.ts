import {useEffect, useMemo, useState} from 'react';
import {useQueries} from '@tanstack/react-query';
import {
  getSurahs,
  normalizeSurahKeyword,
} from '@/services/quranContentService';
import {
  getHighlightChallenges,
  getSurahReadingHistory,
} from '@/services/quranService';
import {useQuranReadingStore} from '@/stores/quranReadingStore';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import type {ChallengeSummary, Surah} from '@/types/quran';
import type {SortDirection} from '@/types/donationFilter';

const TOTAL_SURAH = 114;

interface UseQuranSurahListParams {
  initialSearch?: string;
  initialJuz?: number;
}

type State = {
  surahs: Surah[];
  challenges: ChallengeSummary[];
  keyword: string;
  juzFilter: number | null;
  sortDirection: SortDirection;
  hasActiveFilter: boolean;
  isEmpty: boolean;
};

type Actions = {
  setJuzFilter: (juzNumber: number | null) => void;
  toggleSortDirection: () => void;
  clearKeyword: () => void;
  clearAllFilters: () => void;
  getResumeAyah: (surahNumber: number) => number;
};

export function useQuranSurahList({
  initialSearch,
  initialJuz,
}: UseQuranSurahListParams): State & Actions {
  const [keyword, setKeyword] = useState(initialSearch ?? '');
  const [juzFilter, setJuzFilter] = useState<number | null>(initialJuz ?? null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Tab ini tetap ter-mount saat user bolak-balik ke QuranSearchScreen, jadi
  // keyword baru datang lewat perubahan route param, bukan lewat mount ulang.
  useEffect(() => {
    if (initialSearch != null) {
      setKeyword(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    if (initialJuz != null) {
      setJuzFilter(initialJuz);
    }
  }, [initialJuz]);

  const localPositions = useQuranReadingStore(s => s.positions);

  const [challengesQuery, historyQuery] = useQueries({
    queries: [
      {
        queryKey: queryKeys.quran.highlightChallenges,
        queryFn: () => getHighlightChallenges().then(unwrapResponse),
      },
      {
        queryKey: queryKeys.quran.readingHistory('surah', TOTAL_SURAH),
        queryFn: () =>
          getSurahReadingHistory(TOTAL_SURAH).then(unwrapResponse),
      },
    ],
  });

  const surahs = useMemo(() => {
    const normalizedKeyword = normalizeSurahKeyword(keyword);

    const filtered = getSurahs().filter(surah => {
      // Keyword dan juz bersifat AND, bukan saling menggantikan.
      const matchesJuz =
        juzFilter == null || surah.juzNumbers.includes(juzFilter);
      if (!matchesJuz) {
        return false;
      }
      if (!normalizedKeyword) {
        return true;
      }
      if (/^\d+$/.test(normalizedKeyword)) {
        return surah.number === Number(normalizedKeyword);
      }
      return (
        normalizeSurahKeyword(surah.nameLatin).includes(normalizedKeyword) ||
        normalizeSurahKeyword(surah.meaning).includes(normalizedKeyword)
      );
    });

    // Toggle hanya membalik urutan nomor surah, tidak mengubah kriteria lain.
    return sortDirection === 'asc' ? filtered : [...filtered].reverse();
  }, [keyword, juzFilter, sortDirection]);

  // Posisi lokal menang atas riwayat server kalau updatedAt-nya lebih baru —
  // bacaan yang belum sempat ter-sync tetap jadi acuan.
  const resumeAyahBySurah = useMemo(() => {
    const map = new Map<number, {ayah: number; updatedAt: string}>();
    for (const item of historyQuery.data ?? []) {
      map.set(item.surahNumber, {
        ayah: item.lastAyah,
        updatedAt: item.updatedAt,
      });
    }
    for (const position of Object.values(localPositions)) {
      const existing = map.get(position.surahNumber);
      if (!existing || position.updatedAt > existing.updatedAt) {
        map.set(position.surahNumber, {
          ayah: position.ayahNumber,
          updatedAt: position.updatedAt,
        });
      }
    }
    return map;
  }, [historyQuery.data, localPositions]);

  function getResumeAyah(surahNumber: number): number {
    return resumeAyahBySurah.get(surahNumber)?.ayah ?? 1;
  }

  const hasActiveFilter = keyword.trim().length > 0 || juzFilter != null;

  return {
    surahs,
    // Carousel disembunyikan diam-diam kalau challenge gagal dimuat —
    // daftar surah tetap jadi isi utama screen ini.
    challenges: challengesQuery.data ?? [],
    keyword,
    juzFilter,
    sortDirection,
    hasActiveFilter,
    isEmpty: surahs.length === 0,
    setJuzFilter,
    toggleSortDirection: () =>
      setSortDirection(current => (current === 'asc' ? 'desc' : 'asc')),
    clearKeyword: () => setKeyword(''),
    clearAllFilters: () => {
      setKeyword('');
      setJuzFilter(null);
    },
    getResumeAyah,
  };
}
