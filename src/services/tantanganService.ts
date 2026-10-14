import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {
  TantanganCategory,
  TantanganDetail,
  TantanganDayStatus,
  TantanganInvite,
  TantanganJurnalCheckResult,
  TantanganJurnalResult,
  TantanganLeaderboardResult,
  TantanganListResult,
  TantanganPayload,
  TantanganTab,
} from '@/types/tantangan';

export interface TantanganListParams {
  page: number; // mulai dari 1
  tab: TantanganTab;
  search: string;
}

export async function getTantanganList(
  params: TantanganListParams,
): Promise<ApiResponse<TantanganListResult>> {
  // Bukan URLSearchParams — tidak tersedia di runtime React Native/Hermes
  // tanpa polyfill tambahan (belum terinstall di project ini).
  const searchParam = params.search
    ? `&search=${encodeURIComponent(params.search)}`
    : '';
  const res = await apiClient.get<ApiResponse<TantanganListResult>>(
    `/tantangan?tab=${params.tab}&page=${params.page}${searchParam}`,
  );
  return res.data;
}

export async function getTantanganCategories(): Promise<
  ApiResponse<TantanganCategory[]>
> {
  const res = await apiClient.get<ApiResponse<TantanganCategory[]>>(
    '/tantangan/categories',
  );
  return res.data;
}

export async function getTantanganDetail(
  challengeId: string,
): Promise<ApiResponse<TantanganDetail>> {
  const res = await apiClient.get<ApiResponse<TantanganDetail>>(
    `/tantangan/${challengeId}`,
  );
  return res.data;
}

export async function createTantangan(
  payload: TantanganPayload,
): Promise<ApiResponse<TantanganDetail>> {
  const res = await apiClient.post<ApiResponse<TantanganDetail>>(
    '/tantangan',
    payload,
  );
  return res.data;
}

// Payload-nya sama persis dengan create — form-nya memang satu, hanya beda
// mode. Server menolak kalau bukan pembuatnya.
export async function updateTantangan(
  challengeId: string,
  payload: TantanganPayload,
): Promise<ApiResponse<TantanganDetail>> {
  const res = await apiClient.put<ApiResponse<TantanganDetail>>(
    `/tantangan/${challengeId}`,
    payload,
  );
  return res.data;
}

export interface TantanganLeaderboardParams {
  challengeId: string;
  page: number; // mulai dari 1
}

export async function getTantanganLeaderboard(
  params: TantanganLeaderboardParams,
): Promise<ApiResponse<TantanganLeaderboardResult>> {
  const res = await apiClient.get<ApiResponse<TantanganLeaderboardResult>>(
    `/tantangan/${params.challengeId}/leaderboard?page=${params.page}`,
  );
  return res.data;
}

export async function joinTantangan(
  challengeId: string,
): Promise<ApiResponse<TantanganDetail>> {
  const res = await apiClient.post<ApiResponse<TantanganDetail>>(
    `/tantangan/${challengeId}/join`,
  );
  return res.data;
}

// Balikannya cuma id — beda dengan join yang mengembalikan detail penuh.
// Setelah keluar, screen langsung goBack(), jadi tidak ada yang perlu dirender
// dari response ini.
export async function leaveTantangan(
  challengeId: string,
): Promise<ApiResponse<{challengeId: string}>> {
  const res = await apiClient.post<ApiResponse<{challengeId: string}>>(
    `/tantangan/${challengeId}/leave`,
  );
  return res.data;
}

export async function getTantanganInvite(
  challengeId: string,
): Promise<ApiResponse<TantanganInvite>> {
  const res = await apiClient.get<ApiResponse<TantanganInvite>>(
    `/tantangan/${challengeId}/invite`,
  );
  return res.data;
}

export async function getTantanganJurnal(
  date: string,
): Promise<ApiResponse<TantanganJurnalResult>> {
  const res = await apiClient.get<ApiResponse<TantanganJurnalResult>>(
    `/tantangan/jurnal?date=${date}`,
  );
  return res.data;
}

export interface TantanganJurnalCheckPayload {
  date: string;
  // null → centang biner (toggle). Angka → pencatatan bernilai.
  value: number | null;
}

export async function checkTantanganJurnal(
  challengeId: string,
  payload: TantanganJurnalCheckPayload,
): Promise<ApiResponse<TantanganJurnalCheckResult>> {
  const res = await apiClient.post<ApiResponse<TantanganJurnalCheckResult>>(
    `/tantangan/jurnal/${challengeId}`,
    payload,
  );
  return res.data;
}

export async function updateTantanganDayStatus(
  payload: TantanganDayStatus,
): Promise<ApiResponse<TantanganDayStatus>> {
  const res = await apiClient.put<ApiResponse<TantanganDayStatus>>(
    '/tantangan/jurnal/status',
    payload,
  );
  return res.data;
}
