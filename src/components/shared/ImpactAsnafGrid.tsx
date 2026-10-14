import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Icon} from '@/components/ui/Icon';
import {getAsnafIcon} from '@/utils/asnafIcons';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {ImpactAsnafShare} from '@/types/impact';

interface ImpactAsnafGridProps {
  asnaf: ImpactAsnafShare[];
}

// Persen dengan koma sebagai pemisah desimal: 79.43 -> "79,43%".
function formatPercentage(value: number): string {
  return `${value.toFixed(2).replace('.', ',')}%`;
}

export function ImpactAsnafGrid({
  asnaf,
}: ImpactAsnafGridProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Peserta Program Berdasarkan Asnaf</Text>
      </View>
      <View style={styles.grid}>
        {/* Urutan mengikuti API — jangan diurut ulang di klien. */}
        {asnaf.map(item => (
          <View key={item.slug} style={styles.item} accessibilityRole="text">
            <View style={styles.iconWrapper}>
              <Icon
                icon={getAsnafIcon(item.slug)}
                size={20}
                color={colors.secondary[500]}
              />
            </View>
            <View style={styles.itemText}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemValue}>
                {formatPercentage(item.percentage)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primary[50],
    gap: spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.secondary[500],
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[0],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.md,
  },
  item: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary[100],
  },
  itemText: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSize.xs,
    color: colors.neutral[600],
  },
  itemValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
});
