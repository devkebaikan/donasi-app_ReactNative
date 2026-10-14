import React from 'react';
import {Switch} from 'react-native';
import {PrayerSettingRow} from '@/components/shared/PrayerSettingRow';
import {colors} from '@/theme';

interface PrayerSettingToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function PrayerSettingToggleRow({
  label,
  description,
  value,
  onChange,
}: PrayerSettingToggleRowProps): React.JSX.Element {
  return (
    <PrayerSettingRow
      label={label}
      description={description}
      rightSlot={
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{
            false: colors.neutral[300],
            true: colors.primary[400],
          }}
          thumbColor={value ? colors.primary[600] : colors.neutral[100]}
          accessibilityRole="switch"
          accessibilityState={{checked: value}}
          accessibilityLabel={label}
        />
      }
    />
  );
}
