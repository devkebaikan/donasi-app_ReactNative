import {useCallback, useState} from 'react';
import {useAuthStore} from '@/stores/authStore';
import {
  createRecurringDonation,
  DONATION_ADMIN_FEE,
  getPaymentMethods,
  prepayRecurringDonation,
} from '@/services/donationService';
import {getWalletBalance} from '@/services/homeService';
import {showToast} from '@/utils/toast';
import {formatCurrency} from '@/utils/formatCurrency';
import type {CreateDonationResult, PaymentMethod} from '@/types/payment';
import {FREQUENCY_TO_API} from '@/types/recurringDonation';
import type {
  CreateRecurringDonationResult,
  RecurringDonationTab,
  RecurringFrequency,
} from '@/types/recurringDonation';

export const MIN_RECURRING_SALDO_AMOUNT = 1_000;
export const MIN_RECURRING_BAYAR_AMOUNT = 2_000;


function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

interface Params {
  programId: string;
}

type State = {
  activeTab: RecurringDonationTab;
  amount: number;
  selectedPreset: number | null;
  frequency: RecurringFrequency;
  scheduleHour: number;
  scheduleMinute: number;
  isOnBehalfEnabled: boolean;
  onBehalfOf: string;
  isPrayerEnabled: boolean;
  prayer: string;
  repeatCount: number;
  repeatCountError: string | null;
  amountError: string | null;
  adminFee: number;
  donaturName: string;
  donaturPhone: string;
  paymentMethods: PaymentMethod[];
  isLoadingMethods: boolean;
  selectedMethod: PaymentMethod | null;
  methodError: string | null;
  walletBalance: number;
  isLoadingWalletBalance: boolean;
  isWalletInsufficient: boolean;
  isSubmitting: boolean;
};

type Actions = {
  setActiveTab: (tab: RecurringDonationTab) => void;
  selectPreset: (amount: number) => void;
  setCustomAmount: (rawDigits: string) => void;
  setFrequency: (frequency: RecurringFrequency) => void;
  setScheduleHour: (hour: number) => void;
  setScheduleMinute: (minute: number) => void;
  setIsOnBehalfEnabled: (value: boolean) => void;
  setOnBehalfOf: (value: string) => void;
  setIsPrayerEnabled: (value: boolean) => void;
  setPrayer: (value: string) => void;
  setRepeatCount: (value: number) => void;
  setDonaturName: (value: string) => void;
  setDonaturPhone: (value: string) => void;
  loadPaymentMethods: () => Promise<void>;
  loadWalletBalance: () => Promise<void>;
  selectMethod: (method: PaymentMethod) => void;
  submitSaldo: () => Promise<CreateRecurringDonationResult | null>;
  submitBayar: () => Promise<CreateDonationResult | null>;
};

export function useDonasiRutinSetup({programId}: Params): State & Actions {
  const isAuthenticated = useAuthStore(s => s.accessToken != null);

  // Tab pertama = "Bayar Sekarang", sesuai urutan di DonasiRutinTabBar.
  const [activeTab, setActiveTab] = useState<RecurringDonationTab>('bayar');
  const [amount, setAmount] = useState(5_000);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(5_000);
  const [frequency, setFrequency] = useState<RecurringFrequency>('harian');
  const [scheduleHour, setScheduleHour] = useState(8);
  const [scheduleMinute, setScheduleMinute] = useState(0);
  const [isOnBehalfEnabled, setIsOnBehalfEnabled] = useState(false);
  const [onBehalfOf, setOnBehalfOf] = useState('');
  const [isPrayerEnabled, setIsPrayerEnabled] = useState(false);
  const [prayer, setPrayer] = useState('');
  const [repeatCount, setRepeatCountState] = useState(30);
  const [repeatCountError, setRepeatCountError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [donaturName, setDonaturName] = useState('');
  const [donaturPhone, setDonaturPhone] = useState('');

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [methodError, setMethodError] = useState<string | null>(null);

  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoadingWalletBalance, setIsLoadingWalletBalance] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pola sama dengan useTopup: preset menyorot chip, ketik manual melepas
  // sorotan chip manapun.
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

  function setRepeatCount(value: number): void {
    setRepeatCountState(value);
    setRepeatCountError(null);
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

  const loadWalletBalance = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      setWalletBalance(0);
      return;
    }
    setIsLoadingWalletBalance(true);
    try {
      const response = await getWalletBalance();
      if (response.success) {
        setWalletBalance(response.data);
      }
    } catch {
      setWalletBalance(0);
    } finally {
      setIsLoadingWalletBalance(false);
    }
  }, [isAuthenticated]);

  function selectMethod(method: PaymentMethod): void {
    setMethodError(null);
    setSelectedMethod(method);
  }

  // Sengaja tidak di-gate oleh `isAuthenticated` — saldo guest dipaksa 0 di
  // `loadWalletBalance`, dan tab ini tidak punya gate login terpisah seperti
  // Dompet Kebaikan di alur-donasi, jadi validasi saldo harus tetap berlaku.
  const isWalletInsufficient = !isLoadingWalletBalance && walletBalance < amount;

  async function submitSaldo(): Promise<CreateRecurringDonationResult | null> {
    // Batas minimal ini dulu dijaga NominalBottomSheet. Nominal sekarang
    // diketik langsung di form, jadi validasinya pindah ke sini.
    if (amount < MIN_RECURRING_SALDO_AMOUNT) {
      setAmountError(`Nominal minimal ${formatCurrency(MIN_RECURRING_SALDO_AMOUNT)}`);
      return null;
    }
    if (isWalletInsufficient) {
      showToast('Saldo Saku Berbagi tidak cukup. Silakan top up terlebih dahulu.');
      return null;
    }

    setIsSubmitting(true);
    try {
      const response = await createRecurringDonation({
        programId,
        amount,
        frequency: FREQUENCY_TO_API[frequency],
        scheduleTime: `${pad(scheduleHour)}:${pad(scheduleMinute)}`,
        onBehalfOf: isOnBehalfEnabled ? onBehalfOf || undefined : undefined,
        prayer: isPrayerEnabled ? prayer || undefined : undefined,
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

  async function submitBayar(): Promise<CreateDonationResult | null> {
    if (amount < MIN_RECURRING_BAYAR_AMOUNT) {
      setAmountError(`Nominal minimal ${formatCurrency(MIN_RECURRING_BAYAR_AMOUNT)}`);
      return null;
    }
    if (repeatCount <= 0) {
      setRepeatCountError('Jumlah pengulangan harus lebih dari 0');
      return null;
    }
    if (!selectedMethod) {
      setMethodError('Pilih metode pembayaran');
      return null;
    }

    setIsSubmitting(true);
    try {
      const response = await prepayRecurringDonation({
        programId,
        amount,
        frequency: FREQUENCY_TO_API[frequency],
        scheduleTime: `${pad(scheduleHour)}:${pad(scheduleMinute)}`,
        onBehalfOf: isOnBehalfEnabled ? onBehalfOf || undefined : undefined,
        prayer: isPrayerEnabled ? prayer || undefined : undefined,
        repeatCount,
        paymentMethodId: String(selectedMethod.id),
        donaturName: donaturName || 'Hamba Allah',
        donaturPhone,
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
    frequency,
    scheduleHour,
    scheduleMinute,
    isOnBehalfEnabled,
    onBehalfOf,
    isPrayerEnabled,
    prayer,
    repeatCount,
    repeatCountError,
    amountError,
    adminFee: DONATION_ADMIN_FEE,
    donaturName,
    donaturPhone,
    paymentMethods,
    isLoadingMethods,
    selectedMethod,
    methodError,
    walletBalance,
    isLoadingWalletBalance,
    isWalletInsufficient,
    isSubmitting,
    setActiveTab,
    selectPreset,
    setCustomAmount,
    setFrequency,
    setScheduleHour,
    setScheduleMinute,
    setIsOnBehalfEnabled,
    setOnBehalfOf,
    setIsPrayerEnabled,
    setPrayer,
    setRepeatCount,
    setDonaturName,
    setDonaturPhone,
    loadPaymentMethods,
    loadWalletBalance,
    selectMethod,
    submitSaldo,
    submitBayar,
  };
}
