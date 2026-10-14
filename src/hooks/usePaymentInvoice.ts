import {useCallback, useEffect, useRef, useState} from 'react';
import {getDonationStatus} from '@/services/donationService';
import {showToast} from '@/utils/toast';
import type {DonationPaymentStatus} from '@/types/tracking';

const POLL_INTERVAL_MS = 10_000;

interface Params {
  donationId: string;
  expiredAt: string;
}

type State = {
  secondsLeft: number;
  paymentStatus: DonationPaymentStatus;
  isCheckingStatus: boolean;
};

type Actions = {
  checkStatus: () => Promise<void>;
};

function getSecondsLeft(expiredAt: string): number {
  const diffMs = new Date(expiredAt).getTime() - Date.now();
  return Math.max(0, Math.floor(diffMs / 1000));
}

export function usePaymentInvoice({donationId, expiredAt}: Params): State & Actions {
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft(expiredAt));
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<DonationPaymentStatus>('menunggu');
  const isFetchingRef = useRef(false);

  useEffect(() => {
    setSecondsLeft(getSecondsLeft(expiredAt));
    const interval = setInterval(() => {
      setSecondsLeft(getSecondsLeft(expiredAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiredAt]);

  // Timer habis melebur jadi bagian dari paymentStatus itu sendiri — bukan
  // flag isExpired terpisah. Cuma override kalau statusnya masih 'menunggu'
  // (status yang sudah resolve ke sukses/gagal tidak boleh ketimpa expired).
  useEffect(() => {
    if (secondsLeft <= 0) {
      setPaymentStatus(prev => (prev === 'menunggu' ? 'expired' : prev));
    }
  }, [secondsLeft]);

  const runCheck = useCallback(
    async (showFeedback: boolean): Promise<void> => {
      if (isFetchingRef.current) {
        return;
      }
      isFetchingRef.current = true;
      if (showFeedback) {
        setIsCheckingStatus(true);
      }
      try {
        const response = await getDonationStatus(donationId);
        if (!response.success) {
          if (showFeedback) {
            showToast(response.message);
          }
          return;
        }
        setPaymentStatus(response.data.status);
        if (showFeedback) {
          if (response.data.status === 'menunggu') {
            showToast('Pembayaran belum diterima. Silakan cek kembali nanti.');
          } else if (response.data.status === 'gagal') {
            showToast('Pembayaran gagal. Silakan coba lagi.');
          }
        }
      } catch {
        if (showFeedback) {
          showToast('Tidak dapat terhubung.');
        }
      } finally {
        isFetchingRef.current = false;
        if (showFeedback) {
          setIsCheckingStatus(false);
        }
      }
    },
    [donationId],
  );

  // Polling otomatis — silent (tanpa toast), berhenti begitu status resolve
  // (sukses/gagal) atau expired, jalan lagi kalau screen dibuka ulang.
  useEffect(() => {
    if (paymentStatus !== 'menunggu') {
      return;
    }
    const interval = setInterval(() => {
      runCheck(false);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [paymentStatus, runCheck]);

  const checkStatus = useCallback((): Promise<void> => runCheck(true), [runCheck]);

  return {secondsLeft, paymentStatus, isCheckingStatus, checkStatus};
}
