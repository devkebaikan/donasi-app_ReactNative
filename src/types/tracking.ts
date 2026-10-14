import type {ProjectSalurStatus} from '@/types/programDetail';

export type DonationPaymentStatus = 'menunggu' | 'gagal' | 'expired' | 'sukses';
export type DonationSalurStatus = 'menunggu' | 'persiapan' | 'proses' | 'selesai';

export type TrackingStepKey = 'payment' | 'distribution' | 'completion';
export type TrackingStepState = 'completed' | 'current' | 'pending' | 'error';

// Judul & keterangan sudah diformat penuh (bukan mentah) — mapping teks
// dinamis per status dilakukan di layer service (donationService.ts §
// buildTrackingStatusSteps), bukan di komponen, supaya komponen timeline
// murni presentational.
export interface TrackingStatusStep {
  key: TrackingStepKey;
  title: string;
  description: string;
  state: TrackingStepState;
}

export interface TrackingMitra {
  id: string;
  name: string;
  photoUrl: string;
  isVerified: boolean;
}

// Card Program — tampil di semua status pembayaran, dan saat status salur
// masih 'menunggu' (project belum dialokasikan).
export interface TrackingProgram {
  id: string;
  link: string; // navigasi ke DetailProgramScreen({link})
  title: string;
  imageUrl: string;
  donationLabel: string; // "namaTipe program", contoh: "Infaq", "Wakaf"
  mitra: TrackingMitra;
}

// Card Project Salur — tampil begitu status salur sudah 'persiapan' ke atas.
export interface TrackingProjectSalur {
  id: string; // navigasi ke DetailProjectSalurScreen({projectSalurId})
  title: string;
  location: string;
  beneficiaryCount: number;
  mitra: TrackingMitra;
}

// Carousel Card Report Salur — hanya diisi saat status salur 'proses'/'selesai'.
export interface TrackingReportCard {
  id: string;
  photoUrl: string;
  title: string;
  distributedAt: string;
  status: ProjectSalurStatus;
}

export interface TrackingPayment {
  amount: number;
  date: string;
  method: string;
}

export interface DonationTracking {
  donationId: string;
  paymentStatus: DonationPaymentStatus;
  // hanya terisi saat paymentStatus === 'sukses'
  salurStatus?: DonationSalurStatus;
  // 1 item saat paymentStatus belum 'sukses' (cuma node pembayaran), 3 item
  // (pembayaran, salur, selesai salur) begitu paymentStatus 'sukses'.
  statusSteps: TrackingStatusStep[];
  program: TrackingProgram;
  // hanya ada saat salurStatus 'persiapan' | 'proses' | 'selesai'
  projectSalur?: TrackingProjectSalur;
  // hanya ada saat salurStatus 'proses' | 'selesai'
  reports: TrackingReportCard[];
  payment: TrackingPayment;
}

// Bentuk mentah 1 baris data dummy di `src/assets/json/donation-tracking.json`
// — dipakai untuk testing kombinasi status secara deterministik lewat
// "Donasi Saya" (tab Donasi & Penyaluran) dan lookup langsung by id di
// `getDonationTracking`. Field dinamis (judul/keterangan timeline) TIDAK
// disimpan jadi (di-generate saat runtime lewat `buildTrackingStatusSteps`
// di donationService.ts) — fixture cuma nyimpan data mentah/timestamp ISO,
// supaya teks dinamisnya tetap satu sumber kebenaran dengan jalur donasi
// baru (checkout) yang datanya di-generate procedural, bukan dari fixture.
export interface DonationTrackingFixture {
  id: string;
  paymentStatus: DonationPaymentStatus;
  salurStatus: DonationSalurStatus | null;
  paymentStatusAt: string;
  salurStatusAt: string | null;
  salurCompletionAt: string | null;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  donationLabel: string;
  program: {
    id: string;
    link: string;
    title: string;
    imageUrl: string;
    mitra: TrackingMitra;
  };
  // mitra project salur sama dengan program.mitra — lembaga yang menjalankan
  // program juga yang menjalankan project salur-nya, lihat tracking.md.
  projectSalur: {
    id: string;
    title: string;
    location: string;
    beneficiaryCount: number;
  } | null;
  reports: {
    id: string;
    photoUrl: string;
    title: string;
    distributedAt: string;
    status: ProjectSalurStatus;
  }[];
}
