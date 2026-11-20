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
import {getSurahByNumber} from './quranContentService';
import quranFixture from '@/assets/json/quran.json';

export interface CityLookupResult {
  city: string;
}

export interface JoinChallengeResult {
  challengeId: string;
  joinedAt: string;
}

export interface BookmarkStatus {
  surahNumber: number;
  isSaved: boolean;
}

export interface ReadingProgressPayload {
  surahNumber: number;
  ayahNumber: number;
  isCompleted: boolean;
  readAt: string;
}

// Local cache
const localBookmarks = new Set<number>([1, 18, 36, 67]);
const joinedChallenges = new Set<string>(['chl-khatam-30', 'chl-juz-30']);

const localSurahHistory: SurahReadingHistory[] = [
  {
    surahNumber: 1,
    surahNameLatin: 'Al-Fatihah',
    surahNameArabic: 'الفاتحة',
    lastAyah: 7,
    totalAyah: 7,
    isCompleted: true,
    updatedAt: new Date().toISOString(),
  },
  {
    surahNumber: 18,
    surahNameLatin: 'Al-Kahf',
    surahNameArabic: 'الكهف',
    lastAyah: 45,
    totalAyah: 110,
    isCompleted: false,
    updatedAt: new Date().toISOString(),
  },
];

const localJuzHistory: JuzReadingHistory[] = [
  {
    juzNumber: 1,
    readAyahCount: 148,
    totalAyahCount: 148,
    percentage: 100,
    updatedAt: new Date().toISOString(),
  },
  {
    juzNumber: 30,
    readAyahCount: 200,
    totalAyahCount: 564,
    percentage: 35,
    updatedAt: new Date().toISOString(),
  },
];

let localSchedules: Schedule[] = [
  {
    id: 'sched-1',
    date: '2026-11-20',
    surahNumber: 18,
    surahNameLatin: 'Al-Kahf',
    targetAyah: 50,
    readAyah: 20,
    percentage: 40,
    status: 'BERJALAN',
    repeat: 'MINGGUAN',
    createdAt: '2026-11-19',
  },
];

export async function getHighlightChallenges(): Promise<
  ApiResponse<ChallengeSummary[]>
> {
  try {
    const res = await apiClient.get<ApiResponse<ChallengeSummary[]>>(
      '/quran/challenges/highlight',
    );
    if (res.data?.data && Array.isArray(res.data.data)) {
      return res.data;
    }
  } catch {
    // Safe fallback
  }

  const catalog = (quranFixture.challengeCatalog || []) as Array<{
    id: string;
    name: string;
    imageUrl: string;
  }>;

  const summaries: ChallengeSummary[] = catalog.slice(0, 3).map(c => ({
    id: c.id,
    name: c.name,
    imageUrl: c.imageUrl,
    isJoined: joinedChallenges.has(c.id),
    joinedDayCount: joinedChallenges.has(c.id) ? 12 : null,
    lastReadSurahName: 'Al-Baqarah',
    progressPercentage: joinedChallenges.has(c.id) ? 45 : 0,
  }));

  return {
    status: 200,
    success: true,
    message: 'OK',
    data: summaries,
  };
}

export async function getSurahReadingHistory(
  _limit: number,
): Promise<ApiResponse<SurahReadingHistory[]>> {
  try {
    const res = await apiClient.get<ApiResponse<SurahReadingHistory[]>>(
      `/quran/reading-history?type=surah&limit=${_limit}`,
    );
    if (res.data?.data && Array.isArray(res.data.data)) {
      return res.data;
    }
  } catch {
    // Safe fallback
  }

  return {
    status: 200,
    success: true,
    message: 'OK',
    data: localSurahHistory.slice(0, _limit),
  };
}

export async function getJuzReadingHistory(
  _limit: number,
): Promise<ApiResponse<JuzReadingHistory[]>> {
  try {
    const res = await apiClient.get<ApiResponse<JuzReadingHistory[]>>(
      `/quran/reading-history?type=juz&limit=${_limit}`,
    );
    if (res.data?.data && Array.isArray(res.data.data)) {
      return res.data;
    }
  } catch {
    // Safe fallback
  }

  return {
    status: 200,
    success: true,
    message: 'OK',
    data: localJuzHistory.slice(0, _limit),
  };
}

export async function getBookmarks(
  _limit: number,
): Promise<ApiResponse<SavedSurah[]>> {
  try {
    const res = await apiClient.get<ApiResponse<SavedSurah[]>>(
      `/quran/bookmarks?limit=${_limit}`,
    );
    if (res.data?.data && Array.isArray(res.data.data)) {
      return res.data;
    }
  } catch {
    // Safe fallback
  }

  const items: SavedSurah[] = Array.from(localBookmarks).map(num => {
    const meta = getSurahByNumber(num);
    return {
      surahNumber: num,
      surahNameLatin: meta?.nameLatin ?? `Surah ${num}`,
      surahNameArabic: meta?.nameArabic ?? '',
      totalAyah: meta?.totalAyah ?? 7,
      savedAt: new Date().toISOString(),
    };
  });

  return {
    status: 200,
    success: true,
    message: 'OK',
    data: items.slice(0, _limit),
  };
}

export async function getSchedules(
  _limit: number,
): Promise<ApiResponse<Schedule[]>> {
  try {
    const res = await apiClient.get<ApiResponse<Schedule[]>>(
      `/quran/schedules?limit=${_limit}`,
    );
    if (res.data?.data && Array.isArray(res.data.data)) {
      return res.data;
    }
  } catch {
    // Safe fallback
  }

  return {
    status: 200,
    success: true,
    message: 'OK',
    data: localSchedules.slice(0, _limit),
  };
}

export async function getCityByCoordinate(
  _latitude: number,
  _longitude: number,
): Promise<ApiResponse<CityLookupResult>> {
  return {
    status: 200,
    success: true,
    message: 'OK',
    data: {city: 'Jakarta Pusat'},
  };
}

export async function getBookmarkStatus(
  surahNumber: number,
): Promise<ApiResponse<BookmarkStatus>> {
  return {
    status: 200,
    success: true,
    message: 'OK',
    data: {
      surahNumber,
      isSaved: localBookmarks.has(surahNumber),
    },
  };
}

export async function addBookmark(
  surahNumber: number,
): Promise<ApiResponse<BookmarkStatus>> {
  localBookmarks.add(surahNumber);
  try {
    await apiClient.post('/quran/bookmarks', {surahNumber});
  } catch {
    // silent
  }
  return {
    status: 200,
    success: true,
    message: 'OK',
    data: {surahNumber, isSaved: true},
  };
}

export async function removeBookmark(
  surahNumber: number,
): Promise<ApiResponse<BookmarkStatus>> {
  localBookmarks.delete(surahNumber);
  try {
    await apiClient.delete(`/quran/bookmarks/${surahNumber}`);
  } catch {
    // silent
  }
  return {
    status: 200,
    success: true,
    message: 'OK',
    data: {surahNumber, isSaved: false},
  };
}

export async function syncReadingProgress(
  payload: ReadingProgressPayload,
): Promise<ApiResponse<null>> {
  const existing = localSurahHistory.find(s => s.surahNumber === payload.surahNumber);
  if (existing) {
    existing.lastAyah = payload.ayahNumber;
    existing.isCompleted = payload.isCompleted;
    existing.updatedAt = payload.readAt;
  } else {
    const meta = getSurahByNumber(payload.surahNumber);
    localSurahHistory.unshift({
      surahNumber: payload.surahNumber,
      surahNameLatin: meta?.nameLatin ?? `Surah ${payload.surahNumber}`,
      surahNameArabic: meta?.nameArabic ?? '',
      lastAyah: payload.ayahNumber,
      totalAyah: meta?.totalAyah ?? payload.ayahNumber,
      isCompleted: payload.isCompleted,
      updatedAt: payload.readAt,
    });
  }

  try {
    await apiClient.post('/quran/reading-progress', payload);
  } catch {
    // silent
  }
  return {status: 200, success: true, message: 'OK', data: null};
}

export async function getChallengeDetail(
  challengeId: string,
): Promise<ApiResponse<Challenge>> {
  try {
    const res = await apiClient.get<ApiResponse<Challenge>>(
      `/quran/challenges/${challengeId}`,
    );
    if (res.data?.data) {
      return res.data;
    }
  } catch {
    // Safe fallback
  }

  const catalog = (quranFixture.challengeCatalog || []) as Array<{
    id: string;
    name: string;
    imageUrl: string;
    descriptionHtml: string;
    participantCount: number;
    surahNumbers: number[];
  }>;
  const defaultFixture = {
    id: challengeId,
    name: 'Tantangan Mengaji Harian',
    imageUrl: 'https://don.aksiberbagi.com/images/challenge/khatam-30.webp',
    descriptionHtml: '<p>Tantangan mengaji harian.</p>',
    participantCount: 100,
    surahNumbers: [1, 2, 3],
  };
  const fixture = catalog.find(c => c.id === challengeId) ?? catalog[0] ?? defaultFixture;

  return {
    status: 200,
    success: true,
    message: 'OK',
    data: {
      id: fixture.id,
      name: fixture.name,
      imageUrl: fixture.imageUrl,
      descriptionHtml: fixture.descriptionHtml,
      participantCount: fixture.participantCount,
      startDate: '2026-11-01',
      endDate: '2026-11-30',
      surahNumbers: fixture.surahNumbers,
      isJoined: joinedChallenges.has(fixture.id),
      isEnded: false,
      joinedDayCount: joinedChallenges.has(fixture.id) ? 12 : null,
      lastReadSurahName: 'Al-Baqarah',
      progressPercentage: joinedChallenges.has(fixture.id) ? 45 : 0,
    },
  };
}

export async function joinChallenge(
  challengeId: string,
): Promise<ApiResponse<JoinChallengeResult>> {
  joinedChallenges.add(challengeId);
  try {
    await apiClient.post(`/quran/challenges/${challengeId}/join`);
  } catch {
    // Safe fallback
  }
  return {
    status: 200,
    success: true,
    message: 'OK',
    data: {
      challengeId,
      joinedAt: new Date().toISOString(),
    },
  };
}

export async function getChallengeProgress(
  challengeId: string,
): Promise<ApiResponse<ChallengeProgress>> {
  try {
    const res = await apiClient.get<ApiResponse<ChallengeProgress>>(
      `/quran/challenges/${challengeId}/progress`,
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
    data: {
      challengeId,
      name: 'Khatam 30 Hari',
      startDate: '2026-11-01',
      endDate: '2026-11-30',
      remainingDays: 18,
      isEnded: false,
      completedSurahCount: 14,
      totalSurahCount: 30,
      percentage: 45,
      surahs: [
        {
          surahNumber: 1,
          nameLatin: 'Al-Fatihah',
          totalAyah: 7,
          readAyah: 7,
          isCompleted: true,
        },
        {
          surahNumber: 2,
          nameLatin: 'Al-Baqarah',
          totalAyah: 286,
          readAyah: 150,
          isCompleted: false,
        },
      ],
    },
  };
}

export async function leaveChallenge(
  challengeId: string,
): Promise<ApiResponse<{challengeId: string}>> {
  joinedChallenges.delete(challengeId);
  try {
    await apiClient.post(`/quran/challenges/${challengeId}/leave`);
  } catch {
    // Safe fallback
  }
  return {
    status: 200,
    success: true,
    message: 'OK',
    data: {challengeId},
  };
}

export async function getProgressSummary(): Promise<
  ApiResponse<ProgressSummary>
> {
  return {
    status: 200,
    success: true,
    message: 'OK',
    data: {
      completedSurahCount: localSurahHistory.filter(s => s.isCompleted).length,
      completedJuzCount: localJuzHistory.filter(j => j.percentage >= 100).length,
      savedSurahCount: localBookmarks.size,
      activeScheduleCount: localSchedules.filter(s => s.status !== 'SELESAI').length,
    },
  };
}

export async function deleteSchedule(
  scheduleId: string,
): Promise<ApiResponse<{id: string}>> {
  localSchedules = localSchedules.filter(s => s.id !== scheduleId);
  try {
    await apiClient.delete(`/quran/schedules/${scheduleId}`);
  } catch {
    // Safe fallback
  }
  return {status: 200, success: true, message: 'OK', data: {id: scheduleId}};
}

export async function getScheduleDetail(
  scheduleId: string,
): Promise<ApiResponse<Schedule>> {
  const found = localSchedules.find(s => s.id === scheduleId);
  return {
    status: 200,
    success: true,
    message: 'OK',
    data: found ?? {
      id: scheduleId,
      date: '2026-11-20',
      surahNumber: 1,
      surahNameLatin: 'Al-Fatihah',
      targetAyah: 7,
      readAyah: 0,
      percentage: 0,
      status: 'DIJADWALKAN',
      repeat: 'HARIAN',
      createdAt: '2026-11-19',
    },
  };
}

export async function createSchedule(
  payload: SchedulePayload,
): Promise<ApiResponse<Schedule>> {
  const meta = getSurahByNumber(payload.surahNumber);
  const newSched: Schedule = {
    id: `sched-${Date.now()}`,
    date: payload.date,
    surahNumber: payload.surahNumber,
    surahNameLatin: meta?.nameLatin ?? `Surah ${payload.surahNumber}`,
    targetAyah: payload.targetAyah,
    readAyah: 0,
    percentage: 0,
    status: 'DIJADWALKAN',
    repeat: payload.repeat,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  localSchedules.push(newSched);
  try {
    await apiClient.post('/quran/schedules', payload);
  } catch {
    // Safe fallback
  }
  return {status: 200, success: true, message: 'OK', data: newSched};
}

export async function updateSchedule(
  scheduleId: string,
  payload: SchedulePayload,
): Promise<ApiResponse<Schedule>> {
  const meta = getSurahByNumber(payload.surahNumber);
  const idx = localSchedules.findIndex(s => s.id === scheduleId);
  const existing = idx >= 0 ? localSchedules[idx] : undefined;
  const updated: Schedule = {
    id: scheduleId,
    date: payload.date,
    surahNumber: payload.surahNumber,
    surahNameLatin: meta?.nameLatin ?? `Surah ${payload.surahNumber}`,
    targetAyah: payload.targetAyah,
    readAyah: existing ? existing.readAyah : 0,
    percentage: existing ? existing.percentage : 0,
    status: existing ? existing.status : 'DIJADWALKAN',
    repeat: payload.repeat,
    createdAt: existing ? existing.createdAt : new Date().toISOString().slice(0, 10),
  };
  if (idx >= 0) {
    localSchedules[idx] = updated;
  }
  try {
    await apiClient.put(`/quran/schedules/${scheduleId}`, payload);
  } catch {
    // Safe fallback
  }
  return {status: 200, success: true, message: 'OK', data: updated};
}

export async function resetReadingProgress(): Promise<ApiResponse<null>> {
  localSurahHistory.length = 0;
  localJuzHistory.length = 0;
  try {
    await apiClient.delete('/quran/progress');
  } catch {
    // Safe fallback
  }
  return {status: 200, success: true, message: 'OK', data: null};
}
