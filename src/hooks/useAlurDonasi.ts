import {useState} from 'react';
import {createDonation} from '@/services/donationService';
import {useAuthStore} from '@/stores/authStore';
import {showToast} from '@/utils/toast';
import {BANK_TRANSFER_MIN_AMOUNT} from '@/utils/paymentMethodGroup';
import {usePaymentMethodSelection} from '@/hooks/usePaymentMethodSelection';
import type {CreateDonationResult, PaymentMethod} from '@/types/payment';

// Nominal terkecil yang masih bisa dipilih di NominalBottomSheet — mengikuti
// grup pembayaran dengan minimal paling rendah (transfer bank). Metode dengan
// minimal lebih tinggi (mis. pembayaran instan) divalidasi lagi saat dipilih,
// lihat `usePaymentMethodSelection`.
export const MIN_DONATION_AMOUNT = BANK_TRANSFER_MIN_AMOUNT;

const DEFAULT_NOMINAL_LABEL = 'Nominal Donasi';

interface Params {
  programId: string;
  initialAmount: number;
  initialNominalLabel?: string;
  projectSalurId?: string;
  programLink?: string;
}

type State = {
  selectedAmount: number;
  nominalLabel: string;
  paymentMethods: PaymentMethod[];
  isLoadingMethods: boolean;
  selectedMethod: PaymentMethod | null;
  methodError: string | null;
  walletBalance: number | null;
  isLoadingWalletBalance: boolean;
  isWalletInsufficient: boolean;
  isAuthenticated: boolean;
  donaturName: string;
  donaturNameError: string | null;
  donaturPhone: string;
  donaturPhoneError: string | null;
  isAnonymous: boolean;
  isOnBehalfEnabled: boolean;
  onBehalfOf: string;
  prayer: string;
  isSubmitting: boolean;
};

type Actions = {
  confirmAmount: (amount: number, label?: string) => void;
  loadPaymentMethods: () => Promise<void>;
  loadWalletBalance: () => Promise<void>;
  selectMethod: (method: PaymentMethod) => void;
  presetMethod: (method: PaymentMethod) => void;
  setDonaturName: (value: string) => void;
  setDonaturPhone: (value: string) => void;
  setIsAnonymous: (value: boolean) => void;
  setIsOnBehalfEnabled: (value: boolean) => void;
  setOnBehalfOf: (value: string) => void;
  setPrayer: (value: string) => void;
  validateDonaturFields: () => boolean;
  submitDonation: () => Promise<CreateDonationResult | null>;
};

export function useAlurDonasi({
  programId,
  initialAmount,
  initialNominalLabel,
  projectSalurId,
  programLink,
}: Params): State & Actions {
  const isAuthenticated = useAuthStore(s => s.accessToken != null);
  const [selectedAmount, setSelectedAmount] = useState(initialAmount);
  const [nominalLabel, setNominalLabel] = useState(
    initialNominalLabel ?? DEFAULT_NOMINAL_LABEL,
  );

  const {
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
  } = usePaymentMethodSelection({
    amount: selectedAmount,
    program_link: programLink,
  });

  const [donaturName, setDonaturNameState] = useState('');
  const [donaturNameError, setDonaturNameError] = useState<string | null>(null);
  const [donaturPhone, setDonaturPhoneState] = useState('');
  const [donaturPhoneError, setDonaturPhoneError] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isOnBehalfEnabled, setIsOnBehalfEnabled] = useState(false);
  const [onBehalfOf, setOnBehalfOf] = useState('');
  const [prayer, setPrayer] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  function confirmAmount(amount: number, label?: string): void {
    setSelectedAmount(amount);
    setNominalLabel(label ?? DEFAULT_NOMINAL_LABEL);
  }

  function setDonaturName(value: string): void {
    setDonaturNameState(value);
    setDonaturNameError(null);
  }

  function setDonaturPhone(value: string): void {
    setDonaturPhoneState(value.replace(/\D/g, ''));
    setDonaturPhoneError(null);
  }

  function validateDonaturFields(): boolean {
    if (isAuthenticated) {
      return true;
    }
    let isValid = true;
    if (!isAnonymous && !donaturName.trim()) {
      setDonaturNameError('Nama lengkap wajib diisi');
      isValid = false;
    }
    if (!donaturPhone.trim()) {
      setDonaturPhoneError('Nomor WhatsApp wajib diisi');
      isValid = false;
    }
    if (isOnBehalfEnabled && !onBehalfOf.trim()) {
      showToast('Masukkan nama penerima / atas nama');
      isValid = false;
    }
    return isValid;
  }

  async function submitDonation(): Promise<CreateDonationResult | null> {
    if (selectedAmount < MIN_DONATION_AMOUNT) {
      showToast('Minimal donasi Rp 10.000');
      return null;
    }
    if (!selectedMethod) {
      setMethodError('Pilih metode pembayaran terlebih dahulu');
      showToast('Pilih metode pembayaran terlebih dahulu');
      return null;
    }
    if (!validateDonaturFields()) {
      return null;
    }

    const user = useAuthStore.getState().user;
    const finalName = isAuthenticated
      ? user?.name || 'Donatur'
      : isAnonymous
      ? 'Hamba Allah'
      : donaturName.trim() || 'Hamba Allah';

    const rawPhone = isAuthenticated ? user?.phone || '' : donaturPhone.trim();
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('0')
      ? cleanPhone
      : cleanPhone
      ? `0${cleanPhone}`
      : '';

    setIsSubmitting(true);
    try {
      const response = await createDonation({
        programId,
        amount: selectedAmount,
        paymentMethodId: selectedMethod.id,
        isAnonymous,
        onBehalfOf: isOnBehalfEnabled ? onBehalfOf.trim() || undefined : undefined,
        prayer: prayer.trim() || undefined,
        donaturName: finalName,
        donaturPhone: finalPhone,
        projectSalurId,
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
    selectedAmount,
    nominalLabel,
    paymentMethods,
    isLoadingMethods,
    selectedMethod,
    methodError,
    walletBalance,
    isLoadingWalletBalance,
    isWalletInsufficient,
    isAuthenticated,
    donaturName,
    donaturNameError,
    donaturPhone,
    donaturPhoneError,
    isAnonymous,
    isOnBehalfEnabled,
    onBehalfOf,
    prayer,
    isSubmitting,
    confirmAmount,
    loadPaymentMethods,
    loadWalletBalance,
    selectMethod,
    presetMethod,
    setDonaturName,
    setDonaturPhone,
    setIsAnonymous,
    setIsOnBehalfEnabled,
    setOnBehalfOf,
    setPrayer,
    validateDonaturFields,
    submitDonation,
  };
}
