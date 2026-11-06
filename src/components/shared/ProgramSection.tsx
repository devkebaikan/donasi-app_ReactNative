import React from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SectionTitle} from '@/components/ui/SectionTitle';
import {colors} from '@/theme';
import {formatCompactCurrency} from '@/utils/formatCurrency';
import {getDonationProgress} from '@/utils/donationProgress';
import {sanitizeImageUrl} from '@/utils/imageUrl';
import type {Program} from '@/types/program';

interface ProgramSectionProps {
  programs: Program[];
  onPressProgram: (program: Program) => void;
  className?: string;
}

export function ProgramSection({
  programs = [],
  onPressProgram,
  className = '',
}: ProgramSectionProps): React.JSX.Element {
  if (programs.length === 0) {
    return <View />;
  }

  return (
    <View className={`bg-white pt-2 mb-2 ${className}`}>
      <SectionTitle
        title="#BersamaJadiMudah"
        description="Pilih program yang sesuai dengan niat baikmu, dan mari wujudkan perubahan bersama."
      />

      <ImageBackground
        source={require('@/assets/images/home/tema-ustman.jpeg')}
        className="h-64 justify-center overflow-hidden"
        resizeMode="cover">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="items-center pr-4 py-2"
          decelerationRate="fast"
          removeClippedSubviews={true}>
          {/* Spacer kiri agar kartu pertama tidak menutupi visual tema */}
          <View className="w-32 shrink-0" />

          {programs.map(program => {
            const pct = getDonationProgress(
              Number(program.nominal_achieved) || 0,
              Number(program.nominal_target) || 0,
            );
            const categoryName =
              program.category?.name ||
              (typeof program.category === 'string' ? program.category : '');
            const remainingDays =
              program.remaining_days != null ? `${program.remaining_days} hari` : '∞';

            const safeImage = sanitizeImageUrl(program.image);

            return (
              <TouchableOpacity
                key={program.id}
                className="w-48 bg-white rounded-2xl mr-3 border border-neutral-100 shadow-sm overflow-hidden flex-col"
                onPress={() => onPressProgram(program)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={program.title}>
                {/* Thumbnail Image + Category Badge */}
                <View className="relative w-full h-[105px] bg-neutral-100">
                  {safeImage ? (
                    <Image
                      source={{uri: safeImage}}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full bg-neutral-200" />
                  )}
                  {Boolean(categoryName) && (
                    <View className="absolute top-2 right-2 bg-secondary-500 px-2 py-0.5 rounded-full">
                      <Text className="text-white text-[9px] font-bold leading-none" numberOfLines={1}>
                        {categoryName}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Content */}
                <View className="p-3 flex-1 justify-between">
                  <Text className="text-xs font-semibold text-neutral-800 leading-snug line-clamp-2 min-h-[32px] mb-2" numberOfLines={2}>
                    {program.title}
                  </Text>

                  {/* Progress Bar */}
                  <View className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden mb-2">
                    <LinearGradient
                      colors={[colors.primary[400], colors.primary[600]]}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      style={[styles.progressFill, {width: `${Math.min(pct, 100)}%`}]}
                    />
                  </View>
                  {/* Stats Row */}
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[10px] font-bold text-primary-600 flex-1" numberOfLines={1}>
                      {formatCompactCurrency(Number(program.nominal_achieved) || 0)}
                    </Text>
                    <Text className="text-[9px] text-neutral-400">
                      {/* {program.is_target_nominal && `${pct}% · `} */}
                      {remainingDays}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  progressFill: {
    height: '100%',
    borderRadius: 9999,
  },
});
