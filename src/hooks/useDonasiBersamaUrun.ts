import {useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {createDonasiBersamaContribution} from '@/services/donasiBersamaService';
import {usePaymentMethodSelection} from '@/hooks/usePaymentMethodSelection';
import {MIN_DONATION_AMOUNT} from '@/hooks/useAlurDonasi';
import {queryKeys} from '@/utils/queryKeys';
import {formatCurrency} from '@/utils/formatCurrency';
import {showToast} from '@/utils/toast';
import type {CreateDonationResult, PaymentMethod} from '@/types/payment';

type State = {
  selectedAmount: number;
  amountError: string | null;
  isAnonymous: boolean;
  isSubmitting: boolean;
  paymentMethods: PaymentMethod[];
  isLoadingMethods: boolean;
  selectedMethod: PaymentMethod | null;
  methodError: string | null;
  walletBalance: number | null;
  isLoadingWalletBalance: boolean;
  isWalletInsufficient: boolean;
};

type Actions = {
  selectAmount: (amount: number) => void;
  setIsAnonymous: (value: boolean) => void;
  loadPaymentMethods: () => Promise<void>;
  loadWalletBalance: () => Promise<void>;
  selectMethod: (method: PaymentMethod) => void;
  submit: () => Promise<CreateDonationResult | null>;
};

export function useDonasiBersamaUrun(groupId: string): State & Actions {
  const queryClient = useQueryClient();
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seluruh urusan metode pembayaran — daftar, saldo dompet, saldo kurang,
  // dan pesan error per metode — sudah ditangani hook yang sudah ada.
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
    setMethodError,
  } = usePaymentMethodSelection({amount: selectedAmount});

  // Catatan: `isWalletInsufficient` TIDAK dipakai sebagai penghalang submit.
  // Flag itu berarti "saldo dompet < nominal" tanpa melihat metode yang
  // dipilih, jadi memakainya di sini akan memblokir pembayaran via bank/e-wallet
  // hanya karena saldo Dompet Kebaikan kebetulan kecil. Satu-satunya konsumen
  // yang benar adalah DompetKebaikanListItem, yang menonaktifkan baris dompet
  // sehingga metode itu tidak bisa dipilih sejak awal — pola yang sama dengan
  // useAlurDonasi, yang juga tidak punya guard ini.
  function selectAmount(amount: number): void {
    setSelectedAmount(amount);
    setAmountError(null);
  }

  async function submit(): Promise<CreateDonationResult | null> {
    if (selectedAmount < MIN_DONATION_AMOUNT) {
      setAmountError(
        `Nominal urunan minimal ${formatCurrency(MIN_DONATION_AMOUNT)}`,
      );
      return null;
    }
    if (!selectedMethod) {
      setMethodError('Pilih metode pembayaran');
      return null;
    }
    setIsSubmitting(true);
    try {
      const response = await createDonasiBersamaContribution(groupId, {
        amount: selectedAmount,
        paymentMethodId: String(selectedMethod.id),
        isAnonymous,
      });
      if (!response.success) {
        showToast(response.message);
        return null;
      }
      // Progres dan riwayat grup sudah berubah di server — buang cache-nya
      // supaya detail menampilkan angka baru saat pengguna kembali.
      queryClient.invalidateQueries({
        queryKey: queryKeys.donasiBersama.detail(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.donasiBersama.contributions(groupId),
      });
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
    amountError,
    isAnonymous,
    isSubmitting,
    paymentMethods,
    isLoadingMethods,
    selectedMethod,
    methodError,
    walletBalance,
    isLoadingWalletBalance,
    isWalletInsufficient,
    selectAmount,
    setIsAnonymous,
    loadPaymentMethods,
    loadWalletBalance,
    selectMethod,
    submit,
  };
}
