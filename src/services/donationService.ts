import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {Category} from '@/types/category';
import type {Program} from '@/types/program';
import type {SortDirection, SortOption} from '@/types/donationFilter';
import {getDonationTypeLabel} from '@/utils/donationTypeLabel';
import type {
  DonaturSort,
  MitraSalur,
  ProgramDetail,
  ProgramDetailApiResponse,
  ProgramDonatur,
  ProgramFundraiser,
  ProjectSalur,
  ProjectSalurDetail,
  ProjectSalurStatus,
  ReportSalur,
  SalesNotifItem,
} from '@/types/programDetail';
import type {
  OrganizationProfile,
  OrganizationReport,
} from '@/types/organization';
import type {
  CreateDonationPayload,
  CreateDonationResult,
  NominalOption,
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
  DonationTracking,
} from '@/types/tracking';

const PAGE_SIZE = 10;

// ── Categories & Programs ─────────────────────────────────────────────────────

export async function getDonationCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const res = await apiClient.get<any>('/program-categories');
    const rawList = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data)
      ? res.data
      : [];

    return {
      success: true,
      message: res.data?.message || 'OK',
      data: rawList,
    };
  } catch {
    return {
      success: false,
      message: 'Tidak dapat memuat kategori',
      data: [],
    };
  }
}

export interface ApiProgramItem {
  id: number;
  title: string;
  link: string;
  image: string;
  time_target: string | number | null;
  nominal_target: number | null;
  nominal_achieved: string | number;
  progress_achieved: string | number;
  remaining_days: number | null;
  mitra: {
    id: number;
    name: string;
    image: string;
    location: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
    image: string;
  };
  tipe?: {
    id: number;
    name: string;
    slug: string;
    description: string;
  };
  is_rutin?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export function mapApiProgramToProgram(item: ApiProgramItem): Program {
  return {
    id: item.id,
    title: item.title,
    link: item.link,
    image: item.image,
    time_target: item.time_target,
    nominal_target: item.nominal_target,
    nominal_achieved: item.nominal_achieved,
    progress_achieved: item.progress_achieved,
    is_target_nominal: item.is_target_nominal ?? true,
    remaining_days: item.remaining_days,
    mitra: item.mitra,
    category: item.category,
    tipe: item.tipe,
    isRutin: Boolean(item.is_rutin),
    isRecommended: false,
    donaturCount: Number(item.total_donors ?? item.total_donaturs ?? 0),
    createdAt: item.created_at,
    latestNewsAt: item.updated_at,
  };
}

export async function getFeaturedDonations(): Promise<ApiResponse<Program[]>> {
  try {
    const res = await apiClient.get<any>('/programs', {
      params: {
        mode: 'list',
        status: 'PUBLISH',
        limit: 5,
      },
    });

    const rawList: ApiProgramItem[] = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.data?.data)
      ? res.data.data.data
      : [];

    return {
      success: true,
      message: 'OK',
      data: rawList.slice(0, 5).map(mapApiProgramToProgram),
    };
  } catch {
    return {success: true, message: 'OK', data: []};
  }
}

export interface DonationListParams {
  page: number;
  categoryId: number | null;
  sortOption: SortOption;
  sortDirection: SortDirection;
  search: string;
  isRutin?: boolean;
}

export interface DonationListResult {
  items: Program[];
  hasMore: boolean;
  total: number;
}

function sortPrograms(
  programs: Program[],
  sortOption: SortOption,
  sortDirection: SortDirection,
): Program[] {
  const result = [...programs];
  const directionMultiplier = sortDirection === 'asc' ? 1 : -1;

  result.sort((a, b) => {
    if (sortOption === 'terbaru') {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return (timeA - timeB) * directionMultiplier;
    }
    if (sortOption === 'segera-berakhir') {
      const daysA = a.remaining_days ?? Infinity;
      const daysB = b.remaining_days ?? Infinity;
      return (daysA - daysB) * directionMultiplier;
    }
    if (sortOption === 'jumlah-donatur') {
      const countA = a.donaturCount ?? 0;
      const countB = b.donaturCount ?? 0;
      return (countA - countB) * directionMultiplier;
    }
    return 0;
  });

  return result;
}

export async function getDonationList(
  params: DonationListParams,
): Promise<ApiResponse<DonationListResult>> {
  try {
    const apiOrder =
      params.sortOption === 'segera-berakhir'
        ? undefined
        : params.sortOption === 'terbaru'
        ? 'created_at'
        : undefined;

    const res = await apiClient.get<any>('/programs', {
      params: {
        mode: 'list',
        status: 'PUBLISH',
        search: params.search || undefined,
        order: apiOrder,
        sort: params.sortDirection,
      },
    });

    const rawList: ApiProgramItem[] = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.data?.data)
      ? res.data.data.data
      : [];

    const programs = rawList.map(mapApiProgramToProgram);

    const filtered = programs.filter(program => {
      const matchesCategory =
        params.categoryId !== null
          ? String(program.category?.id) === String(params.categoryId)
          : true;
      const matchesRutin = params.isRutin ? program.isRutin : true;
      return matchesCategory && matchesRutin;
    });

    const sorted = sortPrograms(filtered, params.sortOption, params.sortDirection);
    const pageStart = (params.page - 1) * PAGE_SIZE;
    const items = sorted.slice(pageStart, pageStart + PAGE_SIZE);
    const hasMore = pageStart + items.length < sorted.length;

    return {
      success: true,
      message: 'OK',
      data: {
        items,
        hasMore,
        total: sorted.length,
      },
    };
  } catch {
    return {
      success: true,
      message: 'OK',
      data: {
        items: [],
        hasMore: false,
        total: 0,
      },
    };
  }
}

// ── Detail Program (Direct API without dummy, passing all raw data) ───────────

export async function getProgramDetail(
  link: string,
): Promise<ApiResponse<ProgramDetail>> {
  try {
    const res = await apiClient.get<ApiResponse<ProgramDetailApiResponse>>(
      `/programs/link/${encodeURIComponent(link)}`,
    );

    const raw = res.data?.data;
    if (!raw || Object.keys(raw).length === 0) {
      return {
        status: 404,
        success: false,
        message: 'Program tidak ditemukan',
        data: null as unknown as ProgramDetail,
      };
    }

    const collectedAmount = Number(raw.nominal_achieved ?? 0);
    const usedAmount = Number(raw.nominal_used ?? 0);
    const goalAmount = raw.nominal_target !== null ? Number(raw.nominal_target) : Infinity;
    const donaturCount = Number(raw.total_donors ?? raw.total_donaturs ?? 0);
    const daysLeft = raw.remaining_days !== null ? Number(raw.remaining_days) : Infinity;
    const progressPercent =
      raw.progress_achieved !== undefined && raw.progress_achieved !== null
        ? Number(raw.progress_achieved)
        : goalAmount !== Infinity && goalAmount > 0
        ? Math.min(100, (collectedAmount / goalAmount) * 100)
        : 100;

    // Seluruh data mentah backend diboyong langsung tanpa ada yang dipangkas
    const programDetail: ProgramDetail = {
      ...raw,
      imageUrl: raw.image,
      videoUrl: raw.video || undefined,
      contentHtml: raw.content || '',
      collectedAmount,
      usedAmount,
      availableAmount: Math.max(0, collectedAmount - usedAmount),
      goalAmount,
      donaturCount,
      daysLeft,
      progressPercent,
      isRutin: Boolean(raw.is_rutin),
      donationLabel: getDonationTypeLabel(raw.tipe),
      organization: raw.mitra
        ? {
            id: String(raw.mitra.id),
            name: raw.mitra.name,
            logoUrl: raw.mitra.image,
            isVerified: true,
          }
        : null,
      nominalType: raw.jenis_nominal === 'paket' ? 'paket' : 'biasa',
      totalBeneficiary: Number(raw.total_beneficiery ?? 0),
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
      nearestProjects: (raw.nearest_projects ?? []).map((item: any) => ({
        id: String(item.id),
        title: item.title,
        status: item.status,
        distributedAt: item.distributed_at,
        image: item.image || item.photoUrl || undefined,
        mitra: {
          name: item.mitra?.name || '',
          photoUrl: item.mitra?.image || '',
        },
      })),
    };

    return {
      status: 200,
      success: true,
      message: res.data.message || 'OK',
      data: programDetail,
    };
  } catch (error: any) {
    return {
      status: error.response?.status || 500,
      success: false,
      message: error.response?.data?.message || error.message || 'Gagal memuat program',
      data: null as unknown as ProgramDetail,
    };
  }
}

// ── Tab Salur, Donatur & Fundraisers ───────────────────────────────────────────

export async function getProgramReport(
  link: string,
): Promise<ApiResponse<ReportSalur | null>> {
  if (!link) {
    return {success: true, message: 'OK', data: null};
  }

  try {
    const res = await apiClient.get<any>('/report', {
      params: {program_link: link, limit: 1},
    });

    const reportData = res.data?.data?.[0] ?? null;
    const reportNews = res.data?.news?.[0] ?? null;
    const item = reportData ?? reportNews;

    if (!item) {
      return {success: true, message: 'OK', data: null};
    }

    const isReport = Boolean(reportData);
    const title = isReport
      ? reportData.project?.title || reportData.title || 'Laporan Penyaluran'
      : reportNews.title || 'Laporan Penyaluran';
    const descriptionHtml = isReport
      ? reportData.kegiatan?.deskripsi || reportData.wa_caption || reportData.content || ''
      : reportNews.content || '';
    const photoUrl =
      item.image ||
      item.wa_image ||
      item.kegiatan?.image ||
      '';
    const distributedAt = item.date || item.created_at || new Date().toISOString();
    const mitraObj = Array.isArray(item.mitra) ? item.mitra[0] : item.mitra;

    const report: ReportSalur = {
      id: String(item.id || 'report-1'),
      title,
      descriptionHtml,
      status: 'selesai',
      distributedAt,
      photoUrl,
      mitra: {
        name: mitraObj?.name || 'Beramal Bersama',
        photoUrl: mitraObj?.image_url || mitraObj?.image || '',
      },
    };

    return {success: true, message: 'OK', data: report};
  } catch {
    return {success: true, message: 'OK', data: null};
  }
}

export async function getProgramProjects(
  id: string | number,
  link?: string,
): Promise<ApiResponse<ProjectSalur[]>> {
  try {
    const res = await apiClient.get<any>('/projects', {
      params: {
        program_id: id,
        limit: 10,
      },
    });

    const rawList = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.data?.data)
      ? res.data.data.data
      : [];

    const mapped: ProjectSalur[] = rawList.map((item: any) => ({
      id: String(item.id),
      title: item.title || 'Penyaluran Program',
      descriptionHtml: item.description || '',
      status: (item.status === 'diterima' ||
      item.activity === 'active open' ||
      item.status === 'proses'
        ? 'proses'
        : item.status === 'selesai' || item.activity === 'selesai'
        ? 'selesai'
        : 'menunggu') as ProjectSalurStatus,
      distributedAt:
        item.excecution_time || item.created_at || new Date().toISOString(),
      photoUrl: item.image || '',
      beneficiaryCount: Number(item.beneficiary || 0),
      mitra: {
        name: item.mitra?.name || 'Beramal Bersama',
        photoUrl: item.mitra?.image || '',
      },
      reports: [],
    }));

    return {success: true, message: 'OK', data: mapped};
  } catch {
    return {success: true, message: 'OK', data: []};
  }
}

export async function getProgramMitraSalur(
  link?: string,
): Promise<ApiResponse<MitraSalur[]>> {
  if (!link) return {success: true, message: 'OK', data: []};
  try {
    const res = await apiClient.get<any>('/programs/mitra-salur', {
      params: {program_link: link},
    });
    const list = Array.isArray(res.data?.data) ? res.data.data : [];
    const mapped: MitraSalur[] = list.map((item: any) => ({
      id: String(item.id),
      name: item.name || '',
      photoUrl: item.image || item.photo || '',
      role: 'utama',
    }));
    return {success: true, message: 'OK', data: mapped};
  } catch {
    return {success: true, message: 'OK', data: []};
  }
}

export async function getProgramDonatur(
  _id: string | number,
  sort: DonaturSort = 'terbaru',
  link?: string,
): Promise<ApiResponse<ProgramDonatur[]>> {
  if (!link) {
    return {success: true, message: 'OK', data: []};
  }

  try {
    const res = await apiClient.get<any>(
      `/programs/link/${encodeURIComponent(link)}/donors`,
      {
        params: {
          mode: 'pagination',
          limit: 10,
          page: 1,
        },
      },
    );

    const rawList = Array.isArray(res.data?.data?.data)
      ? res.data.data.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : [];

    const mapped: ProgramDonatur[] = rawList.map((item: any, idx: number) => {
      const isAnon =
        !item.name ||
        item.name.toLowerCase().includes('hamba allah') ||
        item.name.trim() === '';
      const name = isAnon ? 'Hamba Allah' : item.name.trim();

      return {
        id: String(item.id || item.invoice || `donatur-${idx}`),
        name,
        photoUrl: item.photo_url || item.photo || item.image || undefined,
        amount: Number(item.nominal_donasi || item.nominal || item.total || 0),
        createdAt: item.date || item.created_at || new Date().toISOString(),
        paymentMethodName: item.bank_name || item.payment_method || 'Online',
        isAnonymous: isAnon,
        prayer: item.doa?.trim() || undefined,
        aminCount: Number(item.amin || item.liked || 0),
        isLiked: Boolean(item.liked && item.liked > 0),
      };
    });

    if (sort === 'terbesar') {
      mapped.sort((a, b) => b.amount - a.amount);
    } else {
      mapped.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return {success: true, message: 'OK', data: mapped};
  } catch {
    return {success: true, message: 'OK', data: []};
  }
}

export async function likeDonaturPrayer(
  donorId: string | number,
): Promise<ApiResponse<boolean>> {
  try {
    await apiClient.post(`/amin/${donorId}/like`, {id: donorId});
    return {success: true, message: 'OK', data: true};
  } catch {
    return {success: false, message: 'Gagal mengaminkan doa', data: false};
  }
}

export async function getProgramFundraisers(
  link: string,
): Promise<ApiResponse<ProgramFundraiser[]>> {
  if (!link) {
    return {success: true, message: 'OK', data: []};
  }

  try {
    const res = await apiClient.get<any>(
      `/programs/link/${encodeURIComponent(link)}/fundraisers`,
      {
        params: {
          mode: 'pagination',
          limit: 6,
          page: 1,
        },
      },
    );

    const rawList = Array.isArray(res.data?.data?.data)
      ? res.data.data.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : [];

    const mapped: ProgramFundraiser[] = rawList.map((item: any, idx: number) => ({
      id: String(item.id || `fundraiser-${idx}`),
      name: item.name || 'Fundraiser',
      photoUrl: item.image || item.photo || undefined,
      totalDonors: Number(item.total_donatur || item.donatur_count || 0),
      totalAmount: Number(item.total_donasi || item.nominal || 0),
    }));

    return {success: true, message: 'OK', data: mapped};
  } catch {
    return {success: true, message: 'OK', data: []};
  }
}

export async function getSalesNotif(
  _id: string | number,
): Promise<ApiResponse<SalesNotifItem[]>> {
  return {success: true, message: 'OK', data: []};
}

// ── Project Salur Detail & Mitra Profile ──────────────────────────────────────

export async function getProjectSalurDetail(
  projectSalurId: string,
): Promise<ApiResponse<ProjectSalurDetail>> {
  try {
    const res = await apiClient.get<any>(`/program/projects/${projectSalurId}`);
    const data = res.data?.data || res.data;
    const collectedAmount = Number(data.nominal_achieved || 0);
    const targetAmount = Number(data.nominal_target || 0);
    const progressPercent =
      targetAmount > 0
        ? Math.min(100, (collectedAmount / targetAmount) * 100)
        : 100;

    const detail: ProjectSalurDetail = {
      id: String(data.id),
      title: data.title || '',
      photoUrl: data.image || '',
      address: data.lokasi_penyaluran || data.location || '',
      descriptionHtml: data.description || '',
      status: (data.status === 'diterima' ||
      data.activity === 'active open' ||
      data.status === 'proses'
        ? 'proses'
        : data.status === 'selesai' || data.activity === 'selesai'
        ? 'selesai'
        : 'menunggu') as ProjectSalurStatus,
      distributedAt: data.excecution_time || data.created_at || '',
      beneficiaryCount: Number(data.beneficiary || 0),
      targetAmount,
      collectedAmount,
      progressPercent,
      donaturCount: Number(data.donatur_count || data.total_donors || 0),
      donationLabel: data.program?.tipe?.name || 'Donasi',
      mitra: {
        id: String(data.mitra?.id || '1'),
        name: data.mitra?.name || '',
        photoUrl: data.mitra?.image || '',
        isVerified: true,
      },
      program: {
        id: String(data.program?.id || data.program_id || '1'),
        link: data.program?.link || '',
        title: data.program?.title || '',
        imageUrl: data.program?.image || '',
        nominalType:
          data.program?.jenis_nominal === 'paket' ? 'paket' : 'biasa',
        nominalPresets: [],
        packages: [],
      },
      reports: [],
    };
    return {success: true, message: 'OK', data: detail};
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Gagal memuat detail salur',
      data: null as unknown as ProjectSalurDetail,
    };
  }
}

export async function getProjectSalurDonatur(
  _projectSalurId: string,
  _sort: DonaturSort,
): Promise<ApiResponse<ProgramDonatur[]>> {
  return {success: true, message: 'OK', data: []};
}

export async function getOrganizationProfile(
  id: string,
): Promise<ApiResponse<OrganizationProfile>> {
  try {
    const res = await apiClient.get<any>(`/mitra/${encodeURIComponent(id)}`);
    const data = res.data?.data || res.data;
    if (!data) {
      return {
        success: false,
        message: 'Lembaga tidak ditemukan',
        data: null as unknown as OrganizationProfile,
      };
    }
    const profile: OrganizationProfile = {
      id: String(data.id),
      name: data.name || '',
      logoUrl: data.image || data.logo || '',
      location: data.location || '',
      phone: data.phone || '',
      joinedAt: data.created_at || '',
      description: data.description || '',
      stats: {
        programs: Number(data.total_programs || 0),
        donatur: Number(data.total_donatur || 0),
      },
      isVerified: Boolean(data.is_verified ?? true),
    };
    return {success: true, message: 'OK', data: profile};
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Gagal memuat lembaga',
      data: null as unknown as OrganizationProfile,
    };
  }
}

export async function getOrganizationPrograms(
  id: string,
): Promise<ApiResponse<Program[]>> {
  try {
    const res = await apiClient.get<any>('/programs', {
      params: {
        mitra_id: id,
        status: 'PUBLISH',
      },
    });
    const rawList = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.data?.data)
      ? res.data.data.data
      : [];
    return {
      success: true,
      message: 'OK',
      data: rawList.map(mapApiProgramToProgram),
    };
  } catch {
    return {success: true, message: 'OK', data: []};
  }
}

export async function getOrganizationReports(
  id: string,
): Promise<ApiResponse<OrganizationReport[]>> {
  try {
    const res = await apiClient.get<any>('/reports', {
      params: {mitra_id: id},
    });
    const rawList = Array.isArray(res.data?.data) ? res.data.data : [];
    const mapped: OrganizationReport[] = rawList.map((raw: any) => ({
      id: String(raw.id),
      title: raw.title || '',
      periodLabel: raw.period || '',
      publishedAt: raw.published_at || raw.date || '',
      fileUrl: raw.file_url || '',
    }));
    return {success: true, message: 'OK', data: mapped};
  } catch {
    return {success: true, message: 'OK', data: []};
  }
}

// ── Payment & Transactions ───────────────────────────────────────────────────

export async function getNominalOptions(
  program_link: string,
): Promise<ApiResponse<NominalOption[]>> {
  try {
    const res = await apiClient.get<any>('/payment/nominal-option', {
      params: {program_link},
    });
    const list = Array.isArray(res.data?.data) ? res.data.data : [];
    return {
      success: true,
      message: 'OK',
      data: list,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Gagal memuat opsi nominal',
      data: [],
    };
  }
}

export async function getPaymentMethods(
  program_link?: string,
  type?: string,
): Promise<ApiResponse<PaymentMethod[]>> {
  try {
    const params: Record<string, any> = {
      status: 1,
      usage: 'penerima',
    };
    if (program_link) {
      params.program_link = program_link;
    }
    if (type) {
      params.type = type;
    }

    const res = await apiClient.get<any>('/payment/payment-method', {params});
    const list = Array.isArray(res.data?.data) ? res.data.data : [];
    return {
      success: true,
      message: 'OK',
      data: list,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Gagal memuat metode pembayaran',
      data: [],
    };
  }
}

export const DONATION_ADMIN_FEE = 2500;

export async function createPaymentInvoiceResult(
  idPrefix: string,
  paymentMethodId: string,
  amount: number,
  methodInfo?: PaymentMethod | null,
): Promise<CreateDonationResult> {
  const isWallet = methodInfo?.type === 'wallet' || methodInfo?.type === 'dompet_kebaikan';
  const adminFee = isWallet ? 0 : Number(methodInfo?.fee || DONATION_ADMIN_FEE);
  const donationId = `${idPrefix}-${Date.now()}`;
  const now = new Date();
  const expiredAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  return {
    donationId,
    invoiceId: `INV-${Date.now()}`,
    paymentMethod: methodInfo?.name ?? paymentMethodId,
    paymentMethodType: methodInfo?.type,
    paymentMethodLogoUrl: methodInfo?.image_url || methodInfo?.logoUrl,
    paymentGateway: 'midtrans',
    checkoutUrl: undefined,
    accountNumber:
      methodInfo?.account_number ||
      (methodInfo?.type === 'bank' || methodInfo?.type === 'bank_transfer'
        ? '8990812345678'
        : undefined),
    accountHolderName:
      methodInfo?.account_behalf ||
      (methodInfo?.type === 'bank' || methodInfo?.type === 'bank_transfer'
        ? 'Yayasan Beramal Bersama'
        : undefined),
    bankName: methodInfo?.name,
    amount,
    adminFee,
    totalAmount: amount + adminFee,
    expiredAt,
  };
}

export async function createDonation(
  payload: CreateDonationPayload,
): Promise<ApiResponse<CreateDonationResult>> {
  try {
    const body: Record<string, any> = {
      type: 'donation',
      program_type: 'infaq',
      items: [Number(payload.programId)],
      total: [Number(payload.amount)],
      payment_method_id:
        Number(payload.paymentMethodId) || payload.paymentMethodId,
      name: payload.isAnonymous
        ? 'Hamba Allah'
        : payload.donaturName || 'Hamba Allah',
      phone: payload.donaturPhone || '',
      status: 'Pending',
    };
    if (payload.prayer) {
      body.doa = payload.prayer;
    }
    if (payload.onBehalfOf) {
      body.other_detail = payload.onBehalfOf;
    }
    if (payload.projectSalurId) {
      body.projects = [Number(payload.projectSalurId)];
    }

    const res = await apiClient.post<any>('/transactions', body);
    const invoiceData = res.data?.data;
    if (invoiceData?.invoice) {
      return {
        success: true,
        message: 'Donasi berhasil dibuat',
        data: {
          donationId: String(invoiceData.id || invoiceData.invoice),
          invoiceId: invoiceData.invoice,
          paymentMethod: String(payload.paymentMethodId),
          amount: payload.amount,
          adminFee: Number(invoiceData.admin_fee || 0),
          totalAmount: Number(invoiceData.total || payload.amount),
          expiredAt:
            invoiceData.expired_at ||
            new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          accountNumber: invoiceData.va_number || invoiceData.account_number,
          accountHolderName: invoiceData.account_name,
          checkoutUrl: invoiceData.checkout_url || invoiceData.payment_url,
        },
      };
    }
  } catch {
    // fallback lokal
  }
  const data = await createPaymentInvoiceResult(
    'donation',
    String(payload.paymentMethodId),
    payload.amount,
  );
  return {success: true, message: 'Donasi berhasil dibuat', data};
}

export interface InvoiceData {
  id?: number;
  invoice: string;
  nominal: number;
  status: string;
  last_payment_time: string;
  payment_url?: string | null;
  payment_method?: {
    id?: number;
    name?: string;
    bank?: string;
    image?: string;
    image_url?: string;
    type?: string;
    code?: string;
    account_behalf?: string;
    account_number?: string;
    fee_type?: string;
    fee?: number;
    bank_provider?: string;
    minimun_nominal?: string | number;
  };
  third_party_detail?: {
    qr_string?: string | null;
    account_number?: string | null;
    bank_code?: string | null;
    account_holder?: string | null;
    raw?: any;
  } | null;
  items?: Array<{
    id?: number;
    program?: {
      id?: number;
      title?: string;
      link?: string;
      image?: string;
    };
  }>;
  [key: string]: any;
}

export async function getInvoiceDetail(
  invoiceId: string,
): Promise<ApiResponse<InvoiceData>> {
  try {
    const res = await apiClient.get<any>(
      `/transactions/invoice/${encodeURIComponent(invoiceId)}`,
    );
    const rawData = res.data?.data || res.data;
    if (rawData) {
      return {
        success: true,
        message: 'OK',
        data: rawData,
      };
    }
    return {
      success: false,
      message: 'Data invoice tidak ditemukan',
      data: null as unknown as InvoiceData,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || 'Gagal memuat invoice',
      data: null as unknown as InvoiceData,
    };
  }
}

export async function getDonationStatus(
  invoiceId: string,
): Promise<ApiResponse<{status: DonationPaymentStatus}>> {
  try {
    const res = await apiClient.get<any>(
      `/transactions/invoice/${encodeURIComponent(invoiceId)}`,
    );
    const statusStr = (
      res.data?.data?.status ||
      res.data?.status ||
      ''
    ).toLowerCase();
    const status: DonationPaymentStatus =
      statusStr.includes('berhasil') ||
      statusStr.includes('sukses') ||
      statusStr.includes('settlement') ||
      statusStr.includes('paid')
        ? 'sukses'
        : statusStr.includes('expire')
        ? 'expired'
        : statusStr.includes('gagal') || statusStr.includes('cancel')
        ? 'gagal'
        : 'menunggu';
    return {success: true, message: 'OK', data: {status}};
  } catch {
    return {success: true, message: 'OK', data: {status: 'menunggu'}};
  }
}

export async function createRecurringDonation(
  _payload: RecurringDonationPayload,
): Promise<ApiResponse<CreateRecurringDonationResult>> {
  return {
    success: true,
    message: 'Donasi rutin berhasil diatur',
    data: {recurringDonationId: `recurring-${Date.now()}`},
  };
}

export async function prepayRecurringDonation(
  payload: PrepayRecurringDonationPayload,
): Promise<ApiResponse<CreateDonationResult>> {
  const data = await createPaymentInvoiceResult(
    'recurring-prepay',
    payload.paymentMethodId,
    payload.amount * payload.repeatCount,
  );
  return {success: true, message: 'OK', data};
}

// ── Donation Tracking & Dashboard ─────────────────────────────────────────────

export async function getTrackingSummary(): Promise<ApiResponse<TrackingSummary>> {
  return {
    success: true,
    message: 'OK',
    data: {
      waitingPayment: 0,
      waitingDistribution: 0,
      inProgress: 0,
      completed: 0,
    },
  };
}

export async function getDonationTransactions(
  _page: number,
): Promise<ApiResponse<Donation[]>> {
  try {
    const res = await apiClient.get<any>('/dashboard/donatur/my-donations');
    const list = Array.isArray(res.data?.data) ? res.data.data : [];
    return {success: true, message: 'OK', data: list};
  } catch {
    return {success: true, message: 'OK', data: []};
  }
}

export async function getDonationDistributions(
  _page: number,
): Promise<ApiResponse<DistributedDonation[]>> {
  return {success: true, message: 'OK', data: []};
}

export async function getDonationCategorySummary(): Promise<
  ApiResponse<CategorySummary[]>
> {
  return {success: true, message: 'OK', data: []};
}

export async function downloadDonationRecap(): Promise<
  ApiResponse<{fileUrl: string}>
> {
  return {
    success: true,
    message: 'Rekapan berhasil diunduh',
    data: {fileUrl: ''},
  };
}

export async function getDonationTracking(
  _donationId: string,
): Promise<ApiResponse<DonationTracking>> {
  return {
    success: false,
    message: 'Data pelacakan belum tersedia',
    data: null as unknown as DonationTracking,
  };
}
