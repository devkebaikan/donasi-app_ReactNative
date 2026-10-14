import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {RecurringDonationTab} from '@/types/recurringDonation';

interface TabOption {
  value: RecurringDonationTab;
  label: string;
}

const TAB_OPTIONS: TabOption[] = [
  {value: 'bayar', label: 'Bayar Sekarang'},
  {value: 'saldo', label: 'Saku Berbagi'},
];

interface DonasiRutinTabBarProps {
  activeTab: RecurringDonationTab;
  onChange: (tab: RecurringDonationTab) => void;
}

export function DonasiRutinTabBar({
  activeTab,
  onChange,
}: DonasiRutinTabBarProps): React.JSX.Element {
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
