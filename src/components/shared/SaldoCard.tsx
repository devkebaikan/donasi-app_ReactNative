import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClockCircle, AltArrowRight} from '@solar-icons/react-native/Linear';
import {formatCurrency} from '@/utils/formatCurrency';
import {usePrayerSchedule} from '@/hooks/usePrayerSchedule';
import {usePrayerSettingStore} from '@/stores/prayerSettingStore';
import {getHijriDateLabel} from '@/utils/hijriDate';
import type {RootStackParamList} from '@/types/navigation';

interface SaldoCardProps {
  balance: number;
  isAuthenticated: boolean;
  onPressAction: () => void;
  onPressPrayer?: () => void;
  className?: string;
}

export function SaldoCard({
  balance,
  isAuthenticated,
  onPressAction,
  onPressPrayer,
  className = '',
}: SaldoCardProps): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {schedule, nextPrayer} = usePrayerSchedule();
  const hijriOffsetDays = usePrayerSettingStore(s => s.hijriOffsetDays);

  const displayBalance = isAuthenticated ? formatCurrency(balance) : '*******';
  const buttonLabel = isAuthenticated ? 'Top Up' : 'Masuk';

  // State jam aktif
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const tzAbbr = useMemo(() => {
    const tz = schedule?.location.timezone;
    if (tz === 'Asia/Makassar') {
      return 'WITA';
    }
    if (tz === 'Asia/Jayapura') {
      return 'WIT';
    }
    return 'WIB';
  }, [schedule?.location.timezone]);

  const timeString = useMemo(() => {
    const h = String(currentTime.getHours()).padStart(2, '0');
    const m = String(currentTime.getMinutes()).padStart(2, '0');
    return `${h}:${m} ${tzAbbr}`;
  }, [currentTime, tzAbbr]);

  const prayerLabel = useMemo(() => {
    if (nextPrayer) {
      return `${nextPrayer.item.label} pukul ${nextPrayer.item.time}`;
    }
    return 'Jadwal Sholat';
  }, [nextPrayer]);

  const hijriDate = useMemo(() => {
    if (schedule?.hijriLabel) {
      return schedule.hijriLabel;
    }
    return getHijriDateLabel(new Date(), {
      offsetDays: hijriOffsetDays,
      suffix: true,
    }).replace(/(\d+)(H)$/, '$1 $2');
  }, [schedule?.hijriLabel, hijriOffsetDays]);

  const handlePressPrayer = (): void => {
    if (onPressPrayer) {
      onPressPrayer();
    } else {
      try {
        navigation.navigate('PrayerSchedule');
      } catch {
        // Fallback defensif jika di luar stack navigation
      }
    }
  };

  return (
    <View className={`mx-8 -mt-4 mb-2 z-10 ${className}`}>
      <View className="bg-white rounded-xl border border-neutral-100 shadow-md overflow-hidden">
        {/* Bagian Atas: Saldo & Tombol Aksi */}
        <View className="px-4 py-3 flex-row items-center gap-3">
          {/* Wallet Icon with circular tinted background */}
          <View className="w-8 h-8 items-center justify-center shrink-0">
            <Image
              source={require('@/assets/images/icons/wallet.png')}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>

          {/* Saldo Details */}
          <View className="flex-1 min-w-0 justify-center">
            <Text className="text-[11px] text-neutral-400 mb-0.5 leading-none">
              Saldo Saku Kebaikan
            </Text>
            <Text
              className={
                isAuthenticated
                  ? 'text-base font-bold text-neutral-800'
                  : 'text-sm font-medium text-neutral-400 tracking-widest'
              }>
              {displayBalance}
            </Text>
          </View>

          {/* Action Button: Top Up or Masuk */}
          <TouchableOpacity
            className="bg-secondary-500 px-4 py-2 rounded-lg shrink-0 items-center justify-center"
            onPress={onPressAction}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={buttonLabel}>
            <Text className="text-white text-xs font-semibold">
              {buttonLabel}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pembatas / Divider */}
        <View className="h-px bg-neutral-100 mx-4" />

        {/* Bagian Bawah: Info Jam, Masuk Waktu Sholat, dan Tanggal Hijriyah */}
        <TouchableOpacity
          className="px-4 py-2.5 bg-neutral-50/70 flex-row items-center justify-between"
          onPress={handlePressPrayer}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Waktu sekarang ${timeString}, ${prayerLabel}, ${hijriDate}`}>
          <View className="flex-1 mr-2">
            {/* Baris 1: Jam & Masuk Waktu Sholat */}
            <View className="flex-row items-center flex-wrap gap-1.5">
              <ClockCircle size={12} color="#1EB8B1" />
              <Text className="text-xs font-semibold text-neutral-400">
                {prayerLabel}
              </Text>
            </View>

          </View>
          <View className="items-center justify-center">
            {/* Baris 2: Tanggal Hijriyah */}
            <Text className="text-xs text-neutral-500 mt-0.5">
              {hijriDate}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
