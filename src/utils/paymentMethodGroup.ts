import {formatCurrency} from '@/utils/formatCurrency';
import type {PaymentMethodType} from '@/types/payment';

export type PaymentMethodGroupKey = 'instant' | 'bank_transfer';

export const INSTANT_PAYMENT_MIN_AMOUNT = 10_000;
export const BANK_TRANSFER_MIN_AMOUNT = 1_000;

const GROUP_TYPES: Record<PaymentMethodGroupKey, PaymentMethodType[]> = {
  instant: ['wallet', 'e_wallet', 'qris'],
  bank_transfer: ['bank_transfer'],
};

export const PAYMENT_METHOD_GROUP_MIN_AMOUNT: Record<PaymentMethodGroupKey, number> = {
  instant: INSTANT_PAYMENT_MIN_AMOUNT,
  bank_transfer: BANK_TRANSFER_MIN_AMOUNT,
};

export const PAYMENT_METHOD_GROUP_ORDER: PaymentMethodGroupKey[] = [
  'instant',
  'bank_transfer',
];

const PAYMENT_METHOD_GROUP_NAME: Record<PaymentMethodGroupKey, string> = {
  instant: 'Pembayaran Instan',
  bank_transfer: 'Transfer Bank',
};

export function getPaymentMethodGroup(type: PaymentMethodType): PaymentMethodGroupKey {
  return GROUP_TYPES.instant.includes(type) ? 'instant' : 'bank_transfer';
}

// Nama kategori singkat (mis. dipakai di PaymentInvoiceScreen) — beda dari
// getPaymentMethodGroupLabel yang dipakai sebagai header MetodePembayaranBottomSheet
// (lebih panjang, ada info verifikasi/minimal). Metode pembayaran di seluruh app
// cuma dikelompokkan jadi 2: "Pembayaran Instan" (wallet/e-wallet/QRIS) dan
// "Transfer Bank" (bank_transfer) — tidak ada label kategori lain di luar 2 ini.
export function getPaymentMethodGroupName(type: PaymentMethodType): string {
  return PAYMENT_METHOD_GROUP_NAME[getPaymentMethodGroup(type)];
}

export function getPaymentMethodGroupMinAmount(type: PaymentMethodType): number {
  return PAYMENT_METHOD_GROUP_MIN_AMOUNT[getPaymentMethodGroup(type)];
}

export function getPaymentMethodGroupLabel(group: PaymentMethodGroupKey): string {
  const minAmount = formatCurrency(PAYMENT_METHOD_GROUP_MIN_AMOUNT[group]);
  if (group === 'instant') {
    return `Pembayaran instan (verifikasi otomatis, minimal nominal ${minAmount})`;
  }
  return `Transfer bank (verifikasi manual 1x24 jam, minimal nominal ${minAmount})`;
}
