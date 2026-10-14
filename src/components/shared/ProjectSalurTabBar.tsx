import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {DetailProjectSalurTab} from '@/hooks/useDetailProjectSalur';

const TABS: {key: DetailProjectSalurTab; label: string}[] = [
  {key: 'report', label: 'Report'},
  {key: 'donatur', label: 'Donatur'},
];

interface ProjectSalurTabBarProps {
  activeTab: DetailProjectSalurTab;
  onChange: (tab: DetailProjectSalurTab) => void;
}

// Tab segmented 2 item — visual disamakan dengan `MyDonationsTabBar`
// (Donasi Saya): container abu-abu, tab aktif berlatar putih. Bukan reuse
// ProgramTabBar (underline, 4 item tetap) maupun MyDonationsTabBar langsung
// (tab enum beda) — style-nya di-copy 1:1, lihat detail-project-salur.md
// § "Catatan Implementasi".
export function ProjectSalurTabBar({
  activeTab,
  onChange,
}: ProjectSalurTabBarProps): React.JSX.Element {
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
            <Text style={[styles.label, isActive && styles.labelActive]}>
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
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  tabActive: {
    backgroundColor: colors.neutral[0],
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
