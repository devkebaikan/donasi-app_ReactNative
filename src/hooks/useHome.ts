import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getHomePage } from '@/services/homeService';
import { unwrapResponse } from '@/utils/apiError';
import { queryKeys } from '@/utils/queryKeys';
import { showToast } from '@/utils/toast';
import { getHijriDateLabel } from '@/utils/hijriDate';
import type { Banner } from '@/types/banner';
import type { Category } from '@/types/category';
import type { Program } from '@/types/program';
import type { PrayerTime } from '@/types/prayerTime';
import type { Promo } from '@/types/promo';
import type { DonasiRutinCalendarData, ProgramTheme } from '@/services/homeService';

const LAST_POPUP_DATE_KEY = '@amalsholeh:lastPopupDate';

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

type MenuUtama = {
  id: number;
  name: string;
  image_url: string;
  screen: string;
  is_new?: boolean;
};

type State = {
  banners: Banner[];
  mainBanner: { id: string; image_url: string; programId: number } | null;
  secondBanner: { id: string; image_url: string; programId: number } | null;
  menuUtama: MenuUtama[];
  donasiRutinCalendar: DonasiRutinCalendarData | null;
  programTheme1: ProgramTheme | null;
  programTheme2: ProgramTheme | null;
  programMendesak: ProgramTheme | null;
  categories: Category[];
  programs: Program[];
  balance: number;
  nextPrayerTime: PrayerTime | null;
  hijriDate: string;
  popupPromo: Promo[] | null;
  isPopupVisible: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
};

type Actions = {
  refresh: () => Promise<void>;
  closePopup: () => Promise<void>;
};

export function useHome(): State & Actions {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const query = useQuery({
    queryKey: queryKeys.home,
    queryFn: () => getHomePage().then(unwrapResponse),
  });

  // Munculin popup promo maksimal 1x per hari — dicek ulang tiap kali fetch
  // home page berhasil (bukan tiap render). React Query structural-sharing
  // bikin `query.data` referensinya tetap sama kalau hasil fetch background
  // (stale-while-revalidate) isinya identik, jadi effect ini tidak
  // nge-trigger ulang popup di silent refetch selama datanya tidak berubah.
  useEffect(() => {
    if (!query.data?.popup_promo) {
      return;
    }
    let isActive = true;
    AsyncStorage.getItem(LAST_POPUP_DATE_KEY).then(lastShownDate => {
      if (isActive && lastShownDate !== getTodayDateString()) {
        setIsPopupVisible(true);
      }
    });
    return () => {
      isActive = false;
    };
  }, [query.data]);

  async function refresh(): Promise<void> {
    await query.refetch();
  }

  async function closePopup(): Promise<void> {
    setIsPopupVisible(false);
    try {
      await AsyncStorage.setItem(LAST_POPUP_DATE_KEY, getTodayDateString());
    } catch {
      showToast('Tidak dapat terhubung.');
    }
  }

  return {
    banners: query.data?.home_banner ?? [],
    mainBanner: query.data?.main_banner ?? null,
    secondBanner: query.data?.second_banner ?? null,
    menuUtama: query.data?.menu_utama ?? [],
    donasiRutinCalendar: query.data?.kalender_donasi_rutin ?? null,
    programTheme1: query.data?.program_tema_1 ?? null,
    programTheme2: query.data?.program_tema_2 ?? null,
    programMendesak: query.data?.program_mendesak ?? null,
    categories: query.data?.program_category ?? [],
    programs: query.data?.program_list ?? [],
    balance: query.data?.wallet_balance ?? 0,
    nextPrayerTime: query.data?.next_prayer_time ?? null,
    hijriDate: getHijriDateLabel(),
    popupPromo: query.data?.popup_promo ?? null,
    isPopupVisible,
    isLoading: query.isPending,
    isRefreshing: query.isRefetching,
    refresh,
    closePopup,
  };
}
