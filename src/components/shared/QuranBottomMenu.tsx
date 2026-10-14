import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon, type SolarIconComponent} from '@/components/ui/Icon';
import {
  Home,
  Book2,
  ChartSquare,
  Settings,
} from '@solar-icons/react-native/Bold';
import {
  Home as HomeLinear,
  Book2 as Book2Linear,
  ChartSquare as ChartSquareLinear,
  Settings as SettingsLinear,
} from '@solar-icons/react-native/Linear';
import {colors, spacing, shadows, fontSize, fontWeight} from '@/theme';

interface TabConfig {
  label: string;
  activeIcon: SolarIconComponent;
  inactiveIcon: SolarIconComponent;
}

// Bottom menu kedua, khusus menu Quran — sengaja tidak memakai BottomTabBar
// milik menu utama supaya perubahan di sini tidak berisiko ke tab yang sudah
// stabil. Lihat docs/05-architecture/adr/ADR-002-quran-tab-navigator.md.
const TAB_CONFIG: Record<string, TabConfig> = {
  QuranHome: {label: 'Beranda', activeIcon: Home, inactiveIcon: HomeLinear},
  QuranSurahList: {label: 'Surah', activeIcon: Book2, inactiveIcon: Book2Linear},
  QuranProgress: {
    label: 'Progres',
    activeIcon: ChartSquare,
    inactiveIcon: ChartSquareLinear,
  },
  QuranSetting: {
    label: 'Pengaturan',
    activeIcon: Settings,
    inactiveIcon: SettingsLinear,
  },
};

export function QuranBottomMenu({
  state,
  navigation,
}: BottomTabBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {paddingBottom: insets.bottom}]}>
      {state.routes.map((route, index) => {
        const config = TAB_CONFIG[route.name];
        const isFocused = state.index === index;
        const label = config?.label ?? route.name;

        function handlePress(): void {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={handlePress}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{selected: isFocused}}>
            <Icon
              icon={
                isFocused
                  ? config?.activeIcon ?? Home
                  : config?.inactiveIcon ?? HomeLinear
              }
              size={24}
              color={isFocused ? colors.primary[600] : colors.neutral[400]}
            />
            <Text style={[styles.label, isFocused && styles.labelActive]}>
              {label}
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
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    ...shadows.md,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.neutral[400],
  },
  labelActive: {
    color: colors.primary[600],
    fontWeight: fontWeight.semiBold,
  },
});
