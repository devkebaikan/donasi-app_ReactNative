export interface TopupPayload {
  amount: number;
  paymentMethodId: string;
  voucherCode?: string;
}

export interface TopupResult {
  topupId: string;
  invoiceId: string;
  paymentMethod: string;
  accountNumber?: string;
  bankName?: string;
  amount: number;
  adminFee: number;
  totalAmount: number;
  expiredAt: string;
  paymentInstructions?: string[];
}
