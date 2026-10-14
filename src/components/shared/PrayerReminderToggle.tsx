import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {Bell, BellOff} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, radius} from '@/theme';

interface PrayerReminderToggleProps {
  label: string;
  isActive: boolean;
  onToggle: () => void;
}

export function PrayerReminderToggle({
  label,
  isActive,
  onToggle,
}: PrayerReminderToggleProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{checked: isActive}}
      accessibilityLabel={`Pengingat ${label}`}>
      <Icon
        icon={isActive ? Bell : BellOff}
        size={20}
        color={isActive ? colors.primary[700] : colors.neutral[400]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
});
