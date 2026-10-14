import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Icon, type SolarIconComponent} from '@/components/ui/Icon';
import {colors, spacing, fontSize, fontWeight, lineHeight} from '@/theme';

interface EmptyStateProps {
  icon: SolarIconComponent;
  title: string;
  description?: string;
}

export function EmptyState({
  icon,
  title,
  description,
}: EmptyStateProps): React.JSX.Element {
  return (
    <View style={styles.container} accessibilityRole="text">
      <Icon icon={icon} size={48} color={colors.neutral[300]} />
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});
