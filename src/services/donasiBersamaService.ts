import {apiClient} from './apiClient';
import {createPaymentInvoiceResult} from './donationService';
import type {ApiResponse} from '@/types/api';
import type {CreateDonationResult} from '@/types/payment';
import type {
  BatchMutationResult,
  BatchPayload,
  CreateContributionPayload,
  CreateDonasiBersamaPayload,
  DonasiBersamaBatch,
  DonasiBersamaContribution,
  DonasiBersamaContributionListResult,
  DonasiBersamaDetail,
  DonasiBersamaInvite,
  DonasiBersamaListResult,
  DonasiBersamaMemberListResult,
  RemoveMemberResult,
  DonasiBersamaMyContributionListResult,
  DonasiBersamaTab,
  JoinGroupResult,
  UploadCoverResult,
} from '@/types/donasiBersama';

export interface DonasiBersamaListParams {
  page: number; // mulai dari 1
  tab: DonasiBersamaTab;
  search: string;
}

export async function getDonasiBersamaList(
  params: DonasiBersamaListParams,
): Promise<ApiResponse<DonasiBersamaListResult>> {
  // Bukan URLSearchParams — tidak tersedia di runtime React Native/Hermes
  // tanpa polyfill tambahan (belum terinstall di project ini).
  const searchParam = params.search
    ? `&search=${encodeURIComponent(params.search)}`
    : '';
  const res = await apiClient.get<ApiResponse<DonasiBersamaListResult>>(
    `/donasi-bersama?tab=${params.tab}&page=${params.page}${searchParam}`,
  );
  return res.data;
}

// Payload-nya sama persis dengan create — form-nya memang satu, hanya beda
// mode. Server menolak kalau bukan kreator.
export async function updateDonasiBersama(
  groupId: string,
  payload: CreateDonasiBersamaPayload,
): Promise<ApiResponse<DonasiBersamaDetail>> {
  const res = await apiClient.put<ApiResponse<DonasiBersamaDetail>>(
    `/donasi-bersama/${groupId}`,
    payload,
  );
  return res.data;
}

export async function getDonasiBersamaDetail(
  groupId: string,
): Promise<ApiResponse<DonasiBersamaDetail>> {
  const res = await apiClient.get<ApiResponse<DonasiBersamaDetail>>(
    `/donasi-bersama/${groupId}`,
  );
  return res.data;
}

export async function getDonasiBersamaContributions(
  groupId: string,
  params: {page: number},
): Promise<ApiResponse<DonasiBersamaContributionListResult>> {
  const res = await apiClient.get<
    ApiResponse<DonasiBersamaContributionListResult>
  >(`/donasi-bersama/${groupId}/contributions?page=${params.page}`);
  return res.data;
}

export async function getDonasiBersamaMembers(
  groupId: string,
  params: {page: number; search: string},
): Promise<ApiResponse<DonasiBersamaMemberListResult>> {
  const searchParam = params.search
    ? `&search=${encodeURIComponent(params.search)}`
    : '';
  const res = await apiClient.get<ApiResponse<DonasiBersamaMemberListResult>>(
    `/donasi-bersama/${groupId}/members?page=${params.page}${searchParam}`,
  );
  return res.data;
}

export async function getDonasiBersamaBatches(
  groupId: string,
): Promise<ApiResponse<DonasiBersamaBatch[]>> {
  const res = await apiClient.get<ApiResponse<DonasiBersamaBatch[]>>(
    `/donasi-bersama/${groupId}/batches`,
  );
  return res.data;
}

export async function createDonasiBersamaBatch(
  groupId: string,
  payload: BatchPayload,
): Promise<ApiResponse<BatchMutationResult>> {
  const res = await apiClient.post<ApiResponse<BatchMutationResult>>(
    `/donasi-bersama/${groupId}/batches`,
    payload,
  );
  return res.data;
}

export async function updateDonasiBersamaBatch(
  groupId: string,
  batchId: string,
  payload: BatchPayload,
): Promise<ApiResponse<BatchMutationResult>> {
  const res = await apiClient.put<ApiResponse<BatchMutationResult>>(
    `/donasi-bersama/${groupId}/batches/${batchId}`,
    payload,
  );
  return res.data;
}

// Memulai batch menutup batch yang sedang berjalan — server yang menjaga
// hanya ada satu batch aktif.
export async function startDonasiBersamaBatch(
  groupId: string,
  batchId: string,
): Promise<ApiResponse<BatchMutationResult>> {
  const res = await apiClient.post<ApiResponse<BatchMutationResult>>(
    `/donasi-bersama/${groupId}/batches/${batchId}/start`,
  );
  return res.data;
}

// Hanya batch berstatus draft yang boleh dihapus — server ikut menolak.
export async function deleteDonasiBersamaBatch(
  groupId: string,
  batchId: string,
): Promise<ApiResponse<null>> {
  const res = await apiClient.delete<ApiResponse<null>>(
    `/donasi-bersama/${groupId}/batches/${batchId}`,
  );
  return res.data;
}

export async function getDonasiBersamaBatchContributions(
  groupId: string,
  batchId: string,
  params: {page: number},
): Promise<ApiResponse<DonasiBersamaContributionListResult>> {
  const res = await apiClient.get<
    ApiResponse<DonasiBersamaContributionListResult>
  >(
    `/donasi-bersama/${groupId}/batches/${batchId}/contributions?page=${params.page}`,
  );
  return res.data;
}

export async function getDonasiBersamaMyContributions(
  groupId: string,
  params: {page: number},
): Promise<ApiResponse<DonasiBersamaMyContributionListResult>> {
  const res = await apiClient.get<
    ApiResponse<DonasiBersamaMyContributionListResult>
  >(`/donasi-bersama/${groupId}/contributions/mine?page=${params.page}`);
  return res.data;
}

export async function getDonasiBersamaMemberContributions(
  groupId: string,
  memberId: string,
  params: {page: number},
): Promise<ApiResponse<DonasiBersamaContributionListResult>> {
  const res = await apiClient.get<
    ApiResponse<DonasiBersamaContributionListResult>
  >(
    `/donasi-bersama/${groupId}/members/${memberId}/contributions?page=${params.page}`,
  );
  return res.data;
}

// Ditolak server kalau pemanggilnya bukan kreator, kalau targetnya kreator,
// atau kalau anggota itu sudah pernah urun.
export async function removeDonasiBersamaMember(
  groupId: string,
  memberId: string,
): Promise<ApiResponse<RemoveMemberResult>> {
  const res = await apiClient.delete<ApiResponse<RemoveMemberResult>>(
    `/donasi-bersama/${groupId}/members/${memberId}`,
  );
  return res.data;
}

export async function getDonasiBersamaInvite(
  groupId: string,
): Promise<ApiResponse<DonasiBersamaInvite>> {
  const res = await apiClient.get<ApiResponse<DonasiBersamaInvite>>(
    `/donasi-bersama/${groupId}/invite`,
  );
  return res.data;
}

// Tanpa body — identitas pengguna diambil dari token di interceptor apiClient.
export async function joinDonasiBersama(
  groupId: string,
): Promise<ApiResponse<JoinGroupResult>> {
  const res = await apiClient.post<ApiResponse<JoinGroupResult>>(
    `/donasi-bersama/${groupId}/join`,
  );
  return res.data;
}

// Bentuk balikannya sama dengan join supaya satu handler di hook bisa
// memperbarui cache tanpa cabang.
export async function leaveDonasiBersama(
  groupId: string,
): Promise<ApiResponse<JoinGroupResult>> {
  const res = await apiClient.post<ApiResponse<JoinGroupResult>>(
    `/donasi-bersama/${groupId}/leave`,
  );
  return res.data;
}

export interface UploadCoverPayload {
  uri: string;
  fileName: string;
  type: string;
}

// Endpoint terpisah supaya payload create tetap JSON. Bentuk multipart-nya
// mengikuti updateAvatar di userService.ts.
export async function uploadDonasiBersamaCover(
  payload: UploadCoverPayload,
): Promise<ApiResponse<UploadCoverResult>> {
  const formData = new FormData();
  formData.append('cover', {
    uri: payload.uri,
    name: payload.fileName,
    type: payload.type,
  } as unknown as Blob);

  const res = await apiClient.post<ApiResponse<UploadCoverResult>>(
    '/donasi-bersama/cover',
    formData,
    {headers: {'Content-Type': 'multipart/form-data'}},
  );
  return res.data;
}

// Mengembalikan detail penuh, bukan cuma id — DonasiBersamaSuksesScreen
// menampilkan nama, target, dan cover tanpa satu pun request tambahan.
export async function createDonasiBersama(
  payload: CreateDonasiBersamaPayload,
): Promise<ApiResponse<DonasiBersamaDetail>> {
  const res = await apiClient.post<ApiResponse<DonasiBersamaDetail>>(
    '/donasi-bersama',
    payload,
  );
  return res.data;
}

// Urunan dicatat lewat endpoint grup, tapi payload invoice-nya dibangun
// `createPaymentInvoiceResult` — factory yang sama dengan `createDonation`.
// Pembagian ini mengikuti keadaan kode sekarang: pembuatan invoice memang
// belum lewat HTTP sama sekali (lihat createDonation di donationService.ts),
// sementara pencatatan urunan HARUS lewat mock supaya progres grup dan riwayat
// patungan ikut naik.
//
// Saat API asli tersedia, fungsi ini menyusut jadi satu POST yang langsung
// mengembalikan CreateDonationResult — hanya bagian di bawah `if` yang hilang.
export async function createDonasiBersamaContribution(
  groupId: string,
  payload: CreateContributionPayload,
): Promise<ApiResponse<CreateDonationResult>> {
  const res = await apiClient.post<ApiResponse<DonasiBersamaContribution>>(
    `/donasi-bersama/${groupId}/contributions`,
    payload,
  );
  if (!res.data.success) {
    return {
      success: false,
      message: res.data.message,
      data: null as unknown as CreateDonationResult,
    };
  }

  const invoice = await createPaymentInvoiceResult(
    'urun',
    payload.paymentMethodId,
    payload.amount,
  );
  return {success: true, message: 'Urunan berhasil dibuat', data: invoice};
}
