import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {Article, ArticleDetail, NewsFilter} from '@/types/news';
import localNews from '@/assets/json/news.json';

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

const mockLikes = new Map<string, {isLiked: boolean; count: number}>();

export async function getFeaturedNews(): Promise<ApiResponse<Article[]>> {
  try {
    const res = await apiClient.get<ApiResponse<Article[]>>(
      `/news?featured=true&limit=${FEATURED_LIMIT}`,
    );
    if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
      return res.data;
    }
  } catch (_e) {
    // Fallback defensif
  }

  const all = (localNews as unknown as (ArticleDetail & {featured?: boolean})[]) || [];
  const featured = all.filter(a => a.featured).slice(0, FEATURED_LIMIT);
  const items: Article[] = (featured.length > 0 ? featured : all.slice(0, FEATURED_LIMIT)).map(a => ({
    id: a.id,
    title: a.title,
    coverImageUrl: a.coverImageUrl,
    publishedAt: a.publishedAt,
    likeCount: mockLikes.get(a.id)?.count ?? a.likeCount,
    isLiked: mockLikes.get(a.id)?.isLiked ?? a.isLiked,
  }));

  return {
    status: 200,
    success: true,
    message: 'OK',
    data: items,
  };
}

export async function getNewsList(
  params: NewsListParams,
): Promise<ApiResponse<NewsListResult>> {
  try {
    const searchParam = params.search
      ? `&search=${encodeURIComponent(params.search)}`
      : '';
    const res = await apiClient.get<ApiResponse<NewsListResult>>(
      `/news?sort=${params.sort}&page=${params.page}${searchParam}`,
    );
    if (res.data?.data?.items) {
      return res.data;
    }
  } catch (_e) {
    // Fallback defensif jika backend live 404
  }

  const all = (localNews as unknown as ArticleDetail[]) || [];
  const query = (params.search || '').trim().toLowerCase();
  let list = query
    ? all.filter(a => a.title.toLowerCase().includes(query))
    : [...all];

  if (params.sort === 'popular') {
    list.sort((a, b) => (mockLikes.get(b.id)?.count ?? b.likeCount) - (mockLikes.get(a.id)?.count ?? a.likeCount));
  } else if (params.sort === 'newest') {
    list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  const pageSize = 10;
  const start = Math.max(0, (params.page - 1) * pageSize);
  const paged: Article[] = list.slice(start, start + pageSize).map(a => ({
    id: a.id,
    title: a.title,
    coverImageUrl: a.coverImageUrl,
    publishedAt: a.publishedAt,
    likeCount: mockLikes.get(a.id)?.count ?? a.likeCount,
    isLiked: mockLikes.get(a.id)?.isLiked ?? a.isLiked,
  }));

  return {
    status: 200,
    success: true,
    message: 'OK',
    data: {
      items: paged,
      hasMore: start + pageSize < list.length,
    },
  };
}

export async function getNewsDetail(
  articleId: string,
): Promise<ApiResponse<ArticleDetail>> {
  try {
    const res = await apiClient.get<ApiResponse<ArticleDetail>>(
      `/news/${articleId}`,
    );
    if (res.data?.data) {
      return res.data;
    }
  } catch (_e) {
    // Fallback defensif
  }

  const all = (localNews as unknown as ArticleDetail[]) || [];
  const found: ArticleDetail = all.find(a => a.id === articleId) ?? all[0] ?? {
    id: articleId,
    title: 'Kabar Berbagi',
    coverImageUrl: '',
    publishedAt: new Date().toISOString(),
    likeCount: 0,
    isLiked: false,
    content: '<p>Belum ada isi berita.</p>',
    partner: null,
  };
  const dynamicLike = mockLikes.get(found.id);

  return {
    status: 200,
    success: true,
    message: 'OK',
    data: {
      ...found,
      likeCount: dynamicLike?.count ?? found.likeCount,
      isLiked: dynamicLike?.isLiked ?? found.isLiked,
    },
  };
}

export async function toggleNewsLike(
  articleId: string,
): Promise<ApiResponse<NewsLikeResult>> {
  try {
    const res = await apiClient.post<ApiResponse<NewsLikeResult>>(
      `/news/${articleId}/like`,
    );
    if (res.data?.data) {
      return res.data;
    }
  } catch (_e) {
    // Fallback defensif
  }

  const all = (localNews as unknown as ArticleDetail[]) || [];
  const found = all.find(a => a.id === articleId);
  const currentLike = mockLikes.get(articleId) ?? {
    isLiked: found?.isLiked ?? false,
    count: found?.likeCount ?? 0,
  };

  const nextLiked = !currentLike.isLiked;
  const nextCount = nextLiked ? currentLike.count + 1 : Math.max(0, currentLike.count - 1);
  mockLikes.set(articleId, {isLiked: nextLiked, count: nextCount});

  return {
    status: 200,
    success: true,
    message: 'OK',
    data: {
      isLiked: nextLiked,
      likeCount: nextCount,
    },
  };
}
