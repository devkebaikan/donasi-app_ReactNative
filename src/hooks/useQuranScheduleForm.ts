import {useEffect, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  createSchedule,
  getScheduleDetail,
  updateSchedule,
} from '@/services/quranService';
import {getSurahByNumber} from '@/services/quranContentService';
import {ApiError, unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {showToast} from '@/utils/toast';
import type {ScheduleRepeat, Surah} from '@/types/quran';

function todayKey(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

type State = {
  isEditMode: boolean;
  isLoading: boolean;
  date: string;
  surah: Surah | null;
  targetAyah: string;
  repeat: ScheduleRepeat;
  fieldErrors: Record<string, string>;
  isSaving: boolean;
  today: string;
};

type Actions = {
  setDate: (value: string) => void;
  selectSurah: (surah: Surah) => void;
  setTargetAyah: (value: string) => void;
  setRepeat: (value: ScheduleRepeat) => void;
  submit: () => Promise<boolean>;
};

export function useQuranScheduleForm(scheduleId?: string): State & Actions {
  const queryClient = useQueryClient();
  const isEditMode = scheduleId != null;
  const today = todayKey();

  const [date, setDate] = useState(today);
  const [surah, setSurah] = useState<Surah | null>(null);
  const [targetAyah, setTargetAyah] = useState('');
  const [repeat, setRepeat] = useState<ScheduleRepeat>('TIDAK_BERULANG');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const detailQuery = useQuery({
    queryKey: queryKeys.quran.scheduleDetail(scheduleId ?? ''),
    queryFn: () => getScheduleDetail(scheduleId ?? '').then(unwrapResponse),
    enabled: isEditMode,
    retry: false,
  });

  useEffect(() => {
    const detail = detailQuery.data;
    if (!detail) {
      return;
    }
    setDate(detail.date.slice(0, 10));
    setSurah(getSurahByNumber(detail.surahNumber));
    setTargetAyah(String(detail.targetAyah));
    setRepeat(detail.repeat);
  }, [detailQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        date,
        surahNumber: surah?.number ?? 0,
        targetAyah: Number(targetAyah.replace(/\D/g, '')) || 0,
        repeat,
      };
      return (
        isEditMode
          ? updateSchedule(scheduleId ?? '', payload)
          : createSchedule(payload)
      ).then(unwrapResponse);
    },
    onSuccess: () => {
      showToast(isEditMode ? 'Jadwal diperbarui' : 'Jadwal dibuat');
      queryClient.invalidateQueries({queryKey: ['quran']});
    },
    onError: (error: Error) => {
      showToast(error.message || 'Tidak dapat terhubung.');
      // `data` dari response error dipetakan ke error inline per field,
      // sesuai kontrak API di CLAUDE.md.
      if (error instanceof ApiError && error.data) {
        setFieldErrors(error.data as Record<string, string>);
      }
    },
  });

  // Validasi hanya dijalankan saat tombol ditekan, bukan saat mengetik.
  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!date) {
      errors.date = 'Tanggal wajib diisi';
    } else if (!isEditMode && date < today) {
      // Mode ubah membolehkan tanggal lampau supaya jadwal lama bisa
      // dikoreksi tanpa harus dihapus.
      errors.date = 'Tanggal tidak boleh di masa lalu';
    }
    if (!surah) {
      errors.surahNumber = 'Pilih surah terlebih dahulu';
    }
    const target = Number(targetAyah.replace(/\D/g, ''));
    if (!targetAyah.trim() || !target || target < 1) {
      errors.targetAyah = 'Target ayat wajib diisi';
    } else if (surah && target > surah.totalAyah) {
      errors.targetAyah = `Surah ini hanya punya ${surah.totalAyah} ayat`;
    }
    return errors;
  }

  async function submit(): Promise<boolean> {
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return false;
    }
    try {
      await saveMutation.mutateAsync();
      return true;
    } catch {
      return false;
    }
  }

  return {
    isEditMode,
    isLoading: isEditMode && detailQuery.isPending,
    date,
    surah,
    targetAyah,
    repeat,
    fieldErrors,
    isSaving: saveMutation.isPending,
    today,
    setDate: (value: string) => {
      setDate(value);
      setFieldErrors(current => ({...current, date: ''}));
    },
    // Ganti surah mereset target ayat karena batas maksimalnya ikut berubah.
    selectSurah: (value: Surah) => {
      setSurah(value);
      setTargetAyah('');
      setFieldErrors(current => ({...current, surahNumber: '', targetAyah: ''}));
    },
    setTargetAyah: (value: string) => {
      setTargetAyah(value);
      setFieldErrors(current => ({...current, targetAyah: ''}));
    },
    setRepeat,
    submit,
  };
}
