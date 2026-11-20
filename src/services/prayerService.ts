import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {
  CalculationMethod,
  HighLatitudeRule,
  JuristicMethod,
  PrayerLocation,
  PrayerName,
  PrayerOptions,
  PrayerSchedule,
  PrayerTimeItem,
} from '@/types/prayerTime';
import {FALLBACK_PRAYER_OPTIONS} from '@/utils/prayerOptions';
import prayerFixture from '@/assets/json/prayer-times.json';
import locationsFixture from '@/assets/json/locations.json';

export interface PrayerScheduleParams {
  lat: number;
  lng: number;
  date: string;
  method: CalculationMethod;
  juristic: JuristicMethod;
  highLat: HighLatitudeRule;
  imsak: number;
  ihtiyat: string;
  hijriOffset: number;
}

type BaseTimeKey = Exclude<PrayerName, 'IMSAK'>;

const PRAYER_LABELS: Record<PrayerName, string> = {
  IMSAK: 'Imsak',
  SUBUH: 'Subuh',
  TERBIT: 'Terbit',
  DZUHUR: 'Dzuhur',
  ASHAR: 'Ashar',
  MAGHRIB: 'Maghrib',
  ISYA: 'Isya',
};

const NON_PRAYER_KEYS: PrayerName[] = ['IMSAK', 'TERBIT'];

function timeToMinutes(time: string): number {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

function minutesToTime(totalMinutes: number): string {
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = String(Math.floor(wrapped / 60)).padStart(2, '0');
  const minutes = String(wrapped % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function parseIhtiyat(raw: string): Record<BaseTimeKey, number> {
  const parts = (raw || '2,3,2,2,2').split(',').map(value => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  });
  return {
    SUBUH: parts[0] ?? 2,
    TERBIT: 0,
    DZUHUR: parts[1] ?? 3,
    ASHAR: parts[2] ?? 2,
    MAGHRIB: parts[3] ?? 2,
    ISYA: parts[4] ?? 2,
  };
}

function resolveLocation(lat: number, lng: number): PrayerLocation {
  const locs = locationsFixture as PrayerLocation[];
  let nearest: PrayerLocation = locs[0] ?? {
    id: 'jakarta',
    name: 'DKI Jakarta',
    latitude: -6.2088,
    longitude: 106.8456,
    timezone: 'Asia/Jakarta',
  };
  let minDistance = Number.POSITIVE_INFINITY;

  for (const loc of locs) {
    const dist = Math.abs(loc.latitude - lat) + Math.abs(loc.longitude - lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = loc;
    }
  }

  return nearest;
}

function calculateScheduleTimes(
  locationId: string,
  ihtiyatRaw: string,
  imsakOffsetMinutes: number,
): PrayerTimeItem[] {
  const baseTimes = prayerFixture.baseTimes as Record<
    string,
    Record<BaseTimeKey, string>
  >;
  const base =
    baseTimes[locationId] ?? baseTimes[prayerFixture.defaultLocationId] ?? {
      SUBUH: '04:39',
      TERBIT: '06:03',
      DZUHUR: '11:55',
      ASHAR: '15:17',
      MAGHRIB: '17:48',
      ISYA: '19:03',
    };

  const ihtiyat = parseIhtiyat(ihtiyatRaw);
  const subuhMins = timeToMinutes(base.SUBUH) + ihtiyat.SUBUH;
  const imsakMins = subuhMins - (imsakOffsetMinutes || 10);

  const ordered: [PrayerName, number][] = [
    ['IMSAK', imsakMins],
    ['SUBUH', subuhMins],
    ['TERBIT', timeToMinutes(base.TERBIT)],
    ['DZUHUR', timeToMinutes(base.DZUHUR) + ihtiyat.DZUHUR],
    ['ASHAR', timeToMinutes(base.ASHAR) + ihtiyat.ASHAR],
    ['MAGHRIB', timeToMinutes(base.MAGHRIB) + ihtiyat.MAGHRIB],
    ['ISYA', timeToMinutes(base.ISYA) + ihtiyat.ISYA],
  ];

  return ordered.map(([key, mins]) => ({
    key,
    label: PRAYER_LABELS[key],
    time: minutesToTime(mins),
    isPrayer: !NON_PRAYER_KEYS.includes(key),
  }));
}

export async function getPrayerSchedule(
  params: PrayerScheduleParams,
): Promise<ApiResponse<PrayerSchedule>> {
  try {
    const query = [
      `lat=${encodeURIComponent(String(params.lat))}`,
      `lng=${encodeURIComponent(String(params.lng))}`,
      `date=${encodeURIComponent(params.date)}`,
      `method=${encodeURIComponent(params.method)}`,
      `juristic=${encodeURIComponent(params.juristic)}`,
      `highLat=${encodeURIComponent(params.highLat)}`,
      `imsak=${encodeURIComponent(String(params.imsak))}`,
      `ihtiyat=${encodeURIComponent(params.ihtiyat)}`,
      `hijriOffset=${encodeURIComponent(String(params.hijriOffset))}`,
    ].join('&');

    const res = await apiClient.get<ApiResponse<PrayerSchedule>>(
      `/prayer-times?${query}`,
    );
    if (res.data?.data) {
      return res.data;
    }
  } catch {
    // Fallback defensif
  }

  const location = resolveLocation(params.lat, params.lng);
  const times = calculateScheduleTimes(location.id, params.ihtiyat, params.imsak);

  return {
    status: 200,
    success: true,
    message: 'OK',
    data: {
      date: params.date,
      dateLabel: params.date,
      hijriLabel: '10 Jumadil Awwal 1448 H',
      location,
      times,
    },
  };
}

export async function getNearestLocation(
  latitude: number,
  longitude: number,
): Promise<ApiResponse<PrayerLocation>> {
  try {
    const res = await apiClient.get<ApiResponse<PrayerLocation>>(
      `/locations/nearest?lat=${latitude}&lng=${longitude}`,
    );
    if (res.data?.data) {
      return res.data;
    }
  } catch {
    // Safe fallback
  }

  return {
    status: 200,
    success: true,
    message: 'OK',
    data: resolveLocation(latitude, longitude),
  };
}

export async function getPrayerOptions(): Promise<ApiResponse<PrayerOptions>> {
  try {
    const res = await apiClient.get<ApiResponse<PrayerOptions>>(
      '/prayer-times/options',
    );
    if (res.data?.data) {
      return res.data;
    }
  } catch {
    // Safe fallback
  }

  return {
    status: 200,
    success: true,
    message: 'OK',
    data: FALLBACK_PRAYER_OPTIONS,
  };
}

export async function searchLocations(
  keyword: string,
): Promise<ApiResponse<PrayerLocation[]>> {
  try {
    const res = await apiClient.get<ApiResponse<PrayerLocation[]>>(
      `/locations?q=${encodeURIComponent(keyword)}`,
    );
    if (Array.isArray(res.data?.data)) {
      return res.data;
    }
  } catch {
    // Safe fallback
  }

  const locs = locationsFixture as PrayerLocation[];
  const query = (keyword || '').trim().toLowerCase();
  const filtered = query
    ? locs.filter(c => c.name.toLowerCase().includes(query))
    : locs;

  return {
    status: 200,
    success: true,
    message: 'OK',
    data: filtered,
  };
}
