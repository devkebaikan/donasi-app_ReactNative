import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {MyDonationsTab} from '@/types/myDonations';

interface TabOption {
  value: MyDonationsTab;
  label: string;
}

const TAB_OPTIONS: TabOption[] = [
  {value: 'donasi', label: 'Donasi'},
  {value: 'penyaluran', label: 'Penyaluran'},
  {value: 'rekap', label: 'Rekap'},
];

interface MyDonationsTabBarProps {
  activeTab: MyDonationsTab;
  onChange: (tab: MyDonationsTab) => void;
}

export function MyDonationsTabBar({
  activeTab,
  onChange,
}: MyDonationsTabBarProps): React.JSX.Element {
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
