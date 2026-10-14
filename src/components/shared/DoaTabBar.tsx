import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, fontSize, fontWeight} from '@/theme';
import type {DoaTab} from '@/types/doa';

interface TabOption {
  value: DoaTab;
  label: string;
  // Label tanpa emoji — dipakai screen reader supaya "🌼" tidak dibacakan
  // sebagai "bunga mekar" di tengah nama tab.
  accessibilityLabel: string;
}

const TAB_OPTIONS: TabOption[] = [
  {value: 'all', label: 'Semua Doa 🌼', accessibilityLabel: 'Semua Doa'},
  {value: 'mine', label: 'Doa Saya 🤲', accessibilityLabel: 'Doa Saya'},
  {value: 'favorite', label: 'Doa Favorit ⭐', accessibilityLabel: 'Doa Favorit'},
];

interface DoaTabBarProps {
  activeTab: DoaTab;
  onChange: (tab: DoaTab) => void;
}

export function DoaTabBar({
  activeTab,
  onChange,
}: DoaTabBarProps): React.JSX.Element {
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
            accessibilityLabel={option.accessibilityLabel}
            accessibilityState={{selected: isActive}}>
            <Text
              style={[styles.label, isActive && styles.labelActive]}
              numberOfLines={1}>
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
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  tab: {
    flex: 1,
    // 44 supaya touch target tetap memenuhi standar meski labelnya pendek.
    minHeight: 44,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary[500],
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[500],
  },
  labelActive: {
    color: colors.primary[500],
    fontWeight: fontWeight.semiBold,
  },
});
