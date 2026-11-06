import {apiClient} from './apiClient';
import {isProgramRutin, seedFromLink} from './mockData/programSeed';
import {donationTrackingFixture} from './mockData/fixtures';
import type {ApiResponse} from '@/types/api';
import type {Category} from '@/types/category';
import type {Program} from '@/types/program';
import type {SortDirection, SortOption} from '@/types/donationFilter';
import {getDonationTypeLabel} from '@/utils/donationTypeLabel';
import {formatDateTimeWib} from '@/utils/formatDate';
import type {
  DonaturSort,
  MitraSalur,
  ProgramDetail,
  ProgramDetailApiResponse,
  ProgramDonatur,
  ProjectSalur,
  ProjectSalurDetail,
  ProjectSalurStatus,
  ReportSalur,
  SalesNotifItem,
} from '@/types/programDetail';
import type {
  OrganizationProfile,
  OrganizationProfileApiResponse,
  OrganizationReport,
  OrganizationReportApiResponse,
} from '@/types/organization';
import type {
  CreateDonationPayload,
  CreateDonationResult,
  PaymentGateway,
  PaymentMethod,
  PaymentMethodType,
} from '@/types/payment';
import type {
  CreateRecurringDonationResult,
  PrepayRecurringDonationPayload,
  RecurringDonationPayload,
} from '@/types/recurringDonation';
import type {
  CategorySummary,
  DistributedDonation,
  Donation,
  TrackingSummary,
} from '@/types/myDonations';
import type {
  DonationPaymentStatus,
  DonationSalurStatus,
  DonationTracking,
  DonationTrackingFixture,
  TrackingMitra,
  TrackingReportCard,
  TrackingStatusStep,
} from '@/types/tracking';

const SIMULATED_DELAY_MS = 500;
const PAGE_SIZE = 10;

interface ProgramCategoriesResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data: Category[];
  program_list?: Program[];
}

const ORGANIZATIONS = [
  'Yayasan Amal Sholeh',
  'Rumah Zakat',
  'Dompet Dhuafa',
  'Baznas',
];

const MITRA_LOCATIONS = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta'];

const PROGRAM_IMAGE_URL =
  'https://cdn.aksiberbagi.com/settings/home-banner-1777532258.jpeg';

const PROJECT_TITLES = [
  'Distribusi Bantuan Tahap 1',
  'Pembangunan Fasilitas Umum',
  'Penyaluran Sembako',
  'Renovasi Sarana Ibadah',
];

const DONATUR_NAMES = [
  'Hamba Allah',
  'Ahmad Fauzi',
  'Siti Aminah',
  'Budi Santoso',
  'Dewi Lestari',
  'Rizky Pratama',
];

const SALES_NOTIF_NAMES = [
  'Faris Adiyaksa',
  'Nadia Putri',
  'Rangga Saputra',
  'Melati Ayu',
  'Yusuf Hakim',
];

const REPORT_TITLES = [
  'Penyaluran Tahap Pertama',
  'Update Progres Pembangunan',
  'Laporan Penggunaan Dana',
  'Dokumentasi Kegiatan di Lapangan',
];

const PROJECT_SALUR_ADDRESSES = [
  'Donggo, Kabupaten Bima, Nusa Tenggara Barat (NTB)',
  'Cileungsi, Kabupaten Bogor, Jawa Barat',
  'Pulau Kelapa, Kepulauan Seribu, DKI Jakarta',
  'Wonosari, Kabupaten Gunungkidul, DI Yogyakarta',
];

const PROGRAM_TITLES = [
  'Zakat Penghasilan untuk Dhuafa',
  'Beasiswa Penuh untuk Santri Berprestasi',
  'Bantuan Air Bersih di Daerah Terpencil',
  'Wakaf Pembangunan Masjid',
  'Bantuan Korban Bencana Alam',
  'Santunan Anak Yatim',
  'Bedah Rumah Dhuafa',
  'Bantuan Medis Gratis',
  'Distribusi Sembako Ramadhan',
  'Renovasi Sekolah Pelosok',
];

function pick<T>(items: T[], index: number): T {
  return items[index % items.length] as T;
}

// Seed deterministik dari sebuah id string — dipakai untuk mock yang
// menerima id sembarang (mis. projectSalurId, bisa datang dari format
// composite `createMockProjects` atau id numerik-as-string dari
// `nearest_projects`), supaya hasil mock tetap konsisten untuk id yang sama.
function hashString(value: string): number {
  let seed = 0;
  for (let index = 0; index < value.length; index += 1) {
    seed = (seed * 31 + value.charCodeAt(index)) % 1000;
  }
  return seed;
}

function buildProgramLink(title: string, id: number): string {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${id}`;
}

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function delay<T>(value: T): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), SIMULATED_DELAY_MS);
  });
}

async function fetchProgramCategoriesPage(): Promise<ProgramCategoriesResponse> {
  const res = await apiClient.get<ProgramCategoriesResponse>(
    '/program-categories',
  );
  return res.data;
}

let programCategoriesPagePromise: Promise<ProgramCategoriesResponse> | null =
  null;

function getProgramCategoriesPage(): Promise<ProgramCategoriesResponse> {
  if (!programCategoriesPagePromise) {
    programCategoriesPagePromise = fetchProgramCategoriesPage();
  }
  return programCategoriesPagePromise;
}

function createMockPrograms(categories: Category[]): Program[] {
  const total = 26;
  return Array.from({length: total}, (_, index) => {
    const category = pick(categories, index);
    const hasUnlimitedGoal = index % 9 === 0;
    const hasUnlimitedTime = index % 7 === 0;
    const nominalTarget = hasUnlimitedGoal
      ? 0
      : 20000000 + (index % 5) * 10000000;
    const nominalAchieved = hasUnlimitedGoal
      ? (index + 1) * 1500000
      : Math.round(nominalTarget * ((index % 10) / 10));
    const remainingDays = hasUnlimitedTime ? null : 15 - (index % 18);

    const title = pick(PROGRAM_TITLES, index);
    const link = buildProgramLink(title, index + 1);

    return {
      id: index + 1,
      title,
      link,
      image: PROGRAM_IMAGE_URL,
      time_target: hasUnlimitedTime ? null : 30 + (index % 60),
      nominal_target: nominalTarget,
      nominal_achieved: nominalAchieved,
      progress_achieved:
        nominalTarget > 0
          ? Math.min(100, Math.round((nominalAchieved / nominalTarget) * 100))
          : 100,
      remaining_days: remainingDays,
      mitra: {
        id: (index % ORGANIZATIONS.length) + 1,
        name: pick(ORGANIZATIONS, index),
        image: '',
        location: pick(MITRA_LOCATIONS, index),
      },
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image,
      },
      // Dihitung dari `link` memakai helper yang sama dengan detail program,
      // supaya daftar dan detail tidak pernah berbeda pendapat soal program
      // yang sama. Lihat src/services/mockData/programSeed.ts.
      isRutin: isProgramRutin(seedFromLink(link)),
      isRecommended: index % 6 === 0,
      donaturCount: (index + 1) * 37,
      createdAt: daysAgoIso(index),
      latestNewsAt: daysAgoIso((index * 3) % 20),
    };
  });
}

let mockProgramsPromise: Promise<Program[]> | null = null;

function getMockPrograms(): Promise<Program[]> {
  if (!mockProgramsPromise) {
    mockProgramsPromise = getProgramCategoriesPage().then(page =>
      createMockPrograms(page.data),
    );
  }
  return mockProgramsPromise;
}

function getRemainingDaysSortValue(remainingDays: number | null): number {
  return remainingDays === null ? Number.POSITIVE_INFINITY : remainingDays;
}

function sortPrograms(
  programs: Program[],
  sortOption: SortOption,
  sortDirection: SortDirection,
): Program[] {
  const sorted = [...programs];
  const directionMultiplier = sortDirection === 'asc' ? -1 : 1;

  switch (sortOption) {
    case 'terbaru':
      return sorted.sort(
        (a, b) =>
          directionMultiplier *
          (new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime()),
      );
    case 'segera-berakhir':
      return sorted.sort(
        (a, b) =>
          directionMultiplier *
          (getRemainingDaysSortValue(a.remaining_days) -
            getRemainingDaysSortValue(b.remaining_days)),
      );
    case 'jumlah-donatur':
      return sorted.sort(
        (a, b) =>
          directionMultiplier * ((b.donaturCount ?? 0) - (a.donaturCount ?? 0)),
      );
    case 'berita-terbaru':
      return sorted.sort(
        (a, b) =>
          directionMultiplier *
          (new Date(b.latestNewsAt ?? 0).getTime() -
            new Date(a.latestNewsAt ?? 0).getTime()),
      );
    case 'berakhir':
      return sorted
        .filter(
          program =>
            program.remaining_days !== null && program.remaining_days <= 0,
        )
        .sort(
          (a, b) =>
            directionMultiplier *
            (getRemainingDaysSortValue(a.remaining_days) -
              getRemainingDaysSortValue(b.remaining_days)),
        );
    default:
      return sorted;
  }
}

export async function getDonationCategories(): Promise<
  ApiResponse<Category[]>
> {
  try {
    const page = await getProgramCategoriesPage();
    const isSuccess =
      page.success === true ||
      (typeof page.status === 'number' && page.status >= 200 && page.status < 300) ||
      (page.data != null && Array.isArray(page.data));

    return {
      success: isSuccess,
      message: page.message || 'OK',
      data: Array.isArray(page.data) ? page.data : [],
    };
  } catch {
    return {
      success: false,
      message: 'Tidak dapat terhubung.',
      data: [],
    };
  }
}

export async function getFeaturedDonations(): Promise<ApiResponse<Program[]>> {
  const programs = await getMockPrograms();
  const data = await delay(programs.filter(program => program.isRecommended));
  return {success: true, message: 'OK', data};
}

export interface DonationListParams {
  page: number;
  categoryId: number | null;
  sortOption: SortOption;
  sortDirection: SortDirection;
  search: string;
  // Hanya dikirim menu Donasi Rutin. AllDonationsScreen tidak mengisinya, jadi
  // perilakunya di sana tidak berubah.
  isRutin?: boolean;
}

export interface DonationListResult {
  items: Program[];
  hasMore: boolean;
  // Jumlah seluruh program yang cocok dengan filter, bukan cuma yang ada di
  // halaman ini — dipakai banner "X program tersedia" di daftar donasi rutin.
  total: number;
}

export async function getDonationList(
  params: DonationListParams,
): Promise<ApiResponse<DonationListResult>> {
  const programs = await getMockPrograms();
  const filtered = programs.filter(program => {
    const matchesCategory =
      params.categoryId !== null
        ? program.category.id === params.categoryId
        : true;
    const matchesSearch = params.search
      ? program.title.toLowerCase().includes(params.search.toLowerCase())
      : true;
    const matchesRutin = params.isRutin ? program.isRutin : true;
    return matchesCategory && matchesSearch && matchesRutin;
  });
  const sorted = sortPrograms(filtered, params.sortOption, params.sortDirection);
  const pageStart = (params.page - 1) * PAGE_SIZE;
  const items = sorted.slice(pageStart, pageStart + PAGE_SIZE);
  const hasMore = pageStart + items.length < sorted.length;

  const data = await delay({items, hasMore, total: sorted.length});
  return {success: true, message: 'OK', data};
}

function parseAmount(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapProgramDetail(raw: ProgramDetailApiResponse): ProgramDetail {
  const collectedAmount = parseAmount(raw.nominal_achieved);
  const usedAmount = parseAmount(raw.nominal_used);
  const hasUnlimitedGoal = raw.nominal_target === null;

  return {
    id: String(raw.id),
    link: raw.link,
    title: raw.title,
    imageUrl: raw.image,
    videoUrl: raw.video || undefined,
    contentHtml: raw.content,
    collectedAmount,
    usedAmount,
    availableAmount: collectedAmount - usedAmount,
    goalAmount: raw.nominal_target ?? Infinity,
    donaturCount: raw.total_donors ?? raw.total_donaturs ?? 0,
    daysLeft: raw.remaining_days ?? Infinity,
    progressPercent: hasUnlimitedGoal
      ? 100
      : Math.min(100, parseAmount(raw.progress_achieved)),
    isRutin: raw.is_rutin,
    donationLabel: getDonationTypeLabel(raw.tipe),
    organization: raw.mitra
      ? {
          id: String(raw.mitra.id),
          name: raw.mitra.name,
          logoUrl: raw.mitra.image,
          // API mitra tidak mengirim status verifikasi — selalu true untuk sekarang
          isVerified: true,
        }
      : null,
    // jenis_nominal tidak dikenal/tidak ada -> fallback ke 'biasa' (superset paling aman)
    nominalType: raw.jenis_nominal === 'paket' ? 'paket' : 'biasa',
    nominalPresets: (raw.nominal_presets ?? []).map(preset => ({
      nominal: preset.nominal,
      iconUrl: preset.icon,
      label: preset.label,
    })),
    packages: (raw.packages ?? []).map(pkg => ({
      id: String(pkg.id),
      label: pkg.label,
      nominal: pkg.nominal,
      iconUrl: pkg.icon,
    })),
    ctaColor: raw.cta_color ?? undefined,
    nearestProjects: (raw.nearest_projects ?? []).map(item => ({
      id: String(item.id),
      title: item.title,
      status: item.status,
      distributedAt: item.distributed_at,
      mitra: {
        name: item.mitra.name,
        photoUrl: item.mitra.image,
      },
    })),
  };
}

const MITRA_LOGO_URL =
  'https://cdn.aksiberbagi.com/mitra-logo/logo-1737686881.png';

const REPORT_SALUR_DESCRIPTION_HTML =
  '<p>Alhamdulillah, penyaluran tahap ini telah dilaksanakan. Bantuan diserahkan langsung kepada penerima manfaat sesuai dengan rencana program.</p><p>Terima kasih kepada seluruh sahabat berbagi yang telah berpartisipasi.</p>';

const PROJECT_SALUR_DESCRIPTION_HTML =
  '<p>Project penyaluran ini dijalankan untuk menyalurkan bantuan kepada penerima manfaat secara bertahap. Setiap tahap penyaluran dicatat sebagai laporan tersendiri di bawah project ini.</p>';

const PROJECT_SALUR_STATUSES: ProjectSalurStatus[] = [
  'proses',
  'selesai',
  'menunggu',
];

function createMockReportSalur(
  projectId: string,
  projectIndex: number,
): ReportSalur[] {
  // Contoh dari spec: 1 project "proses" bisa punya 2 report selesai + 1 menunggu
  const statuses: ProjectSalurStatus[] =
    projectIndex % 2 === 0
      ? ['selesai', 'selesai', 'menunggu']
      : ['selesai', 'proses'];

  return statuses.map((status, index) => ({
    id: `${projectId}-report-${index + 1}`,
    title: pick(REPORT_TITLES, projectIndex + index),
    descriptionHtml: REPORT_SALUR_DESCRIPTION_HTML,
    status,
    distributedAt: daysAgoIso(projectIndex * 7 + index * 2),
    photoUrl: PROGRAM_IMAGE_URL,
    mitra: {
      name: pick(ORGANIZATIONS, projectIndex),
      photoUrl: MITRA_LOGO_URL,
    },
  }));
}

function createMockProjects(programId: string): ProjectSalur[] {
  return PROJECT_TITLES.map((title, index) => {
    const projectId = `${programId}-project-${index + 1}`;
    return {
      id: projectId,
      title,
      descriptionHtml: PROJECT_SALUR_DESCRIPTION_HTML,
      status: pick(PROJECT_SALUR_STATUSES, index),
      distributedAt: daysAgoIso(index * 7),
      photoUrl: PROGRAM_IMAGE_URL,
      beneficiaryCount: 80 + index * 65,
      mitra: {
        name: pick(ORGANIZATIONS, index),
        photoUrl: MITRA_LOGO_URL,
      },
      reports: createMockReportSalur(projectId, index),
    };
  });
}

function createMockMitraSalur(programId: string): MitraSalur[] {
  return ORGANIZATIONS.map((name, index) => ({
    id: `${programId}-mitra-${index + 1}`,
    name,
    photoUrl: MITRA_LOGO_URL,
    role: index === 0 ? 'utama' : 'bantuan',
  }));
}

// projectSalurId bisa datang dari 2 bentuk berbeda (composite
// `createMockProjects` maupun id numerik-as-string dari `nearest_projects`)
// — mock detail ini tidak mengasumsikan format apa pun, murni hash dari id.
function createMockProjectSalurDetail(projectSalurId: string): ProjectSalurDetail {
  const seed = hashString(projectSalurId);
  const targetAmount = 100_000_000 + (seed % 10) * 25_000_000;
  const isOverfunded = seed % 4 === 0;
  const collectedAmount = isOverfunded
    ? Math.round(targetAmount * 1.1)
    : Math.round(targetAmount * ((seed % 10) / 10));
  const progressPercent = Math.min(
    100,
    Math.round((collectedAmount / targetAmount) * 100),
  );
  const programTitle = pick(PROGRAM_TITLES, seed);

  return {
    id: projectSalurId,
    title: pick(PROJECT_TITLES, seed),
    photoUrl: PROGRAM_IMAGE_URL,
    address: pick(PROJECT_SALUR_ADDRESSES, seed),
    descriptionHtml: PROJECT_SALUR_DESCRIPTION_HTML,
    status: pick(PROJECT_SALUR_STATUSES, seed),
    distributedAt: daysAgoIso(seed % 60),
    beneficiaryCount: 80 + (seed % 12) * 55,
    targetAmount,
    collectedAmount,
    progressPercent,
    donaturCount: DONATUR_NAMES.length,
    donationLabel: getDonationTypeLabel({name: 'INFAK', slug: 'infaq'}),
    mitra: {
      id: `mitra-${(seed % ORGANIZATIONS.length) + 1}`,
      name: pick(ORGANIZATIONS, seed),
      photoUrl: MITRA_LOGO_URL,
      isVerified: true,
    },
    program: {
      id: String(seed + 1),
      link: buildProgramLink(programTitle, seed + 1),
      title: programTitle,
      imageUrl: PROGRAM_IMAGE_URL,
      nominalType: 'biasa',
      nominalPresets: [],
      packages: [],
    },
    reports: createMockReportSalur(projectSalurId, seed),
  };
}

const DONATUR_PAYMENT_METHODS = [
  'OVO',
  'GoPay',
  'BCA',
  'QRIS',
  'Dompet Kebaikan',
];

const DONATUR_PRAYERS = [
  'Semoga bantuan ini bermanfaat dan menjadi berkah untuk kita semua. Aamiin.',
  'Ya Allah, mudahkanlah urusan saudara-saudara kami yang sedang kesulitan.',
];

function hoursAgoIso(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

function createMockDonatur(programId: string): ProgramDonatur[] {
  return DONATUR_NAMES.map((name, index) => ({
    id: `${programId}-donatur-${index + 1}`,
    name,
    photoUrl: index % 3 === 1 ? MITRA_LOGO_URL : undefined,
    amount: 50000 + index * 75000,
    createdAt: index === 0 ? hoursAgoIso(3) : daysAgoIso(index),
    paymentMethodName: pick(DONATUR_PAYMENT_METHODS, index),
    isAnonymous: name === 'Hamba Allah',
    prayer: index % 2 === 0 ? pick(DONATUR_PRAYERS, index) : undefined,
  }));
}

function sortDonatur(
  donatur: ProgramDonatur[],
  sort: DonaturSort,
): ProgramDonatur[] {
  const sorted = [...donatur];
  if (sort === 'terbesar') {
    return sorted.sort((a, b) => b.amount - a.amount);
  }
  return sorted.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

const SALES_NOTIF_AMOUNTS = [10000276, 250000, 1500000, 75000, 5000000];

function createMockSalesNotif(programId: string): SalesNotifItem[] {
  return SALES_NOTIF_NAMES.map((name, index) => ({
    id: `${programId}-sales-notif-${index + 1}`,
    donaturName: name,
    amount: pick(SALES_NOTIF_AMOUNTS, index),
  }));
}

export async function getProgramDetail(
  link: string,
): Promise<ApiResponse<ProgramDetail>> {
  const res = await apiClient.get<ApiResponse<ProgramDetailApiResponse>>(
    `/programs/link/${encodeURIComponent(link)}`,
  );
  const isSuccess =
    res.data.success === true ||
    (typeof res.data.status === 'number' && res.data.status >= 200 && res.data.status < 300) ||
    res.status === 200;

  if (!isSuccess || !res.data.data) {
    return {
      success: false,
      message: res.data.message || 'Program tidak tersedia',
      data: null as unknown as ProgramDetail,
    };
  }
  return {
    success: true,
    message: res.data.message || 'OK',
    data: mapProgramDetail(res.data.data),
  };
}

export async function getProgramProjects(
  id: string,
): Promise<ApiResponse<ProjectSalur[]>> {
  const data = await delay(createMockProjects(id));
  return {success: true, message: 'OK', data};
}

export async function getProgramMitraSalur(
  id: string,
): Promise<ApiResponse<MitraSalur[]>> {
  const data = await delay(createMockMitraSalur(id));
  return {success: true, message: 'OK', data};
}

export async function getProgramDonatur(
  id: string,
  sort: DonaturSort,
): Promise<ApiResponse<ProgramDonatur[]>> {
  const data = await delay(sortDonatur(createMockDonatur(id), sort));
  return {success: true, message: 'OK', data};
}

export async function getSalesNotif(
  id: string,
): Promise<ApiResponse<SalesNotifItem[]>> {
  const data = await delay(createMockSalesNotif(id));
  return {success: true, message: 'OK', data};
}

export async function getProjectSalurDetail(
  projectSalurId: string,
): Promise<ApiResponse<ProjectSalurDetail>> {
  const data = await delay(createMockProjectSalurDetail(projectSalurId));
  return {success: true, message: 'OK', data};
}

export async function getProjectSalurDonatur(
  projectSalurId: string,
  sort: DonaturSort,
): Promise<ApiResponse<ProgramDonatur[]>> {
  const data = await delay(sortDonatur(createMockDonatur(projectSalurId), sort));
  return {success: true, message: 'OK', data};
}

function mapOrganizationProfile(
  raw: OrganizationProfileApiResponse,
): OrganizationProfile {
  return {
    id: String(raw.id),
    name: raw.name,
    logoUrl: raw.logo,
    location: raw.location,
    phone: raw.phone,
    joinedAt: raw.joined_at,
    description: raw.description,
    stats: {
      programs: raw.total_programs,
      donatur: raw.total_donatur,
    },
    isVerified: raw.is_verified,
  };
}

export async function getOrganizationProfile(
  id: string,
): Promise<ApiResponse<OrganizationProfile>> {
  const res = await apiClient.get<ApiResponse<OrganizationProfileApiResponse | null>>(
    `/organizations/${encodeURIComponent(id)}`,
  );
  if (!res.data.success || !res.data.data) {
    return {
      success: false,
      message: res.data.message || 'Lembaga tidak ditemukan',
      data: null as unknown as OrganizationProfile,
    };
  }
  return {
    success: true,
    message: res.data.message,
    data: mapOrganizationProfile(res.data.data),
  };
}

export async function getOrganizationPrograms(
  id: string,
): Promise<ApiResponse<Program[]>> {
  const res = await apiClient.get<ApiResponse<Program[]>>(
    `/organizations/${encodeURIComponent(id)}/programs`,
  );
  return {
    success: res.data.success,
    message: res.data.message,
    data: res.data.data,
  };
}

function mapOrganizationReport(
  raw: OrganizationReportApiResponse,
): OrganizationReport {
  return {
    id: String(raw.id),
    title: raw.title,
    periodLabel: raw.period,
    publishedAt: raw.published_at,
    fileUrl: raw.file_url,
  };
}

export async function getOrganizationReports(
  id: string,
): Promise<ApiResponse<OrganizationReport[]>> {
  const res = await apiClient.get<ApiResponse<OrganizationReportApiResponse[]>>(
    `/organizations/${encodeURIComponent(id)}/reports`,
  );
  return {
    success: res.data.success,
    message: res.data.message,
    data: res.data.data.map(mapOrganizationReport),
  };
}

// Gambar dummy sementara — logo asli tiap metode belum tersedia
const DUMMY_PAYMENT_METHOD_LOGO_URL =
  'https://cdn.aksiberbagi.com/bank_refferences/tmpphp_vt_j_zu_y.png';

// Nama pemilik rekening tujuan transfer bank — sementara sama untuk semua
// bank sampai tiap bank punya rekening tujuan sendiri-sendiri.
const ACCOUNT_HOLDER_NAME = 'Yayasan Aksi Berbagi';

const PAYMENT_METHODS: PaymentMethod[] = [
  {id: 'wallet-kebaikan', name: 'Dompet Kebaikan', type: 'wallet', logoUrl: ''},
  {
    id: 'bank-bca',
    name: 'BCA',
    type: 'bank_transfer',
    logoUrl: DUMMY_PAYMENT_METHOD_LOGO_URL,
  },
  {
    id: 'bank-mandiri',
    name: 'Mandiri',
    type: 'bank_transfer',
    logoUrl: DUMMY_PAYMENT_METHOD_LOGO_URL,
  },
  {
    id: 'bank-bni',
    name: 'BNI',
    type: 'bank_transfer',
    logoUrl: DUMMY_PAYMENT_METHOD_LOGO_URL,
  },
  {
    id: 'bank-bsi',
    name: 'BSI',
    type: 'bank_transfer',
    logoUrl: DUMMY_PAYMENT_METHOD_LOGO_URL,
  },
  {
    id: 'ewallet-ovo',
    name: 'OVO',
    type: 'e_wallet',
    logoUrl: DUMMY_PAYMENT_METHOD_LOGO_URL,
  },
  {
    id: 'ewallet-gopay',
    name: 'GoPay',
    type: 'e_wallet',
    logoUrl: DUMMY_PAYMENT_METHOD_LOGO_URL,
  },
  {id: 'qris', name: 'QRIS', type: 'qris', logoUrl: DUMMY_PAYMENT_METHOD_LOGO_URL},
];

export async function getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
  const data = await delay(PAYMENT_METHODS);
  return {success: true, message: 'OK', data};
}

export const DONATION_ADMIN_FEE = 2500;
// Dummy 30 detik supaya gampang uji tampilan expired — kembalikan ke 24 jam
// (24 * 60 * 60 * 1000) sebelum rilis / begitu endpoint asli tersedia.
const INVOICE_EXPIRY_MS = 30 * 1000;

function buildPaymentInstructions(
  method: PaymentMethod | undefined,
  accountNumber: string | undefined,
): string[] | undefined {
  if (!method || method.type === 'wallet') {
    return undefined;
  }
  if (method.type === 'bank_transfer') {
    return [
      `Buka aplikasi mobile banking atau kunjungi ATM ${method.name}.`,
      'Pilih menu Transfer Bank atau Transfer Antar Bank.',
      `Masukkan nomor rekening tujuan ${accountNumber}.`,
      'Masukkan nominal transfer sesuai jumlah donasi yang tertera.',
      'Periksa detail transaksi, lalu selesaikan pembayaran.',
    ];
  }
  if (method.type === 'e_wallet') {
    return [
      `Buka aplikasi ${method.name}.`,
      'Pilih menu Bayar atau Transfer.',
      'Masukkan nominal sesuai jumlah donasi yang tertera.',
      'Ikuti instruksi di aplikasi untuk menyelesaikan pembayaran.',
    ];
  }
  return [
    'Buka aplikasi e-wallet atau mobile banking yang mendukung QRIS.',
    'Pilih menu Scan atau Bayar dengan QRIS.',
    'Pindai kode QRIS yang ditampilkan pada layar.',
    'Periksa nominal, lalu selesaikan pembayaran.',
  ];
}

// Backend gateway asli belum ada — checkoutUrl di bawah ini dummy, cuma
// buat simulasi buka halaman checkout eksternal (Snap/Xendit/Flip).
const DUMMY_CHECKOUT_BASE_URL = 'https://example.com/checkout';

// GoPay lewat Midtrans Snap, e-wallet/QRIS lain lewat Xendit, transfer bank
// manual (diverifikasi Moota di backend) tidak butuh checkout eksternal.
// Flip belum kepakai di mock ini karena belum ada metode Virtual Account.
function getPaymentGateway(
  methodId: string | undefined,
  type: PaymentMethodType | undefined,
): PaymentGateway | null {
  if (methodId === 'ewallet-gopay') {
    return 'midtrans';
  }
  if (type === 'e_wallet' || type === 'qris') {
    return 'xendit';
  }
  return null;
}

function buildCheckoutUrl(
  gateway: PaymentGateway | null,
  donationId: string,
): string | undefined {
  return gateway ? `${DUMMY_CHECKOUT_BASE_URL}/${gateway}/${donationId}` : undefined;
}

export async function createPaymentInvoiceResult(
  idPrefix: string,
  paymentMethodId: string,
  amount: number,
): Promise<CreateDonationResult> {
  const method = PAYMENT_METHODS.find(item => item.id === paymentMethodId);
  const isWallet = method?.type === 'wallet';
  const adminFee = isWallet ? 0 : DONATION_ADMIN_FEE;
  const accountNumber =
    method?.type === 'bank_transfer' ? '8990812345678' : undefined;
  const donationId = `${idPrefix}-${Date.now()}`;
  const paymentGateway = getPaymentGateway(method?.id, method?.type);

  return delay<CreateDonationResult>({
    donationId,
    invoiceId: `INV-${Date.now()}`,
    paymentMethod: method?.name ?? paymentMethodId,
    paymentMethodType: method?.type,
    paymentMethodLogoUrl: method?.logoUrl,
    paymentGateway,
    checkoutUrl: buildCheckoutUrl(paymentGateway, donationId),
    accountNumber,
    accountHolderName: method?.type === 'bank_transfer' ? ACCOUNT_HOLDER_NAME : undefined,
    bankName: method?.type === 'bank_transfer' ? method.name : undefined,
    amount,
    adminFee,
    totalAmount: amount + adminFee,
    expiredAt: new Date(Date.now() + INVOICE_EXPIRY_MS).toISOString(),
    paymentInstructions: buildPaymentInstructions(method, accountNumber),
  });
}

export async function createDonation(
  payload: CreateDonationPayload,
): Promise<ApiResponse<CreateDonationResult>> {
  const data = await createPaymentInvoiceResult(
    'donation',
    payload.paymentMethodId,
    payload.amount,
  );

  return {success: true, message: 'Donasi berhasil dibuat', data};
}

// ============================================================================
// KONFIGURASI TESTING — ganti DUMMY_PAYMENT_OUTCOME buat simulasikan hasil
// pembayaran yang mau diuji, tanpa perlu nunggu/tuning waktu:
//   'realistic' (default) — expired duluan (INVOICE_EXPIRY_MS 30 detik),
//                            baru sukses kalau expiry dinaikkan lagi
//                            (SIMULATED_SETTLEMENT_MS 45 detik)
//   'sukses'              — status langsung 'sukses' di cek pertama
//   'gagal'                — status langsung 'gagal' di cek pertama
// Hapus konfigurasi ini begitu endpoint status asli sudah tersedia.
// ============================================================================
type DummyPaymentOutcome = 'realistic' | 'sukses' | 'gagal';
const DUMMY_PAYMENT_OUTCOME: DummyPaymentOutcome = 'sukses';

const donationFirstCheckedAt = new Map<string, number>();

// Simulasi settlement backend berbasis WAKTU sejak status pertama kali
// dicek — bukan dari berapa kali di-poll/tap. Auto-poll (usePaymentInvoice,
// tiap 10 detik) + tap manual sama-sama cuma "bertanya", tidak boleh
// mempercepat 'sukses' — sama seperti backend asli, status berubah karena
// event eksternal (transfer diterima), bukan karena sering dicek. Ini juga
// yang bikin expiry dummy (INVOICE_EXPIRY_MS) bisa diuji secara deterministik
// saat DUMMY_PAYMENT_OUTCOME === 'realistic': selama SIMULATED_SETTLEMENT_MS
// > INVOICE_EXPIRY_MS, status pasti jadi 'expired' duluan.
const SIMULATED_SETTLEMENT_MS = 45 * 1000;

export async function getDonationStatus(
  donationId: string,
): Promise<ApiResponse<{status: DonationPaymentStatus}>> {
  if (DUMMY_PAYMENT_OUTCOME !== 'realistic') {
    const data = await delay({status: DUMMY_PAYMENT_OUTCOME});
    return {success: true, message: 'OK', data};
  }

  const firstCheckedAt = donationFirstCheckedAt.get(donationId) ?? Date.now();
  donationFirstCheckedAt.set(donationId, firstCheckedAt);

  const elapsedMs = Date.now() - firstCheckedAt;
  const status: DonationPaymentStatus =
    elapsedMs >= SIMULATED_SETTLEMENT_MS ? 'sukses' : 'menunggu';

  const data = await delay({status});
  return {success: true, message: 'OK', data};
}

export async function createRecurringDonation(
  _payload: RecurringDonationPayload,
): Promise<ApiResponse<CreateRecurringDonationResult>> {
  const data = await delay<CreateRecurringDonationResult>({
    recurringDonationId: `recurring-${Date.now()}`,
  });
  return {success: true, message: 'Donasi rutin berhasil diatur', data};
}

export async function prepayRecurringDonation(
  payload: PrepayRecurringDonationPayload,
): Promise<ApiResponse<CreateDonationResult>> {
  const method = PAYMENT_METHODS.find(item => item.id === payload.paymentMethodId);
  const adminFee = DONATION_ADMIN_FEE;
  const subtotal = payload.amount * payload.repeatCount;
  const accountNumber =
    method?.type === 'bank_transfer' ? '8990812345678' : undefined;
  const donationId = `recurring-prepay-${Date.now()}`;
  const paymentGateway = getPaymentGateway(method?.id, method?.type);

  const data = await delay<CreateDonationResult>({
    donationId,
    invoiceId: `INV-${Date.now()}`,
    paymentMethod: method?.name ?? payload.paymentMethodId,
    paymentMethodType: method?.type,
    paymentMethodLogoUrl: method?.logoUrl,
    paymentGateway,
    checkoutUrl: buildCheckoutUrl(paymentGateway, donationId),
    accountNumber,
    accountHolderName: method?.type === 'bank_transfer' ? ACCOUNT_HOLDER_NAME : undefined,
    bankName: method?.type === 'bank_transfer' ? method.name : undefined,
    amount: subtotal,
    adminFee,
    totalAmount: subtotal + adminFee,
    expiredAt: new Date(Date.now() + INVOICE_EXPIRY_MS).toISOString(),
    paymentInstructions: buildPaymentInstructions(method, accountNumber),
  });

  return {success: true, message: 'Donasi rutin berhasil dibuat', data};
}

// "Donasi Saya" (tab Donasi & tab Penyaluran) dibangun langsung dari fixture
// yang sama dengan `getDonationTracking` (`donation-tracking.json`) — supaya
// item yang tampil di list & detail yang muncul setelah di-tap selalu
// konsisten (sebelumnya 2 generator terpisah bisa menghasilkan status
// berbeda untuk id yang "sama"). Tab Donasi menampilkan seluruh fixture
// (semua status pembayaran yang ada di fixture); tab Penyaluran otomatis
// cuma menampilkan yang `salurStatus`-nya terisi lewat `isDistributedDonation`
// di bawah, mencakup ke-4 varian status salur (menunggu/persiapan/proses/selesai).
function createMockDonations(): Donation[] {
  return (donationTrackingFixture as DonationTrackingFixture[]).map(fixture => ({
    id: fixture.id,
    programTitle: fixture.program.title,
    programImageUrl: fixture.program.imageUrl,
    amount: fixture.amount,
    date: fixture.paymentDate,
    status: fixture.paymentStatus,
    salurStatus: fixture.salurStatus ?? undefined,
  }));
}

let mockDonationsPromise: Promise<Donation[]> | null = null;

function getMockDonations(): Promise<Donation[]> {
  if (!mockDonationsPromise) {
    mockDonationsPromise = Promise.resolve(createMockDonations());
  }
  return mockDonationsPromise;
}

// API donasi hanya mengembalikan donasi yang sudah 'sukses' untuk tab
// Penyaluran — donasi yang belum sukses tidak pernah punya salurStatus.
function isDistributedDonation(donation: Donation): donation is DistributedDonation {
  return donation.status === 'sukses' && donation.salurStatus !== undefined;
}

function createMockCategorySummary(categories: Category[]): CategorySummary[] {
  const summary = categories.map((category, index) => {
    const donationCount = 3 + ((index * 7) % 25);
    const averageAmount = 50000 + (index % 5) * 25000;
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      donationCount,
      totalAmount: donationCount * averageAmount,
    };
  });
  return summary.sort((a, b) => b.totalAmount - a.totalAmount);
}

let mockCategorySummaryPromise: Promise<CategorySummary[]> | null = null;

function getMockCategorySummary(): Promise<CategorySummary[]> {
  if (!mockCategorySummaryPromise) {
    mockCategorySummaryPromise = getProgramCategoriesPage().then(page =>
      createMockCategorySummary(page.data),
    );
  }
  return mockCategorySummaryPromise;
}

export async function getTrackingSummary(): Promise<ApiResponse<TrackingSummary>> {
  const donations = await getMockDonations();
  const data = await delay<TrackingSummary>({
    waitingPayment: donations.filter(item => item.status === 'menunggu').length,
    waitingDistribution: donations.filter(item => item.salurStatus === 'menunggu').length,
    inProgress: donations.filter(
      item => item.salurStatus === 'persiapan' || item.salurStatus === 'proses',
    ).length,
    completed: donations.filter(item => item.salurStatus === 'selesai').length,
  });
  return {success: true, message: 'OK', data};
}

export async function getDonationTransactions(
  _page: number,
): Promise<ApiResponse<Donation[]>> {
  const donations = await getMockDonations();
  const data = await delay(donations);
  return {success: true, message: 'OK', data};
}

export async function getDonationDistributions(
  _page: number,
): Promise<ApiResponse<DistributedDonation[]>> {
  const donations = await getMockDonations();
  const data = await delay(donations.filter(isDistributedDonation));
  return {success: true, message: 'OK', data};
}

export async function getDonationCategorySummary(): Promise<
  ApiResponse<CategorySummary[]>
> {
  const summary = await getMockCategorySummary();
  const data = await delay(summary);
  return {success: true, message: 'OK', data};
}

export async function downloadDonationRecap(): Promise<
  ApiResponse<{fileUrl: string}>
> {
  const data = await delay({
    fileUrl: `https://cdn.aksiberbagi.com/recap/recap-${Date.now()}.pdf`,
  });
  return {success: true, message: 'Rekapan berhasil diunduh', data};
}

const PAYMENT_STATUS_CYCLE: DonationPaymentStatus[] = [
  'sukses',
  'sukses',
  'sukses',
  'sukses',
  'menunggu',
  'sukses',
  'gagal',
  'sukses',
  'sukses',
  'expired',
];

const SALUR_STATUS_CYCLE: DonationSalurStatus[] = [
  'selesai',
  'proses',
  'menunggu',
  'persiapan',
  'selesai',
  'proses',
];

const PAYMENT_STATUS_LABEL: Record<DonationPaymentStatus, string> = {
  menunggu: 'MENUNGGU PEMBAYARAN',
  gagal: 'GAGAL',
  expired: 'EXPIRED',
  sukses: 'SUKSES',
};

// Judul node "Status Salur" — sengaja tetap "Proses Salur" saat salurStatus
// sudah 'selesai' (bukan berubah ke "Selesai Salur"), karena penyelesaiannya
// direpresentasikan node ke-3 tersendiri ("Selesai Salur") — lihat
// tracking.md § "Timeline Status".
const DISTRIBUTION_STEP_TITLE: Record<DonationSalurStatus, string> = {
  menunggu: 'Menunggu Salur',
  persiapan: 'Persiapan Salur',
  proses: 'Proses Salur',
  selesai: 'Proses Salur',
};

const DONATION_TIPE_OPTIONS: {name: string; slug: string}[] = [
  {name: 'INFAK', slug: 'infaq'},
  {name: 'ZAKAT', slug: 'zakat'},
  {name: 'WAKAF', slug: 'wakaf'},
  {name: 'SEDEKAH', slug: 'sedekah'},
];

const PROGRAM_COUNT = 26;

function hashStringToIndex(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 1000000007;
  }
  return hash;
}

function daysFromNowIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function buildPaymentStep(
  paymentStatus: DonationPaymentStatus,
  // Maknanya beda-beda per status — batas waktu bayar (menunggu/expired) atau
  // tanggal kejadian (gagal/sukses), lihat tracking.md § "Timeline Status".
  paymentStatusAt: string,
): TrackingStatusStep {
  const datetime = formatDateTimeWib(paymentStatusAt);
  if (paymentStatus === 'sukses') {
    return {
      key: 'payment',
      title: PAYMENT_STATUS_LABEL.sukses,
      description: `Pembayaran berhasil dilakukan pada ${datetime}`,
      state: 'completed',
    };
  }
  if (paymentStatus === 'menunggu') {
    return {
      key: 'payment',
      title: PAYMENT_STATUS_LABEL.menunggu,
      description: `Batas waktu pembayaran pada ${datetime}`,
      state: 'current',
    };
  }
  if (paymentStatus === 'expired') {
    return {
      key: 'payment',
      title: PAYMENT_STATUS_LABEL.expired,
      description: `Gagal melakukan pembayaran sebelum ${datetime}`,
      state: 'error',
    };
  }
  return {
    key: 'payment',
    title: PAYMENT_STATUS_LABEL.gagal,
    description: `Gagal melakukan pembayaran pada ${datetime}`,
    state: 'error',
  };
}

function buildDistributionStep(
  salurStatus: DonationSalurStatus,
  // Cuma relevan buat persiapan (tgl dialokasikan) & proses (tgl persiapan
  // selesai) — menunggu/selesai tidak menyisipkan datetime di keterangannya.
  salurStatusAt: string | undefined,
  donationLabel: string,
): TrackingStatusStep {
  const title = DISTRIBUTION_STEP_TITLE[salurStatus];
  if (salurStatus === 'menunggu') {
    return {
      key: 'distribution',
      title,
      description: `${donationLabel} telah diverifikasi dan menunggu dialokasikan`,
      state: 'current',
    };
  }
  if (salurStatus === 'persiapan') {
    return {
      key: 'distribution',
      title,
      description: `${donationLabel} sudah dialokasikan pada ${formatDateTimeWib(salurStatusAt as string)}, sedang persiapan penyaluran`,
      state: 'current',
    };
  }
  if (salurStatus === 'proses') {
    return {
      key: 'distribution',
      title,
      description: `Persiapan salur telah selesai pada ${formatDateTimeWib(salurStatusAt as string)}, sedang proses penyaluran`,
      state: 'current',
    };
  }
  return {
    key: 'distribution',
    title,
    description: 'Proses salur telah selesai dilakukan',
    state: 'completed',
  };
}

function buildCompletionStep(
  salurStatus: DonationSalurStatus,
  // Estimasi (belum selesai) atau tanggal aktual (sudah selesai).
  salurCompletionAt: string,
  donationLabel: string,
): TrackingStatusStep {
  const datetime = formatDateTimeWib(salurCompletionAt);
  if (salurStatus === 'selesai') {
    return {
      key: 'completion',
      title: 'Selesai Salur',
      description: `${donationLabel} telah berhasil disalurkan pada ${datetime}`,
      state: 'completed',
    };
  }
  return {
    key: 'completion',
    title: 'Selesai Salur',
    description: `Estimasi penyelesaian pada ${datetime}`,
    state: 'pending',
  };
}

interface BuildTrackingStatusStepsInput {
  paymentStatus: DonationPaymentStatus;
  paymentStatusAt: string;
  salurStatus: DonationSalurStatus | undefined;
  salurStatusAt: string | undefined;
  salurCompletionAt: string;
  donationLabel: string;
}

// 1 node kalau paymentStatus belum 'sukses' (cuma status pembayaran), 3 node
// (pembayaran, salur, selesai salur) begitu paymentStatus 'sukses' — node
// salur & selesai salur tidak pernah dirender pudar/terkunci seperti versi
// sebelumnya, murni tidak ada di array kalau belum relevan.
function buildTrackingStatusSteps(
  input: BuildTrackingStatusStepsInput,
): TrackingStatusStep[] {
  const paymentStep = buildPaymentStep(input.paymentStatus, input.paymentStatusAt);
  if (input.paymentStatus !== 'sukses' || !input.salurStatus) {
    return [paymentStep];
  }
  return [
    paymentStep,
    buildDistributionStep(input.salurStatus, input.salurStatusAt, input.donationLabel),
    buildCompletionStep(input.salurStatus, input.salurCompletionAt, input.donationLabel),
  ];
}

function createTrackingMitra(index: number): TrackingMitra {
  return {
    id: `mitra-${(index % ORGANIZATIONS.length) + 1}`,
    name: pick(ORGANIZATIONS, index),
    photoUrl: MITRA_LOGO_URL,
    isVerified: true,
  };
}

function createTrackingReportCards(
  projectId: string,
  index: number,
): TrackingReportCard[] {
  // Carousel Card Report Salur — reuse generator report salur yang sama
  // dipakai tab "Report" DetailProjectSalurScreen, cuma diringkas ke field
  // yang dipakai kartunya (foto, judul, waktu, status).
  return createMockReportSalur(projectId, index).map(report => ({
    id: report.id,
    photoUrl: report.photoUrl,
    title: report.title,
    distributedAt: report.distributedAt,
    status: report.status,
  }));
}

// Bangun DonationTracking langsung dari 1 baris fixture JSON — dipakai buat
// id yang match dengan salah satu entri `donation-tracking.json` (lihat
// "Donasi Saya" & tracking.md § "Data gunakan asset json"). statusSteps
// tetap di-generate lewat buildTrackingStatusSteps yang sama dengan jalur
// procedural di bawah, supaya format teksnya satu sumber kebenaran.
function createDonationTrackingFromFixture(
  fixture: DonationTrackingFixture,
): DonationTracking {
  return {
    donationId: fixture.id,
    paymentStatus: fixture.paymentStatus,
    salurStatus: fixture.salurStatus ?? undefined,
    statusSteps: buildTrackingStatusSteps({
      paymentStatus: fixture.paymentStatus,
      paymentStatusAt: fixture.paymentStatusAt,
      salurStatus: fixture.salurStatus ?? undefined,
      salurStatusAt: fixture.salurStatusAt ?? undefined,
      salurCompletionAt: fixture.salurCompletionAt ?? fixture.paymentStatusAt,
      donationLabel: fixture.donationLabel,
    }),
    program: {
      id: fixture.program.id,
      link: fixture.program.link,
      title: fixture.program.title,
      imageUrl: fixture.program.imageUrl,
      donationLabel: fixture.donationLabel,
      mitra: fixture.program.mitra,
    },
    projectSalur: fixture.projectSalur
      ? {
          id: fixture.projectSalur.id,
          title: fixture.projectSalur.title,
          location: fixture.projectSalur.location,
          beneficiaryCount: fixture.projectSalur.beneficiaryCount,
          // mitra project salur sama dengan mitra program, lihat tipe
          // DonationTrackingFixture.
          mitra: fixture.program.mitra,
        }
      : undefined,
    reports: fixture.reports,
    payment: {
      amount: fixture.amount,
      date: fixture.paymentDate,
      method: fixture.paymentMethod,
    },
  };
}

// Fallback buat id yang TIDAK ada di fixture (mis. donasi baru dari alur
// checkout sungguhan, `AlurDonasi` → `createDonation`, id-nya
// `donation-${Date.now()}`) — generate procedural deterministik dari hash
// id, sama seperti sebelum fixture JSON ditambahkan.
function createProceduralDonationTracking(donationId: string): DonationTracking {
  const index = hashStringToIndex(donationId);
  const paymentStatus = pick(PAYMENT_STATUS_CYCLE, index);
  const salurStatus = paymentStatus === 'sukses' ? pick(SALUR_STATUS_CYCLE, index) : undefined;
  const method = pick(PAYMENT_METHODS, index);
  const amount = 25000 + (index % 8) * 35000;
  const programTitle = pick(PROGRAM_TITLES, index);
  const programNumericId = (index % PROGRAM_COUNT) + 1;
  const paymentDate = daysAgoIso(20 + (index % 5));
  const donationLabel = getDonationTypeLabel(pick(DONATION_TIPE_OPTIONS, index));
  // Mitra program & mitra project salur adalah lembaga yang sama — lembaga
  // yang menjalankan program juga yang menjalankan project salur-nya.
  const mitra = createTrackingMitra(index);

  const paymentStatusAt =
    paymentStatus === 'menunggu'
      ? daysFromNowIso(1)
      : paymentStatus === 'expired' || paymentStatus === 'gagal'
        ? daysAgoIso(1)
        : paymentDate;

  const hasProjectSalur =
    salurStatus === 'persiapan' || salurStatus === 'proses' || salurStatus === 'selesai';
  const hasReports = salurStatus === 'proses' || salurStatus === 'selesai';
  const projectId = `${donationId}-project`;

  const salurStatusAt =
    salurStatus === 'persiapan'
      ? daysAgoIso((index % 5) + 1)
      : salurStatus === 'proses'
        ? daysAgoIso((index % 5) + 4)
        : undefined;
  const salurCompletionAt =
    salurStatus === 'selesai' ? daysAgoIso(index % 3) : daysFromNowIso(14 + (index % 10) * 3);

  return {
    donationId,
    paymentStatus,
    salurStatus,
    statusSteps: buildTrackingStatusSteps({
      paymentStatus,
      paymentStatusAt,
      salurStatus,
      salurStatusAt,
      salurCompletionAt,
      donationLabel,
    }),
    program: {
      id: String(programNumericId),
      link: buildProgramLink(programTitle, programNumericId),
      title: programTitle,
      imageUrl: PROGRAM_IMAGE_URL,
      donationLabel,
      mitra,
    },
    projectSalur: hasProjectSalur
      ? {
          id: projectId,
          title: pick(PROJECT_TITLES, index),
          location: pick(MITRA_LOCATIONS, index),
          beneficiaryCount: 20 + (index % 10) * 5,
          mitra,
        }
      : undefined,
    reports: hasReports ? createTrackingReportCards(projectId, index) : [],
    payment: {
      amount,
      date: paymentDate,
      method: method.name,
    },
  };
}

function createDonationTracking(donationId: string): DonationTracking {
  const fixture = (donationTrackingFixture as DonationTrackingFixture[]).find(
    item => item.id === donationId,
  );
  return fixture
    ? createDonationTrackingFromFixture(fixture)
    : createProceduralDonationTracking(donationId);
}

export async function getDonationTracking(
  donationId: string,
): Promise<ApiResponse<DonationTracking>> {
  const data = await delay(createDonationTracking(donationId));
  return {success: true, message: 'OK', data};
}
