import { apiClient } from './apiClient';
import type { ApiResponse } from '@/types/api';
import type { HomePageData } from '@/types/home';
import type { Banner } from '@/types/banner';
import type { Category } from '@/types/category';
import type { Program } from '@/types/program';
import type { Promo } from '@/types/promo';

interface DaySchedule {
  day_name: string;
  has_donation: boolean;
  day_of_week: number;
}

export interface DonasiRutinCalendarData {
  streak_days: number;
  subtitle: string;
  weekly_schedule: DaySchedule[];
}

export interface ProgramTheme {
  nama_tema: string;
  deskripsi_tema: string;
  /** Background penuh section tema; judul & deskripsi sudah menyatu di gambar. */
  background_url: string;
  program: Program[];
}

export type { HomePageData };

export async function getHomePage(): Promise<ApiResponse<HomePageData>> {
  const res = await apiClient.get<ApiResponse<HomePageData>>('/pages/home');
  return res.data;
}


export async function getBanners(): Promise<ApiResponse<Banner[]>> {
  try {
    const res = await apiClient.get<ApiResponse<Banner[]>>('/banners');
    return res.data;
  } catch {
    return {success: false, data: [], message: ''};
  }
}

export async function getCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return res.data;
  } catch {
    return {success: false, data: [], message: ''};
  }
}

export async function getFeaturedPrograms(): Promise<ApiResponse<Program[]>> {
  try {
    const res = await apiClient.get<ApiResponse<Program[]>>(
      '/programs?featured=true&limit=5',
    );
    return res.data;
  } catch {
    return {success: false, data: [], message: ''};
  }
}

export async function getWalletBalance(): Promise<ApiResponse<number>> {
  try {
    const res = await apiClient.get<any>('/dashboard/donatur/my-wallet');
    const saldo = Number(res.data?.data?.saldo ?? res.data?.saldo ?? 0);
    return {
      success: true,
      data: saldo,
      message: 'OK',
    };
  } catch {
    return {
      success: true,
      data: 0,
      message: '',
    };
  }
}

export async function getPopupPromo(): Promise<ApiResponse<Promo | null>> {
  try {
    const res = await apiClient.get<ApiResponse<Promo | null>>('/promos/popup');
    return res.data;
  } catch {
    return {success: false, data: null, message: ''};
  }
}
