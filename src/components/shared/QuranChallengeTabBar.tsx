import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {ChallengeTab} from '@/types/quran';

interface TabOption {
  value: ChallengeTab;
  label: string;
}

const TAB_OPTIONS: TabOption[] = [
  {value: 'detail', label: 'Detail'},
  {value: 'surah', label: 'Surah'},
];

interface QuranChallengeTabBarProps {
  activeTab: ChallengeTab;
  onChange: (tab: ChallengeTab) => void;
}

export function QuranChallengeTabBar({
  activeTab,
  onChange,
}: QuranChallengeTabBarProps): React.JSX.Element {
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
            <Text style={[styles.label, isActive && styles.labelActive]}>
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
    marginHorizontal: spacing.lg,
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
