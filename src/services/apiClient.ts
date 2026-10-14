import axios from 'axios';
import type {AxiosAdapter, AxiosResponse} from 'axios';
import {ENV, USE_MOCK_DATA} from '@/config/env';
import {useAuthStore} from '@/stores/authStore';
import {resolveMockRequest} from './mockData/mockRouter';
import {queryClient} from './queryClient';

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const MOCK_LATENCY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// `transformRequest` sudah men-JSON.stringify body sebelum adapter dipanggil
// (kecuali FormData/string), jadi parse balik supaya mock router menerima
// object biasa seperti body request aslinya.
function parseRequestBody(data: unknown): unknown {
  if (typeof data !== 'string') {
    return data;
  }
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

// Menjawab semua request langsung dari fixture lokal
// (mobile/src/assets/json) tanpa jaringan sama sekali — dipakai supaya build
// APK tetap jalan tanpa backend/json-server. Lihat docs/PRD_JSON.md untuk
// katalog endpoint dan cara pindah balik ke API asli.
const mockAdapter: AxiosAdapter = async config => {
  await delay(MOCK_LATENCY_MS);
  const {status, data} = resolveMockRequest(
    config.method ?? 'get',
    config.url ?? '',
    parseRequestBody(config.data),
  );
  const response: AxiosResponse = {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Not Found',
    headers: {},
    config,
  };
  return response;
};

if (USE_MOCK_DATA) {
  apiClient.defaults.adapter = mockAdapter;
}

apiClient.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      // Auth invalid di luar alur logout manual (mis. token expired) —
      // cache query tetap harus dibersihkan, sama seperti logout manual di
      // useAccount.ts, supaya data user sebelumnya tidak nyangkut/kebaca
      // user berikutnya yang login di device yang sama.
      queryClient.clear();
    }
    return Promise.reject(error);
  },
);
