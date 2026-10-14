import React from 'react';
import {View, Text, TouchableOpacity, StatusBar, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon} from '@/components/ui/Icon';
import {ArrowLeft} from '@solar-icons/react-native/Linear';
import {colors, spacing, fontSize, fontWeight} from '@/theme';

interface HeaderLightProps {
  title: string;
  onBack: () => void;
  rightSlot?: React.ReactNode;
}

// Judul SELALU rata tengah — satu perilaku untuk seluruh app, tanpa knob.
// Saat tidak ada rightSlot, header menyisipkan spacer selebar tombol back di
// sisi kanan; tanpa itu judul cuma terpusat pada ruang SISA di sebelah tombol
// back dan tampak bergeser setengah lebar tombol (22px) ke kanan.
export function HeaderLight({
  title,
  onBack,
  rightSlot,
}: HeaderLightProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.container, {paddingTop: insets.top + spacing.md}]}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon icon={ArrowLeft} size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {/* Penyeimbang tombol back saat tidak ada aksi di kanan. */}
        {rightSlot ?? <View style={styles.iconButton} />}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
});
