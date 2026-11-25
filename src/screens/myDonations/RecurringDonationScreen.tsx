import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  CalendarDate,
  CardTransfer,
  HeartShine,
  AltArrowRight,
  Heart,
  User,
} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {useAuthStore} from '@/stores/authStore';
import {
  getMyRutinList,
  type MyRutinItem,
} from '@/services/recurringDonationService';
import {formatCurrency} from '@/utils/formatCurrency';
import {colors} from '@/theme';
import type {MainTabNavigationProp, RootStackNavigationProp} from '@/types/navigation';

const FEATURES = [
  {
    icon: CalendarDate,
    title: 'Atur Jadwal',
    caption: 'Fleksibel',
    bg: 'bg-blue-50',
    iconColor: '#3b82f6',
  },
  {
    icon: CardTransfer,
    title: 'Auto Debit',
    caption: 'Mudah',
    bg: 'bg-emerald-50',
    iconColor: '#10b981',
  },
  {
    icon: HeartShine,
    title: 'Pahala Rutin',
    caption: 'Berkah',
    bg: 'bg-rose-50',
    iconColor: '#f43f5e',
  },
];

export default function RecurringDonationScreen(): React.JSX.Element {
  const tabNavigation = useNavigation<MainTabNavigationProp>();
  const rootNavigation = tabNavigation.getParent<RootStackNavigationProp>();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore(state => Boolean(state.accessToken));

  const [items, setItems] = useState<MyRutinItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchRutin = useCallback(async (isRefresh = false) => {
    if (!isAuthenticated) {
      setItems([]);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }
    if (!isRefresh) setIsLoading(true);
    setIsError(false);
    try {
      const res = await getMyRutinList(1);
      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        setItems([]);
      }
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      fetchRutin();
    }, [fetchRutin]),
  );

  function handleRefresh(): void {
    setIsRefreshing(true);
    fetchRutin(true);
  }

  function handlePressStart(): void {
    rootNavigation?.navigate('DonasiRutinJenis');
  }

  function handlePressLogin(): void {
    rootNavigation?.navigate('Login', {
      redirectTo: {screen: 'Home', params: {screen: 'RecurringDonation'}},
    });
  }

  function handlePressItem(item: MyRutinItem): void {
    rootNavigation?.navigate('DetailDonasiRutin', {recurringId: String(item.id)});
  }

  function formatSchedule(item: MyRutinItem): string {
    const time = item.time ? item.time.slice(0, 5) : '08:00';
    if (item.range_type === 'monthly') {
      return `Setiap bulan (Tgl ${item.range || 1}) • ${time}`;
    }
    if (item.range_type === 'weekly') {
      return `Setiap minggu (${item.range || 'Senin'}) • ${time}`;
    }
    return `Setiap hari • ${time}`;
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header bar */}
      <View
        style={{paddingTop: insets.top}}
        className="bg-white border-b border-slate-100 py-3 items-center justify-center">
        <Text className="text-base font-bold text-slate-900">Donasi Rutin</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 40}}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
          />
        }>
        {/* Hero Banner */}
        <View className="relative overflow-hidden">
          <LinearGradient
            colors={[colors.primary[100], colors.primary[300]]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            className="relative px-5 pt-7 pb-12 overflow-hidden">
            <View className="absolute -top-8 -right-8 w-40 h-40 bg-primary-300/30 rounded-full" />
            <View className="absolute -bottom-6 right-10 w-24 h-24 bg-primary-400/20 rounded-full" />

            <View className="relative z-10 w-11/12">
              <Text className="text-xl font-bold text-slate-800 leading-tight mb-2">
                Berbagi Kebaikan{'\n'}
                <Text className="text-primary-700">Setiap Hari, Tanpa Putus</Text>
              </Text>

              <Text className="text-xs text-slate-700/90 leading-relaxed mb-4 font-medium">
                Wujudkan pahala yang mengalir terus menerus dengan donasi rutin otomatis dari Saku Kebaikanmu
              </Text>

              <TouchableOpacity
                onPress={handlePressStart}
                activeOpacity={0.85}
                className="self-start flex-row items-center gap-2 bg-orange-500 active:bg-orange-600 px-5 py-2.5 rounded-xl shadow-md">
                <Text className="text-xs font-bold text-white">Mulai Donasi Rutin</Text>
                <Icon icon={AltArrowRight} size={14} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* 3 Feature Cards */}
          <View className="px-4 -mt-6 relative z-20 mb-4">
            <View className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
              <View className="flex-row justify-between">
                {FEATURES.map((f, i) => (
                  <View key={i} className="flex-1 items-center px-1">
                    <View
                      className={`w-12 h-12 rounded-xl items-center justify-center mb-1.5 shadow-2xs ${f.bg}`}>
                      <Icon icon={f.icon} size={22} color={f.iconColor} />
                    </View>
                    <Text className="text-xs font-semibold text-slate-800 text-center leading-tight">
                      {f.title}
                    </Text>
                    <Text className="text-[10px] text-slate-400 mt-0.5">
                      {f.caption}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* List Donasi Rutin Saya */}
        <View className="mt-2 px-4 space-y-3">
          {!isAuthenticated ? (
            /* Guest State */
            <View className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 items-center text-center">
              <View className="w-14 h-14 bg-slate-100 rounded-full items-center justify-center mb-3">
                <Icon icon={User} size={28} color={colors.neutral[400]} />
              </View>
              <Text className="text-sm font-bold text-slate-800">
                Masuk untuk melihat donasi rutin
              </Text>
              <Text className="text-xs text-slate-400 mt-1 mb-4 text-center">
                Kelola jadwal donasi otomatis kamu dengan mudah
              </Text>
              <TouchableOpacity
                onPress={handlePressLogin}
                activeOpacity={0.85}
                className="bg-primary-500 active:bg-primary-600 px-5 py-2.5 rounded-xl shadow-sm">
                <Text className="text-xs font-bold text-white">Masuk Sekarang</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <View className="px-4 py-3 border-b border-slate-100 flex-row items-center justify-between">
                <Text className="text-sm font-bold text-slate-800">
                  Donasi Rutin Saya
                </Text>
                {items.length > 0 && (
                  <TouchableOpacity onPress={handlePressStart}>
                    <Text className="text-xs font-semibold text-primary-600">
                      + Tambah
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {isLoading ? (
                /* Skeleton Loader */
                <View className="p-4 gap-3">
                  {[1, 2, 3].map(n => (
                    <View key={n} className="flex-row items-center gap-3">
                      <View className="w-24 h-16 rounded-lg bg-slate-200 animate-pulse" />
                      <View className="flex-1 gap-2">
                        <View className="w-3/4 h-3 rounded bg-slate-200 animate-pulse" />
                        <View className="w-1/2 h-2.5 rounded bg-slate-200 animate-pulse" />
                      </View>
                    </View>
                  ))}
                </View>
              ) : isError ? (
                /* Error State */
                <View className="py-10 items-center justify-center px-4">
                  <Text className="text-xs text-slate-500 mb-3">
                    Gagal memuat donasi rutin
                  </Text>
                  <TouchableOpacity
                    onPress={() => fetchRutin()}
                    className="px-4 py-2 border border-primary-500 rounded-xl">
                    <Text className="text-xs font-bold text-primary-600">Coba Lagi</Text>
                  </TouchableOpacity>
                </View>
              ) : items.length === 0 ? (
                /* Empty State */
                <View className="py-10 px-4 items-center justify-center">
                  <View className="w-14 h-14 bg-primary-50 rounded-full items-center justify-center mb-3">
                    <Icon icon={Heart} size={28} color={colors.primary[500]} />
                  </View>
                  <Text className="text-sm font-bold text-slate-800">
                    Belum ada donasi rutin
                  </Text>
                  <Text className="text-xs text-slate-400 mt-1 mb-4 text-center">
                    Mulai jadwalkan kebaikanmu sekarang
                  </Text>
                  <TouchableOpacity
                    onPress={handlePressStart}
                    className="bg-primary-500 active:bg-primary-600 px-5 py-2.5 rounded-xl shadow-sm">
                    <Text className="text-xs font-bold text-white">Buat Donasi Rutin</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* Items List */
                <View className="divide-y divide-slate-100">
                  {items.map((item, index) => {
                    const isActive = item.status === 'active' || item.status === 'AKTIF';
                    const imageUrl = item.program?.image;
                    const title = item.program?.title || 'Program Donasi Rutin';

                    return (
                      <TouchableOpacity
                        key={item.id || index}
                        onPress={() => handlePressItem(item)}
                        activeOpacity={0.7}
                        className="p-3 flex-row gap-3 items-center active:bg-slate-50">
                        {imageUrl ? (
                          <Image
                            source={{uri: imageUrl}}
                            className="w-36 h-20 rounded-lg bg-slate-100"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-24 h-20 rounded-xl bg-primary-50 items-center justify-center">
                            <Icon icon={Heart} size={24} color={colors.primary[500]} />
                          </View>
                        )}

                        <View className="flex-1 justify-between py-0.5 min-w-0">
                          <Text
                            numberOfLines={2}
                            className="text-xs font-bold text-slate-800 leading-snug mb-1">
                            {title}
                          </Text>

                          <Text className="text-[10px] text-slate-400 mb-2">
                            {formatSchedule(item)}
                          </Text>

                          <View className="flex-row items-center justify-between">
                            <View>
                              <Text className="text-[9px] text-slate-400">Nominal</Text>
                              <Text className="text-xs font-bold text-primary-600">
                                {formatCurrency(item.nominal ?? 0)}
                              </Text>
                            </View>

                            <View
                              className={`px-2 py-0.5 rounded-full ${
                                isActive ? 'bg-primary-50' : 'bg-slate-100'
                              }`}>
                              <Text
                                className={`text-[10px] font-bold ${
                                  isActive ? 'text-primary-600' : 'text-slate-400'
                                }`}>
                                {isActive ? 'Aktif' : 'Nonaktif'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
