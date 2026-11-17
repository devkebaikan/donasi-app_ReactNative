import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {VerifiedCheck, AltArrowRight} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors} from '@/theme';
import type {ProgramOrganization} from '@/types/programDetail';

interface FundraiserCardProps {
  organization: ProgramOrganization;
  label?: string;
  onPress: () => void;
}

export function FundraiserCard({
  organization,
  onPress,
}: FundraiserCardProps): React.JSX.Element {
  return (
    <TouchableOpacity
      className="flex-row items-center gap-3 py-3 px-4 bg-white border-b border-neutral-100"
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Lihat profil lembaga ${organization.name}`}>
      <View className="w-12 h-12 rounded-full bg-primary-500 overflow-hidden items-center justify-center border border-neutral-100">
        {organization.logoUrl ? (
          <Image
            source={{uri: organization.logoUrl}}
            className="w-full h-full"
            resizeMode="cover"
            accessibilityRole="image"
            accessibilityLabel={`Logo ${organization.name}`}
          />
        ) : (
          <Text className="text-sm font-bold text-white">
            {organization.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      <View className="flex-1 min-w-0">
        <Text className="font-bold text-neutral-900 text-sm truncate uppercase tracking-tight" numberOfLines={1}>
          {organization.name}
        </Text>
        <View className="flex-row items-center gap-1 bg-cyan-50 px-2 py-0.5 rounded-full self-start mt-1 border border-cyan-100">
          <Text className="text-[10px] text-cyan-700 font-semibold">Verified</Text>
          <Icon icon={VerifiedCheck} size={11} color="#0891b2" />
        </View>
      </View>

      <Icon icon={AltArrowRight} size={18} color={colors.neutral[400]} />
    </TouchableOpacity>
  );
}
