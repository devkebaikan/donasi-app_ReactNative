import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight, shadows} from '@/theme';
import type {LembagaTab} from '@/hooks/useLembagaProfile';

const TABS: {key: LembagaTab; label: string}[] = [
  {key: 'program', label: 'Program'},
  {key: 'about', label: 'Tentang Mitra'},
  {key: 'report', label: 'Laporan'},
];

interface LembagaTabBarProps {
  activeTab: LembagaTab;
  onChange: (tab: LembagaTab) => void;
}

export function LembagaTabBar({
  activeTab,
  onChange,
}: LembagaTabBarProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      {TABS.map(tab => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{selected: isActive}}>
            <Text
              style={[styles.label, isActive && styles.labelActive]}
              numberOfLines={1}>
              {tab.label}
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
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  tabActive: {
    backgroundColor: colors.neutral[0],
    ...shadows.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[500],
  },
  labelActive: {
    color: colors.primary[600],
    fontWeight: fontWeight.semiBold,
  },
});
