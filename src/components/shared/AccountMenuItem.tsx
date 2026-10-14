import React from 'react';
import {View, TouchableOpacity, Text, Switch, StyleSheet} from 'react-native';
import {Icon, type SolarIconComponent} from '@/components/ui/Icon';
import {AltArrowRight} from '@solar-icons/react-native/Linear';
import {colors, spacing, radius, fontSize, fontWeight, lineHeight} from '@/theme';

interface AccountMenuItemProps {
  icon: SolarIconComponent;
  label: string;
  /** Baris keterangan di bawah label. Tanpa ini barisnya satu baris seperti
   * menu di AccountScreen. */
  description?: string;
  /** 'circle' membungkus icon dengan lingkaran mint — dipakai baris pilihan
   * jenis donasi rutin. Default 'plain' seperti menu akun. */
  iconTone?: 'plain' | 'circle';
  trailing?: 'arrow' | 'toggle';
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  onPress?: () => void;
}

export function AccountMenuItem({
  icon,
  label,
  description,
  iconTone = 'plain',
  trailing = 'arrow',
  toggleValue = false,
  onToggleChange,
  onPress,
}: AccountMenuItemProps): React.JSX.Element {
  if (trailing === 'toggle') {
    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={1}
        onPress={() => onToggleChange?.(!toggleValue)}
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityState={{checked: toggleValue}}>
        <Icon icon={icon} size={22} color={colors.neutral[700]} />
        <Text style={styles.label}>{label}</Text>
        <Switch
          value={toggleValue}
          onValueChange={onToggleChange}
          trackColor={{false: colors.neutral[300], true: colors.primary[400]}}
          thumbColor={colors.neutral[0]}
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={description ? `${label}. ${description}` : label}>
      {iconTone === 'circle' ? (
        <View style={styles.iconCircle}>
          <Icon icon={icon} size={22} color={colors.primary[600]} />
        </View>
      ) : (
        <Icon icon={icon} size={22} color={colors.neutral[700]} />
      )}
      <View style={styles.textWrapper}>
        <Text style={description ? styles.labelStrong : styles.label}>
          {label}
        </Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
      <Icon icon={AltArrowRight} size={22} color={colors.neutral[400]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    flex: 1,
    gap: 2,
  },
  label: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.neutral[900],
  },
  labelStrong: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  description: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.neutral[500],
  },
});
