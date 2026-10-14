import React from 'react';
import {View, TouchableOpacity, StatusBar, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon} from '@/components/ui/Icon';
import {ArrowLeft} from '@solar-icons/react-native/Linear';
import {colors, spacing} from '@/theme';

// Header generik transparan — back + slot kanan opsional, tanpa judul (judul
// biasanya sudah tampil di konten di bawahnya). Dipakai mengambang di atas
// gambar/media, sebelum berubah jadi HeaderLight/HeaderColor setelah discroll.
// Posisi absolute jadi tanggung jawab screen pemakai (lihat NewsDetailScreen),
// bukan komponen ini, supaya tetap bisa dipakai di konteks non-absolute juga.
// Default 'light' — ikon putih di atas media gelap, perilaku lama semua
// pemakai yang sudah ada. 'dark' dipakai kalau header mengambang di atas latar
// terang, di mana ikon putih praktis tidak terlihat.
type HeaderTransparentTone = 'light' | 'dark';

interface HeaderTransparentProps {
  onBack: () => void;
  rightSlot?: React.ReactNode;
  tone?: HeaderTransparentTone;
}

export function HeaderTransparent({
  onBack,
  rightSlot,
  tone = 'light',
}: HeaderTransparentProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const isDark = tone === 'dark';

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? 'dark-content' : 'light-content'}
      />
      <View style={[styles.container, {paddingTop: insets.top}]}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon
            icon={ArrowLeft}
            size={24}
            color={isDark ? colors.primary[700] : colors.neutral[0]}
          />
        </TouchableOpacity>
        <View style={styles.spacer} />
        {rightSlot}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    flex: 1,
  },
});
