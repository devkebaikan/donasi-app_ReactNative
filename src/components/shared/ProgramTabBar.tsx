import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, fontSize, fontWeight} from '@/theme';
import type {DetailProgramTab} from '@/hooks/useDetailProgram';

const TABS: {key: DetailProgramTab; label: string}[] = [
  {key: 'about', label: 'Cerita'},
  {key: 'projects', label: 'Project Salur'},
  {key: 'donatur', label: 'Donatur'},
  {key: 'reports', label: 'Report Salur'},
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
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
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
