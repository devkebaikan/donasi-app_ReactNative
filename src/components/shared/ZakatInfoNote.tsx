import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import {formatCurrency} from '@/utils/formatCurrency';

interface ZakatInfoNoteProps {
  pricePerGram: number | null;
  nisab: number | null;
  nisabLabel: string;
  isLoading: boolean;
}

export function ZakatInfoNote({
  pricePerGram,
  nisab,
  nisabLabel,
  isLoading,
}: ZakatInfoNoteProps): React.JSX.Element {
  return (
    <View style={styles.container} accessibilityRole="text">
      <Text style={styles.title}>Catatan:</Text>
      <Text style={styles.row}>
        Harga Emas:{' '}
        <Text style={styles.value}>
          {isLoading || pricePerGram === null
            ? 'Memuat...'
            : formatCurrency(pricePerGram)}
        </Text>
      </Text>
      <Text style={styles.row}>
        {nisabLabel}:{' '}
        <Text style={styles.value}>
          {isLoading || nisab === null ? 'Memuat...' : formatCurrency(nisab)}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.semantic.infoLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  row: {
    fontSize: fontSize.sm,
    color: colors.neutral[700],
  },
  value: {
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
});
