import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {Program} from '@/types/program';

export interface ProgramThemeData {
  id: number | string;
  name: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  totalCollected: number;
  totalPrograms: number;
  programs: Program[];
}

export async function getProgramThemeBySlug(
  slug: string,
): Promise<ApiResponse<ProgramThemeData | null>> {
  try {
    const res = await apiClient.get<any>(`/program-themes/slug/${encodeURIComponent(slug)}`);
    const data = res.data?.data || res.data;
    if (!data) {
      return {success: false, message: 'Tema tidak ditemukan', data: null};
    }

    const title = data.judul || data.name || data.title || 'Tema Kebaikan';
    const rawPrograms = Array.isArray(data.programs) ? data.programs : [];
    const totalCollected = rawPrograms.reduce(
      (acc: number, p: any) => acc + (Number(p.saldo || p.nominal_achieved) || 0),
      0,
    );

    const imageUrl = data.image
      ? data.image.startsWith('http')
        ? data.image
        : `https://cdn.aksiberbagi.com/themes/${data.image}`
      : 'https://cdn.aksiberbagi.com/settings/home-banner-1777532258.jpeg';

    const mappedPrograms: Program[] = rawPrograms.map((p: any) => {
      const nominalTarget = Number(p.nominal_target || 0);
      const nominalAchieved = Number(p.saldo || p.nominal_achieved || 0);
      const progressPercent =
        nominalTarget > 0
          ? Math.min(100, Math.round((nominalAchieved / nominalTarget) * 100))
          : 0;

      return {
        id: String(p.id),
        title: p.title || p.name || '',
        link: p.slug || p.link || String(p.id),
        imageUrl: p.image_url || p.image || '',
        organizationName: p.mitra?.name || 'Yayasan Sahabat Beramal Bersama',
        collectedAmount: nominalAchieved,
        targetAmount: nominalTarget,
        progressPercent,
        daysLeft: typeof p.remaining_days === 'number' ? p.remaining_days : 30,
        isUrgent: false,
        category: p.category?.name || 'Umum',
      };
    });

    return {
      success: true,
      message: 'OK',
      data: {
        id: data.id || slug,
        name: title,
        title,
        slug,
        description: data.deskripsi || data.description || '',
        imageUrl,
        totalCollected,
        totalPrograms: mappedPrograms.length,
        programs: mappedPrograms,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Gagal memuat tema',
      data: null,
    };
  }
}

/**
 * Backward compatibility untuk tema aktif
 */
export async function getActiveTheme(): Promise<ApiResponse<any | null>> {
  try {
    const res = await apiClient.get<any>('/themes/active');
    return res.data;
  } catch {
    return {
      success: true,
      message: 'OK',
      data: {
        id: 'theme-1',
        title: 'Tema Kebaikan Beramal',
        description: 'Kumpulkan kebaikan bersama jutaan orang baik lainnya.',
        imageUrl: 'https://cdn.aksiberbagi.com/settings/home-banner-1777532258.jpeg',
        ctaLabel: 'Lihat Program',
        ctaType: 'program',
        ctaTarget: '',
      },
    };
  }
}
