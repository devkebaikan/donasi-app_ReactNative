import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { CheckCircle } from '@solar-icons/react-native/Linear';
import { Icon } from '@/components/ui/Icon';
import { colors, spacing, radius, fontSize, fontWeight } from '@/theme';
import type { PaymentMethod } from '@/types/payment';

interface PaymentMethodListItemProps {
  method: PaymentMethod;
  isSelected: boolean;
  onPress: () => void;
}

export function PaymentMethodListItem({
  method,
  isSelected,
  onPress,
}: PaymentMethodListItemProps): React.JSX.Element {
  return (
    <TouchableOpacity
      testID={`payment-method-item-${method.id}`}
      style={[styles.item, isSelected && styles.itemSelected]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={method.name}
      accessibilityState={{ selected: isSelected }}>
      {method.image_url || method.logoUrl ? (
        <Image
          source={{ uri: method.image_url || method.logoUrl }}
          style={styles.logo}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.logoPlaceholder} />
      )}
      <Text style={styles.name}>{method.name}</Text>
      {isSelected ? (
        <Icon icon={CheckCircle} size={22} color={colors.primary[500]} />
      ) : (
        <View style={styles.radioEmpty} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  itemSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[100],
  },
  name: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  radioEmpty: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
  },
});
