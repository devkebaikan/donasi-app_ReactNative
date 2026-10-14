import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon, type SolarIconComponent} from '@/components/ui/Icon';
import {
  Home,
  Gift,
  Heart,
  CalendarMark,
  User,
} from '@solar-icons/react-native/Bold';
import {
  Home as HomeLinear,
  Gift as GiftLinear,
  Heart as HeartLinear,
  CalendarMark as CalendarMarkLinear,
  User as UserLinear,
} from '@solar-icons/react-native/Linear';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {colors, spacing, radius, shadows, fontSize, fontWeight} from '@/theme';

interface TabConfig {
  label: string;
  activeIcon: SolarIconComponent;
  inactiveIcon: SolarIconComponent;
  isCentered?: boolean;
}

const TAB_CONFIG: Record<string, TabConfig> = {
  Home: {label: 'Beranda', activeIcon: Home, inactiveIcon: HomeLinear},
  Donations: {label: 'Program', activeIcon: Gift, inactiveIcon: GiftLinear},
  MyDonations: {
    label: 'Donasi Saya',
    activeIcon: Heart,
    inactiveIcon: HeartLinear,
    isCentered: true,
  },
  RecurringDonation: {
    label: 'Donasi Rutin',
    activeIcon: CalendarMark,
    inactiveIcon: CalendarMarkLinear,
  },
  Account: {
    label: 'Akun',
    activeIcon: User,
    inactiveIcon: UserLinear,
  },
};

export function BottomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {paddingBottom: insets.bottom}]}>
      {state.routes.map((route, index) => {
        const options = descriptors[route.key]?.options;
        const config = TAB_CONFIG[route.name];
        const isFocused = state.index === index;
        const label =
          typeof options?.tabBarLabel === 'string'
            ? options.tabBarLabel
            : config?.label ?? route.name;

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

        if (config?.isCentered) {
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.centeredTab}
              onPress={handlePress}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{selected: isFocused}}>
              <View style={styles.centeredButton}>
                <Icon
                  icon={config.activeIcon}
                  size={28}
                  color={colors.neutral[0]}
                />
              </View>
              <Text style={[styles.label, isFocused && styles.labelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={handlePress}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{selected: isFocused}}>
            <Icon
              icon={
                isFocused
                  ? config?.activeIcon ?? Home
                  : config?.inactiveIcon ?? HomeLinear
              }
              size={24}
              color={isFocused ? colors.primary[500] : colors.neutral[400]}
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
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    // paddingBottom: spacing.sm,
  },
  centeredTab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    // paddingBottom: spacing.sm,
  },
  centeredButton: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    ...shadows.lg,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.neutral[400],
  },
  labelActive: {
    color: colors.primary[500],
    fontWeight: fontWeight.semiBold,
  },
});
