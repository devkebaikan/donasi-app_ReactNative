import {useCallback, useEffect, useRef, useState} from 'react';
import {getInvoiceDetail, type InvoiceData} from '@/services/donationService';
import {showToast} from '@/utils/toast';
import type {DonationPaymentStatus} from '@/types/tracking';

const POLL_INTERVAL_MS = 10_000;

interface Params {
  invoiceId?: string;
  donationId?: string;
  initialExpiredAt?: string;
}

type State = {
  invoice: InvoiceData | null;
  isLoading: boolean;
  secondsLeft: number;
  paymentStatus: DonationPaymentStatus;
  isCheckingStatus: boolean;
};

type Actions = {
  checkStatus: () => Promise<void>;
  refetch: () => Promise<void>;
};

function getSecondsLeft(expiredAt?: string): number {
  if (!expiredAt) return 86400;
  const diffMs = new Date(expiredAt).getTime() - Date.now();
  return Math.max(0, Math.floor(diffMs / 1000));
}

function parseStatus(statusStr: string): DonationPaymentStatus {
  const s = (statusStr || '').toLowerCase();
  if (
    s.includes('paid') ||
    s.includes('sukses') ||
    s.includes('berhasil') ||
    s.includes('settlement')
  ) {
    return 'sukses';
  }
  if (s.includes('expire')) {
    return 'expired';
  }
  if (s.includes('cancel') || s.includes('gagal')) {
    return 'gagal';
  }
  return 'menunggu';
}

export function usePaymentInvoice({
  invoiceId,
  donationId,
  initialExpiredAt,
}: Params): State & Actions {
  const effectiveId = invoiceId || donationId || '';
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(effectiveId));
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [paymentStatus, setPaymentStatus] =
    useState<DonationPaymentStatus>('menunggu');

  const expiryTime = invoice?.last_payment_time || initialExpiredAt;
  const [secondsLeft, setSecondsLeft] = useState(() =>
    getSecondsLeft(expiryTime),
  );
  const isFetchingRef = useRef(false);

  // Update countdown
  useEffect(() => {
    setSecondsLeft(getSecondsLeft(expiryTime));
    const interval = setInterval(() => {
      setSecondsLeft(getSecondsLeft(expiryTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiryTime]);

  // Expiry check
  useEffect(() => {
    if (secondsLeft <= 0) {
      setPaymentStatus(prev => (prev === 'menunggu' ? 'expired' : prev));
    }
  }, [secondsLeft]);

  const fetchInvoiceData = useCallback(
    async (showFeedback = false): Promise<void> => {
      if (!effectiveId || isFetchingRef.current) {
        return;
      }
      isFetchingRef.current = true;
      if (showFeedback) {
        setIsCheckingStatus(true);
      }
      try {
        const response = await getInvoiceDetail(effectiveId);
        if (response.success && response.data) {
          setInvoice(response.data);
          const parsed = parseStatus(response.data.status);
          setPaymentStatus(parsed);

          if (showFeedback) {
            if (parsed === 'sukses') {
              showToast('Pembayaran berhasil diverifikasi!');
            } else if (parsed === 'menunggu') {
              showToast('Pembayaran belum diterima. Silakan selesaikan pembayaran.');
            } else if (parsed === 'expired') {
              showToast('Waktu pembayaran telah kedaluwarsa.');
            } else {
              showToast('Transaksi dibatalkan atau gagal.');
            }
          }
        } else if (showFeedback) {
          showToast(response.message || 'Gagal memuat status invoice');
        }
      } catch {
        if (showFeedback) {
          showToast('Tidak dapat terhubung ke server.');
        }
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false);
        if (showFeedback) {
          setIsCheckingStatus(false);
        }
      }
    },
    [effectiveId],
  );

  // Initial fetch on mount
  useEffect(() => {
    if (effectiveId) {
      fetchInvoiceData(false);
    }
  }, [effectiveId, fetchInvoiceData]);

  // Periodic polling if still pending
  useEffect(() => {
    if (paymentStatus !== 'menunggu' || !effectiveId) {
      return;
    }
    const interval = setInterval(() => {
      fetchInvoiceData(false);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [paymentStatus, effectiveId, fetchInvoiceData]);

  const checkStatus = useCallback(async () => {
    await fetchInvoiceData(true);
  }, [fetchInvoiceData]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchInvoiceData(false);
  }, [fetchInvoiceData]);

  return {
    invoice,
    isLoading,
    secondsLeft,
    paymentStatus,
    isCheckingStatus,
    checkStatus,
    refetch,
  };
}
