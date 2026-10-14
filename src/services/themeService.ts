import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {Theme} from '@/types/theme';

// Tema yang sedang aktif, tanpa perlu id — entry point-nya menu di AccountScreen
// yang tidak membawa id apa pun. Path `/themes/:id` sengaja dibiarkan kosong
// untuk entry point lain (mis. banner tema di Home) kalau nanti dibuat.
export async function getActiveTheme(): Promise<ApiResponse<Theme | null>> {
  const res = await apiClient.get<ApiResponse<Theme | null>>('/themes/active');
  return res.data;
}
