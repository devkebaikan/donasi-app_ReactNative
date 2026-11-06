import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { VerifiedCheck } from '@solar-icons/react-native/Linear';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { RecommendedBadge } from '@/components/shared/RecommendedBadge';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  getDonationProgress,
  formatDaysLeftValue,
} from '@/utils/donationProgress';
import { colors } from '@/theme';
import type { Program } from '@/types/program';
import type { ViewMode } from '@/types/donationFilter';

interface DonationListCardProps {
  program: Program;
  variant: ViewMode;
  onPress: (program: Program) => void;
}

const THUMBNAIL_WIDTH = 160;
const DEFAULT_ASPECT_RATIO = 1080 / 1920; // 16:9

export function DonationListCard({
  program,
  variant,
  onPress,
}: DonationListCardProps): React.JSX.Element {
  const [imageHeight, setImageHeight] = useState<number>(THUMBNAIL_WIDTH * DEFAULT_ASPECT_RATIO);

  const collectedAmount = Number(program.nominal_achieved) || 0;
  const progress = getDonationProgress(
    collectedAmount,
    program.nominal_target,
  );

  useEffect(() => {
    Image.getSize(
      program.image,
      (width, height) => {
        const aspectRatio = height / width;
        setImageHeight(THUMBNAIL_WIDTH * aspectRatio);
      },
      () => {
        setImageHeight(THUMBNAIL_WIDTH * DEFAULT_ASPECT_RATIO);
      },
    );
  }, [program.image]);

  if (variant === 'grid') {
    return (
      <TouchableOpacity
        testID={`donation-card-${program.id}`}
        className="flex-1 bg-white rounded-xl p-2 gap-2 border border-neutral-100 shadow-sm"
        onPress={() => onPress(program)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={program.title}>
        <View className="relative">
          <Image
            source={{ uri: program.image }}
            className="w-full h-28 rounded-lg bg-neutral-100"
            resizeMode="cover"
            accessibilityRole="image"
            accessibilityLabel={program.title}
          />
          {program.isRecommended && <RecommendedBadge />}
        </View>
        <View className="flex-1 justify-between gap-1.5">
          <Text className="text-sm font-semibold text-neutral-900" numberOfLines={2} ellipsizeMode="tail">
            {program.title}
          </Text>

          <View className="flex-row items-center gap-1">
            <Text className="text-xs text-neutral-500" numberOfLines={1}>
              {program.mitra.name}
            </Text>
            <Icon icon={VerifiedCheck} size={13} color={colors.primary[500]} />
          </View>

          <ProgressBar progress={progress} height={4} />
          <Footer collectedAmount={collectedAmount} remainingDays={program.remaining_days} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      testID={`donation-card-${program.id}`}
      className="flex-row gap-3 p-2 rounded-xl bg-neutral-50"
      onPress={() => onPress(program)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={program.title}>
      <View className="relative">
        <Image
          source={{ uri: program.image }}
          className="w-40 rounded-lg bg-neutral-100"
          style={{ height: imageHeight }}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={program.title}
        />
        {program.isRecommended && <RecommendedBadge />}
      </View>

      <View className="flex-1 justify-between gap-1">
        <Text className="text-sm font-semibold text-neutral-900" numberOfLines={2} ellipsizeMode="tail">
          {program.title}
        </Text>

        <View className="flex-row items-center gap-1">
          <Text className="text-xs text-neutral-500" numberOfLines={1}>
            {program.mitra.name}
          </Text>
          <Icon icon={VerifiedCheck} size={13} color={colors.primary[500]} />
        </View>

        <ProgressBar progress={progress} height={4} />
        <Footer collectedAmount={collectedAmount} remainingDays={program.remaining_days} />
      </View>
    </TouchableOpacity>
  );
}

function Footer({ collectedAmount, remainingDays }: { collectedAmount: number; remainingDays: number | null }): React.JSX.Element {
  return (
    <View className="flex-row justify-between items-end mt-1">
      <View>
        <Text className="text-xs text-neutral-500">Terkumpul</Text>
        <Text className="text-sm font-semibold text-primary-600" numberOfLines={1}>
          {formatCurrency(collectedAmount)}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-xs text-neutral-500">Sisa hari</Text>
        <Text className="text-sm font-semibold text-primary-600">
          {formatDaysLeftValue(remainingDays)}
        </Text>
      </View>
    </View>
  );
}
