import React from 'react';
import {View, TouchableOpacity, Text, Image, type ImageSourcePropType} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';

const navIcons = {
  homeActive: require('@/assets/images/nav/home-active.png'),
  homeInactive: require('@/assets/images/nav/home-inactive.png'),
  programActive: require('@/assets/images/nav/program-active.png'),
  programInactive: require('@/assets/images/nav/program-inactive.png'),
  donasiku: require('@/assets/images/nav/donasiku.png'),
  rutinActive: require('@/assets/images/nav/rutin-active.png'),
  rutinInactive: require('@/assets/images/nav/rutin-inactive.png'),
  userActive: require('@/assets/images/nav/user-active.png'),
  userInactive: require('@/assets/images/nav/user-inactive.png'),
};

interface TabConfig {
  label: string;
  activeImage: ImageSourcePropType;
  inactiveImage: ImageSourcePropType;
  isCentered?: boolean;
}

const TAB_CONFIG: Record<string, TabConfig> = {
  Home: {
    label: 'Beranda',
    activeImage: navIcons.homeActive,
    inactiveImage: navIcons.homeInactive,
  },
  Donations: {
    label: 'Program',
    activeImage: navIcons.programActive,
    inactiveImage: navIcons.programInactive,
  },
  MyDonations: {
    label: 'Donasi Saya',
    activeImage: navIcons.donasiku,
    inactiveImage: navIcons.donasiku,
    isCentered: true,
  },
  RecurringDonation: {
    label: 'Donasi Rutin',
    activeImage: navIcons.rutinActive,
    inactiveImage: navIcons.rutinInactive,
  },
  Account: {
    label: 'Akun',
    activeImage: navIcons.userActive,
    inactiveImage: navIcons.userInactive,
  },
};

export function BottomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row bg-white border-t border-neutral-200"
      style={{paddingBottom: insets.bottom}}>
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
              className="flex-1 min-h-[44px] items-center justify-end pb-1"
              onPress={handlePress}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{selected: isFocused}}>
              <View className="w-14 h-14 rounded-full bg-primary-500 items-center justify-center -mt-5 shadow-lg shadow-primary-500/30">
                <Image
                  source={config.activeImage}
                  className="w-7 h-7"
                  resizeMode="contain"
                />
              </View>
              <Text
                className={`text-[10px] mt-1 ${
                  isFocused
                    ? 'text-primary-600 font-semibold'
                    : 'text-neutral-500 font-medium'
                }`}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        }

        const iconSource = isFocused ? config?.activeImage : config?.inactiveImage;

        return (
          <TouchableOpacity
            key={route.key}
            className="flex-1 min-h-[44px] items-center justify-center py-2"
            onPress={handlePress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{selected: isFocused}}>
            {iconSource ? (
              <Image
                source={iconSource}
                className="w-6 h-6"
                resizeMode="contain"
              />
            ) : null}
            <Text
              className={`text-[10px] mt-1 ${
                isFocused
                  ? 'text-primary-600 font-semibold'
                  : 'text-neutral-400 font-medium'
              }`}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
