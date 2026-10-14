import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  getAyahs,
  getSurahAyahs,
  getSurahByNumber,
  getTafsir,
} from '@/services/quranContentService';
import {
  addBookmark,
  getBookmarkStatus,
  removeBookmark,
  syncReadingProgress,
} from '@/services/quranService';
import {useQuranReadingStore} from '@/stores/quranReadingStore';
import {useQuranSettingStore} from '@/stores/quranSettingStore';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {showToast} from '@/utils/toast';
import type {Ayah, ArabicFontSize, SurahMeta} from '@/types/quran';

const SYNC_DEBOUNCE_MS = 3000;
const AT_TAUBAH = 9;
const AL_FATIHAH = 1;
const LAST_SURAH = 114;

interface UseQuranReaderParams {
  surahNumber: number;
  ayahNumber?: number;
}

type State = {
  surah: SurahMeta | null;
  ayahs: Ayah[];
  isPlaceholderData: boolean;
  hasContent: boolean;
  initialAyah: number;
  subtitle: string;
  showBismillah: boolean;
  isSaved: boolean;
  previousSurah: SurahMeta | null;
  nextSurah: SurahMeta | null;
  arabicFontSize: ArabicFontSize;
  showLatin: boolean;
  showTranslation: boolean;
};

type Actions = {
  handleAyahVisible: (ayahNumber: number) => void;
  toggleBookmark: () => void;
  getTafsirText: (ayahNumber: number) => string | null;
  flushProgress: () => void;
};

export function useQuranReader({
  surahNumber,
  ayahNumber,
}: UseQuranReaderParams): State & Actions {
  const queryClient = useQueryClient();
  const surah = getSurahByNumber(surahNumber);
  const surahContent = getSurahAyahs(surahNumber);
  const ayahs = useMemo(() => getAyahs(surahNumber), [surahNumber]);

  const setPosition = useQuranReadingStore(s => s.setPosition);

  const arabicFontSize = useQuranSettingStore(s => s.arabicFontSize);
  const showLatin = useQuranSettingStore(s => s.showLatin);
  const showTranslation = useQuranSettingStore(s => s.showTranslation);

  // Posisi baca dibaca lewat getState(), BUKAN dengan berlangganan store.
  // Berlangganan berarti tiap ayat yang terlihat saat menggulir menulis
  // posisi baru, nilainya berubah, dan seluruh screen ikut render ulang —
  // itulah penyebab layar berkedip saat digulir. Nilainya cuma dibutuhkan
  // sekali saat mount, jadi tidak perlu diikuti perubahannya.
  const [initialAyah] = useState<number>(() => {
    const total = surah?.totalAyah ?? 1;
    const stored =
      useQuranReadingStore.getState().positions[surahNumber]?.ayahNumber;
    const requested = ayahNumber ?? stored ?? 1;
    // Nomor ayat di luar rentang di-clamp, bukan bikin screen kosong.
    return Math.min(Math.max(1, requested), Math.max(1, total));
  });

  const bookmarkQuery = useQuery({
    queryKey: queryKeys.quran.bookmarkStatus(surahNumber),
    queryFn: () => getBookmarkStatus(surahNumber).then(unwrapResponse),
  });
  const [optimisticSaved, setOptimisticSaved] = useState<boolean | null>(null);
  const isSaved = optimisticSaved ?? bookmarkQuery.data?.isSaved ?? false;

  const bookmarkMutation = useMutation({
    mutationFn: (nextSaved: boolean) =>
      (nextSaved ? addBookmark(surahNumber) : removeBookmark(surahNumber)).then(
        unwrapResponse,
      ),
    onSuccess: () => {
      setOptimisticSaved(null);
      queryClient.invalidateQueries({
        queryKey: queryKeys.quran.bookmarkStatus(surahNumber),
      });
      queryClient.invalidateQueries({queryKey: ['quran', 'bookmarks']});
    },
    onError: (error: Error) => {
      // Rollback ikon ke kondisi server, lalu beri tahu user.
      setOptimisticSaved(null);
      showToast(error.message || 'Tidak dapat terhubung.');
    },
  });

  function toggleBookmark(): void {
    const nextSaved = !isSaved;
    setOptimisticSaved(nextSaved);
    bookmarkMutation.mutate(nextSaved);
  }

  // Posisi baca ditulis ke store lokal seketika, sinkronisasi ke server
  // menyusul dengan debounce — kalau sync gagal, posisi lokal tetap benar.
  const pendingRef = useRef<{ayahNumber: number; isCompleted: boolean} | null>(
    null,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushProgress = useCallback((): void => {
    const pending = pendingRef.current;
    if (!pending) {
      return;
    }
    pendingRef.current = null;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    syncReadingProgress({
      surahNumber,
      ayahNumber: pending.ayahNumber,
      isCompleted: pending.isCompleted,
      readAt: new Date().toISOString(),
    }).catch(() => {
      // Sengaja diam: posisi lokal sudah tersimpan, tidak ada yang hilang
      // dari sisi user. Percobaan berikutnya terjadi saat surah dibuka lagi.
    });
  }, [surahNumber]);

  const handleAyahVisible = useCallback(
    (visibleAyah: number): void => {
      setPosition(surahNumber, visibleAyah);
      pendingRef.current = {
        ayahNumber: visibleAyah,
        // Surah dianggap selesai saat ayat terakhirnya terbaca — tidak ada
        // tombol "tandai selesai".
        isCompleted: visibleAyah >= (surah?.totalAyah ?? 0),
      };
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(flushProgress, SYNC_DEBOUNCE_MS);
    },
    [flushProgress, setPosition, surah?.totalAyah, surahNumber],
  );

  // Progres yang belum ter-sync dikirim saat screen ditinggalkan.
  useEffect(() => {
    return () => {
      flushProgress();
    };
  }, [flushProgress]);

  return {
    surah,
    ayahs,
    isPlaceholderData: surahContent?.isPlaceholder ?? false,
    hasContent: ayahs.length > 0,
    initialAyah,
    subtitle: surah
      ? `Juz ${ayahs[0]?.juzNumber ?? '-'} · ${surah.totalAyah} ayat`
      : '',
    // Bismillah bukan bagian teks di At-Taubah, dan di Al-Fatihah sudah
    // menjadi ayat 1 sehingga tidak boleh digandakan sebagai header.
    showBismillah: surahNumber !== AT_TAUBAH && surahNumber !== AL_FATIHAH,
    isSaved,
    previousSurah: surahNumber > 1 ? getSurahByNumber(surahNumber - 1) : null,
    nextSurah:
      surahNumber < LAST_SURAH ? getSurahByNumber(surahNumber + 1) : null,
    arabicFontSize,
    showLatin,
    showTranslation,
    handleAyahVisible,
    toggleBookmark,
    getTafsirText: (ayah: number) => getTafsir(surahNumber, ayah),
    flushProgress,
  };
}
