import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, fontSize, fontWeight} from '@/theme';
import type {DonasiBersamaDetailTab} from '@/types/donasiBersama';

const TABS: {value: DonasiBersamaDetailTab; label: string}[] = [
  {value: 'contributions', label: 'Riwayat Patungan'},
  {value: 'about', label: 'Tentang Grup'},
];

interface DonasiBersamaDetailTabBarProps {
  activeTab: DonasiBersamaDetailTab;
  onChange: (tab: DonasiBersamaDetailTab) => void;
}

// Tab underline — standar aplikasi untuk berpindah antar bagian ISI di dalam
// satu halaman detail (lihat ProgramTabBar). Beda peran dengan
// DonasiBersamaTabBar yang segmented: yang itu mengganti isi satu daftar.
export function DonasiBersamaDetailTabBar({
  activeTab,
  onChange,
}: DonasiBersamaDetailTabBarProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      {TABS.map(tab => {
        const isActive = tab.value === activeTab;
        return (
          <TouchableOpacity
            key={tab.value}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(tab.value)}
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
