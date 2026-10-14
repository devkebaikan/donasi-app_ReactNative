import {useCallback, useEffect, useState} from 'react';
import {useAuthStore} from '@/stores/authStore';
import {getPaymentMethods} from '@/services/donationService';
import {getWalletBalance} from '@/services/homeService';
import {showToast} from '@/utils/toast';
import {formatCurrency} from '@/utils/formatCurrency';
import {getPaymentMethodGroupMinAmount} from '@/utils/paymentMethodGroup';
import type {PaymentMethod} from '@/types/payment';

interface Params {
  amount: number;
}

type State = {
  paymentMethods: PaymentMethod[];
  isLoadingMethods: boolean;
  selectedMethod: PaymentMethod | null;
  methodError: string | null;
  walletBalance: number | null;
  isLoadingWalletBalance: boolean;
  isWalletInsufficient: boolean;
};

type Actions = {
  loadPaymentMethods: () => Promise<void>;
  loadWalletBalance: () => Promise<void>;
  selectMethod: (method: PaymentMethod) => void;
  presetMethod: (method: PaymentMethod) => void;
  setMethodError: (message: string) => void;
  resetSelection: () => void;
};

// Dipakai bareng oleh useAlurDonasi dan DetailProgramScreen — dua tempat yang
// sama-sama menampilkan MetodePembayaranBottomSheet, supaya logic-nya (load
// metode/saldo, validasi minimal per grup) tidak dobel.
export function usePaymentMethodSelection({amount}: Params): State & Actions {
  const isAuthenticated = useAuthStore(s => s.accessToken != null);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [methodError, setMethodErrorState] = useState<string | null>(null);

  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isLoadingWalletBalance, setIsLoadingWalletBalance] = useState(false);

  const loadPaymentMethods = useCallback(async (): Promise<void> => {
    setIsLoadingMethods(true);
    try {
      const response = await getPaymentMethods();
      if (!response.success) {
        showToast(response.message);
        return;
      }
      setPaymentMethods(response.data);
    } catch {
      showToast('Tidak dapat terhubung.');
    } finally {
      setIsLoadingMethods(false);
    }
  }, []);

  const loadWalletBalance = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      setWalletBalance(null);
      return;
    }
    setIsLoadingWalletBalance(true);
    try {
      const response = await getWalletBalance();
      if (response.success) {
        setWalletBalance(response.data);
      }
    } finally {
      setIsLoadingWalletBalance(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setWalletBalance(null);
    }
  }, [isAuthenticated]);

  function selectMethod(method: PaymentMethod): void {
    const groupMinAmount = getPaymentMethodGroupMinAmount(method.type);
    if (amount < groupMinAmount) {
      showToast(`Minimal donasi ${formatCurrency(groupMinAmount)} untuk metode ini`);
      return;
    }
    setMethodErrorState(null);
    setSelectedMethod(method);
  }

  // Set metode terpilih tanpa validasi minimal — dipakai saat metode sudah
  // divalidasi sebelumnya (mis. dibawa dari DetailProgramScreen via
  // navigation params ke AlurDonasiScreen), supaya tidak re-check terhadap
  // `amount` yang mungkin belum sinkron di render pertama.
  function presetMethod(method: PaymentMethod): void {
    setMethodErrorState(null);
    setSelectedMethod(method);
  }

  function setMethodError(message: string): void {
    setMethodErrorState(message);
  }

  // Dipakai saat pemanggil perlu memaksa user memilih ulang dari kosong
  // (mis. kembali dari invoice yang sudah dibentuk) — bukan sekadar
  // membersihkan error seperti `setMethodError(null)`.
  function resetSelection(): void {
    setSelectedMethod(null);
    setMethodErrorState(null);
  }

  const isWalletInsufficient =
    isAuthenticated &&
    !isLoadingWalletBalance &&
    walletBalance !== null &&
    walletBalance < amount;

  return {
    paymentMethods,
    isLoadingMethods,
    selectedMethod,
    methodError,
    walletBalance,
    isLoadingWalletBalance,
    isWalletInsufficient,
    loadPaymentMethods,
    loadWalletBalance,
    selectMethod,
    presetMethod,
    setMethodError,
    resetSelection,
  };
}
