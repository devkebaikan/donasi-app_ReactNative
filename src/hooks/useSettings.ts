import {useCallback, useEffect, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {updateSettings} from '@/services/userService';
import type {UpdateSettingsPayload} from '@/services/userService';
import {useAuthStore} from '@/stores/authStore';
import {useSettingStore} from '@/stores/settingStore';
import {useQuranReadingStore} from '@/stores/quranReadingStore';
import {useQuranSearchStore} from '@/stores/quranSearchStore';
import {
  clearQuranLocalData,
  getQuranLocalDataSize,
} from '@/utils/quranLocalData';
import {showToast} from '@/utils/toast';
import type {AppFontSize, DonationReminderFrequency} from '@/types/setting';

type State = {
  appFontSize: AppFontSize;
  isHideName: boolean;
  isHideNominal: boolean;
  isContactable: boolean;
  isReminderEnabled: boolean;
  reminderFrequency: DonationReminderFrequency;
  reminderTime: string;
  quranDataSize: number | null;
  isClearDialogOpen: boolean;
  isClearingQuranData: boolean;
};

type Actions = {
  setAppFontSize: (value: AppFontSize) => void;
  toggleHideName: (value: boolean) => Promise<void>;
  toggleHideNominal: (value: boolean) => Promise<void>;
  toggleContactable: (value: boolean) => Promise<void>;
  toggleReminder: (value: boolean) => Promise<void>;
  changeReminderFrequency: (value: DonationReminderFrequency) => Promise<void>;
  changeReminderTime: (value: string) => Promise<void>;
  openClearDialog: () => void;
  closeClearDialog: () => void;
  confirmClearQuranData: () => Promise<void>;
};

export function useSettings(): State & Actions {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(s => s.accessToken != null);

  const appFontSize = useSettingStore(s => s.appFontSize);
  const setAppFontSize = useSettingStore(s => s.setAppFontSize);
  const isHideName = useSettingStore(s => s.isHideName);
  const setHideName = useSettingStore(s => s.setHideName);
  const isHideNominal = useSettingStore(s => s.isHideNominal);
  const setHideNominal = useSettingStore(s => s.setHideNominal);
  const isContactable = useSettingStore(s => s.isContactable);
  const setContactable = useSettingStore(s => s.setContactable);
  const isReminderEnabled = useSettingStore(s => s.isReminderEnabled);
  const setReminderEnabled = useSettingStore(s => s.setReminderEnabled);
  const reminderFrequency = useSettingStore(s => s.reminderFrequency);
  const setReminderFrequency = useSettingStore(s => s.setReminderFrequency);
  const reminderTime = useSettingStore(s => s.reminderTime);
  const setReminderTime = useSettingStore(s => s.setReminderTime);

  const resetReadingPositions = useQuranReadingStore(s => s.reset);
  const resetQuranSearch = useQuranSearchStore(s => s.reset);

  const [quranDataSize, setQuranDataSize] = useState<number | null>(null);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isClearingQuranData, setIsClearingQuranData] = useState(false);

  const refreshQuranDataSize = useCallback(async (): Promise<void> => {
    try {
      setQuranDataSize(await getQuranLocalDataSize());
    } catch {
      // Ukuran gagal dibaca bukan alasan mengganggu pengguna dengan toast —
      // barisnya cukup tampil tanpa angka.
      setQuranDataSize(null);
    }
  }, []);

  useEffect(() => {
    refreshQuranDataSize();
  }, [refreshQuranDataSize]);

  // Nilai baru dipasang lebih dulu supaya kontrol terasa langsung, lalu
  // dikembalikan ke nilai lama kalau server menolak. Tamu tidak memanggil API
  // sama sekali — preferensinya cukup tersimpan di perangkat sampai ia masuk.
  const savePreference = useCallback(
    async <T>(
      payload: UpdateSettingsPayload,
      apply: (value: T) => void,
      nextValue: T,
      previousValue: T,
    ): Promise<void> => {
      apply(nextValue);
      if (!isAuthenticated) {
        return;
      }

      try {
        const response = await updateSettings(payload);
        if (!response.success) {
          apply(previousValue);
          showToast(response.message);
        }
      } catch {
        apply(previousValue);
        showToast('Tidak dapat terhubung.');
      }
    },
    [isAuthenticated],
  );

  async function toggleHideName(value: boolean): Promise<void> {
    await savePreference({hideName: value}, setHideName, value, isHideName);
  }

  async function toggleHideNominal(value: boolean): Promise<void> {
    await savePreference(
      {hideNominal: value},
      setHideNominal,
      value,
      isHideNominal,
    );
  }

  async function toggleContactable(value: boolean): Promise<void> {
    await savePreference(
      {contactable: value},
      setContactable,
      value,
      isContactable,
    );
  }

  // Jadwal ikut dikirim saat pengingat dinyalakan supaya server menerima
  // pengingat yang lengkap dalam satu permintaan, bukan setengah jadi.
  async function toggleReminder(value: boolean): Promise<void> {
    await savePreference(
      value
        ? {reminderEnabled: true, reminderFrequency, reminderTime}
        : {reminderEnabled: false},
      setReminderEnabled,
      value,
      isReminderEnabled,
    );
  }

  async function changeReminderFrequency(
    value: DonationReminderFrequency,
  ): Promise<void> {
    await savePreference(
      {reminderEnabled: isReminderEnabled, reminderFrequency: value},
      setReminderFrequency,
      value,
      reminderFrequency,
    );
  }

  async function changeReminderTime(value: string): Promise<void> {
    await savePreference(
      {reminderEnabled: isReminderEnabled, reminderTime: value},
      setReminderTime,
      value,
      reminderTime,
    );
  }

  // Yang dihapus hanya jejak pemakaian di perangkat: posisi baca terakhir dan
  // riwayat pencarian. Progres challenge dan target baca ada di server dan
  // tidak ikut hilang — cache-nya cukup diminta ulang.
  async function confirmClearQuranData(): Promise<void> {
    setIsClearingQuranData(true);
    try {
      resetReadingPositions();
      resetQuranSearch();
      await clearQuranLocalData();
      await queryClient.invalidateQueries({queryKey: ['quran']});
      await refreshQuranDataSize();
      showToast('Data Quran di perangkat ini sudah dihapus');
    } catch {
      showToast('Tidak dapat menghapus data Quran.');
    } finally {
      setIsClearingQuranData(false);
      setIsClearDialogOpen(false);
    }
  }

  return {
    appFontSize,
    isHideName,
    isHideNominal,
    isContactable,
    isReminderEnabled,
    reminderFrequency,
    reminderTime,
    quranDataSize,
    isClearDialogOpen,
    isClearingQuranData,
    setAppFontSize,
    toggleHideName,
    toggleHideNominal,
    toggleContactable,
    toggleReminder,
    changeReminderFrequency,
    changeReminderTime,
    openClearDialog: () => setIsClearDialogOpen(true),
    closeClearDialog: () => setIsClearDialogOpen(false),
    confirmClearQuranData,
  };
}
