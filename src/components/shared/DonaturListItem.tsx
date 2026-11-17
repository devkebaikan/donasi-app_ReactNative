import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {Heart} from '@solar-icons/react-native/Bold';
import {Icon} from '@/components/ui/Icon';
import {Avatar} from '@/components/ui/Avatar';
import {formatCurrency} from '@/utils/formatCurrency';
import {formatRelativeTime} from '@/utils/formatRelativeTime';
import {colors} from '@/theme';
import type {ProgramDonatur} from '@/types/programDetail';

interface DonaturListItemProps {
  donatur: ProgramDonatur;
  onPressAamiin: (donatur: ProgramDonatur) => void;
}

export function DonaturListItem({
  donatur,
  onPressAamiin,
}: DonaturListItemProps): React.JSX.Element {
  const [isLiked, setIsLiked] = useState<boolean>(donatur.isLiked ?? false);
  const [aminCount, setAminCount] = useState<number>(donatur.aminCount ?? 0);

  const displayName = donatur.isAnonymous || !donatur.name?.trim()
    ? 'Hamba Allah'
    : donatur.name.trim();
  const photoUri = donatur.isAnonymous ? null : donatur.photoUrl ?? null;

  function handleAamiin(): void {
    if (isLiked) return;
    setIsLiked(true);
    setAminCount(prev => prev + 1);
    onPressAamiin(donatur);
  }

  return (
    <View
      className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100"
      accessibilityRole="text"
      accessibilityLabel={`${displayName}, ${formatCurrency(donatur.amount)}`}>
      <View className="flex-row items-start gap-3">
        <Avatar uri={photoUri} name={displayName} size={40} />
        <View className="flex-1 min-w-0">
          <Text className="font-semibold text-neutral-900 text-sm truncate" numberOfLines={1}>
            {displayName}
          </Text>
          <Text className="text-xs text-neutral-500 mt-0.5">
            {formatRelativeTime(donatur.createdAt)} via {donatur.paymentMethodName || 'Online'}
          </Text>
        </View>
        <Text className="font-bold text-primary-600 text-sm">
          {formatCurrency(donatur.amount)}
        </Text>
      </View>

      {donatur.prayer ? (
        <View className="bg-neutral-50 rounded-lg p-3 mt-3 border border-neutral-100">
          <Text className="text-neutral-700 text-xs leading-relaxed mb-2.5">
            {donatur.prayer}
          </Text>
          <View className="flex-row items-center justify-between pt-2 border-t border-neutral-200">
            <Text className="text-[11px] text-neutral-500">
              {aminCount > 0 ? (
                <>
                  <Text className="font-semibold text-primary-600">{aminCount}</Text> orang mengaminkan doa ini
                </>
              ) : (
                'Yuk Aamiin-kan doa saudara kita'
              )}
            </Text>
            <TouchableOpacity
              className={`flex-row items-center gap-1.5 px-3 py-1 rounded-md border ${
                isLiked
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-white border-primary-500'
              }`}
              onPress={handleAamiin}
              activeOpacity={0.7}
              disabled={isLiked}
              accessibilityRole="button"
              accessibilityLabel={`Aamiin-kan doa ${displayName}`}>
              <Icon
                icon={Heart}
                size={13}
                color={isLiked ? '#FFFFFF' : colors.primary[500]}
              />
              <Text
                className={`text-xs font-semibold ${
                  isLiked ? 'text-white' : 'text-primary-600'
                }`}>
                Aamiin
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}
