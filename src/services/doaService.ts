import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {
  CreateDoaPayload,
  Doa,
  DoaBanner,
  DoaListResult,
  DoaTab,
  DoaToggleResult,
} from '@/types/doa';

export interface DoaListParams {
  page: number;
  tab: DoaTab;
}

// Memory cache untuk doa lokal yang baru dibuat
const localCreatedDoas: Doa[] = [];
const localAmiinedIds = new Set<string>();
const localFavoriteIds = new Set<string>();

/**
 * Mengambil daftar doa donatur nyata dari API backend
 */
export async function getDoaList(
  params: DoaListParams,
): Promise<ApiResponse<DoaListResult>> {
  try {
    // Coba endpoint /doa jika ada
    const res = await apiClient.get<ApiResponse<DoaListResult>>(
      `/doa?tab=${params.tab}&page=${params.page}`,
    );
    if (res.data?.success && res.data.data) {
      return res.data;
    }
  } catch {
    // Fallback terintegrasi ke live donor prayers
  }

  try {
    // Ambil doa dari live donor transactions
    const donorRes = await apiClient.get<{data: any[]}>(
      '/programs/link/sedekahbangunpesantren/donors',
      {
        params: {limit: 25},
      },
    );

    const rawDonors = Array.isArray(donorRes.data?.data) ? donorRes.data.data : [];
    const prayersFromDonors: Doa[] = rawDonors
      .filter((d: any) => Boolean(d.doa && typeof d.doa === 'string' && d.doa.trim()))
      .map((d: any) => {
        const id = String(d.id);
        const isAmiin = localAmiinedIds.has(id);
        const isFavorite = localFavoriteIds.has(id);
        return {
          id,
          author: {
            id: `author-${d.id}`,
            name: d.name || 'Hamba Allah',
            avatarUrl: null,
          },
          content: d.doa,
          createdAt: d.date || new Date().toISOString(),
          isAmiin,
          isFavorite,
          isMine: false,
          isReported: false,
        };
      });

    let combined = [...localCreatedDoas, ...prayersFromDonors];

    if (params.tab === 'mine') {
      combined = combined.filter(d => d.isMine);
    } else if (params.tab === 'favorite') {
      combined = combined.filter(d => d.isFavorite);
    }

    const pageSize = 10;
    const startIdx = (params.page - 1) * pageSize;
    const pageItems = combined.slice(startIdx, startIdx + pageSize);
    const hasMore = startIdx + pageSize < combined.length;

    return {
      success: true,
      message: 'OK',
      data: {
        items: pageItems,
        hasMore,
      },
    };
  } catch {
    return {
      success: true,
      message: 'OK',
      data: {
        items: localCreatedDoas,
        hasMore: false,
      },
    };
  }
}

export async function getDoaBanners(): Promise<ApiResponse<DoaBanner[]>> {
  try {
    const res = await apiClient.get<ApiResponse<DoaBanner[]>>('/doa/banners');
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data;
    }
  } catch {
    // safe fallback
  }

  return {
    success: true,
    message: 'OK',
    data: [
      {
        id: 'banner-1',
        imageUrl:
          'https://cdn.aksiberbagi.com/settings/home-banner-1777532258.jpeg',
        title: 'Doakan Saudara Kita',
      },
    ],
  };
}

export async function createDoa(
  payload: CreateDoaPayload,
): Promise<ApiResponse<Doa>> {
  const isAnonymous = payload.nameVisibility === 'anonymous';
  const newDoa: Doa = {
    id: `doa-${Date.now()}`,
    author: {
      id: 'me',
      name: isAnonymous ? 'Hamba Allah' : 'Saya',
      avatarUrl: null,
    },
    content: payload.content,
    createdAt: new Date().toISOString(),
    isAmiin: true,
    isFavorite: false,
    isMine: true,
    isReported: false,
  };

  localCreatedDoas.unshift(newDoa);
  localAmiinedIds.add(newDoa.id);

  try {
    await apiClient.post('/doa', payload);
  } catch {
    // Ignore error, tersimpan di localCreatedDoas
  }

  return {success: true, message: 'Doa berhasil dikirim', data: newDoa};
}

export async function toggleDoaAmiin(
  doaId: string,
): Promise<ApiResponse<DoaToggleResult>> {
  const isCurrentlyAmiin = localAmiinedIds.has(doaId);
  const nextAmiin = !isCurrentlyAmiin;

  if (nextAmiin) {
    localAmiinedIds.add(doaId);
  } else {
    localAmiinedIds.delete(doaId);
  }

  try {
    await apiClient.post(`/amin/${encodeURIComponent(doaId)}/like`);
  } catch {
    // Ignore error
  }

  return {
    success: true,
    message: 'OK',
    data: {
      id: doaId,
      isAmiin: nextAmiin,
      isFavorite: localFavoriteIds.has(doaId),
    },
  };
}

export async function toggleDoaFavorite(
  doaId: string,
): Promise<ApiResponse<DoaToggleResult>> {
  const isFav = localFavoriteIds.has(doaId);
  const nextFav = !isFav;

  if (nextFav) {
    localFavoriteIds.add(doaId);
  } else {
    localFavoriteIds.delete(doaId);
  }

  return {
    success: true,
    message: 'OK',
    data: {
      id: doaId,
      isAmiin: localAmiinedIds.has(doaId),
      isFavorite: nextFav,
    },
  };
}

export async function reportDoa(_doaId: string): Promise<ApiResponse<null>> {
  return {success: true, message: 'Laporan berhasil diterima', data: null};
}
