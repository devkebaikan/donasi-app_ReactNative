import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getHomePage, getWalletBalance } from '@/services/homeService';
import { unwrapResponse } from '@/utils/apiError';
import { queryKeys } from '@/utils/queryKeys';
import { showToast } from '@/utils/toast';
import { getHijriDateLabel } from '@/utils/hijriDate';
import { useAuthStore } from '@/stores/authStore';
import type { Banner } from '@/types/banner';
import type { Category } from '@/types/category';
import type { Program } from '@/types/program';
import type { PrayerTime } from '@/types/prayerTime';
import type { Promo } from '@/types/promo';
import type { DonasiRutinCalendarData, ProgramTheme } from '@/services/homeService';
import type {
  HomePageData,
  BannerSlide,
  ProjectItem,
  HomeLastUpdate,
} from '@/types/home';

const LAST_POPUP_DATE_KEY = '@amalsholeh:lastPopupDate';

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export type MenuUtama = {
  id: number;
  name: string;
  image_url: string;
  screen: string;
  is_new?: boolean;
};

const DEFAULT_MENU_UTAMA: MenuUtama[] = [
  { id: 1, name: 'Donasi', image_url: '', screen: 'Donations' },
  { id: 2, name: 'Infak', image_url: '', screen: 'Infak' },
  { id: 3, name: 'Zakat', image_url: '', screen: 'Zakat' },
  { id: 4, name: 'Rutin', image_url: '', screen: 'RecurringDonation', is_new: true },
];

export type HomeBannerDisplay = {
  id: string;
  name?: string;
  image_url: string;
  link?: string;
  programId?: number;
};

type State = {
  homeData: HomePageData | null;
  bannerSlides: BannerSlide[];
  mainBanner: HomeBannerDisplay | null;
  secondBanner: HomeBannerDisplay | null;
  thirdBanner: HomeBannerDisplay | null;
  projectList: ProjectItem[];
  programRutin: Program[];
  lastUpdate: HomeLastUpdate[];

  banners: Banner[];
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
  isError: boolean;
  error: Error | null;
};

type Actions = {
  refresh: () => Promise<void>;
  closePopup: () => Promise<void>;
};

export function useHome(): State & Actions {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const accessToken = useAuthStore(s => s.accessToken);
  const isAuthenticated = accessToken != null;

  const query = useQuery({
    queryKey: queryKeys.home,
    queryFn: () => getHomePage().then(unwrapResponse),
  });

  const walletQuery = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: () => getWalletBalance().then(unwrapResponse),
    enabled: isAuthenticated,
  });

  const mainBannerData = query.data?.main_banner;
  const bannerSlides = query.data?.banner_slides ?? [];

  // Banner slider teratas: main_banner + banner_slides
  const banners: Banner[] = [];
  if (mainBannerData?.image_url) {
    banners.push({
      id: 'main-banner',
      imageUrl: mainBannerData.image_url,
      title: mainBannerData.name || 'Main Banner',
      link: mainBannerData.link,
    });
  }
  bannerSlides.forEach((slide, index) => {
    banners.push({
      id: `slide-${index + 1}`,
      imageUrl: slide.image_url,
      title: slide.link,
      link: slide.link,
    });
  });

  const mainBanner: HomeBannerDisplay | null = mainBannerData
    ? {
        id: 'main-1',
        name: mainBannerData.name,
        image_url: mainBannerData.image_url,
        link: mainBannerData.link,
      }
    : null;

  const secondBanner: HomeBannerDisplay | null = query.data?.second_banner
    ? {
        id: 'second-1',
        name: query.data.second_banner.name,
        image_url: query.data.second_banner.image_url,
        link: query.data.second_banner.link,
      }
    : null;

  const thirdBanner: HomeBannerDisplay | null = query.data?.third_banner
    ? {
        id: 'third-1',
        name: query.data.third_banner.name,
        image_url: query.data.third_banner.image_url,
        link: query.data.third_banner.link,
      }
    : null;

  async function refresh(): Promise<void> {
    await Promise.all([
      query.refetch(),
      isAuthenticated ? walletQuery.refetch() : Promise.resolve(),
    ]);
  }

  async function closePopup(): Promise<void> {
    setIsPopupVisible(false);
    try {
      await AsyncStorage.setItem(LAST_POPUP_DATE_KEY, getTodayDateString());
    } catch {
      showToast('Tidak dapat terhubung.');
    }
  }

  const balance = isAuthenticated ? (walletQuery.data ?? 0) : 0;

  return {
    homeData: query.data ?? null,
    bannerSlides,
    mainBanner,
    secondBanner,
    thirdBanner,
    projectList: query.data?.project_list ?? [],
    programRutin: query.data?.program_rutin ?? [],
    lastUpdate: query.data?.last_update ?? [],

    banners,
    menuUtama: DEFAULT_MENU_UTAMA,
    donasiRutinCalendar: null,
    programTheme1: null,
    programTheme2: null,
    programMendesak: null,
    categories: query.data?.program_category ?? [],
    programs: query.data?.program_list ?? [],
    balance,
    nextPrayerTime: null,
    hijriDate: getHijriDateLabel(),
    popupPromo: null,
    isPopupVisible,
    isLoading: query.isPending,
    isRefreshing: query.isRefetching,
    isError: query.isError,
    error: (query.error as Error) ?? null,
    refresh,
    closePopup,
  };
}
