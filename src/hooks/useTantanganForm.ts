import {useState} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {
  createTantangan,
  getTantanganCategories,
  getTantanganDetail,
  updateTantangan,
} from '@/services/tantanganService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {showToast} from '@/utils/toast';
import type {
  TantanganCategory,
  TantanganDetail,
  TantanganMode,
} from '@/types/tantangan';

export const TANTANGAN_NAME_MIN_LENGTH = 3;
export const TANTANGAN_NAME_MAX_LENGTH = 60;
export const TANTANGAN_UNIT_MAX_LENGTH = 20;
export const TANTANGAN_TARGET_TEXT_MAX_LENGTH = 200;

type State = {
  isEditMode: boolean;
  // Mode ubah menunggu detail sebelum form dirender — form setengah terisi
  // lebih membingungkan daripada layar memuat.
  isLoadingDetail: boolean;
  isDetailError: boolean;
  categories: TantanganCategory[];
  isLoadingCategories: boolean;
  isCategoriesError: boolean;
  // Mode dikunci saat tantangan sudah punya peserta lain: mengubahnya berarti
  // membuang papan kebaikan orang yang sudah ikut.
  isModeLocked: boolean;
  name: string;
  categorySlug: string | null;
  mode: TantanganMode;
  durationDays: number | null;
  unit: string;
  dailyTargetText: string;
  isPublic: boolean;
  fieldErrors: Record<string, string>;
  isSubmitting: boolean;
};

type Actions = {
  setName: (value: string) => void;
  setCategorySlug: (value: string) => void;
  setMode: (value: TantanganMode) => void;
  setDurationDays: (value: number) => void;
  setUnit: (value: string) => void;
  setDailyTargetText: (value: string) => void;
  setIsPublic: (value: boolean) => void;
  reloadCategories: () => void;
  reloadDetail: () => void;
  submit: () => Promise<TantanganDetail | null>;
};

interface Params {
  /** Ada = mode ubah, kosong = mode buat. */
  challengeId?: string;
}

export function useTantanganForm({challengeId}: Params = {}): State & Actions {
  const queryClient = useQueryClient();
  const isEditMode = challengeId != null;

  const categoriesQuery = useQuery({
    queryKey: queryKeys.tantangan.categories,
    queryFn: () => getTantanganCategories().then(unwrapResponse),
  });

  // Key-nya sama dengan yang dipakai halaman detail, jadi membuka form ubah
  // dari detail biasanya tidak memicu request tambahan.
  const detailQuery = useQuery({
    queryKey: queryKeys.tantangan.detail(challengeId ?? ''),
    queryFn: () => getTantanganDetail(challengeId as string).then(unwrapResponse),
    enabled: isEditMode,
  });

  const detail = isEditMode ? (detailQuery.data ?? null) : null;

  // Nilai awal field baru terpasang setelah detail datang. `isLoadingDetail`
  // yang menahan form dirender sebelum itu, jadi state di bawah tidak pernah
  // terlihat kosong lalu melompat terisi.
  const [name, setNameState] = useState('');
  const [categorySlug, setCategorySlugState] = useState<string | null>(null);
  const [mode, setModeState] = useState<TantanganMode>('personal');
  const [durationDays, setDurationDaysState] = useState<number | null>(null);
  const [unit, setUnitState] = useState('');
  const [dailyTargetText, setDailyTargetTextState] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  // Mengisi form dari detail dilakukan saat render, sekali per challengeId —
  // bukan useEffect, supaya tidak ada satu frame form kosong yang terlihat
  // duluan. Pola set-state-while-rendering yang dianjurkan React untuk
  // menurunkan props jadi state.
  if (detail && hydratedId !== detail.id) {
    setHydratedId(detail.id);
    setNameState(detail.name);
    setCategorySlugState(detail.categorySlug);
    setModeState(detail.mode);
    setDurationDaysState(detail.durationDays);
    setUnitState(detail.unit ?? '');
    setDailyTargetTextState(detail.dailyTargetText ?? '');
    setIsPublic(detail.isPublic);
  }

  function clearFieldError(field: string): void {
    setFieldErrors(current => {
      if (!current[field]) {
        return current;
      }
      const next = {...current};
      delete next[field];
      return next;
    });
  }

  function setName(value: string): void {
    setNameState(value);
    clearFieldError('name');
  }

  function setCategorySlug(value: string): void {
    setCategorySlugState(value);
    clearFieldError('categorySlug');
  }

  function setMode(value: TantanganMode): void {
    setModeState(value);
  }

  function setDurationDays(value: number): void {
    setDurationDaysState(value);
    clearFieldError('durationDays');
  }

  function setUnit(value: string): void {
    setUnitState(value);
    clearFieldError('unit');
  }

  function setDailyTargetText(value: string): void {
    setDailyTargetTextState(value);
    clearFieldError('dailyTargetText');
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    const trimmedName = name.trim();

    if (trimmedName.length < TANTANGAN_NAME_MIN_LENGTH) {
      errors.name = `Nama tantangan minimal ${TANTANGAN_NAME_MIN_LENGTH} karakter`;
    } else if (trimmedName.length > TANTANGAN_NAME_MAX_LENGTH) {
      errors.name = `Nama tantangan maksimal ${TANTANGAN_NAME_MAX_LENGTH} karakter`;
    }
    if (!categorySlug) {
      errors.categorySlug = 'Pilih kategori dulu';
    }
    if (durationDays == null) {
      errors.durationDays = 'Pilih lama hari dulu';
    }
    if (unit.trim().length > TANTANGAN_UNIT_MAX_LENGTH) {
      errors.unit = `Satuan maksimal ${TANTANGAN_UNIT_MAX_LENGTH} karakter`;
    }
    if (dailyTargetText.trim().length > TANTANGAN_TARGET_TEXT_MAX_LENGTH) {
      errors.dailyTargetText = `Deskripsi maksimal ${TANTANGAN_TARGET_TEXT_MAX_LENGTH} karakter`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function submit(): Promise<TantanganDetail | null> {
    if (!validate()) {
      return null;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        categorySlug: categorySlug as string,
        mode,
        durationDays: durationDays as number,
        // Field kosong dikirim null, bukan string kosong: `unit: null` yang
        // menentukan tantangan dicatat biner, dan '' bukan penanda yang sama.
        unit: unit.trim() || null,
        dailyTargetText: dailyTargetText.trim() || null,
        // Tantangan personal tidak untuk diikuti orang lain — nilai toggle
        // yang tersembunyi tidak boleh ikut terkirim.
        isPublic: mode === 'group' ? isPublic : false,
      };
      const response =
        isEditMode && challengeId
          ? await updateTantangan(challengeId, payload)
          : await createTantangan(payload);
      if (!response.success) {
        showToast(response.message);
        // `data` saat success:false berisi error per field, bukan detail.
        setFieldErrors(
          (response.data as unknown as Record<string, string> | null) ?? {},
        );
        return null;
      }
      // Daftar sudah ter-cache per tab & kata kunci; tanpa invalidate,
      // tantangan yang baru dibuat tidak muncul saat kembali ke daftar.
      queryClient.invalidateQueries({queryKey: ['tantangan', 'list']});
      if (isEditMode && challengeId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tantangan.detail(challengeId),
        });
      }
      return response.data;
    } catch {
      showToast('Tidak dapat terhubung.');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isEditMode,
    isLoadingDetail: isEditMode && detailQuery.isPending,
    isDetailError: isEditMode && detailQuery.isError,
    categories: categoriesQuery.data ?? [],
    isLoadingCategories: categoriesQuery.isPending,
    isCategoriesError: categoriesQuery.isError,
    isModeLocked: (detail?.participantCount ?? 0) > 1,
    name,
    categorySlug,
    mode,
    durationDays,
    unit,
    dailyTargetText,
    isPublic,
    fieldErrors,
    isSubmitting,
    setName,
    setCategorySlug,
    setMode,
    setDurationDays,
    setUnit,
    setDailyTargetText,
    setIsPublic,
    reloadCategories: () => {
      categoriesQuery.refetch();
    },
    reloadDetail: () => {
      detailQuery.refetch();
    },
    submit,
  };
}
