import React from 'react';
import {View, Text, Image} from 'react-native';
import {Icon} from '@/components/ui/Icon';
import {ClockCircle} from '@solar-icons/react-native/Linear';
import {Button} from '@/components/ui/Button';
import {colors} from '@/theme';
import {formatCurrency} from '@/utils/formatCurrency';
import type {PrayerTime} from '@/types/prayerTime';

interface SaldoCardProps {
  balance: number;
  nextPrayerTime: PrayerTime | null;
  hijriDate: string;
  isAuthenticated: boolean;
  onPressAction: () => void;
}

export function SaldoCard({
  balance,
  nextPrayerTime,
  hijriDate,
  isAuthenticated,
  onPressAction,
}: SaldoCardProps): React.JSX.Element {
  const displayBalance = isAuthenticated ? formatCurrency(balance) : '●●●●●●●●';
  const buttonLabel = isAuthenticated ? 'Top Up' : 'Masuk';

  return (
    <View className="bg-white px-6 py-4 gap-3 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3.5 flex-1">
          <View className="w-8 h-8 rounded-xl items-center justify-center">
            <Image
              source={require('@/assets/images/icons/wallet.png')}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-sm font-medium text-neutral-600">Saldo Saku Kebaikan</Text>
            <Text
              className={
                isAuthenticated
                  ? 'text-lg font-bold text-neutral-900'
                  : 'text-xs font-normal text-neutral-400'
              }>
              {displayBalance}
            </Text>
          </View>
        </View>
        <Button label={buttonLabel} onPress={onPressAction} size="smWide" />
      </View>

      <View className="h-px bg-neutral-200" />

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Icon icon={ClockCircle} size={14} color={colors.neutral[900]} />
          <Text className="text-xs font-medium text-neutral-600">
            {nextPrayerTime
              ? `${nextPrayerTime.name} ${nextPrayerTime.time}`
              : '-'}
          </Text>
        </View>
        <Text className="text-xs font-medium text-neutral-600">{hijriDate}</Text>
      </View>
    </View>
  );
}
