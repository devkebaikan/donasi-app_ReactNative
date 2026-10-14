import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {
  Challenge,
  ChallengeProgress,
  ChallengeSummary,
  JuzReadingHistory,
  ProgressSummary,
  SavedSurah,
  Schedule,
  SchedulePayload,
  SurahReadingHistory,
} from '@/types/quran';

// Data per-pengguna menu Quran (challenge, riwayat bacaan, bookmark, jadwal).
// Teks mushaf TIDAK lewat sini — sumbernya JSON bundled offline, lihat
// docs/05-architecture/adr/ADR-003-quran-offline-data.md.

export interface CityLookupResult {
  city: string;
}

export interface JoinChallengeResult {
  challengeId: string;
  joinedAt: string; // ISO
}

export interface BookmarkStatus {
  surahNumber: number;
  isSaved: boolean;
}

export interface ReadingProgressPayload {
  surahNumber: number;
  ayahNumber: number;
  isCompleted: boolean; // true saat ayat terakhir surah terbaca
  readAt: string; // ISO
}

export async function getHighlightChallenges(): Promise<
  ApiResponse<ChallengeSummary[]>
> {
  const res = await apiClient.get<ApiResponse<ChallengeSummary[]>>(
    '/quran/challenges/highlight',
  );
  return res.data;
}

export async function getSurahReadingHistory(
  limit: number,
): Promise<ApiResponse<SurahReadingHistory[]>> {
  const res = await apiClient.get<ApiResponse<SurahReadingHistory[]>>(
    `/quran/reading-history?type=surah&limit=${limit}`,
  );
  return res.data;
}

export async function getJuzReadingHistory(
  limit: number,
): Promise<ApiResponse<JuzReadingHistory[]>> {
  const res = await apiClient.get<ApiResponse<JuzReadingHistory[]>>(
    `/quran/reading-history?type=juz&limit=${limit}`,
  );
  return res.data;
}

export async function getBookmarks(
  limit: number,
): Promise<ApiResponse<SavedSurah[]>> {
  const res = await apiClient.get<ApiResponse<SavedSurah[]>>(
    `/quran/bookmarks?limit=${limit}`,
  );
  return res.data;
}

export async function getSchedules(
  limit: number,
): Promise<ApiResponse<Schedule[]>> {
  const res = await apiClient.get<ApiResponse<Schedule[]>>(
    `/quran/schedules?limit=${limit}`,
  );
  return res.data;
}

// Koordinat ditukar jadi nama kota lewat backend, bukan lewat layanan
// geocoding pihak ketiga langsung dari app — supaya tidak ada API key yang
// ikut ke dalam bundle dan koordinat tidak pernah keluar ke pihak lain.
//
// Belum terpanggil selama getCurrentCoordinate() masih mengembalikan null
// (GPS ditunda, lihat ADR-004). Handler mock-nya sudah siap dipakai.
export async function getCityByCoordinate(
  latitude: number,
  longitude: number,
): Promise<ApiResponse<CityLookupResult>> {
  const res = await apiClient.get<ApiResponse<CityLookupResult>>(
    `/quran/location?lat=${latitude}&lng=${longitude}`,
  );
  return res.data;
}

export async function getBookmarkStatus(
  surahNumber: number,
): Promise<ApiResponse<BookmarkStatus>> {
  const res = await apiClient.get<ApiResponse<BookmarkStatus>>(
    `/quran/bookmarks?surahNumber=${surahNumber}`,
  );
  return res.data;
}

export async function addBookmark(
  surahNumber: number,
): Promise<ApiResponse<BookmarkStatus>> {
  const res = await apiClient.post<ApiResponse<BookmarkStatus>>(
    '/quran/bookmarks',
    {surahNumber},
  );
  return res.data;
}

export async function removeBookmark(
  surahNumber: number,
): Promise<ApiResponse<BookmarkStatus>> {
  const res = await apiClient.delete<ApiResponse<BookmarkStatus>>(
    `/quran/bookmarks/${surahNumber}`,
  );
  return res.data;
}

export async function syncReadingProgress(
  payload: ReadingProgressPayload,
): Promise<ApiResponse<null>> {
  const res = await apiClient.post<ApiResponse<null>>(
    '/quran/reading-progress',
    payload,
  );
  return res.data;
}

export async function getChallengeDetail(
  challengeId: string,
): Promise<ApiResponse<Challenge>> {
  const res = await apiClient.get<ApiResponse<Challenge>>(
    `/quran/challenges/${challengeId}`,
  );
  return res.data;
}

export async function joinChallenge(
  challengeId: string,
): Promise<ApiResponse<JoinChallengeResult>> {
  const res = await apiClient.post<ApiResponse<JoinChallengeResult>>(
    `/quran/challenges/${challengeId}/join`,
    {},
  );
  return res.data;
}

export async function getChallengeProgress(
  challengeId: string,
): Promise<ApiResponse<ChallengeProgress>> {
  const res = await apiClient.get<ApiResponse<ChallengeProgress>>(
    `/quran/challenges/${challengeId}/progress`,
  );
  return res.data;
}

export async function leaveChallenge(
  challengeId: string,
): Promise<ApiResponse<{challengeId: string}>> {
  const res = await apiClient.post<ApiResponse<{challengeId: string}>>(
    `/quran/challenges/${challengeId}/leave`,
    {},
  );
  return res.data;
}

export async function getProgressSummary(): Promise<
  ApiResponse<ProgressSummary>
> {
  const res = await apiClient.get<ApiResponse<ProgressSummary>>(
    '/quran/progress/summary',
  );
  return res.data;
}

export async function deleteSchedule(
  scheduleId: string,
): Promise<ApiResponse<{id: string}>> {
  const res = await apiClient.delete<ApiResponse<{id: string}>>(
    `/quran/schedules/${scheduleId}`,
  );
  return res.data;
}

export async function getScheduleDetail(
  scheduleId: string,
): Promise<ApiResponse<Schedule>> {
  const res = await apiClient.get<ApiResponse<Schedule>>(
    `/quran/schedules/${scheduleId}`,
  );
  return res.data;
}

export async function createSchedule(
  payload: SchedulePayload,
): Promise<ApiResponse<Schedule>> {
  const res = await apiClient.post<ApiResponse<Schedule>>(
    '/quran/schedules',
    payload,
  );
  return res.data;
}

export async function updateSchedule(
  scheduleId: string,
  payload: SchedulePayload,
): Promise<ApiResponse<Schedule>> {
  const res = await apiClient.put<ApiResponse<Schedule>>(
    `/quran/schedules/${scheduleId}`,
    payload,
  );
  return res.data;
}

export async function resetReadingProgress(): Promise<ApiResponse<null>> {
  const res = await apiClient.delete<ApiResponse<null>>('/quran/progress');
  return res.data;
}
