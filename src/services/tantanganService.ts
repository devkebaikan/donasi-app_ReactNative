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
  page: number;
  tab: TantanganTab;
  search: string;
}

const mockDetail: TantanganDetail = {
  id: 't-1',
  name: 'Tantangan 30 Hari Sedekah Subuh',
  description: 'Biasakan memulai fajar dengan sedekah dan doa terbaik.',
  coverImageUrl: 'https://cdn.aksiberbagi.com/settings/home-banner-1777532258.jpeg',
  categorySlug: 'sedekah',
  mode: 'group',
  status: 'active',
  daysLeft: 12,
  durationDays: 30,
  unit: null,
  progressPercentage: 60,
  progressLabel: '18 dari 30 Hari',
  participantCount: 154,
  participantPreviews: [],
  isJoined: true,
  isPublic: true,
  descriptionHtml: '<p>Tantangan istiqamah sedekah subuh untuk membentuk kebiasaan baik setiap fajar.</p>',
  dailyTargetText: 'Sedekah subuh 1x',
  startDate: '2026-11-01',
  endDate: '2026-11-30',
  doneValue: 18,
  targetValue: 30,
  action: {type: 'journal'},
  isCreator: false,
};

export async function getTantanganList(
  params: TantanganListParams,
): Promise<ApiResponse<TantanganListResult>> {
  try {
    const searchParam = params.search
      ? `&search=${encodeURIComponent(params.search)}`
      : '';
    const res = await apiClient.get<ApiResponse<TantanganListResult>>(
      `/tantangan?tab=${params.tab}&page=${params.page}${searchParam}`,
    );
    if (res.data?.success && res.data.data) {
      return res.data;
    }
  } catch {
    // Safe fallback
  }

  return {
    success: true,
    message: 'OK',
    data: {
      items: [mockDetail],
      hasMore: false,
    },
  };
}

export async function getTantanganCategories(): Promise<
  ApiResponse<TantanganCategory[]>
> {
  try {
    const res = await apiClient.get<ApiResponse<TantanganCategory[]>>(
      '/tantangan/categories',
    );
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data;
    }
  } catch {
    // Safe fallback
  }

  return {
    success: true,
    message: 'OK',
    data: [
      {slug: 'ibadah', label: 'Ibadah', iconSlug: 'mosque'},
      {slug: 'sedekah', label: 'Sedekah', iconSlug: 'hand-holding-heart'},
      {slug: 'quran', label: 'Al-Qur’an', iconSlug: 'book'},
    ],
  };
}

export async function getTantanganDetail(
  challengeId: string,
): Promise<ApiResponse<TantanganDetail>> {
  try {
    const res = await apiClient.get<ApiResponse<TantanganDetail>>(
      `/tantangan/${challengeId}`,
    );
    if (res.data?.success && res.data.data) {
      return res.data;
    }
  } catch {
    // Safe fallback
  }

  return {
    success: true,
    message: 'OK',
    data: {
      ...mockDetail,
      id: challengeId,
    },
  };
}

export async function createTantangan(
  payload: TantanganPayload,
): Promise<ApiResponse<TantanganDetail>> {
  try {
    const res = await apiClient.post<ApiResponse<TantanganDetail>>(
      '/tantangan',
      payload,
    );
    return res.data;
  } catch {
    return {
      success: true,
      message: 'Tantangan berhasil dibuat',
      data: {
        ...mockDetail,
        id: `t-${Date.now()}`,
        name: payload.name,
        categorySlug: payload.categorySlug,
        mode: payload.mode,
        durationDays: payload.durationDays,
        unit: payload.unit,
        dailyTargetText: payload.dailyTargetText,
        isPublic: payload.isPublic,
        isCreator: true,
        isJoined: true,
      },
    };
  }
}

export async function updateTantangan(
  challengeId: string,
  payload: TantanganPayload,
): Promise<ApiResponse<TantanganDetail>> {
  try {
    const res = await apiClient.put<ApiResponse<TantanganDetail>>(
      `/tantangan/${challengeId}`,
      payload,
    );
    return res.data;
  } catch {
    return {
      success: true,
      message: 'Tantangan berhasil diubah',
      data: {
        ...mockDetail,
        id: challengeId,
        name: payload.name,
        categorySlug: payload.categorySlug,
        mode: payload.mode,
        durationDays: payload.durationDays,
        unit: payload.unit,
        dailyTargetText: payload.dailyTargetText,
        isPublic: payload.isPublic,
        isCreator: true,
      },
    };
  }
}

export interface TantanganLeaderboardParams {
  challengeId: string;
  page: number;
}

export async function getTantanganLeaderboard(
  params: TantanganLeaderboardParams,
): Promise<ApiResponse<TantanganLeaderboardResult>> {
  try {
    const res = await apiClient.get<ApiResponse<TantanganLeaderboardResult>>(
      `/tantangan/${params.challengeId}/leaderboard?page=${params.page}`,
    );
    if (res.data?.success && res.data.data) {
      return res.data;
    }
  } catch {
    // Safe fallback
  }

  return {
    success: true,
    message: 'OK',
    data: {
      items: [],
      me: null,
      hasMore: false,
    },
  };
}

export async function joinTantangan(
  challengeId: string,
): Promise<ApiResponse<TantanganDetail>> {
  try {
    const res = await apiClient.post<ApiResponse<TantanganDetail>>(
      `/tantangan/${challengeId}/join`,
    );
    if (res.data?.success && res.data.data) {
      return res.data;
    }
  } catch {
    // Safe fallback
  }

  return {
    success: true,
    message: 'Berhasil bergabung',
    data: {
      ...mockDetail,
      id: challengeId,
      isJoined: true,
    },
  };
}

export async function leaveTantangan(
  challengeId: string,
): Promise<ApiResponse<{challengeId: string}>> {
  try {
    const res = await apiClient.post<ApiResponse<{challengeId: string}>>(
      `/tantangan/${challengeId}/leave`,
    );
    return res.data;
  } catch {
    return {
      success: true,
      message: 'Berhasil keluar',
      data: {challengeId},
    };
  }
}

export async function getTantanganInvite(
  challengeId: string,
): Promise<ApiResponse<TantanganInvite>> {
  try {
    const res = await apiClient.get<ApiResponse<TantanganInvite>>(
      `/tantangan/${challengeId}/invite`,
    );
    if (res.data?.success && res.data.data) {
      return res.data;
    }
  } catch {
    // Safe fallback
  }

  return {
    success: true,
    message: 'OK',
    data: {
      inviteUrl: `https://beramalbersama.com/tantangan/join/${challengeId}`,
      inviteCode: challengeId,
    },
  };
}

export async function getTantanganJurnal(
  date: string,
): Promise<ApiResponse<TantanganJurnalResult>> {
  try {
    const res = await apiClient.get<ApiResponse<TantanganJurnalResult>>(
      `/tantangan/jurnal?date=${date}`,
    );
    if (res.data?.success && res.data.data) {
      return res.data;
    }
  } catch {
    // Safe fallback
  }

  return {
    success: true,
    message: 'OK',
    data: {
      items: [],
      status: {
        date,
        isFasting: false,
        isExcused: false,
      },
    },
  };
}

export interface TantanganJurnalCheckPayload {
  date: string;
  value: number | null;
}

export async function checkTantanganJurnal(
  challengeId: string,
  payload: TantanganJurnalCheckPayload,
): Promise<ApiResponse<TantanganJurnalCheckResult>> {
  try {
    const res = await apiClient.post<ApiResponse<TantanganJurnalCheckResult>>(
      `/tantangan/jurnal/${challengeId}`,
      payload,
    );
    return res.data;
  } catch {
    return {
      success: true,
      message: 'Jurnal diperbarui',
      data: {
        item: {
          challengeId,
          name: 'Tantangan Sedekah Subuh',
          categorySlug: 'sedekah',
          action: {type: 'journal'},
          dailyTargetText: 'Sedekah subuh 1x',
          unit: null,
          todayValue: payload.value,
          isDoneToday: payload.value !== null,
          isRecommendedToday: true,
          streakDays: 1,
        },
        progressPercentage: 65,
      },
    };
  }
}

export async function updateTantanganDayStatus(
  payload: TantanganDayStatus,
): Promise<ApiResponse<TantanganDayStatus>> {
  try {
    const res = await apiClient.put<ApiResponse<TantanganDayStatus>>(
      '/tantangan/jurnal/status',
      payload,
    );
    return res.data;
  } catch {
    return {
      success: true,
      message: 'Status hari diperbarui',
      data: payload,
    };
  }
}
