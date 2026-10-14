import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {Icon} from '@/components/ui/Icon';
import {Magnifer} from '@solar-icons/react-native/Linear';
import {colors, spacing, radius, fontSize} from '@/theme';

interface SearchBarProps {
  placeholder?: string;
  onPress: () => void;
  backgroundColor?: string;
}

export function SearchBar({
  placeholder = 'Cari program donasi...',
  onPress,
  backgroundColor,
}: SearchBarProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={[styles.container, {backgroundColor: backgroundColor || colors.neutral[100]}]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={placeholder}>
      <Icon icon={Magnifer} size={20} color={colors.neutral[400]} />
      <Text style={styles.placeholder} numberOfLines={1}>
        {placeholder}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
  },
  placeholder: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.neutral[400],
  },
});
