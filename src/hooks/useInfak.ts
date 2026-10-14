import {useCallback, useState} from 'react';
import {getPaymentMethods} from '@/services/donationService';
import {createInfak} from '@/services/infakService';
import {useAuthStore} from '@/stores/authStore';
import {showToast} from '@/utils/toast';
import {formatCurrency} from '@/utils/formatCurrency';
import type {CreateDonationResult, PaymentMethod} from '@/types/payment';
import type {InfakTab} from '@/types/infak';

export const MIN_INFAK_AMOUNT = 1_000;
const DEFAULT_INFAK_AMOUNT = 50_000;
const DEFAULT_DONATUR_NAME = 'Hamba Allah';

type State = {
  activeTab: InfakTab;
  amount: number;
  selectedPreset: number | null;
  amountError: string | null;
  paymentMethods: PaymentMethod[];
  isLoadingMethods: boolean;
  selectedMethod: PaymentMethod | null;
  methodError: string | null;
  donaturName: string;
  isEditingDonatur: boolean;
  prayer: string;
  isForOther: boolean;
  otherName: string;
  isSubmitting: boolean;
};

type Actions = {
  setActiveTab: (tab: InfakTab) => void;
  selectPreset: (amount: number) => void;
  setCustomAmount: (rawDigits: string) => void;
  loadPaymentMethods: () => Promise<void>;
  selectMethod: (method: PaymentMethod) => void;
  setDonaturName: (value: string) => void;
  setIsEditingDonatur: (value: boolean) => void;
  setPrayer: (value: string) => void;
  setIsForOther: (value: boolean) => void;
  setOtherName: (value: string) => void;
  submitInfak: () => Promise<CreateDonationResult | null>;
};

export function useInfak(): State & Actions {
  const userName = useAuthStore(s => s.user?.name);

  const [activeTab, setActiveTab] = useState<InfakTab>('online');

  const [amount, setAmount] = useState(DEFAULT_INFAK_AMOUNT);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [methodError, setMethodError] = useState<string | null>(null);

  const [donaturName, setDonaturName] = useState(userName ?? DEFAULT_DONATUR_NAME);
  const [isEditingDonatur, setIsEditingDonatur] = useState(false);

  const [prayer, setPrayer] = useState('');
  const [isForOther, setIsForOther] = useState(false);
  const [otherName, setOtherName] = useState('');

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
      setPaymentMethods(response.data);
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

  async function submitInfak(): Promise<import('@/types/payment').CreateDonationResult | null> {
    setAmountError(null);
    setMethodError(null);

    if (amount < MIN_INFAK_AMOUNT) {
      setAmountError(`Minimal infak ${formatCurrency(MIN_INFAK_AMOUNT)}`);
      return null;
    }
    if (!selectedMethod) {
      setMethodError('Pilih metode pembayaran');
      return null;
    }

    setIsSubmitting(true);
    try {
      const response = await createInfak({
        amount,
        paymentMethodId: selectedMethod.id,
        donaturName,
        prayer: prayer || undefined,
        isForOther,
        otherName: isForOther ? otherName || undefined : undefined,
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
    activeTab,
    amount,
    selectedPreset,
    amountError,
    paymentMethods,
    isLoadingMethods,
    selectedMethod,
    methodError,
    donaturName,
    isEditingDonatur,
    prayer,
    isForOther,
    otherName,
    isSubmitting,
    setActiveTab,
    selectPreset,
    setCustomAmount,
    loadPaymentMethods,
    selectMethod,
    setDonaturName,
    setIsEditingDonatur,
    setPrayer,
    setIsForOther,
    setOtherName,
    submitInfak,
  };
}
