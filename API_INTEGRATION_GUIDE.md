# 🚀 Panduan Integrasi API: Axios + TanStack Query + React Hook Form & Zod

Panduan arsitektur integrasi API untuk React Native / React yang **mudah digunakan**, **reusable** (dapat dipakai ulang), dan **scalable** (mudah dikembangkan dan dirawat saat skala aplikasi membesar).

---

## 📑 Daftar Isi
1. [Arsitektur & Alur Kerja (Layered Architecture)](#1-arsitektur--alur-kerja-layered-architecture)
2. [Instalasi Dependensi](#2-instalasi-dependensi)
3. [Layer 1: Konfigurasi Axios (`apiClient.ts`)](#3-layer-1-konfigurasi-axios-apiclientts)
4. [Layer 2: Standarisasi Tipe & Error (`api.ts` & `apiError.ts`)](#4-layer-2-standarisasi-tipe--error-apits--apierrorts)
5. [Layer 3: Query Key Factory (`queryKeys.ts`)](#5-layer-3-query-key-factory-querykeysts)
6. [Layer 4: Service Layer (Endpoint API)](#6-layer-4-service-layer-endpoint-api)
7. [Layer 5: Custom Hooks (TanStack Query)](#7-layer-5-custom-hooks-tanstack-query)
8. [Layer 6: Form & Validasi (React Hook Form + Zod)](#8-layer-6-form--validasi-react-hook-form--zod)
9. [Contoh Implementasi Lengkap (Recipes)](#9-contoh-implementasi-lengkap-recipes)
   - [Recipe A: Fetching Data & Pull-to-Refresh](#recipe-a-fetching-data--pull-to-refresh)
   - [Recipe B: Form Submit + Mutation](#recipe-b-form-submit--mutation)
   - [Recipe C: Infinite Scroll / Pagination](#recipe-c-infinite-scroll--pagination)
   - [Recipe D: Optimistic Update (Respons Instan)](#recipe-d-optimistic-update-respons-instan)
   - [Recipe E: Integrasi Real Endpoint BeramalBersama (`GET /pages/home` + `X-Client-Key`)](#recipe-e-integrasi-real-endpoint-beramalbersama-get-pageshome--x-client-key)
10. [Best Practices & Aturan Emas](#10-best-practices--aturan-emas)


---

## 1. Arsitektur & Alur Kerja (Layered Architecture)

Agar kode tidak berantakan dan mudah di-maintain, kita memisahkan tanggung jawab menjadi **5 layer**:

```
┌────────────────────────────────────────────────────────┐
│ UI Screen / Component (React / React Native)            │
│  - Render data & handle event                          │
│  - Opsional: React Hook Form + Zod                      │
└────────────────────────▲───────────────────────────────┘
                         │
┌────────────────────────┴───────────────────────────────┐
│ Custom Hook Layer (TanStack Query)                     │
│  - useQuery / useMutation / useInfiniteQuery           │
│  - Cache management, refetch, invalidation             │
│  - Menggunakan queryKeys factory                       │
└────────────────────────▲───────────────────────────────┘
                         │
┌────────────────────────┴───────────────────────────────┐
│ Service Layer (Pure Async Functions)                   │
│  - Panggilan endpoint spesifik (get, post, put, etc.)  │
│  - Parsing response & unwrap data                      │
└────────────────────────▲───────────────────────────────┘
                         │
┌────────────────────────┴───────────────────────────────┐
│ Network Client (Axios Instance)                        │
│  - Base URL, timeout, headers                          │
│  - Request interceptor: inject Bearer Token            │
│  - Response interceptor: handle 401 & error global     │
└────────────────────────────────────────────────────────┘
```

### Keuntungan Arsitektur Ini:
1. **Tidak ada panggilan `axios.get()` di dalam komponen UI**.
2. **Type-safe dari request sampai response**.
3. **Query Key terpusat**, mencegah salah ketik string saat `invalidateQueries`.
4. **Validasi form terisolasi dengan Zod**, data yang dikirim ke API dijamin sesuai schema.

---

## 2. Instalasi Dependensi

Pastikan paket berikut terpasang di project Anda:

```bash
# TanStack Query & Axios
npm install @tanstack/react-query axios

# React Hook Form & Zod (untuk form + validasi schema)
npm install react-hook-form zod @hookform/resolvers
```

---

## 3. Layer 1: Konfigurasi Axios (`apiClient.ts`)

Buat satu Axios instance sentral dengan baseURL dan interceptors.

📁 **`src/services/apiClient.ts`**
```typescript
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@/config/env';
import { useAuthStore } from '@/stores/authStore';
import { queryClient } from './queryClient';

// Base URL & Client Key diambil dari environment / config
export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL || 'https://aapi.beramalbersama.com/api/v1',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Client-Key': ENV.CLIENT_KEY, // Header custom untuk API BeramalBersama
  },
});

// 1. Request Interceptor: Otomatis sematkan Client Key & Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Pastikan X-Client-Key selalu terlampir di setiap request
    if (ENV.CLIENT_KEY) {
      config.headers['X-Client-Key'] = ENV.CLIENT_KEY;
    }

    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 2. Response Interceptor: Penanganan Error Terpusat (contoh: 401 Unauthorized)
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token kadaluarsa: Bersihkan sesi auth & cache TanStack Query
      useAuthStore.getState().clearAuth();
      queryClient.clear();
      // Opsional: Redirect ke halaman Login
    }
    return Promise.reject(error);
  }
);
```

---

## 4. Layer 2: Standarisasi Tipe & Error (`api.ts` & `apiError.ts`)

Membungkus respons API standar dan error handling agar konsisten di seluruh aplikasi, mendukung baik format `{ status: 200, message, data }` maupun `{ success: true, message, data }`.

📁 **`src/types/api.ts`**
```typescript
// Format respons standar dari backend
export interface ApiResponse<T = unknown> {
  status?: number;     // e.g. 200
  success?: boolean;   // e.g. true
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  hasMore: boolean;
  total?: number;
}
```

📁 **`src/utils/apiError.ts`**
```typescript
import { AxiosError } from 'axios';
import type { ApiResponse } from '@/types/api';

export class ApiError extends Error {
  readonly code?: number;
  readonly data?: unknown;

  constructor(message: string, code?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.data = data;
  }
}

// Helper untuk membuka payload dan melempar ApiError jika response gagal
export function unwrapResponse<T>(response: ApiResponse<T>): T {
  const isSuccess =
    response.success === true ||
    (typeof response.status === 'number' && response.status >= 200 && response.status < 300) ||
    (response.success === undefined && response.status === undefined && response.data !== undefined);

  if (!isSuccess) {
    throw new ApiError(response.message || 'Terjadi kesalahan sistem', undefined, response.data);
  }
  return response.data;
}

// Helper untuk mengekstrak pesan error ramah pengguna dari AxiosError

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message || 'Gagal terhubung ke server.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Terjadi kesalahan yang tidak terduga.';
}
```

---

## 5. Layer 3: Query Key Factory (`queryKeys.ts`)

**KUNCI SCALABILITY**: Jangan pernah menulis query key sebagai string sembarangan seperti `useQuery(['campaigns'])`. Gunakan **Query Key Factory Pattern** agar:
- Bebas dari *typo*.
- Invalidation menjadi prediktif dan aman saat refactor.
- Parameter filter/pagination otomatis menjadi bagian dari cache key.

📁 **`src/utils/queryKeys.ts`**
```typescript
export const queryKeys = {
  // Scope: Auth / Profile
  auth: {
    me: ['auth', 'me'] as const,
  },

  // Scope: Program / Donasi
  programs: {
    all: ['programs'] as const,
    lists: () => [...queryKeys.programs.all, 'list'] as const,
    list: (filter: { categoryId?: number; search?: string; sort?: string }) =>
      [...queryKeys.programs.lists(), filter] as const,
    details: () => [...queryKeys.programs.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...queryKeys.programs.details(), id] as const,
  },

  // Scope: Transaksi / Riwayat
  transactions: {
    all: ['transactions'] as const,
    list: (page: number) => [...queryKeys.transactions.all, 'list', page] as const,
    detail: (id: string) => [...queryKeys.transactions.all, 'detail', id] as const,
  },
} as const;
```

---

## 6. Layer 4: Service Layer (Endpoint API)

Service hanya berisi fungsi murni (pure async functions) yang memanggil Axios. Tidak ada hook atau state React di sini.

📁 **`src/services/programService.ts`**
```typescript
import { apiClient } from './apiClient';
import { unwrapResponse } from '@/utils/apiError';
import type { ApiResponse } from '@/types/api';

export interface Program {
  id: string;
  title: string;
  targetAmount: number;
  collectedAmount: number;
  imageUrl: string;
}

export interface CreateDonationPayload {
  programId: string;
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  isAnonymous?: boolean;
}

export interface DonationInvoice {
  transactionId: string;
  paymentUrl: string;
  expiredAt: string;
}

// 1. GET List
export async function getPrograms(params?: { categoryId?: number; search?: string }): Promise<Program[]> {
  const response = await apiClient.get<ApiResponse<Program[]>>('/programs', { params });
  return unwrapResponse(response.data);
}

// 2. GET Detail
export async function getProgramDetail(id: string | number): Promise<Program> {
  const response = await apiClient.get<ApiResponse<Program>>(`/programs/${id}`);
  return unwrapResponse(response.data);
}

// 3. POST Mutation
export async function createDonation(payload: CreateDonationPayload): Promise<DonationInvoice> {
  const response = await apiClient.post<ApiResponse<DonationInvoice>>('/donations', payload);
  return unwrapResponse(response.data);
}
```

---

## 7. Layer 5: Custom Hooks (TanStack Query)

Bungkus TanStack Query ke dalam custom hooks agar komponen UI tetap bersih dan logic dapat digunakan ulang di layar mana pun.

📁 **`src/hooks/usePrograms.ts`**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPrograms, getProgramDetail, createDonation, type CreateDonationPayload } from '@/services/programService';
import { queryKeys } from '@/utils/queryKeys';
import { showToast } from '@/utils/toast';
import { getErrorMessage } from '@/utils/apiError';

// Hook untuk mendapatkan daftar program
export function usePrograms(filter: { categoryId?: number; search?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.programs.list(filter),
    queryFn: () => getPrograms(filter),
    staleTime: 1000 * 60 * 5, // 5 menit fresh (tidak refetch jika data masih baru)
  });
}

// Hook untuk mendapatkan detail program
export function useProgramDetail(id: string | number) {
  return useQuery({
    queryKey: queryKeys.programs.detail(id),
    queryFn: () => getProgramDetail(id),
    enabled: Boolean(id), // Jangan jalankan jika id kosong/undefined
  });
}

// Hook untuk mutasi pembuatan donasi
export function useCreateDonation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDonationPayload) => createDonation(payload),
    onSuccess: (data, variables) => {
      // Invalidate cache yang relevan agar data ter-refresh otomatis
      queryClient.invalidateQueries({ queryKey: queryKeys.programs.detail(variables.programId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      showToast('Donasi berhasil dibuat!');
    },
    onError: (error) => {
      showToast(getErrorMessage(error));
    },
  });
}
```

---

## 8. Layer 6: Form & Validasi (React Hook Form + Zod)

Integrasi Zod untuk validasi skema dan type inference otomatis, dipadukan dengan React Hook Form.

📁 **`src/schemas/donationSchema.ts`**
```typescript
import { z } from 'zod';

export const donationFormSchema = z.object({
  programId: z.string().min(1, 'Program ID wajib dipilih'),
  amount: z
    .number({ invalid_type_error: 'Nominal harus angka' })
    .min(10_000, 'Nominal donasi minimal Rp 10.000'),
  donorName: z
    .string()
    .min(3, 'Nama minimal 3 karakter')
    .max(50, 'Nama maksimal 50 karakter'),
  donorEmail: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  donorPhone: z
    .string()
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, 'Nomor WhatsApp tidak valid')
    .optional()
    .or(z.literal('')),
  isAnonymous: z.boolean().default(false),
});

// Otomatis mendapatkan TypeScript type dari schema
export type DonationFormData = z.infer<typeof donationFormSchema>;
```

---

## 9. Contoh Implementasi Lengkap (Recipes)

### Recipe A: Fetching Data & Pull-to-Refresh
Contoh menampilkan list program dengan status Loading, Error, Data, dan fitur tarik untuk me-refresh (Pull to Refresh).

```tsx
import React from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { usePrograms } from '@/hooks/usePrograms';

export function ProgramListScreen() {
  const { data: programs, isLoading, isError, error, refetch, isRefetching } = usePrograms();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="mt-2 text-gray-500">Memuat program...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500 font-semibold text-center mb-3">
          {error?.message || 'Gagal memuat data'}
        </Text>
        <TouchableOpacity onPress={() => refetch()} className="bg-emerald-600 px-4 py-2 rounded-lg">
          <Text className="text-white font-medium">Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={programs}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#10B981']} />
      }
      renderItem={({ item }) => (
        <View className="p-4 bg-white rounded-xl mb-3 shadow-sm border border-gray-100">
          <Text className="font-bold text-base text-gray-800">{item.title}</Text>
          <Text className="text-emerald-600 font-semibold mt-1">
            Terkumpul: Rp {item.collectedAmount.toLocaleString('id-ID')}
          </Text>
        </View>
      )}
      ListEmptyComponent={
        <Text className="text-center text-gray-400 mt-10">Belum ada program donasi.</Text>
      }
    />
  );
}
```

---

### Recipe B: Form Submit + Mutation
Kombinasi **React Hook Form + Zod + useMutation**.

```tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { donationFormSchema, type DonationFormData } from '@/schemas/donationSchema';
import { useCreateDonation } from '@/hooks/usePrograms';

export function DonationFormScreen({ programId }: { programId: string }) {
  const { mutate: submitDonation, isPending } = useCreateDonation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      programId,
      amount: 50_000,
      donorName: '',
      donorEmail: '',
      donorPhone: '',
      isAnonymous: false,
    },
  });

  const onSubmit = (formData: DonationFormData) => {
    submitDonation(formData, {
      onSuccess: (response) => {
        reset();
        // Arahkan ke screen pembayaran dengan response.paymentUrl / transactionId
      },
    });
  };

  return (
    <View className="p-4 bg-white rounded-2xl">
      {/* Field: Nama Lengkap */}
      <Text className="text-sm font-medium text-gray-700 mb-1">Nama Lengkap</Text>
      <Controller
        control={control}
        name="donorName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Contoh: Fulan"
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 mb-1"
          />
        )}
      />
      {errors.donorName && (
        <Text className="text-xs text-red-500 mb-3">{errors.donorName.message}</Text>
      )}

      {/* Field: Email */}
      <Text className="text-sm font-medium text-gray-700 mb-1">Alamat Email</Text>
      <Controller
        control={control}
        name="donorEmail"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="nama@email.com"
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 mb-1"
          />
        )}
      />
      {errors.donorEmail && (
        <Text className="text-xs text-red-500 mb-3">{errors.donorEmail.message}</Text>
      )}

      {/* Tombol Submit */}
      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
        className={`py-3.5 rounded-xl items-center justify-center mt-4 ${
          isPending ? 'bg-emerald-400' : 'bg-emerald-600'
        }`}
      >
        {isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-white font-bold text-base">Lanjutkan Pembayaran</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
```

---

### Recipe C: Infinite Scroll / Pagination
Untuk list panjang yang membutuhkan lazy load saat di-scroll ke bawah:

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { unwrapResponse } from '@/utils/apiError';
import { queryKeys } from '@/utils/queryKeys';
import type { ApiResponse } from '@/types/api';

export function useInfinitePrograms(search = '') {
  return useInfiniteQuery({
    queryKey: queryKeys.programs.list({ search }),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get<ApiResponse<{ items: any[]; hasMore: boolean }>>(
        '/programs',
        { params: { page: pageParam, limit: 10, search } }
      );
      return unwrapResponse(response.data);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
  });
}
```
**Di Komponen UI:**
```tsx
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePrograms();
const flatItems = data?.pages.flatMap((page) => page.items) ?? [];

<FlatList
  data={flatItems}
  keyExtractor={(item) => item.id}
  onEndReached={() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }}
  onEndReachedThreshold={0.5}
  ListFooterComponent={isFetchingNextPage ? <ActivityIndicator className="my-4" /> : null}
/>
```

---

### Recipe D: Optimistic Update (Respons Instan)
Untuk fitur seperti **Bookmark / Like / Checklist Amalan**, update UI secara instan sebelum server merespons, dan *rollback* jika request gagal:

```typescript
export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (surahNumber: number) => apiClient.post(`/quran/bookmark/${surahNumber}`),
    onMutate: async (surahNumber) => {
      // 1. Batalkan refetch yang sedang berjalan agar tidak menimpa state optimistik
      await queryClient.cancelQueries({ queryKey: queryKeys.quran.bookmarkStatus(surahNumber) });

      // 2. Simpan snapshot kondisi sebelumnya
      const previousStatus = queryClient.getQueryData<boolean>(
        queryKeys.quran.bookmarkStatus(surahNumber)
      );

      // 3. Update cache secara optimistik (langsung balikkan nilainya)
      queryClient.setQueryData(
        queryKeys.quran.bookmarkStatus(surahNumber),
        (old: boolean | undefined) => !old
      );

      // 4. Return context untuk rollback jika error
      return { previousStatus, surahNumber };
    },
    onError: (err, surahNumber, context) => {
      // Rollback ke status semula jika terjadi error di server
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(
          queryKeys.quran.bookmarkStatus(context.surahNumber),
          context.previousStatus
        );
      }
    },
    onSettled: (data, error, surahNumber) => {
      // Sinkronkan kembali dengan data backend asli
      queryClient.invalidateQueries({
        queryKey: queryKeys.quran.bookmarkStatus(surahNumber),
      });
    },
  });
}
```

---

### Recipe E: Integrasi Real Endpoint BeramalBersama (`GET /pages/home` + `X-Client-Key`)
Implementasi lengkap integrasi API nyata BeramalBersama yang membutuhkan header `X-Client-Key`:

#### 1. Header Requirement:
```bash
curl -X 'GET' \
  'https://aapi.beramalbersama.com/api/v1/pages/home' \
  -H 'accept: application/json' \
  -H 'X-Client-Key: VCe]=xm67-7,b].j8~m=K+cT463pMce7'
```

#### 2. Definisi Tipe Data (`src/types/home.ts`):
```typescript
import type { Category } from './category';
import type { Program } from './program';

export interface BannerSlide {
  image_url: string;
  link: string;
  is_new_tab: boolean;
}

export interface HomeBannerItem {
  name: string;
  image_url: string;
  link: string;
}

export interface ProjectItem {
  id: number;
  title: string;
  nominal_target: number;
  nominal_achieved: number;
  nominal_used: number;
  excecution_time: string;
  image: string;
  beneficiary: string;
  location: string;
  status: string;
  activity: string;
  mitra: {
    id: number;
    name: string;
    image: string;
    location: string;
  };
  description: string;
  reason: string | null;
}

export interface HomePageData {
  banner_slides: BannerSlide[];
  main_banner: HomeBannerItem;
  second_banner: HomeBannerItem;
  third_banner: HomeBannerItem;
  project_list: ProjectItem[];
  program_category: Category[];
  program_list: Program[];
  program_rutin: Program[];
  last_update?: Array<{
    id: number;
    feed_type: string;
    title: string;
    content: string;
    image: string;
    date: string;
  }>;
}
```

#### 3. Service Layer (`src/services/homeService.ts`):
```typescript
import { apiClient } from './apiClient';
import type { ApiResponse } from '@/types/api';
import type { HomePageData } from '@/types/home';

export async function getHomePage(): Promise<ApiResponse<HomePageData>> {
  const res = await apiClient.get<ApiResponse<HomePageData>>('/pages/home');
  return res.data;
}
```

#### 4. Custom Hook (`src/hooks/useHome.ts`):
```typescript
import { useQuery } from '@tanstack/react-query';
import { getHomePage } from '@/services/homeService';
import { unwrapResponse } from '@/utils/apiError';
import { queryKeys } from '@/utils/queryKeys';

export function useHome() {
  const query = useQuery({
    queryKey: queryKeys.home,
    queryFn: () => getHomePage().then(unwrapResponse),
    staleTime: 1000 * 60 * 5, // 5 menit fresh
  });

  return {
    homeData: query.data ?? null,
    bannerSlides: query.data?.banner_slides ?? [],
    mainBanner: query.data?.main_banner ?? null,
    secondBanner: query.data?.second_banner ?? null,
    thirdBanner: query.data?.third_banner ?? null,
    projectList: query.data?.project_list ?? [],
    categories: query.data?.program_category ?? [],
    programs: query.data?.program_list ?? [],
    programRutin: query.data?.program_rutin ?? [],
    isLoading: query.isPending,
    isRefreshing: query.isRefetching,
    refresh: () => query.refetch(),
  };
}
```

---

## 10. Best Practices & Aturan Emas


| Kategori | Rekomendasi Praktik Terbaik |
| :--- | :--- |
| **staleTime vs gcTime** | Atur `staleTime: 1000 * 60 * 5` (5 menit) pada data yang jarang berubah (profil, list kategori). TanStack Query tidak akan melakukan background refetch selama data masih fresh. |
| **Centralized Query Keys** | Selalu letakkan semua query keys di `src/utils/queryKeys.ts`. Jangan pernah mendefinisikan string literal manual di dalam komponen. |
| **Separation of Concerns** | Komponen UI tidak boleh tahu tentang Axios. Komponen hanya memanggil Custom Hook (`useQuery` / `useMutation`). |
| **Single Source of Truth** | Gunakan `unwrapResponse` di Service layer agar komponen selalu menerima typed data bersih (`T`), bukan wrapper `{ success, message, data }`. |
| **Mutation Invalidation** | Saat melakukan mutation (POST/PUT/DELETE), gunakan `queryClient.invalidateQueries()` dengan key yang tepat agar data di layar lain otomatis ter-update tanpa perlu reload aplikasi. |
| **Form Validation** | Selalu gunakan Zod schema untuk validasi input. Gunakan `z.infer<typeof schema>` untuk menghindari duplikasi interface TypeScript. |

---

*Panduan ini dirancang untuk memastikan kode tetap bersih, konsisten, mudah dibaca oleh tim, dan siap untuk produksi.*
