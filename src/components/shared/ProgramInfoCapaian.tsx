import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {AltArrowDown, AltArrowUp, UsersGroupRounded} from '@solar-icons/react-native/Linear';
import { HeartAngle} from '@solar-icons/react-native/Bold';
import {Icon} from '@/components/ui/Icon';
import {ProgramProgressBar} from '@/components/shared/ProgramProgressBar';
import {formatCurrency} from '@/utils/formatCurrency';
import {formatDaysLeftValue} from '@/utils/donationProgress';
import {colors} from '@/theme';
import type {ProgramDetail} from '@/types/programDetail';

interface ProgramInfoCapaianProps {
  program: ProgramDetail;
  expandedContent?: React.ReactNode;
}

export function ProgramInfoCapaian({
  program,
  expandedContent,
}: ProgramInfoCapaianProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);

  const collected = Number(program.nominal_achieved ?? program.collectedAmount ?? 0);
  const used = Number(program.nominal_used ?? program.usedAmount ?? 0);
  const target =
    program.nominal_target !== undefined && program.nominal_target !== null
      ? Number(program.nominal_target)
      : Number.isFinite(program.goalAmount)
      ? program.goalAmount
      : null;
  const donaturCount = Number(
    program.total_donors ?? program.total_donaturs ?? program.donaturCount ?? 0,
  );
  const daysLeft =
    program.remaining_days !== undefined && program.remaining_days !== null
      ? Number(program.remaining_days)
      : Number.isFinite(program.daysLeft)
      ? program.daysLeft
      : null;

  const progressPercent =
    program.progress_achieved !== undefined && program.progress_achieved !== null
      ? Math.min(100, Number(program.progress_achieved))
      : target && target > 0
      ? Math.min(100, (collected / target) * 100)
      : 100;

  const isGoalUnlimited = target === null;
  const isTimeUnlimited = daysLeft === null;
  const amountAllocated= Number(program.nominal_achieved) - Number(program.no_project_nominal?.nominal);
  const availableAmount = Number(program.collectedAmount - amountAllocated);

  return (
    <View className="px-4 py-3 bg-white">
      {/* Title */}
      <Text
        className="text-lg font-bold text-neutral-900 mb-3 leading-snug"
        numberOfLines={3}
        ellipsizeMode="tail">
        {program.title}
      </Text>

      {/* Available Funds Row */}
      <View className="flex-row items-center justify-between mb-2">
        <View>
          <Text className="text-sm text-neutral-500 font-medium">Donasi Tersedia</Text>
          <Text className="text-lg font-bold text-secondary-500 mt-0.5">
            {formatCurrency(availableAmount)}
          </Text>
        </View>

        <TouchableOpacity
          className="flex-row items-center gap-1 py-1 px-2"
          onPress={() => setIsExpanded(previous => !previous)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={
            isExpanded ? 'Tutup detail capaian' : 'Lihat semua detail capaian'
          }
          accessibilityState={{expanded: isExpanded}}>
          <Text className="text-sm text-primary-600">
            {isExpanded ? 'Tutup' : 'Lihat Semua'}
          </Text>
          <Icon
            icon={isExpanded ? AltArrowUp : AltArrowDown}
            size={14}
            color={colors.primary[600]}
          />
        </TouchableOpacity>
      </View>

      {/* Detailed Info (collapsible) */}
      {isExpanded ? (
        <View className="my-2 gap-2.5">
          <View>
            <Text className="text-sm text-neutral-500">Donasi Terkumpul</Text>
            <View className="flex-row items-baseline flex-wrap gap-1 mt-0.5">
              <Text className="text-base font-bold text-primary-600">
                {formatCurrency(collected)}
              </Text>
              {!isGoalUnlimited && target !== null && (
                <>
                  <Text className="text-xs text-neutral-400"> dari target </Text>
                  <Text className="text-sm font-bold text-neutral-800">
                    {formatCurrency(target)}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Progress Bar */}
          <ProgramProgressBar progress={progressPercent} />

          {/* Stats Row */}
          <View className="flex-row justify-between items-center text-xs text-neutral-700 py-1">
            <View className="flex-row items-center gap-1.5">
              <Icon icon={HeartAngle} size={14} color={colors.primary[500]} />
              <Text className="font-bold text-neutral-900 text-xs">
                {donaturCount.toLocaleString('id-ID')}
              </Text>
              <Text className="text-neutral-500 text-xs">Donasi</Text>
            </View>

            {/* <View className="flex-row items-center gap-1.5">
              <Icon icon={UsersGroupRounded} size={16} color={colors.primary[500]} />
              <Text className="font-bold text-neutral-900 text-xs">
                {formatDaysLeftValue(isTimeUnlimited ? Infinity : (daysLeft ?? Infinity))}
              </Text>
              <Text className="text-neutral-500 text-xs">
                {isTimeUnlimited ? '' : 'hari lagi'}
              </Text>
            </View> */}
          </View>
        </View>
      ) : null}

      {isExpanded ? expandedContent : null}
    </View>
  );
}
