import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Share as RNShare,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {
  AltArrowLeft,
  Share,
  Flag,
  HandHeart,
  Card,
  UsersGroupTwoRounded,
} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {ProgramCard} from '@/components/shared/ProgramCard';
import {EmptyState} from '@/components/ui/EmptyState';
import {
  getProgramThemeBySlug,
  getActiveTheme,
  type ProgramThemeData,
} from '@/services/themeService';
import {formatRupiah} from '@/utils/formatCurrency';
import {showToast} from '@/utils/toast';
import type {PerTemaScreenProps} from '@/types/navigation';
import type {Program} from '@/types/program';

export default function PerTemaScreen({
  route,
  navigation,
}: PerTemaScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const slug = route.params?.slug;

  const [themeData, setThemeData] = useState<ProgramThemeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function loadTheme() {
    try {
      if (slug) {
        const res = await getProgramThemeBySlug(slug);
        if (res.success && res.data) {
          setThemeData(res.data);
          return;
        }
      }

      // Fallback ke active theme
      const activeRes = await getActiveTheme();
      if (activeRes.data) {
        const d = activeRes.data;
        setThemeData({
          id: d.id || 'theme-1',
          name: d.title || 'Tema Ramadan: Berbagi Kebaikan',
          title: d.title || 'Tema Ramadan: Berbagi Kebaikan',
          slug: d.id || 'ramadan',
          description:
            d.description ||
            'Bersama kita wujudkan keberkahan bagi saudara-saudara kita yang membutuhkan.',
          imageUrl:
            d.imageUrl ||
            'https://cdn.aksiberbagi.com/settings/home-banner-1777532258.jpeg',
          totalCollected: 248_500_000,
          totalPrograms: 4,
          programs: [],
        });
      }
    } catch {
      // Safe fallback
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadTheme();
  }, [slug]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadTheme();
  }

  async function handleShare() {
    try {
      await RNShare.share({
        message: `Mari berpartisipasi dalam program kebaikan "${
          themeData?.title || 'Tema Kebaikan'
        }" di Beramalbersama: https://beramalbersama.com/tema/${
          themeData?.slug || ''
        }`,
      });
    } catch {
      // Ignore cancel
    }
  }

  function handlePressProgram(program: Program) {
    navigation.navigate('DetailProgram', {
      link: program.link || String(program.id),
    });
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View
        style={{paddingTop: Math.max(insets.top, 12)}}
        className="bg-white px-4 pb-3 flex-row items-center border-b border-gray-100 shadow-xs z-10">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full items-center justify-center bg-gray-50 active:bg-gray-100 mr-2"
          accessibilityLabel="Kembali">
          <Icon icon={AltArrowLeft} size={22} color="#1F2937" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text numberOfLines={1} className="text-base font-bold text-gray-900">
            {themeData?.title || 'Tema Kebaikan'}
          </Text>
          <Text className="text-[11px] text-gray-400">
            Eksplorasi kumpulan program spesial
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleShare}
          className="w-10 h-10 rounded-full items-center justify-center bg-gray-50 active:bg-gray-100 ml-1"
          accessibilityLabel="Bagikan">
          <Icon icon={Share} size={20} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-xs text-gray-400 mt-2">Memuat tema...</Text>
        </View>
      ) : !themeData ? (
        <View className="flex-1 items-center justify-center p-6">
          <EmptyState
            icon={Flag}
            title="Tema Belum Tersedia"
            description="Kumpulan program untuk tema ini akan segera hadir."
          />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{paddingBottom: insets.bottom + 40}}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#10B981"
            />
          }>
          {/* Banner Hero */}
          <View className="w-full aspect-[16/8] bg-gray-200 overflow-hidden relative">
            <Image
              source={{uri: themeData.imageUrl}}
              className="w-full h-full"
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/20" />
          </View>

          <View className="p-4 space-y-4">
            {/* Title & Description Card */}
            <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <Text className="text-lg font-black text-gray-900 mb-1.5 leading-snug">
                {themeData.title}
              </Text>
              {Boolean(themeData.description) && (
                <Text className="text-xs text-gray-600 leading-relaxed">
                  {themeData.description}
                </Text>
              )}

              {/* Ringkasan Statistik */}
              <View className="flex-row items-center gap-3 mt-4 pt-3.5 border-t border-gray-100">
                <View className="flex-1 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                  <Text className="text-[10px] text-emerald-800 font-semibold uppercase">
                    Total Terkumpul
                  </Text>
                  <Text className="text-sm font-extrabold text-emerald-700 mt-0.5">
                    {formatRupiah(themeData.totalCollected)}
                  </Text>
                </View>

                <View className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <Text className="text-[10px] text-gray-500 font-semibold uppercase">
                    Program Terkait
                  </Text>
                  <Text className="text-sm font-extrabold text-gray-800 mt-0.5">
                    {themeData.totalPrograms} Program
                  </Text>
                </View>
              </View>
            </View>

            {/* List Program di bawah tema ini */}
            <View>
              <Text className="text-sm font-bold text-gray-800 mb-3 px-1">
                Program Pilihan Tema Ini
              </Text>

              {themeData.programs.length === 0 ? (
                <View className="bg-white rounded-2xl p-6 border border-gray-100 items-center justify-center">
                  <Icon icon={HandHeart} size={36} color="#D1D5DB" />
                  <Text className="text-xs text-gray-400 mt-2 text-center">
                    Program untuk tema ini sedang disiapkan
                  </Text>
                </View>
              ) : (
                <View className="space-y-3">
                  {themeData.programs.map(program => (
                    <ProgramCard
                      key={program.id}
                      program={program}
                      onPress={handlePressProgram}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
