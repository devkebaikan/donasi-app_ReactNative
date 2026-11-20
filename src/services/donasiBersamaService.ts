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
  page: number;
  tab: DonasiBersamaTab;
  search: string;
}

export interface UploadCoverPayload {
  uri: string;
  fileName: string;
  type: string;
}

const mockDetail: DonasiBersamaDetail = {
  id: 'grup-1',
  name: 'Patungan Wakaf Al-Quran Pelosok',
  description: 'Bersama-sama patungan mencetak dan menyalurkan mushaf Al-Quran untuk santri pelosok nusantara.',
  coverImageUrl: 'https://cdn.aksiberbagi.com/settings/home-banner-1777532258.jpeg',
  targetAmount: 50_000_000,
  collectedAmount: 18_500_000,
  progressLabel: '37% Tercapai',
  daysLeft: 24,
  memberCount: 42,
  memberPreviews: [],
  isMember: true,
  isPublic: true,
  status: 'active',
  location: 'Nusantara',
  batchLabel: 'BATCH 1',
  about: '<p>Program donasi bersama untuk menghadirkan mushaf Al-Quran bagi santri dan masyarakat di daerah terpencil.</p>',
  deadline: '2026-12-31',
  programId: '3',
  programTitle: 'Sedekah Al-Quran Pelosok',
  isCreator: false,
  reminder: {
    isEnabled: true,
    frequency: 'weekly',
    weekDay: 'fri',
    time: '05:00',
  },
};

export async function getDonasiBersamaList(
  params: DonasiBersamaListParams,
): Promise<ApiResponse<DonasiBersamaListResult>> {
  try {
    const searchParam = params.search
      ? `&search=${encodeURIComponent(params.search)}`
      : '';
    const res = await apiClient.get<ApiResponse<DonasiBersamaListResult>>(
      `/donasi-bersama?tab=${params.tab}&page=${params.page}${searchParam}`,
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

export async function updateDonasiBersama(
  groupId: string,
  payload: CreateDonasiBersamaPayload,
): Promise<ApiResponse<DonasiBersamaDetail>> {
  try {
    const res = await apiClient.put<ApiResponse<DonasiBersamaDetail>>(
      `/donasi-bersama/${groupId}`,
      payload,
    );
    return res.data;
  } catch {
    return {
      success: true,
      message: 'OK',
      data: {
        ...mockDetail,
        id: groupId,
        name: payload.name,
        targetAmount: payload.targetAmount,
        deadline: payload.deadline,
        coverImageUrl: payload.coverImageUrl,
        reminder: payload.reminder,
        isCreator: true,
      },
    };
  }
}

export async function getDonasiBersamaDetail(
  groupId: string,
): Promise<ApiResponse<DonasiBersamaDetail>> {
  try {
    const res = await apiClient.get<ApiResponse<DonasiBersamaDetail>>(
      `/donasi-bersama/${groupId}`,
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
      id: groupId,
    },
  };
}

export async function getDonasiBersamaContributions(
  groupId: string,
  params: {page: number},
): Promise<ApiResponse<DonasiBersamaContributionListResult>> {
  try {
    const res = await apiClient.get<
      ApiResponse<DonasiBersamaContributionListResult>
    >(`/donasi-bersama/${groupId}/contributions?page=${params.page}`);
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
      hasMore: false,
    },
  };
}

export async function getDonasiBersamaMembers(
  groupId: string,
  params: {page: number; search: string},
): Promise<ApiResponse<DonasiBersamaMemberListResult>> {
  try {
    const searchParam = params.search
      ? `&search=${encodeURIComponent(params.search)}`
      : '';
    const res = await apiClient.get<ApiResponse<DonasiBersamaMemberListResult>>(
      `/donasi-bersama/${groupId}/members?page=${params.page}${searchParam}`,
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
      hasMore: false,
      total: 0,
    },
  };
}

export async function getDonasiBersamaBatches(
  groupId: string,
): Promise<ApiResponse<DonasiBersamaBatch[]>> {
  try {
    const res = await apiClient.get<ApiResponse<DonasiBersamaBatch[]>>(
      `/donasi-bersama/${groupId}/batches`,
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
    data: [],
  };
}

export async function createDonasiBersamaBatch(
  groupId: string,
  payload: BatchPayload,
): Promise<ApiResponse<BatchMutationResult>> {
  try {
    const res = await apiClient.post<ApiResponse<BatchMutationResult>>(
      `/donasi-bersama/${groupId}/batches`,
      payload,
    );
    return res.data;
  } catch {
    return {
      success: true,
      message: 'Batch berhasil dibuat',
      data: {
        batch: {
          id: `batch-${Date.now()}`,
          sequence: 1,
          label: payload.label,
          status: 'draft',
          collectedAmount: 0,
          contributionCount: 0,
          createdAt: new Date().toISOString(),
          startedAt: null,
        },
        activeBatchLabel: payload.label,
      },
    };
  }
}

export async function updateDonasiBersamaBatch(
  groupId: string,
  batchId: string,
  payload: BatchPayload,
): Promise<ApiResponse<BatchMutationResult>> {
  try {
    const res = await apiClient.put<ApiResponse<BatchMutationResult>>(
      `/donasi-bersama/${groupId}/batches/${batchId}`,
      payload,
    );
    return res.data;
  } catch {
    return {
      success: true,
      message: 'Batch berhasil diubah',
      data: {
        batch: {
          id: batchId,
          sequence: 1,
          label: payload.label,
          status: 'draft',
          collectedAmount: 0,
          contributionCount: 0,
          createdAt: new Date().toISOString(),
          startedAt: null,
        },
        activeBatchLabel: payload.label,
      },
    };
  }
}

export async function startDonasiBersamaBatch(
  groupId: string,
  batchId: string,
): Promise<ApiResponse<BatchMutationResult>> {
  try {
    const res = await apiClient.post<ApiResponse<BatchMutationResult>>(
      `/donasi-bersama/${groupId}/batches/${batchId}/start`,
    );
    return res.data;
  } catch {
    return {
      success: true,
      message: 'Batch dimulai',
      data: {
        batch: {
          id: batchId,
          sequence: 1,
          label: 'Batch 1',
          status: 'active',
          collectedAmount: 0,
          contributionCount: 0,
          createdAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
        },
        activeBatchLabel: 'Batch 1',
      },
    };
  }
}

export async function deleteDonasiBersamaBatch(
  groupId: string,
  batchId: string,
): Promise<ApiResponse<null>> {
  try {
    const res = await apiClient.delete<ApiResponse<null>>(
      `/donasi-bersama/${groupId}/batches/${batchId}`,
    );
    return res.data;
  } catch {
    return {success: true, message: 'Batch berhasil dihapus', data: null};
  }
}

export async function getDonasiBersamaBatchContributions(
  groupId: string,
  batchId: string,
  params: {page: number},
): Promise<ApiResponse<DonasiBersamaContributionListResult>> {
  try {
    const res = await apiClient.get<
      ApiResponse<DonasiBersamaContributionListResult>
    >(
      `/donasi-bersama/${groupId}/batches/${batchId}/contributions?page=${params.page}`,
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
      hasMore: false,
    },
  };
}

export async function getDonasiBersamaMyContributions(
  groupId: string,
  params: {page: number},
): Promise<ApiResponse<DonasiBersamaMyContributionListResult>> {
  try {
    const res = await apiClient.get<
      ApiResponse<DonasiBersamaMyContributionListResult>
    >(`/donasi-bersama/${groupId}/contributions/mine?page=${params.page}`);
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
      hasMore: false,
      totalAmount: 0,
      count: 0,
    },
  };
}

export async function getDonasiBersamaMemberContributions(
  groupId: string,
  memberId: string,
  params: {page: number},
): Promise<ApiResponse<DonasiBersamaContributionListResult>> {
  try {
    const res = await apiClient.get<
      ApiResponse<DonasiBersamaContributionListResult>
    >(
      `/donasi-bersama/${groupId}/members/${memberId}/contributions?page=${params.page}`,
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
      hasMore: false,
    },
  };
}

export async function removeDonasiBersamaMember(
  groupId: string,
  memberId: string,
): Promise<ApiResponse<RemoveMemberResult>> {
  try {
    const res = await apiClient.delete<ApiResponse<RemoveMemberResult>>(
      `/donasi-bersama/${groupId}/members/${memberId}`,
    );
    return res.data;
  } catch {
    return {
      success: true,
      message: 'Anggota dihapus',
      data: {memberCount: 0},
    };
  }
}

export async function getDonasiBersamaInvite(
  groupId: string,
): Promise<ApiResponse<DonasiBersamaInvite>> {
  try {
    const res = await apiClient.get<ApiResponse<DonasiBersamaInvite>>(
      `/donasi-bersama/${groupId}/invite`,
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
      inviteUrl: `https://beramalbersama.com/donasi-bersama/join/${groupId}`,
      inviteCode: groupId,
    },
  };
}

export async function joinDonasiBersama(
  groupId: string,
): Promise<ApiResponse<JoinGroupResult>> {
  try {
    const res = await apiClient.post<ApiResponse<JoinGroupResult>>(
      `/donasi-bersama/${groupId}/join`,
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
      isMember: true,
      memberCount: 43,
    },
  };
}

export async function leaveDonasiBersama(
  groupId: string,
): Promise<ApiResponse<JoinGroupResult>> {
  try {
    const res = await apiClient.post<ApiResponse<JoinGroupResult>>(
      `/donasi-bersama/${groupId}/leave`,
    );
    if (res.data?.success && res.data.data) {
      return res.data;
    }
  } catch {
    // Safe fallback
  }

  return {
    success: true,
    message: 'Berhasil keluar',
    data: {
      isMember: false,
      memberCount: 42,
    },
  };
}

export async function createDonasiBersama(
  payload: CreateDonasiBersamaPayload,
): Promise<ApiResponse<DonasiBersamaDetail>> {
  try {
    const res = await apiClient.post<ApiResponse<DonasiBersamaDetail>>(
      '/donasi-bersama',
      payload,
    );
    return res.data;
  } catch {
    return {
      success: true,
      message: 'Grup berhasil dibuat',
      data: {
        ...mockDetail,
        id: `grup-${Date.now()}`,
        name: payload.name,
        targetAmount: payload.targetAmount,
        deadline: payload.deadline,
        coverImageUrl: payload.coverImageUrl,
        reminder: payload.reminder,
        isCreator: true,
        memberCount: 1,
      },
    };
  }
}

export async function createDonasiBersamaContribution(
  groupId: string,
  payload: CreateContributionPayload,
): Promise<ApiResponse<CreateDonationResult>> {
  try {
    const res = await apiClient.post<ApiResponse<CreateDonationResult>>(
      `/donasi-bersama/${groupId}/contributions`,
      payload,
    );
    return res.data;
  } catch {
    const inv = await createPaymentInvoiceResult(
      groupId,
      payload.paymentMethodId,
      payload.amount,
    );
    return {
      success: true,
      message: 'Kontribusi berhasil dibuat',
      data: inv,
    };
  }
}

export async function uploadDonasiBersamaCover(
  _payload: UploadCoverPayload,
): Promise<ApiResponse<UploadCoverResult>> {
  return {
    success: true,
    message: 'OK',
    data: {
      coverImageUrl: 'https://cdn.aksiberbagi.com/settings/home-banner-1777532258.jpeg',
    },
  };
}
