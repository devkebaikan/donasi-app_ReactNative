import {useCallback, useState} from 'react';
import {getPaymentMethods} from '@/services/donationService';
import {topupWallet} from '@/services/walletService';
import {applyVoucher} from '@/services/voucherService';
import {showToast} from '@/utils/toast';
import {formatCurrency} from '@/utils/formatCurrency';
import type {PaymentMethod} from '@/types/payment';
import type {TopupResult} from '@/types/wallet';

export const MIN_TOPUP_AMOUNT = 10_000;

type State = {
  amount: number;
  selectedPreset: number | null;
  voucherCode: string;
  voucherDiscount: number;
  appliedVoucherCode: string | null;
  isClaimingVoucher: boolean;
  voucherError: string | null;
  paymentMethods: PaymentMethod[];
  isLoadingMethods: boolean;
  selectedMethod: PaymentMethod | null;
  methodError: string | null;
  amountError: string | null;
  isSubmitting: boolean;
};

type Actions = {
  selectPreset: (amount: number) => void;
  setCustomAmount: (rawDigits: string) => void;
  setVoucherCode: (code: string) => void;
  claimVoucher: () => Promise<boolean>;
  loadPaymentMethods: () => Promise<void>;
  selectMethod: (method: PaymentMethod) => void;
  submitTopup: () => Promise<TopupResult | null>;
};

export function useTopup(): State & Actions {
  const [amount, setAmount] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | null>(
    null,
  );
  const [isClaimingVoucher, setIsClaimingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [methodError, setMethodError] = useState<string | null>(null);

  const [amountError, setAmountError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function selectPreset(value: number): void {
    setAmount(value);
    setSelectedPreset(value);
    setAmountError(null);
  }

  function setCustomAmount(rawDigits: string): void {
    const value = Number(rawDigits) || 0;
    setAmount(value);
    setSelectedPreset(null);
    setAmountError(null);
  }

  const loadPaymentMethods = useCallback(async (): Promise<void> => {
    setIsLoadingMethods(true);
    try {
      const response = await getPaymentMethods();
      if (!response.success) {
        showToast(response.message);
        return;
      }
      setPaymentMethods(response.data.filter(method => method.type !== 'wallet'));
    } catch {
      showToast('Tidak dapat terhubung.');
    } finally {
      setIsLoadingMethods(false);
    }
  }, []);

  function selectMethod(method: PaymentMethod): void {
    setMethodError(null);
    setSelectedMethod(method);
  }

  async function claimVoucher(): Promise<boolean> {
    if (!voucherCode.trim()) {
      return false;
    }

    setIsClaimingVoucher(true);
    setVoucherError(null);
    try {
      const response = await applyVoucher(voucherCode.trim());
      if (!response.success) {
        setVoucherError(response.message);
        return false;
      }
      setVoucherDiscount(response.data.discountAmount);
      setAppliedVoucherCode(response.data.code);
      return true;
    } catch {
      showToast('Tidak dapat terhubung.');
      return false;
    } finally {
      setIsClaimingVoucher(false);
    }
  }

  async function submitTopup(): Promise<TopupResult | null> {
    setAmountError(null);
    setMethodError(null);

    if (amount < MIN_TOPUP_AMOUNT) {
      setAmountError(`Minimal topup ${formatCurrency(MIN_TOPUP_AMOUNT)}`);
      return null;
    }
    if (!selectedMethod) {
      setMethodError('Pilih metode pembayaran');
      return null;
    }

    setIsSubmitting(true);
    try {
      const response = await topupWallet({
        amount,
        paymentMethodId: selectedMethod.id,
        voucherCode: appliedVoucherCode ?? undefined,
      });
      if (!response.success) {
        showToast(response.message);
        return null;
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
    amount,
    selectedPreset,
    voucherCode,
    voucherDiscount,
    appliedVoucherCode,
    isClaimingVoucher,
    voucherError,
    paymentMethods,
    isLoadingMethods,
    selectedMethod,
    methodError,
    amountError,
    isSubmitting,
    selectPreset,
    setCustomAmount,
    setVoucherCode,
    claimVoucher,
    loadPaymentMethods,
    selectMethod,
    submitTopup,
  };
}
