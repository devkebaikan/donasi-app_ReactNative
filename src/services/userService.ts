import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {User} from '@/types/user';
import type {DonationReminderFrequency} from '@/types/setting';

export async function getMe(): Promise<ApiResponse<User>> {
  try {
    const res = await apiClient.get<any>('/dashboard/donatur/my-account');
    const data = res.data?.data || res.data || {};
    return {
      success: true,
      message: 'OK',
      data: {
        id: String(data.id || ''),
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        avatarUrl: data.img || null,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || 'Gagal memuat profil',
      data: null as unknown as User,
    };
  }
}

interface UpdateProfilePayload {
  name: string;
  email: string;
}

export type UpdateProfileData = Pick<User, 'name' | 'email'>;

export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<ApiResponse<UpdateProfileData>> {
  const res = await apiClient.patch<ApiResponse<UpdateProfileData>>(
    '/users/me',
    payload,
  );
  return res.data;
}

interface UpdateAvatarPayload {
  uri: string;
  fileName: string;
  type: string;
}

export type UpdateAvatarData = {
  avatarUrl: string;
};

export async function updateAvatar(
  payload: UpdateAvatarPayload,
): Promise<ApiResponse<UpdateAvatarData>> {
  const formData = new FormData();
  formData.append('avatar', {
    uri: payload.uri,
    name: payload.fileName,
    type: payload.type,
  } as unknown as Blob);

  const res = await apiClient.patch<ApiResponse<UpdateAvatarData>>(
    '/users/me/avatar',
    formData,
    {headers: {'Content-Type': 'multipart/form-data'}},
  );
  return res.data;
}

// Semua field opsional: layar Pengaturan mengirim HANYA preferensi yang baru
// saja diubah, bukan seluruh isi form — tiap toggle berdiri sendiri.
export interface UpdateSettingsPayload {
  hideNominal?: boolean;
  hideName?: boolean;
  contactable?: boolean;
  reminderEnabled?: boolean;
  reminderFrequency?: DonationReminderFrequency;
  reminderTime?: string;
}

export type UpdateSettingsData = Required<UpdateSettingsPayload>;

export async function updateSettings(
  payload: UpdateSettingsPayload,
): Promise<ApiResponse<UpdateSettingsData>> {
  const res = await apiClient.patch<ApiResponse<UpdateSettingsData>>(
    '/users/me/settings',
    payload,
  );
  return res.data;
}

export interface MyAccountData {
  id?: number | string;
  name?: string;
  phone?: string;
  email?: string;
  img?: string | null;
  reff_code?: string;
  dompet_kebaikan?: {
    saldo?: number;
    [key: string]: any;
  };
}

export async function getMyAccount(): Promise<ApiResponse<MyAccountData>> {
  try {
    const res = await apiClient.get<ApiResponse<MyAccountData>>(
      '/dashboard/donatur/my-account',
    );
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || 'Gagal memuat akun',
      data: null as unknown as MyAccountData,
    };
  }
}

