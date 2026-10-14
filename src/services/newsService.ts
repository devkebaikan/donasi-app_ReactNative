import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {Article, ArticleDetail, NewsFilter} from '@/types/news';

const FEATURED_LIMIT = 5;

export interface NewsListParams {
  page: number;
  sort: NewsFilter;
  search: string;
}

export interface NewsListResult {
  items: Article[];
  hasMore: boolean;
}

export interface NewsLikeResult {
  likeCount: number;
  isLiked: boolean;
}

export async function getFeaturedNews(): Promise<ApiResponse<Article[]>> {
  const res = await apiClient.get<ApiResponse<Article[]>>(
    `/news?featured=true&limit=${FEATURED_LIMIT}`,
  );
  return res.data;
}

export async function getNewsList(
  params: NewsListParams,
): Promise<ApiResponse<NewsListResult>> {
  // Bukan URLSearchParams — tidak tersedia di runtime React Native/Hermes
  // tanpa polyfill tambahan (belum terinstall di project ini).
  const searchParam = params.search
    ? `&search=${encodeURIComponent(params.search)}`
    : '';
  const res = await apiClient.get<ApiResponse<NewsListResult>>(
    `/news?sort=${params.sort}&page=${params.page}${searchParam}`,
  );
  return res.data;
}

export async function getNewsDetail(
  articleId: string,
): Promise<ApiResponse<ArticleDetail>> {
  const res = await apiClient.get<ApiResponse<ArticleDetail>>(
    `/news/${articleId}`,
  );
  return res.data;
}

export async function toggleNewsLike(
  articleId: string,
): Promise<ApiResponse<NewsLikeResult>> {
  const res = await apiClient.post<ApiResponse<NewsLikeResult>>(
    `/news/${articleId}/like`,
  );
  return res.data;
}
