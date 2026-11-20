import React from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  AltArrowLeft,
  AltArrowRight,
  HandHeart,
  CardSearch,
  Sunrise,
  MoonStars,
  Calendar,
  Heart,
  UsersGroupTwoRounded,
} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors} from '@/theme';
import type {DonasiRutinJenisScreenProps} from '@/types/navigation';

interface OptionItem {
  icon: any;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
  onPress: () => void;
}

export default function DonasiRutinJenisScreen({
  navigation,
}: DonasiRutinJenisScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  const generalItems: OptionItem[] = [
    {
      icon: HandHeart,
      title: 'Pilih Tujuan Donasi Rutin',
      description: 'Donasi rutin ke program yang dipilihkan Beramalbersama.com untuk Anda',
      iconBg: 'bg-primary-50',
      iconColor: colors.primary[600],
      onPress: () =>
        navigation.navigate('DonasiRutinSetup', {intent: 'pilihan'}),
    },
    {
      icon: CardSearch,
      title: 'Pilih Program Sendiri',
      description: 'Cari program kebaikan yang akan ditambahkan ke dalam donasi rutin',
      iconBg: 'bg-sky-50',
      iconColor: '#0284c7',
      onPress: () => navigation.navigate('DonasiRutinProgram'),
    },
  ];

  const categoryItems: OptionItem[] = [
    {
      icon: Sunrise,
      title: 'Donasi Tiap Subuh',
      description: 'Awali hari anda dengan keberkahan donasi rutin tiap Subuh',
      iconBg: 'bg-amber-50',
      iconColor: '#d97706',
      onPress: () =>
        navigation.navigate('DonasiRutinSetup', {intent: 'subuh'}),
    },
    {
      icon: MoonStars,
      title: "Donasi Tiap Jum'at",
      description: 'Jangan sampai ketinggalan keberkahan donasi di hari terbaik',
      iconBg: 'bg-emerald-50',
      iconColor: '#059669',
      onPress: () =>
        navigation.navigate('DonasiRutinSetup', {intent: 'jumat'}),
    },
    {
      icon: Calendar,
      title: '30 Hari Temani Bertumbuh',
      description: 'Rutinkan sedekah subuh selama 30 hari penuh kebaikan',
      iconBg: 'bg-blue-50',
      iconColor: '#2563eb',
      onPress: () =>
        navigation.navigate('DonasiRutinSetup', {intent: 'subuh'}),
    },
    {
      icon: Heart,
      title: '100 Hari Menuju Ramadhan',
      description: 'Persiapkan hati dan pahala terbaik tiap subuh menyambut Ramadhan',
      iconBg: 'bg-rose-50',
      iconColor: '#e11d48',
      onPress: () =>
        navigation.navigate('DonasiRutinSetup', {intent: 'subuh'}),
    },
    {
      icon: UsersGroupTwoRounded,
      title: '52 Kirim Hadiah Tiap Jumat Subuh Atas Nama Ortu',
      description: 'Kirim hadiah pahala jariyah terbaik tiap Jumat subuh untuk orang tua',
      iconBg: 'bg-purple-50',
      iconColor: '#7c3aed',
      onPress: () =>
        navigation.navigate('DonasiRutinSetup', {intent: 'jumat'}),
    },
  ];

  return (
    <View className="flex-1 bg-slate-50">
      {/* Top Header */}
      <View
        style={{paddingTop: insets.top}}
        className="bg-white border-b border-slate-100 flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-slate-100"
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon icon={AltArrowLeft} size={22} color={colors.neutral[800]} />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-900 ml-2">
          Pilih Tujuan Donasi Rutin
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 40}}>
        {/* Hero Banner */}
        <View className="relative overflow-hidden mb-5">
          <LinearGradient
            colors={[colors.primary[100], colors.primary[300]]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            className="px-5 pt-6 pb-8 relative overflow-hidden">
            <View className="absolute -top-8 -right-8 w-40 h-40 bg-primary-300/30 rounded-full" />
            <View className="absolute -bottom-6 right-10 w-24 h-24 bg-primary-400/20 rounded-full" />

            <View className="relative z-10 w-11/12">
              <Text className="text-lg font-bold text-slate-800 leading-tight mb-2">
                Berbagi Kebaikan{'\n'}
                <Text className="text-primary-700">Setiap Hari, Tanpa Putus</Text>
              </Text>
              <Text className="text-xs text-slate-700/90 leading-relaxed font-medium">
                Wujudkan pahala yang mengalir terus menerus dengan donasi rutin otomatis dari Saku Kebaikanmu
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View className="px-4 gap-5">
          {/* Section: Pilih untuk saya */}
          <View>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">
              Pilih Untuk Saya
            </Text>
            <View className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden shadow-2xs">
              {generalItems.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-3.5 px-4 py-3.5 active:bg-slate-50">
                  <View
                    className={`w-11 h-11 rounded-full items-center justify-center shrink-0 ${item.iconBg}`}>
                    <Icon icon={item.icon} size={22} color={item.iconColor} />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="text-xs font-bold text-slate-900 mb-0.5">
                      {item.title}
                    </Text>
                    <Text className="text-[11px] text-slate-500 leading-relaxed">
                      {item.description}
                    </Text>
                  </View>
                  <Icon icon={AltArrowRight} size={16} color={colors.neutral[400]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Section: Kategori pilihan */}
          <View>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">
              Kategori Pilihan
            </Text>
            <View className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden shadow-2xs">
              {categoryItems.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-3.5 px-4 py-3.5 active:bg-slate-50">
                  <View
                    className={`w-11 h-11 rounded-full items-center justify-center shrink-0 ${item.iconBg}`}>
                    <Icon icon={item.icon} size={22} color={item.iconColor} />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="text-xs font-bold text-slate-900 mb-0.5">
                      {item.title}
                    </Text>
                    <Text className="text-[11px] text-slate-500 leading-relaxed">
                      {item.description}
                    </Text>
                  </View>
                  <Icon icon={AltArrowRight} size={16} color={colors.neutral[400]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
