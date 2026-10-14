declare const process: {env: Record<string, string | undefined>};

export const ENV = {
  API_BASE_URL: process.env.API_BASE_URL ?? 'http://localhost:3000',
  APP_STORE_URL: process.env.APP_STORE_URL ?? '',
  PLAY_STORE_URL: process.env.PLAY_STORE_URL ?? '',
  WHATSAPP_CS_NUMBER: process.env.WHATSAPP_CS_NUMBER ?? '',
  TERMS_URL: process.env.TERMS_URL ?? '',
  PRIVACY_URL: process.env.PRIVACY_URL ?? '',
} as const;

// Saat true, `apiClient` (src/services/apiClient.ts) menjawab semua request
// dari fixture lokal di mobile/src/assets/json, tanpa jaringan sama sekali —
// dipakai supaya build APK tetap jalan tanpa backend/json-server. `.env`
// belum di-wire ke bundle JS (belum ada babel dotenv plugin), jadi ini
// sengaja literal boolean, bukan process.env — satu-satunya cara mengganti
// adalah edit baris ini. Set `false` + isi `API_BASE_URL` di atas saat
// backend asli sudah siap (kontrak endpoint & response harus sama persis,
// lihat docs/PRD_JSON.md).
export const USE_MOCK_DATA = true;
