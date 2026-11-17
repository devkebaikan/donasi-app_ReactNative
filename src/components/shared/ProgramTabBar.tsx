import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight, shadows} from '@/theme';
import type {DetailProgramTab} from '@/hooks/useDetailProgram';

const TABS: {key: DetailProgramTab; label: string}[] = [
  {key: 'about', label: 'Cerita'},
  {key: 'projects', label: 'Salur'},
  {key: 'donatur', label: 'Donatur'},
  {key: 'reports', label: 'Fundraiser'},
];

interface ProgramTabBarProps {
  activeTab: DetailProgramTab;
  onChange: (tab: DetailProgramTab) => void;
}

export function ProgramTabBar({
  activeTab,
  onChange,
}: ProgramTabBarProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      {TABS.map(tab => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive ? styles.tabActive : styles.tabInactive]}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{selected: isActive}}>
            <Text
              style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}
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
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
  },
  tabActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  tabInactive: {
    backgroundColor: colors.neutral[0],
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  labelActive: {
    color: colors.neutral[0],
    fontWeight: fontWeight.semiBold,
  },
  labelInactive: {
    color: colors.neutral[700],
  },
});
