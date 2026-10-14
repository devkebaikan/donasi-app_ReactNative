export type PaymentMethodType = 'wallet' | 'bank_transfer' | 'e_wallet' | 'qris';

export type PaymentGateway = 'midtrans' | 'xendit' | 'flip';

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  logoUrl: string;
}

export interface CreateDonationPayload {
  programId: string;
  amount: number;
  paymentMethodId: string;
  isAnonymous: boolean;
  onBehalfOf?: string;
  prayer?: string;
  donaturName?: string; // hanya diisi kalau donatur belum login — kalau login, identitas diambil dari akun
  donaturPhone?: string; // hanya diisi kalau donatur belum login — kalau login, identitas diambil dari akun
  projectSalurId?: string; // diisi kalau donasi berasal dari tombol donasi di DetailProjectSalurScreen — donasi di-tag ke project salur tertentu
}

export interface CreateDonationResult {
  donationId: string;
  invoiceId: string;
  paymentMethod: string;
  paymentMethodType?: PaymentMethodType;
  paymentMethodLogoUrl?: string;
  paymentGateway?: PaymentGateway | null; // null/undefined = transfer manual (diverifikasi Moota di backend, tanpa checkout eksternal)
  checkoutUrl?: string; // ada kalau paymentGateway butuh checkout eksternal (Snap page, link Xendit/Flip, dsb)
  accountNumber?: string;
  accountHolderName?: string;
  bankName?: string;
  amount: number;
  adminFee: number;
  totalAmount: number;
  expiredAt: string;
  paymentInstructions?: string[];
}
