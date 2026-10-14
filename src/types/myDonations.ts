import type {DonationPaymentStatus, DonationSalurStatus} from './tracking';

export type MyDonationsTab = 'donasi' | 'penyaluran' | 'rekap';

export interface TrackingSummary {
  waitingPayment: number;
  waitingDistribution: number;
  inProgress: number;
  completed: number;
}

export interface Donation {
  id: string;
  programTitle: string;
  programImageUrl: string;
  amount: number;
  date: string;
  status: DonationPaymentStatus;
  // hanya terisi saat status === 'sukses'
  salurStatus?: DonationSalurStatus;
}

// Donasi yang sudah tampil di tab Penyaluran — API tidak pernah mengembalikan
// donasi yang belum 'sukses', jadi salurStatus di sini selalu terisi.
export type DistributedDonation = Donation & {salurStatus: DonationSalurStatus};

export interface CategorySummary {
  id: number;
  name: string;
  slug: string;
  donationCount: number;
  totalAmount: number;
}
