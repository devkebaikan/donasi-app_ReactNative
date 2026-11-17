export type PaymentMethodType =
  | 'wallet'
  | 'dompet_kebaikan'
  | 'bank'
  | 'bank_transfer'
  | 'e_wallet'
  | 'qris'
  | string;

export type PaymentGateway = 'midtrans' | 'xendit' | 'flip';

export interface NominalOption {
  id: number;
  nama_pilihan: string;
  nominal: number;
}

export interface PaymentMethod {
  id: number | string;
  name: string;
  image_url: string;
  type: string;
  code: string;
  account_behalf?: string;
  account_number?: string;
  is_active?: string | boolean;
  bank_provider?: string;
  usage?: string;
  fee_type?: string;
  fee?: number;
  minimun_nominal?: string | number;
  // Backward compatibility aliases
  logoUrl?: string;
  adminFee?: number;
}

export interface CreateDonationPayload {
  programId: string | number;
  amount: number;
  paymentMethodId: string | number;
  isAnonymous: boolean;
  onBehalfOf?: string;
  prayer?: string;
  donaturName?: string; // hanya diisi kalau donatur belum login — kalau login, identitas diambil dari akun
  donaturPhone?: string; // hanya diisi kalau donatur belum login — kalau login, identitas diambil dari akun
  projectSalurId?: string | number; // diisi kalau donasi berasal dari tombol donasi di DetailProjectSalurScreen — donasi di-tag ke project salur tertentu
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
