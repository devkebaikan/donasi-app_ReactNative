import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useHome } from '@/hooks/useHome';
import { useAuthStore } from '@/stores/authStore';
import { useHomeBackground } from '@/hooks/useHomeBackground';
import { HomeHeader } from '@/components/shared/HomeHeader';
import { HomeBanner } from '@/components/shared/HomeBanner';
import { SaldoCard } from '@/components/shared/SaldoCard';
import { MenuUtamaGrid } from '@/components/shared/MenuUtamaGrid';
import { MenuUtamaBottomSheet } from '@/components/shared/MenuUtamaBottomSheet';
import { MainBanner } from '@/components/shared/MainBanner';
import { ProgramSection } from '@/components/shared/ProgramSection';
import { ProjectListSection } from '@/components/shared/ProjectListSection';
import { SliderBanner } from '@/components/shared/SliderBanner';
import { ProgramListSection } from '@/components/shared/ProgramListSection';
import { DonorNotifSection } from '@/components/shared/DonorNotifSection';
import { openExternalUrl } from '@/utils/openExternalUrl';
import { showToast } from '@/utils/toast';
import { colors } from '@/theme';
import type { HomeNavigationProp } from '@/types/navigation';
import type { Program } from '@/types/program';
import type { ProjectItem } from '@/types/home';

function showComingSoon(): void {
  showToast('Segera hadir');
}

export default function HomeScreen(): React.JSX.Element {
  const navigation = useNavigation<HomeNavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const menuSheetRef = useRef<BottomSheetModal>(null);
  const accessToken = useAuthStore(s => s.accessToken);
  const isAuthenticated = accessToken != null;
  const [displayCategoryId, setDisplayCategoryId] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const {
    homeData,
    banners,
    mainBanner,
    secondBanner,
    thirdBanner,
    bannerSlides,
    menuUtama,
    projectList,
    programRutin,
    categories,
    programs,
    balance,
    isLoading,
    isRefreshing,
    isError,
    error,
    refresh,
  } = useHome();

  const { Component: BackgroundComponent } = useHomeBackground();

  function handlePressSeeMorePrograms(): void {
    navigation.navigate('Donations');
  }

  function handlePressSaldoAction(): void {
    if (!isAuthenticated) {
      navigation.navigate('Login');
    } else {
      navigation.navigate('Topup', { redirectAfter: 'home' });
    }
  }

  function handlePressSearch(): void {
    navigation.navigate('Search');
  }

  function handleSelectCategory(categoryId: number | null): void {
    setDisplayCategoryId(categoryId);
  }

  function handlePressProgram(program: Program): void {
    const targetLink = program.link || String(program.id);
    if (!targetLink) return;
    navigation.navigate('DetailProgram', {
      link: targetLink,
    });
  }

  function handlePressProject(project: ProjectItem): void {
    navigation.navigate('DetailProjectSalur', { projectSalurId: String(project.id) });
  }

  function handlePressBanner(target?: number | string): void {
    if (!target) return;
    if (typeof target === 'string' && /^https?:\/\//i.test(target)) {
      openExternalUrl(target);
      return;
    }
    const cleanSlug = typeof target === 'string'
      ? target.replace(/^https?:\/\/[^/]+\/(?:donasi\/)?/i, '').replace(/^\/+/, '')
      : String(target);

    if (cleanSlug) {
      navigation.navigate('DetailProgram', {
        link: cleanSlug,
      });
    }
  }

  function handlePressMenuUtama(screen: string): void {
    if (screen === 'Donations') {
      navigation.navigate('Donations');
    } else if (screen === 'RecurringDonation') {
      navigation.navigate('RecurringDonation');
    } else if (screen === 'Zakat') {
      navigation.navigate('Zakat');
    } else if (screen === 'Infak') {
      navigation.navigate('Infak');
    } else {
      showComingSoon();
    }
  }

  function handlePressMoreMenu(): void {
    menuSheetRef.current?.present();
  }

  function handleSelectMenuFromSheet(screen: string): void {
    menuSheetRef.current?.dismiss();
    handlePressMenuUtama(screen);
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>): void {
    const scrolled = event.nativeEvent.contentOffset.y > 20;
    setIsScrolled(prev => (prev !== scrolled ? scrolled : prev));
  }

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Dynamic Background Component */}
      {/* <View pointerEvents="none">
        <BackgroundComponent>
          <View className="absolute top-0 left-0 right-0 h-72 z-0" />
        </BackgroundComponent>
      </View> */}

      {/* Menu Utama Bottom Sheet Modal (jika menu > 4) */}
      <MenuUtamaBottomSheet
        ref={menuSheetRef}
        items={menuUtama}
        onSelectItem={handleSelectMenuFromSheet}
      />

      {/* Header Sticky */}
      <HomeHeader
        onPressSearch={handlePressSearch}
        onPressLogin={() => navigation.navigate('Login')}
        onPressAbout={() => navigation.navigate('About')}
        onPressWebView={params => navigation.navigate('WebView', params)}
        isScrolled={isScrolled}
      />


      {isLoading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : isError && !homeData ? (
        <View className="flex-1 items-center justify-center p-6 py-20">
          <Text className="text-sm text-neutral-600 text-center mb-4 leading-relaxed">
            {error?.message || 'Gagal memuat data Beranda.'}
          </Text>
          <TouchableOpacity
            onPress={() => refresh()}
            className="bg-primary-500 px-5 py-2.5 rounded-xl shadow-sm"
            activeOpacity={0.85}>
            <Text className="text-white font-semibold text-sm">
              Coba Lagi
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          contentContainerClassName="pb-12"
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              colors={[colors.primary[500]]}
              tintColor={colors.primary[500]}
            />
          }
          className="flex-1 z-10">
          {/* 1. Hero Banner Slider */}
          <HomeBanner
            mainBanner={homeData?.main_banner}
            banners={banners}
            onPressBanner={handlePressBanner}
          />

          {/* 2. Floating Saldo Saku Kebaikan Card */}
          <SaldoCard
            balance={balance}
            isAuthenticated={isAuthenticated}
            onPressAction={handlePressSaldoAction}
          />

          {/* 3. 4 Menu Utama (Donasi, Infak, Zakat, Rutin) */}
          <View className="bg-white">
            <MenuUtamaGrid
              items={menuUtama}
              onPressItem={handlePressMenuUtama}
              onPressMore={handlePressMoreMenu}
            />
          </View>

          <View className="h-2 bg-neutral-100" />

          {/* 4. Second Banner (Promotional Banner 1) */}
          {Boolean(secondBanner?.image_url) && (
            <>
              <View className="bg-white">
                <MainBanner
                  imageUrl={secondBanner?.image_url}
                  link={secondBanner?.link}
                  onPress={handlePressBanner}
                />
              </View>
              <View className="h-2 bg-neutral-100" />
            </>
          )}

          {/* 5. Program Pilihan (#BersamaJadiMudah) */}
          <ProgramSection
            programs={programs}
            onPressProgram={handlePressProgram}
          />

          <View className="h-2 bg-neutral-100" />

          {/* 6. Third Banner (Promotional Banner 2) */}
          {Boolean(thirdBanner?.image_url) && (
            <>
              <View className="bg-white">
                <MainBanner
                  imageUrl={thirdBanner?.image_url}
                  link={thirdBanner?.link}
                  onPress={handlePressBanner}
                />
              </View>
              <View className="h-2 bg-neutral-100" />
            </>
          )}

          {/* 7. Laporan Proyek Penyaluran (#BergerakBeramalBersama) */}
          {/* <ProjectListSection
            projectList={projectList}
            onPressProject={handlePressProject}
          /> */}

          <View className="h-2 bg-neutral-100" />

          {/* 8. Secondary Banner Slider (SliderBanner) */}
          {bannerSlides.length > 0 && (
            <>
              <SliderBanner
                bannerSlides={bannerSlides}
                onPressBanner={handlePressBanner}
              />
              <View className="h-2 bg-neutral-100" />
            </>
          )}

          {/* 9. Program Rutin & Kategori (Pilih Program Favoritmu) */}
          <View className="bg-white">
            <ProgramListSection
              programs={programRutin.length > 0 ? programRutin : programs}
              categories={categories}
              selectedCategoryId={displayCategoryId}
              onSelectCategory={handleSelectCategory}
              onPressProgram={handlePressProgram}
              onPressSeeMore={handlePressSeeMorePrograms}
            />
          </View>
        </ScrollView>
        // <View>
        //   <Text>Home Screen</Text>
        // </View>
      )}

      {/* 10. Live Floating Donor Ticker */}
      {/* <DonorNotifSection /> */}
    </View>
  );
}
