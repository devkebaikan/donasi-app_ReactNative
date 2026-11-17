import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CalendarMinimalistic} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors} from '@/theme';

interface FloatingDonationFooterProps {
  isRutin: boolean;
  donationLabel: string;
  donateButtonColor?: string;
  onPressSecondary: () => void;
  onPressDonate: () => void;
}

export function FloatingDonationFooter({
  isRutin,
  donationLabel,
  donateButtonColor,
  onPressSecondary,
  onPressDonate,
}: FloatingDonationFooterProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute left-0 right-0 bottom-0 bg-white/95 border-t border-neutral-200 px-4 pt-3 flex-row gap-3 shadow-lg"
      style={{paddingBottom: Math.max(insets.bottom, 12)}}>
      <TouchableOpacity
        className="w-1/3 min-h-[44px] py-2.5 px-3 rounded-lg border border-primary-500 bg-white items-center justify-center flex-row gap-1.5"
        onPress={onPressSecondary}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={isRutin ? 'Rutin' : 'Bagikan'}>
        <Icon icon={CalendarMinimalistic} size={18} color={colors.primary[500]} />
        <Text className="text-sm font-semibold text-primary-500">
          {isRutin ? 'Rutin' : 'Rutin'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-1 min-h-[44px] py-2.5 px-4 rounded-lg bg-secondary-500 items-center justify-center shadow-sm"
        style={donateButtonColor ? {backgroundColor: donateButtonColor} : undefined}
        onPress={onPressDonate}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${donationLabel} Sekarang`}>
        <Text className="text-white text-sm font-bold uppercase tracking-wide">
          {`${donationLabel} Sekarang`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
