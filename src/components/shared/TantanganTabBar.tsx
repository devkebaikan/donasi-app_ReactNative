import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {TantanganTab} from '@/types/tantangan';

interface TabOption {
  value: TantanganTab;
  label: string;
}

const TAB_OPTIONS: TabOption[] = [
  {value: 'popular', label: 'Populer'},
  {value: 'new', label: 'Baru'},
  {value: 'ending', label: 'Segera Berakhir'},
];

interface TantanganTabBarProps {
  activeTab: TantanganTab;
  onChange: (tab: TantanganTab) => void;
}

// Struktur dan style disamakan persis dengan DonasiBersamaTabBar/InfakTabBar —
// tab segmented adalah standar aplikasi ini untuk mengganti isi satu daftar.
// Komponennya tetap terpisah karena props tab bar lain terikat union tipenya
// masing-masing (DonasiBersamaTab, InfakTab), sama seperti tab bar per domain
// yang sudah ada.
export function TantanganTabBar({
  activeTab,
  onChange,
}: TantanganTabBarProps): React.JSX.Element {
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
            <Text
              style={[styles.tabLabel, isActive && styles.tabLabelActive]}
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
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: spacing.xs,
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
