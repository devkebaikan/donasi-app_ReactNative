import {useState} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {resetReadingProgress} from '@/services/quranService';
import {useQuranReadingStore} from '@/stores/quranReadingStore';
import {useQuranSettingStore} from '@/stores/quranSettingStore';
import {unwrapResponse} from '@/utils/apiError';
import {showToast} from '@/utils/toast';
import type {ArabicFontSize, Qari} from '@/types/quran';

type State = {
  arabicFontSize: ArabicFontSize;
  showLatin: boolean;
  showTranslation: boolean;
  qari: Qari;
  isResetDialogOpen: boolean;
  isResetting: boolean;
};

type Actions = {
  setArabicFontSize: (size: ArabicFontSize) => void;
  setShowLatin: (value: boolean) => void;
  setShowTranslation: (value: boolean) => void;
  setQari: (value: Qari) => void;
  openResetDialog: () => void;
  closeResetDialog: () => void;
  confirmReset: () => Promise<void>;
};

export function useQuranSetting(): State & Actions {
  const queryClient = useQueryClient();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const arabicFontSize = useQuranSettingStore(s => s.arabicFontSize);
  const showLatin = useQuranSettingStore(s => s.showLatin);
  const showTranslation = useQuranSettingStore(s => s.showTranslation);
  const setArabicFontSize = useQuranSettingStore(s => s.setArabicFontSize);
  const setShowLatin = useQuranSettingStore(s => s.setShowLatin);
  const setShowTranslation = useQuranSettingStore(s => s.setShowTranslation);
  const qari = useQuranSettingStore(s => s.qari);
  const setQari = useQuranSettingStore(s => s.setQari);
  const resetReadingPositions = useQuranReadingStore(s => s.reset);

  const resetMutation = useMutation({
    mutationFn: () => resetReadingProgress().then(unwrapResponse),
    onSuccess: () => {
      // Posisi baca lokal ikut dikosongkan; kalau tidak, surah yang sudah
      // direset di server tetap melanjutkan dari ayat lama di perangkat ini.
      resetReadingPositions();
      queryClient.invalidateQueries({queryKey: ['quran']});
      showToast('Progres bacaan direset');
    },
    onError: (error: Error) => {
      // Progres lokal sengaja tidak disentuh saat gagal, supaya server dan
      // perangkat tidak berakhir dalam keadaan berbeda.
      showToast(error.message || 'Tidak dapat terhubung.');
    },
    onSettled: () => setIsResetDialogOpen(false),
  });

  async function confirmReset(): Promise<void> {
    try {
      await resetMutation.mutateAsync();
    } catch {
      // Sudah ditangani di onError.
    }
  }

  return {
    arabicFontSize,
    showLatin,
    showTranslation,
    qari,
    isResetDialogOpen,
    isResetting: resetMutation.isPending,
    setArabicFontSize,
    setShowLatin,
    setShowTranslation,
    setQari,
    openResetDialog: () => setIsResetDialogOpen(true),
    closeResetDialog: () => setIsResetDialogOpen(false),
    confirmReset,
  };
}
