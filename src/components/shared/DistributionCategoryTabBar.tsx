import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {DistributionCategory} from '@/types/impact';

interface TabOption {
  value: DistributionCategory;
  label: string;
}

// Daftarnya KONSTANTA, bukan dirakit dari data: hanya dua jenis dana yang
// dikenal, dan tab dinamis membuat lebar tiap tab tidak bisa diperkirakan.
const TAB_OPTIONS: TabOption[] = [
  {value: 'all', label: 'Semua'},
  {value: 'sedekah', label: 'Sedekah'},
  {value: 'wakaf', label: 'Wakaf'},
];

interface DistributionCategoryTabBarProps {
  activeTab: DistributionCategory;
  onChange: (category: DistributionCategory) => void;
}

// Segmented tab bar standar aplikasi — bentuk yang sama dengan
// MyDonationsTabBar dan RecurringDonationTabBar. Versi pertama memakai chip
// pill mengikuti mockup, tapi app ini sudah punya satu bentuk baku untuk
// berpindah antar segmen dan menambah bentuk kedua bikin UI tidak konsisten.
export function DistributionCategoryTabBar({
  activeTab,
  onChange,
}: DistributionCategoryTabBarProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      {TAB_OPTIONS.map(option => {
        const isActive = option.value === activeTab;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{selected: isActive}}>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  tabActive: {
    backgroundColor: colors.neutral[0],
  },
  tabLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[500],
  },
  tabLabelActive: {
    color: colors.primary[600],
    fontWeight: fontWeight.semiBold,
  },
});
