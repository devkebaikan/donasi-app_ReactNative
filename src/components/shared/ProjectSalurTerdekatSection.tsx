import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {
  AltArrowRight,
  Calendar,
  MapPoint,
  TagPrice,
} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors} from '@/theme';
import {formatCurrency} from '@/utils/formatCurrency';
import {formatDate} from '@/utils/formatDate';
import {sanitizeImageUrl} from '@/utils/imageUrl';
import type {LastTwoProjectItem} from '@/types/programDetail';

interface ProjectSalurTerdekatSectionProps {
  items: LastTwoProjectItem[] | any[];
  onPressNext: (projectSalurId: string) => void;
  onPressSeeAll?: () => void;
}

export function ProjectSalurTerdekatSection({
  items,
  onPressNext,
  onPressSeeAll,
}: ProjectSalurTerdekatSectionProps): React.JSX.Element | null {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <View className="mx-4 mt-4 bg-white rounded-xl">
      {/* Header Section */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-bold text-neutral-800">
          Rencana Salur Terdekat
        </Text>
        {onPressSeeAll ? (
          <TouchableOpacity
            className="flex-row items-center gap-1"
            onPress={onPressSeeAll}
            activeOpacity={0.7}>
            <Text className="text-xs font-medium text-primary-600">Selengkapnya</Text>
            <Icon icon={AltArrowRight} size={14} color={colors.primary[600]} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* List Cards */}
      <View className="gap-3">
        {items.map(item => {
          const targetAmount = Number(item.nominal_target || 0);
          const achievedAmount = Number(item.nominal_achieved || 0);
          const progressPercent =
            targetAmount > 0
              ? Math.min(100, (achievedAmount / targetAmount) * 100)
              : 0;

          const locationText = item.lokasi_penyaluran || item.location;
          const activityText =
            item.activity === 'active open'
              ? 'Proses Penggalangan'
              : item.activity || item.status || 'Proses';

          const executionDate = item.excecution_time
            ? formatDate(item.excecution_time)
            : null;

          return (
            <TouchableOpacity
              key={String(item.id)}
              className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-xs"
              onPress={() => onPressNext(String(item.id))}
              activeOpacity={0.85}>
              {/* Banner Image */}
              {item.image ? (
               <Image
                    source={{uri: sanitizeImageUrl(item.image)}}
                    className="w-full aspect-[16/9] bg-neutral-100"
                    resizeMode="cover"
                />
              ) : null}

              {/* Content Info */}
              <View className="p-3 gap-2.5">
                {/* Title */}
                <Text
                  className="text-sm font-bold text-neutral-900 leading-snug"
                  numberOfLines={2}>
                  {item.title}
                </Text>

                {/* Badges / Chips */}
                <View className="flex-row items-center gap-2 flex-wrap">
                  {/* Status / Activity */}
                  <View className="flex-row items-center gap-1 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                    <View className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <Text className="text-[10px] font-semibold text-amber-600">
                      {activityText}
                    </Text>
                  </View>

                  {/* Lokasi */}
                  {locationText ? (
                    <View className="flex-row items-center gap-1">
                      <Icon icon={MapPoint} size={12} color={colors.neutral[500]} />
                      <Text className="text-xs text-neutral-600">
                        {locationText}
                      </Text>
                    </View>
                  ) : null}

                  {/* Penerima Manfaat */}
                  {/* {item.beneficiary ? (
                    <View className="flex-row items-center gap-1">
                      <Icon icon={UsersGroupRounded} size={12} color={colors.neutral[500]} />
                      <Text className="text-xs text-neutral-600">
                        {item.beneficiary} Penerima
                      </Text>
                    </View>
                  ) : null} */}
                </View>

                {/* Target & Capaian */}
                <View className="pt-1 gap-2">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1">
                      <Icon icon={TagPrice} size={14} color={colors.primary[500]} />
                      <Text className="text-xs text-neutral-500">Target :</Text>
                      <Text className="text-xs font-bold text-neutral-900">
                        {formatCurrency(targetAmount)}
                      </Text>
                    </View>
                  </View>

                  {/* Tanggal Pelaksanaan */}
                  <View className="flex-row items-center justify-between">
                     {executionDate ? (
                    <View className="flex-row items-center gap-1">
                      <Icon icon={Calendar} size={12} color={colors.neutral[500]} />
                      <Text className="text-xs text-neutral-600">
                        {executionDate}
                      </Text>
                    </View>
                  ) : null}
                  </View>

                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
