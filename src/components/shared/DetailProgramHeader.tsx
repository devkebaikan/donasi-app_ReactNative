import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {ArrowLeft, Share} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors} from '@/theme';

interface DetailProgramHeaderProps {
  title: string;
  onPressBack: () => void;
  onPressShare: () => void;
}

export function DetailProgramHeader({
  title,
  onPressBack,
  onPressShare,
}: DetailProgramHeaderProps): React.JSX.Element {
  return (
    <View className="flex-row items-center px-2 py-1 gap-2 bg-white">
      <TouchableOpacity
        className="w-11 h-11 items-center justify-center"
        onPress={onPressBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Kembali">
        <Icon icon={ArrowLeft} size={24} color={colors.neutral[900]} />
      </TouchableOpacity>
      <Text
        className="flex-1 text-base font-semibold text-neutral-900 text-center"
        numberOfLines={1}
        ellipsizeMode="tail">
        {title}
      </Text>
      <TouchableOpacity
        className="w-11 h-11 items-center justify-center"
        onPress={onPressShare}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Bagikan program">
        <Icon icon={Share} size={22} color={colors.neutral[900]} />
      </TouchableOpacity>
    </View>
  );
}
