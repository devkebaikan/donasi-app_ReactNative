import {useState} from 'react';
import {Alert} from 'react-native';
import {useQueryClient} from '@tanstack/react-query';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {
  createDonasiBersama,
  updateDonasiBersama,
  uploadDonasiBersamaCover,
} from '@/services/donasiBersamaService';
import {getDonationList} from '@/services/donationService';
import {showToast} from '@/utils/toast';
import {toIsoDateOnly} from '@/utils/formatDate';
import {queryKeys} from '@/utils/queryKeys';
import type {
  DonasiBersamaDetail,
  ReminderFrequency,
  WeekDay,
} from '@/types/donasiBersama';
import type {Program} from '@/types/program';

export const GROUP_NAME_MIN_LENGTH = 3;
export const GROUP_NAME_MAX_LENGTH = 60;
export const GROUP_MIN_TARGET_AMOUNT = 100000;
const GROUP_MAX_DEADLINE_DAYS = 365;

interface ProgramOption {
  id: string;
  title: string;
}

type State = {
  isEditMode: boolean;
  coverImageUrl: string | null;
  localCoverUri: string | null;
  isUploadingCover: boolean;
  name: string;
  programId: string | null;
  programTitle: string | null;
  programOptions: ProgramOption[];
  isLoadingPrograms: boolean;
  targetAmount: number;
  deadline: string;
  isPublic: boolean;
  reminderEnabled: boolean;
  reminderFrequency: ReminderFrequency;
  reminderWeekDay: WeekDay | null;
  reminderTime: string;
  fieldErrors: Record<string, string>;
  isSubmitting: boolean;
  minDeadline: string;
};

type Actions = {
  pickCover: () => void;
  setName: (value: string) => void;
  selectProgram: (programId: string) => void;
  loadPrograms: () => Promise<void>;
  setTargetAmount: (value: string) => void;
  setDeadline: (value: string) => void;
  setIsPublic: (value: boolean) => void;
  setReminderEnabled: (value: boolean) => void;
  setReminderFrequency: (value: ReminderFrequency) => void;
  setReminderWeekDay: (value: WeekDay) => void;
  setReminderHour: (value: number) => void;
  setReminderMinute: (value: number) => void;
  submit: () => Promise<DonasiBersamaDetail | null>;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function shiftDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toIsoDateOnly(date);
}

interface Params {
  /** Ada = mode ubah, kosong = mode buat. */
  group?: DonasiBersamaDetail | null;
}

export function useCreateDonasiBersama({group}: Params = {}): State & Actions {
  const queryClient = useQueryClient();

  // Dua state cover disengaja: localCoverUri untuk pratinjau instan,
  // coverImageUrl untuk payload. Digabung berarti pratinjau baru muncul
  // setelah unggah selesai — terasa lambat di koneksi biasa.
  const isEditMode = group != null;

  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    group?.coverImageUrl ?? null,
  );
  const [localCoverUri, setLocalCoverUri] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const [name, setNameState] = useState(group?.name ?? '');
  const [programId, setProgramId] = useState<string | null>(
    group?.programId ?? null,
  );
  const [programTitle, setProgramTitle] = useState<string | null>(
    group?.programTitle ?? null,
  );
  const [programOptions, setProgramOptions] = useState<ProgramOption[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [targetAmount, setTargetAmountState] = useState(
    group?.targetAmount ?? 0,
  );
  const [deadline, setDeadlineState] = useState(group?.deadline ?? '');
  const [isPublic, setIsPublic] = useState(group?.isPublic ?? true);

  // Pengaturan ini HANYA disimpan. Fase ini tidak menjadwalkan notifikasi lokal
  // dan tidak mengirim push — belum ada library notifikasi di project ini.
  // Menambahkannya keputusan native tersendiri, lihat
  // docs/08-features/donasi-bersama/README.md.
  const [reminderEnabled, setReminderEnabled] = useState(
    group?.reminder.isEnabled ?? true,
  );
  const [reminderFrequency, setReminderFrequencyState] =
    useState<ReminderFrequency>(group?.reminder.frequency ?? 'daily');
  const [reminderWeekDay, setReminderWeekDayState] = useState<WeekDay | null>(
    group?.reminder.weekDay ?? null,
  );
  const [reminderTime, setReminderTime] = useState(
    group?.reminder.time ?? '05:00',
  );

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minDeadline = shiftDays(1);

  function clearError(field: string): void {
    setFieldErrors(current => {
      if (!current[field]) {
        return current;
      }
      const next = {...current};
      delete next[field];
      return next;
    });
  }

  async function uploadFromSource(source: 'camera' | 'library'): Promise<void> {
    const result =
      source === 'camera'
        ? await launchCamera({mediaType: 'photo', quality: 0.8})
        : await launchImageLibrary({mediaType: 'photo', quality: 0.8});

    const asset = result.assets?.[0];
    if (result.didCancel || !asset?.uri) {
      return;
    }

    setLocalCoverUri(asset.uri);
    setIsUploadingCover(true);
    try {
      const response = await uploadDonasiBersamaCover({
        uri: asset.uri,
        fileName: asset.fileName ?? 'cover.jpg',
        type: asset.type ?? 'image/jpeg',
      });
      if (!response.success) {
        showToast(response.message);
        setLocalCoverUri(null);
        return;
      }
      setCoverImageUrl(response.data.coverImageUrl);
    } catch {
      showToast('Tidak dapat terhubung.');
      setLocalCoverUri(null);
    } finally {
      setIsUploadingCover(false);
    }
  }

  function pickCover(): void {
    Alert.alert('Foto Grup', 'Pilih sumber foto', [
      {text: 'Kamera', onPress: () => uploadFromSource('camera')},
      {text: 'Galeri', onPress: () => uploadFromSource('library')},
      {text: 'Batal', style: 'cancel'},
    ]);
  }

  function setName(value: string): void {
    setNameState(value);
    clearError('name');
  }

  // Daftar program dimuat saat sheet pertama kali dibuka, bukan saat mount —
  // tidak semua pengguna membuka pemilih program.
  async function loadPrograms(): Promise<void> {
    if (programOptions.length > 0 || isLoadingPrograms) {
      return;
    }
    setIsLoadingPrograms(true);
    try {
      // getDonationList sudah ada dan dipakai halaman Donasi — dipakai apa
      // adanya di sini, tanpa endpoint daftar program baru. Halaman 1 saja
      // sudah cukup untuk pemilih; belum ada kebutuhan menggulir di sheet.
      const response = await getDonationList({
        page: 1,
        categoryId: null,
        sortOption: 'terbaru',
        sortDirection: 'desc',
        search: '',
      });
      if (!response.success) {
        showToast(response.message);
        return;
      }
      setProgramOptions(
        response.data.items.map((program: Program) => ({
          id: String(program.id),
          title: program.title,
        })),
      );
    } catch {
      showToast('Tidak dapat terhubung.');
    } finally {
      setIsLoadingPrograms(false);
    }
  }

  function selectProgram(value: string): void {
    setProgramId(value);
    setProgramTitle(
      programOptions.find(option => option.id === value)?.title ?? null,
    );
    clearError('programId');
  }

  // Konversi ke number terjadi sekali di sini, bukan saat submit.
  function setTargetAmount(value: string): void {
    const digits = value.replace(/\D/g, '');
    setTargetAmountState(digits ? Number(digits) : 0);
    clearError('targetAmount');
  }

  function setDeadline(value: string): void {
    setDeadlineState(value);
    clearError('deadline');
  }

  // Ganti frekuensi ke selain 'weekly' mengosongkan hari terpilih supaya
  // payload tidak membawa sisa pilihan lama.
  function setReminderFrequency(value: ReminderFrequency): void {
    setReminderFrequencyState(value);
    if (value !== 'weekly') {
      setReminderWeekDayState(null);
    }
    clearError('reminderWeekDay');
  }

  function setReminderWeekDay(value: WeekDay): void {
    setReminderWeekDayState(value);
    clearError('reminderWeekDay');
  }

  function setReminderHour(value: number): void {
    const [, minute = '00'] = reminderTime.split(':');
    setReminderTime(`${pad(clamp(value, 0, 23))}:${minute}`);
  }

  function setReminderMinute(value: number): void {
    const [hour = '00'] = reminderTime.split(':');
    setReminderTime(`${hour}:${pad(clamp(value, 0, 59))}`);
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    const trimmedName = name.trim();

    if (!trimmedName) {
      errors.name = 'Nama grup wajib diisi';
    } else if (trimmedName.length < GROUP_NAME_MIN_LENGTH) {
      errors.name = `Nama grup minimal ${GROUP_NAME_MIN_LENGTH} karakter`;
    } else if (trimmedName.length > GROUP_NAME_MAX_LENGTH) {
      errors.name = `Nama grup maksimal ${GROUP_NAME_MAX_LENGTH} karakter`;
    }

    if (!programId) {
      errors.programId = 'Pilih program tujuan';
    }

    if (!targetAmount) {
      errors.targetAmount = 'Target nominal wajib diisi';
    } else if (targetAmount < GROUP_MIN_TARGET_AMOUNT) {
      errors.targetAmount = 'Target nominal minimal Rp 100.000';
    }

    if (!deadline) {
      errors.deadline = 'Tenggat wajib dipilih';
    } else if (!isEditMode && deadline < minDeadline) {
      // Saat mengubah grup, tenggat yang sudah lewat dibiarkan apa adanya —
      // memaksanya maju berarti diam-diam memperpanjang grup yang sudah tutup.
      errors.deadline = 'Tenggat minimal besok';
    } else if (deadline > shiftDays(GROUP_MAX_DEADLINE_DAYS)) {
      errors.deadline = 'Tenggat maksimal 1 tahun dari sekarang';
    }

    if (reminderEnabled) {
      if (!reminderTime) {
        errors.reminderTime = 'Waktu pengingat wajib diisi';
      }
      if (reminderFrequency === 'weekly' && !reminderWeekDay) {
        errors.reminderWeekDay = 'Pilih hari pengingat';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function submit(): Promise<DonasiBersamaDetail | null> {
    if (isUploadingCover) {
      showToast('Tunggu foto selesai diunggah.');
      return null;
    }
    if (!validate()) {
      return null;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        programId: programId as string,
        targetAmount,
        deadline,
        isPublic,
        coverImageUrl,
        reminder: {
          isEnabled: reminderEnabled,
          frequency: reminderFrequency,
          weekDay: reminderFrequency === 'weekly' ? reminderWeekDay : null,
          time: reminderTime,
        },
      };
      const response = isEditMode
        ? await updateDonasiBersama(group.id, payload)
        : await createDonasiBersama(payload);
      if (!response.success) {
        showToast(response.message);
        // `data` saat success:false berisi error per field, bukan detail grup.
        setFieldErrors(
          (response.data as unknown as Record<string, string> | null) ?? {},
        );
        return null;
      }
      // Daftar grup sudah ter-cache per tab & kata kunci; tanpa invalidate,
      // grup yang baru dibuat tidak muncul saat pengguna kembali ke daftar.
      queryClient.invalidateQueries({queryKey: ['donasi-bersama', 'list']});
      if (isEditMode) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.donasiBersama.detail(group.id),
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
    coverImageUrl,
    localCoverUri,
    isUploadingCover,
    name,
    programId,
    programTitle,
    programOptions,
    isLoadingPrograms,
    targetAmount,
    deadline,
    isPublic,
    reminderEnabled,
    reminderFrequency,
    reminderWeekDay,
    reminderTime,
    fieldErrors,
    isSubmitting,
    minDeadline,
    pickCover,
    setName,
    selectProgram,
    loadPrograms,
    setTargetAmount,
    setDeadline,
    setIsPublic,
    setReminderEnabled,
    setReminderFrequency,
    setReminderWeekDay,
    setReminderHour,
    setReminderMinute,
    submit,
  };
}
