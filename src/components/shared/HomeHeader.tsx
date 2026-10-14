import React from 'react';
import {View, TouchableOpacity, StatusBar, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon} from '@/components/ui/Icon';
import {Bell} from '@solar-icons/react-native/Linear';
import {AppLogo} from '@/components/ui/AppLogo';
import {SearchBar} from '@/components/ui/SearchBar';
import {NotifBadge} from '@/components/shared/NotifBadge';
import {colors, spacing} from '@/theme';

interface HomeHeaderProps {
  notificationCount: number;
  onPressNotification: () => void;
  onPressSearch: () => void;
  headerBackgroundColor?: string;
  searchBackgroundColor?: string;
}

export function HomeHeader({
  notificationCount,
  onPressNotification,
  onPressSearch,
  headerBackgroundColor,
  searchBackgroundColor,
}: HomeHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.container, {paddingTop: insets.top + spacing.md, backgroundColor: headerBackgroundColor}]}>
        <AppLogo />

        <View style={styles.searchWrapper}>
          <SearchBar onPress={onPressSearch} backgroundColor={searchBackgroundColor} />
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onPressNotification}
          accessibilityRole="button"
          accessibilityLabel={
            notificationCount > 0
              ? `Notifikasi, ${notificationCount} belum dibaca`
              : 'Notifikasi'
          }>
          <Icon icon={Bell} size={24} color={colors.neutral[700]} />
          <NotifBadge count={notificationCount} />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    // backgroundColor:"white"
  },
  searchWrapper: {
    flex: 1,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
