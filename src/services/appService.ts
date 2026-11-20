import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {Faq} from '@/types/faq';

export async function getFaqs(): Promise<ApiResponse<Faq[]>> {
  try {
    const res = await apiClient.get<ApiResponse<Faq[]>>('/faqs');
    return res.data;
  } catch {
    return {
      success: true,
      data: [],
      message: '',
    };
  }
}
