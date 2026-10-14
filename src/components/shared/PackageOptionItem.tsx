import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {AddCircle, MinusCircle} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import {formatCurrency} from '@/utils/formatCurrency';
import type {DonationPackage} from '@/types/programDetail';

interface PackageOptionItemProps {
  item: DonationPackage;
  isSelected: boolean;
  quantity: number;
  onSelect: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function PackageOptionItem({
  item,
  isSelected,
  quantity,
  onSelect,
  onIncrement,
  onDecrement,
}: PackageOptionItemProps): React.JSX.Element {
  return (
    <View style={[styles.container, isSelected && styles.containerSelected]}>
      <TouchableOpacity
        style={styles.row}
        onPress={onSelect}
        accessibilityRole="button"
        accessibilityLabel={`${item.label}, ${formatCurrency(item.nominal)}`}
        accessibilityState={{selected: isSelected}}>
        <Image source={{uri: item.iconUrl}} style={styles.icon} />
        <View style={styles.info}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.nominal}>{formatCurrency(item.nominal)}</Text>
        </View>
      </TouchableOpacity>

      {isSelected ? (
        <View style={styles.stepperRow}>
          <Text style={styles.stepperLabel}>Jumlah paket</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={onDecrement}
              disabled={quantity <= 1}
              accessibilityRole="button"
              accessibilityLabel="Kurangi jumlah paket">
              <Icon
                icon={MinusCircle}
                size={24}
                color={quantity <= 1 ? colors.neutral[300] : colors.primary[500]}
              />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={onIncrement}
              accessibilityRole="button"
              accessibilityLabel="Tambah jumlah paket">
              <Icon icon={AddCircle} size={24} color={colors.primary[500]} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  containerSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[100],
  },
  info: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  nominal: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral[200],
  },
  stepperLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[700],
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepperButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: 20,
    textAlign: 'center',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
});
