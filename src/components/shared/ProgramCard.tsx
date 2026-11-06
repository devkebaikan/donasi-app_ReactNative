import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { VerifiedCheck } from '@solar-icons/react-native/Linear';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/theme';
import { formatCompactCurrency } from '@/utils/formatCurrency';
import {
  getDonationProgress,
  formatDaysLeftLabel,
} from '@/utils/donationProgress';
import { RecommendedBadge } from '@/components/shared/RecommendedBadge';
import { sanitizeImageUrl } from '@/utils/imageUrl';
import type { Program } from '@/types/program';

interface ProgramCardProps {
  program: Program;
  onPress: (program: Program) => void;
}

export function ProgramCard({
  program,
  onPress,
}: ProgramCardProps): React.JSX.Element {
  const collectedAmount = Number(program.nominal_achieved) || 0;
  const progress = getDonationProgress(
    collectedAmount,
    program.nominal_target,
  );

  const safeImage = sanitizeImageUrl(program.image);

  return (
    <TouchableOpacity
      className="flex-row gap-3 p-2 rounded-xl bg-neutral-50"
      onPress={() => onPress(program)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={program.title}>
      <View className="relative w-36 h-24 rounded-lg overflow-hidden bg-neutral-100">
        {safeImage ? (
          <Image
            source={{ uri: safeImage }}
            className="w-full h-full"
            resizeMode="cover"
            accessibilityRole="image"
            accessibilityLabel={program.title}
          />
        ) : (
          <View className="w-full h-full bg-neutral-200" />
        )}
        {program.isRecommended && <RecommendedBadge />}
      </View>
      <View className="flex-1 justify-between py-0.5">
        <Text
          className="text-sm font-semibold text-neutral-900 leading-snug"
          numberOfLines={2}
          ellipsizeMode="tail">
          {program.title}
        </Text>
        <View className="flex-row items-center justify-start gap-1">
          <Text className="text-[11px] text-neutral-500" numberOfLines={1}>
            {program.mitra.name}
          </Text>
          <Icon icon={VerifiedCheck} size={12} color={colors.primary[500]} />
        </View>
        <ProgressBar progress={progress} height={4} />
        <View className="flex-row items-end justify-between mt-1">
          <View>
            <Text className="text-xs text-neutral-500">Terkumpul</Text>
            <Text className="text-xs font-semibold text-primary-600">
              {formatCompactCurrency(collectedAmount)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-neutral-500">Sisa hari</Text>
            <Text className="text-xs font-semibold text-primary-600">
              {formatDaysLeftLabel(program.remaining_days)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
