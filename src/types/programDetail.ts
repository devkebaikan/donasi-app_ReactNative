export type ProjectSalurStatus = 'menunggu' | 'proses' | 'selesai';

export type DonaturSort = 'terbaru' | 'terbesar';

export interface ProgramOrganization {
  id: string;
  name: string;
  logoUrl: string;
  isVerified: boolean;
}

// Bentuk mentah response GET /programs/link/{link} — snake_case,
// sebagian field numerik dikirim sebagai string.
export interface ProgramDetailApiResponse {
  id: number;
  title: string;
  link: string;
  image: string;
  images: string[];
  video: string;
  status: string;
  content: string;
  description: string;
  time_target: string | number | null;
  nominal_target: number | null;
  nominal_achieved: string;
  nominal_used: string;
  nominal_by_news: string;
  progress_achieved: string;
  remaining_nominal: string;
  remaining_days: number | null;
  total_beneficiery: number;
  beneficiery_by_news: number;
  total_donaturs?: number | null;
  total_donors?: number | null;
  is_rutin: boolean;
  is_favorit: boolean;
  created_at: string;
  updated_at: string;
  mitra: {
    id: number;
    name: string;
    image: string;
    location: string;
  } | null;
  category: {
    id: number;
    name: string;
    slug: string;
    image: string;
  } | null;
  tipe: {
    id: number;
    name: string;
    slug: string;
    description: string;
  } | null;
  last_news: unknown | null;
  last_two_projects: unknown[];
  jenis_nominal: 'biasa' | 'paket';
  nominal_presets: NominalPresetApiItem[] | null;
  packages: DonationPackageApiItem[] | null;
  cta_color: string | null; // hex warna tombol CTA, mis. "#FD6542" — null = pakai default
  nearest_projects?: ProjectSalurTerdekatApiItem[] | null;
}

// Bentuk ringkas project salur untuk komponen "Project Salur Terdekat" di
// DetailProgramScreen — beda dari `ProjectSalur` (dipakai tab "Project Salur")
// yang lebih berat (descriptionHtml, photoUrl, beneficiaryCount, reports[]).
export interface ProjectSalurTerdekatApiItem {
  id: number;
  title: string;
  status: ProjectSalurStatus;
  distributed_at: string;
  mitra: {
    name: string;
    image: string;
  };
}

export interface ProjectSalurTerdekat {
  id: string;
  title: string;
  status: ProjectSalurStatus;
  distributedAt: string;
  mitra: {
    name: string;
    photoUrl: string;
  };
}

export interface NominalPresetApiItem {
  nominal: number;
  icon: string;
  label: string; // "Nama Pilihan" — nama tampilan preset, posisi di atas nominal
}

export interface NominalPreset {
  nominal: number;
  iconUrl: string;
  label: string; // "Nama Pilihan" — nama tampilan preset, posisi di atas nominal
}

export interface DonationPackageApiItem {
  id: number;
  label: string;
  nominal: number;
  icon: string;
}

export interface DonationPackage {
  id: string;
  label: string;
  nominal: number;
  iconUrl: string;
}

export interface ProgramDetail {
  id: string;
  link: string;
  title: string;
  imageUrl: string;
  videoUrl?: string;
  contentHtml: string;
  collectedAmount: number;
  usedAmount: number;
  availableAmount: number;
  goalAmount: number; // Infinity = target tanpa batas
  donaturCount: number;
  daysLeft: number; // Infinity = waktu tanpa batas
  progressPercent: number; // dari API, di-override 100 saat target tanpa batas
  isRutin: boolean;
  donationLabel: string; // label tipe donasi, mis. "Infaq" — bukan field API langsung
  organization: ProgramOrganization | null;
  note?: string;
  nominalType: 'biasa' | 'paket';
  nominalPresets: NominalPreset[];
  packages: DonationPackage[];
  ctaColor?: string; // undefined = pakai default (secondary/coral)
  nearestProjects: ProjectSalurTerdekat[];
}

export interface ReportSalur {
  id: string;
  title: string;
  descriptionHtml: string;
  status: ProjectSalurStatus; // independen dari status project induknya
  distributedAt: string;
  photoUrl: string;
  mitra: {
    name: string;
    photoUrl: string;
  };
}

// ProjectSalur adalah entitas sendiri (bukan cuma pembungkus reports) —
// foto/nama lembaga, tanggal, status, judul, foto, deskripsi HTML miliknya
// sendiri, independen dari tiap ReportSalur anaknya.
export interface ProjectSalur {
  id: string;
  title: string;
  descriptionHtml: string;
  status: ProjectSalurStatus;
  distributedAt: string;
  photoUrl: string;
  beneficiaryCount: number;
  mitra: {
    name: string;
    photoUrl: string;
  };
  reports: ReportSalur[];
}

export type MitraSalurRole = 'utama' | 'bantuan';

// Mitra utama = pemilik program (organization), mitra bantuan = mitra yang
// ikut serta dalam project salur di lapangan. Ditampilkan di selector
// "Mitra Salur" pada AllProjectSalurScreen & AllReportSalurScreen.
export interface MitraSalur {
  id: string;
  name: string;
  photoUrl: string;
  role: MitraSalurRole;
}

// Ringkasan jumlah project salur per status + total penerima manfaat,
// dihitung dari ProjectSalur[] satu program — dipakai di header summary
// AllProjectSalurScreen & AllReportSalurScreen.
export interface SalurSummary {
  totalProjects: number;
  akanTergalangCount: number;
  sedangTergalangCount: number;
  selesaiCount: number;
  totalBeneficiaryCount: number;
}

export interface ProgramDonatur {
  id: string;
  name: string;
  photoUrl?: string;
  amount: number;
  createdAt: string;
  paymentMethodName: string;
  isAnonymous: boolean;
  prayer?: string;
}

export interface SalesNotifItem {
  id: string;
  donaturName: string;
  amount: number;
}

// Detail penuh 1 ProjectSalur — dipakai DetailProjectSalurScreen. Berbeda
// dari `ProjectSalur` (tab "Project Salur"/AllProjectSalurScreen, versi
// ringkas) dan `ProjectSalurTerdekat` (versi paling ringan, section
// "Project Salur Terdekat") — 3 tingkat kelengkapan data untuk 1 entitas,
// lihat detail-project-salur.md § "Tipe Internal — ProjectSalurDetail".
export interface ProjectSalurDetail {
  id: string;
  title: string;
  photoUrl: string;
  address: string;
  descriptionHtml: string;
  status: ProjectSalurStatus;
  distributedAt: string;
  beneficiaryCount: number;
  targetAmount: number; // "Kebutuhan Dana"
  collectedAmount: number; // "Terkumpul"
  progressPercent: number; // di-clamp maksimal 100 sekalipun collectedAmount > targetAmount
  donaturCount: number;
  donationLabel: string; // label tipe donasi, mis. "Infaq" — diwarisi dari program induk
  mitra: {
    id: string;
    name: string;
    photoUrl: string;
    isVerified: boolean;
  };
  program: {
    id: string; // dipakai sebagai AlurDonasi.programId
    link: string; // dipakai navigasi ke DetailProgramScreen({link})
    title: string;
    imageUrl: string;
    nominalType: 'biasa' | 'paket';
    nominalPresets: NominalPreset[];
    packages: DonationPackage[];
  };
  reports: ReportSalur[]; // tab Update — reuse tipe ReportSalur yang sudah ada
}
