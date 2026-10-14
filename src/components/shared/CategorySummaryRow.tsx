import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {AltArrowRight} from '@solar-icons/react-native/Linear';
import {Icon, type SolarIconComponent} from '@/components/ui/Icon';
import {formatCurrency} from '@/utils/formatCurrency';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

interface CategorySummaryRowProps {
  icon: SolarIconComponent;
  name: string;
  donationCount: number;
  totalAmount: number;
  onPress: () => void;
}

export function CategorySummaryRow({
  icon,
  name,
  donationCount,
  totalAmount,
  onPress,
}: CategorySummaryRowProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${donationCount} donasi, ${formatCurrency(totalAmount)}`}>
      <View style={styles.iconWrapper}>
        <Icon icon={icon} size={22} color={colors.primary[600]} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.meta}>
          {donationCount} Donasi · {formatCurrency(totalAmount)}
        </Text>
      </View>
      <Icon icon={AltArrowRight} size={20} color={colors.neutral[400]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  meta: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
});
