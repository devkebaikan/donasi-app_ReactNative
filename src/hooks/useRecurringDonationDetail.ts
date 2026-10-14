import {useCallback, useEffect, useState} from 'react';
import {
  getRecurringDonationDetail,
  pauseRecurringDonation,
  resumeRecurringDonation,
  stopRecurringDonation,
  updateRecurringDonation,
} from '@/services/recurringDonationService';
import {showToast} from '@/utils/toast';
import type {
  RecurringDonation,
  RecurringDonationDetail,
  UpdateRecurringDonationPayload,
} from '@/types/recurringDonation';

type State = {
  detail: RecurringDonationDetail | null;
  isLoading: boolean;
  isPausing: boolean;
  isSaving: boolean;
  isStopping: boolean;
  isStopDialogVisible: boolean;
};

type Actions = {
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  update: (
    payload: UpdateRecurringDonationPayload,
  ) => Promise<Record<string, string> | null>;
  openStopDialog: () => void;
  closeStopDialog: () => void;
  confirmStop: () => Promise<boolean>;
};

export function useRecurringDonationDetail(recurringId: string): State & Actions {
  const [detail, setDetail] = useState<RecurringDonationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPausing, setIsPausing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isStopDialogVisible, setIsStopDialogVisible] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await getRecurringDonationDetail(recurringId);
      if (!response.success) {
        showToast(response.message);
        return;
      }
      setDetail(response.data);
    } catch {
      showToast('Tidak dapat terhubung.');
    } finally {
      setIsLoading(false);
    }
  }, [recurringId]);

  useEffect(() => {
    load();
  }, [load]);

  // Menyalin objek terbaru dari response, bukan menambal satu field sendiri.
  // Riwayat tidak ikut dikirim di response mutasi — yang sudah ada di state
  // dipertahankan, karena riwayat baru cuma lahir dari eksekusi terjadwal.
  function applyMutation(updated: RecurringDonation): void {
    setDetail(current =>
      current ? {...updated, history: current.history} : current,
    );
  }

  async function pause(): Promise<void> {
    setIsPausing(true);
    try {
      const response = await pauseRecurringDonation(recurringId);
      if (!response.success) {
        showToast(response.message);
        return;
      }
      applyMutation(response.data);
    } catch {
      showToast('Tidak dapat terhubung.');
    } finally {
      setIsPausing(false);
    }
  }

  async function resume(): Promise<void> {
    setIsPausing(true);
    try {
      const response = await resumeRecurringDonation(recurringId);
      if (!response.success) {
        showToast(response.message);
        return;
      }
      applyMutation(response.data);
    } catch {
      showToast('Tidak dapat terhubung.');
    } finally {
      setIsPausing(false);
    }
  }

  // Mengembalikan error per field saat gagal, dan null saat berhasil — sheet
  // yang memutuskan mau menampilkannya di mana.
  async function update(
    payload: UpdateRecurringDonationPayload,
  ): Promise<Record<string, string> | null> {
    setIsSaving(true);
    try {
      const response = await updateRecurringDonation(recurringId, payload);
      showToast(response.message);
      if (!response.success) {
        return (response.data ?? {}) as unknown as Record<string, string>;
      }
      applyMutation(response.data);
      return null;
    } catch {
      showToast('Tidak dapat terhubung.');
      return {};
    } finally {
      setIsSaving(false);
    }
  }

  function openStopDialog(): void {
    setIsStopDialogVisible(true);
  }

  function closeStopDialog(): void {
    setIsStopDialogVisible(false);
  }

  async function confirmStop(): Promise<boolean> {
    setIsStopping(true);
    try {
      const response = await stopRecurringDonation(recurringId);
      if (!response.success) {
        showToast(response.message);
        return false;
      }
      showToast(response.message);
      return true;
    } catch {
      showToast('Tidak dapat terhubung.');
      return false;
    } finally {
      setIsStopping(false);
      setIsStopDialogVisible(false);
    }
  }

  return {
    detail,
    isLoading,
    isPausing,
    isSaving,
    isStopping,
    isStopDialogVisible,
    pause,
    resume,
    update,
    openStopDialog,
    closeStopDialog,
    confirmStop,
  };
}
