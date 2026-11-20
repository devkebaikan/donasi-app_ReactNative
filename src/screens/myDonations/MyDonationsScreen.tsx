import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {AltArrowRight} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {MyDonationsTopBar} from '@/components/shared/MyDonationsTopBar';
import {KalenderDonasi} from '@/components/shared/KalenderDonasi';
import {useAuthStore} from '@/stores/authStore';
import {colors} from '@/theme';
import type {MainTabNavigationProp, RootStackNavigationProp} from '@/types/navigation';

const MENUNJUKKAN_STATUS_ITEMS = [
  {
    label: 'Menunggu Pembayaran',
    posisi: 'menunggu-pembayaran',
    image: require('@/assets/images/lacak/menunggu-pembayaran-active.png'),
  },
  {
    label: 'Menunggu Salur',
    posisi: 'menunggu-salur',
    image: require('@/assets/images/lacak/menunggu-salur-active.png'),
  },
  {
    label: 'Proses Salur',
    posisi: 'proses',
    image: require('@/assets/images/lacak/proses-salur-active.png'),
  },
  {
    label: 'Selesai Salur',
    posisi: 'selesai',
    image: require('@/assets/images/lacak/selesai-salur-active.png'),
  },
];

export default function MyDonationsScreen(): React.JSX.Element {
  const tabNavigation = useNavigation<MainTabNavigationProp>();
  const rootNavigation = tabNavigation.getParent<RootStackNavigationProp>();
  const isAuthenticated = useAuthStore(state => Boolean(state.accessToken));

  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  }, []);

  function handlePressSearch(): void {
    rootNavigation?.navigate('Search');
  }

  function handlePressDonateAgain(): void {
    tabNavigation.navigate('Donations');
  }

  function handlePressLogin(): void {
    rootNavigation?.navigate('Login', {
      redirectTo: {screen: 'Home', params: {screen: 'MyDonations'}},
    });
  }

  function handleNavigateToRiwayat(posisi?: string): void {
    rootNavigation?.navigate('RiwayatDonasi', {posisi});
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header bar */}
      <MyDonationsTopBar
        onPressSearch={handlePressSearch}
        isScrolled={isScrolled}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 40}}
        onScroll={event => {
          setIsScrolled(event.nativeEvent.contentOffset.y > 10);
        }}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
          />
        }>
        {/* Hero Banner Section */}
        <View className="relative overflow-hidden">
          <LinearGradient
            colors={[colors.primary[200], colors.primary[400]]}
            start={{x: 1, y: 0}}
            end={{x: 0, y: 1}}
            className="relative px-5 pt-7 pb-12 overflow-hidden">
            {/* Dekorasi lingkaran background */}
            <View className="absolute -top-8 -right-8 w-40 h-40 bg-white/20 rounded-full" />
            <View className="absolute -bottom-6 right-10 w-24 h-24 bg-white/10 rounded-full" />

            {/* Content Hero */}
            <View className="relative z-10 w-11/12">
              <Text className="text-xl font-bold text-slate-800 leading-tight mb-2">
                Jejak Kebaikanmu{'\n'}
                <Text className="text-primary-700">Tercatat dengan Indah</Text>
              </Text>

              <Text className="text-xs text-slate-700/90 leading-relaxed mb-4 font-medium">
                Setiap donasi yang kamu berikan adalah catatan pahala yang tak terhapuskan
              </Text>

              {isAuthenticated ? (
                <TouchableOpacity
                  onPress={handlePressDonateAgain}
                  activeOpacity={0.8}
                  className="self-start flex-row items-center gap-1.5 bg-orange-500 active:bg-orange-600 px-5 py-2.5 rounded-xl shadow-md">
                  <Text className="text-xs font-bold text-white">Donasi Lagi</Text>
                  <Icon icon={AltArrowRight} size={14} color="#ffffff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handlePressLogin}
                  activeOpacity={0.8}
                  className="self-start flex-row items-center gap-1.5 border border-primary-600 bg-white/80 active:bg-white px-5 py-2.5 rounded-xl shadow-sm">
                  <Text className="text-xs font-semibold text-primary-700">Masuk untuk Melihat</Text>
                  <Icon icon={AltArrowRight} size={14} color={colors.primary[700]} />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>

          {/* Status Donasi Grid Card */}
          <View className="px-4 -mt-6 relative z-20 mb-5">
            <View className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              {/* Link ke riwayat lengkap */}
              <View className="pb-3 flex-row justify-end">
                <TouchableOpacity
                  onPress={() => handleNavigateToRiwayat()}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-1">
                  <Text className="text-xs font-semibold text-primary-600">
                    Lihat Semua Riwayat
                  </Text>
                  <Icon icon={AltArrowRight} size={14} color={colors.primary[600]} />
                </TouchableOpacity>
              </View>

              {/* 4 Status Grid */}
              <View className="flex-row justify-between">
                {MENUNJUKKAN_STATUS_ITEMS.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleNavigateToRiwayat(item.posisi)}
                    activeOpacity={0.7}
                    className="flex-1 items-center px-1">
                    <View className="w-12 h-12 rounded-2xl items-center justify-center mb-2 shadow-xs bg-primary-50">
                      <Image
                        source={item.image}
                        style={{width: 24, height: 24}}
                        resizeMode="contain"
                      />
                    </View>
                    <Text
                      numberOfLines={2}
                      className="text-[11px] leading-tight text-slate-500 font-medium text-center">
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Kalender Donasi Component */}
        <KalenderDonasi
          key={`cal-${refreshKey}`}
          isAuthenticated={isAuthenticated}
        />
      </ScrollView>
    </View>
  );
}
