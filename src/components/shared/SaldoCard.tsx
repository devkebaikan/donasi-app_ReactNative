import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {formatCurrency} from '@/utils/formatCurrency';

interface SaldoCardProps {
  balance: number;
  isAuthenticated: boolean;
  onPressAction: () => void;
  className?: string;
}

export function SaldoCard({
  balance,
  isAuthenticated,
  onPressAction,
  className = '',
}: SaldoCardProps): React.JSX.Element {
  const displayBalance = isAuthenticated ? formatCurrency(balance) : '*******';
  const buttonLabel = isAuthenticated ? 'Top Up' : 'Masuk';

  return (
    <View className={`mx-8 -mt-4 mb-2 z-10 ${className}`}>
      <View className="bg-white rounded-xl px-4 py-3 flex-row items-center gap-3 border border-neutral-100 shadow-md">
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
          className="bg-secondary-500 px-4 py-2 rounded-xl shrink-0 items-center justify-center"
          onPress={onPressAction}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={buttonLabel}>
          <Text className="text-white text-xs font-semibold">
            {buttonLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
