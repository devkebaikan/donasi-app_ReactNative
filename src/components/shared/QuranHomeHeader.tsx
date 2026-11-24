import React from 'react';
import {View, TouchableOpacity, StatusBar, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon} from '@/components/ui/Icon';
import {Bell} from '@solar-icons/react-native/Linear';
import {SearchBar} from '@/components/ui/SearchBar';
import {AppLogo} from '@/components/ui/AppLogo';
import {colors, spacing} from '@/theme';

interface QuranHomeHeaderProps {
  onPressAppLogo: () => void;
  onPressSearch: () => void;
  onPressNotification: () => void;
  headerBackgroundColor?: string;
  searchBackgroundColor?: string;
}

// Bentuknya mengikuti HomeHeader di menu utama: satu baris ringkas berisi
// SearchBar dan tombol ikon. Lokasi tidak di sini — ia berada di dalam area
// scroll, tepat di bawah search.
export function QuranHomeHeader({
  onPressAppLogo,
  onPressSearch,
  onPressNotification,
  headerBackgroundColor,
  searchBackgroundColor,
}: QuranHomeHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar
        translucent={false}
        backgroundColor={colors.primary[500]}
        barStyle="light-content"
      />
      <View
        style={[
          styles.container,
          {paddingTop: insets.top + spacing.md, backgroundColor: headerBackgroundColor},
        ]}>
        {/* Logo aplikasi di kiri search, posisi yang sama dengan HomeHeader —
            bedanya di sini bisa ditekan untuk kembali ke menu utama. */}
        <TouchableOpacity
          onPress={onPressAppLogo}
          hitSlop={styles.logoHitSlop}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke halaman utama">
          <AppLogo />
        </TouchableOpacity>

        <View style={styles.searchWrapper}>
          <SearchBar
            placeholder="Cari surah..."
            onPress={onPressSearch}
            backgroundColor={searchBackgroundColor}
          />
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onPressNotification}
          accessibilityRole="button"
          accessibilityLabel="Notifikasi">
          <Icon icon={Bell} size={24} color={colors.neutral[700]} />
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
  },
  // Logo 36px, di bawah 44px, jadi area sentuhnya dijaga lewat hitSlop.
  logoHitSlop: {top: 4, bottom: 4, left: 4, right: 4},
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
