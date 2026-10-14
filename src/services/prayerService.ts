import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {
  CalculationMethod,
  HighLatitudeRule,
  JuristicMethod,
  PrayerLocation,
  PrayerOptions,
  PrayerSchedule,
} from '@/types/prayerTime';

// Jadwal sholat selalu datang dari endpoint, tidak pernah dihitung di layar —
// lihat docs/05-architecture/adr/ADR-006-prayer-time-calculation.md.
export interface PrayerScheduleParams {
  lat: number;
  lng: number;
  date: string; // ISO date-only
  method: CalculationMethod;
  juristic: JuristicMethod;
  highLat: HighLatitudeRule;
  imsak: number; // menit sebelum subuh
  ihtiyat: string; // "2,3,2,2,2" urut subuh,dzuhur,ashar,maghrib,isya
  hijriOffset: number; // hari
}

export async function getPrayerSchedule(
  params: PrayerScheduleParams,
): Promise<ApiResponse<PrayerSchedule>> {
  const query = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
    date: params.date,
    method: params.method,
    juristic: params.juristic,
    highLat: params.highLat,
    imsak: String(params.imsak),
    ihtiyat: params.ihtiyat,
    hijriOffset: String(params.hijriOffset),
  }).toString();

  const res = await apiClient.get<ApiResponse<PrayerSchedule>>(
    `/prayer-times?${query}`,
  );
  return res.data;
}

export async function getNearestLocation(
  latitude: number,
  longitude: number,
): Promise<ApiResponse<PrayerLocation>> {
  const res = await apiClient.get<ApiResponse<PrayerLocation>>(
    `/locations/nearest?lat=${latitude}&lng=${longitude}`,
  );
  return res.data;
}

export async function getPrayerOptions(): Promise<ApiResponse<PrayerOptions>> {
  const res = await apiClient.get<ApiResponse<PrayerOptions>>(
    '/prayer-times/options',
  );
  return res.data;
}

export async function searchLocations(
  keyword: string,
): Promise<ApiResponse<PrayerLocation[]>> {
  const res = await apiClient.get<ApiResponse<PrayerLocation[]>>(
    `/locations?q=${encodeURIComponent(keyword)}`,
  );
  return res.data;
}
