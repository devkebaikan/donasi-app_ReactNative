import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {Faq} from '@/types/faq';

export async function getFaqs(): Promise<ApiResponse<Faq[]>> {
  const res = await apiClient.get<ApiResponse<Faq[]>>('/faqs');
  return res.data;
}
