declare const process: {env: Record<string, string | undefined>};

export const ENV = {
  API_BASE_URL: process.env.API_BASE_URL ?? 'https://aapi.beramalbersama.com/api/v1',
  CLIENT_KEY: process.env.CLIENT_KEY ?? 'VCe]=xm67-7,b].j8~m=K+cT463pMce7',
  APP_STORE_URL: process.env.APP_STORE_URL ?? '',
  PLAY_STORE_URL: process.env.PLAY_STORE_URL ?? '',
  WHATSAPP_CS_NUMBER: process.env.WHATSAPP_CS_NUMBER ?? '',
  TERMS_URL: process.env.TERMS_URL ?? '',
  PRIVACY_URL: process.env.PRIVACY_URL ?? '',
} as const;

// Saat true, `apiClient` (src/services/apiClient.ts) menjawab semua request
// dari fixture lokal di mobile/src/assets/json. Diatur false untuk terhubung
// langsung ke backend live API.
export const USE_MOCK_DATA = false;

