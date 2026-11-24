import React from 'react';
import {View, Text, TouchableOpacity, StatusBar, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon} from '@/components/ui/Icon';
import {ArrowLeft} from '@solar-icons/react-native/Linear';
import {colors} from '@/theme';

interface HeaderLightProps {
  title: string;
  onBack: () => void;
  rightSlot?: React.ReactNode;
  isScrolled?: boolean;
  transparent?: boolean;
  variant?: 'primary' | 'light';
  className?: string;
}

// Judul SELALU rata tengah — satu perilaku untuk seluruh app, tanpa knob.
// Saat tidak ada rightSlot, header menyisipkan spacer selebar tombol back di
// sisi kanan; tanpa itu judul cuma terpusat pada ruang SISA di sebelah tombol
// back dan tampak bergeser setengah lebar tombol (20px) ke kanan.
export function HeaderLight({
  title,
  onBack,
  rightSlot,
  className = '',
}: HeaderLightProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar
        translucent={false}
        backgroundColor={colors.primary[500]}
        barStyle="light-content"
      />
      <View
        className={`w-full flex-row items-center px-4 ${className}`}
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            height: insets.top + 54,
          },
        ]}>
        {/* Tombol Back */}
        <TouchableOpacity
          className="w-10 h-10 rounded-full items-center justify-center active:bg-white/10"
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon icon={ArrowLeft} size={22} color={colors.neutral[0]} />
        </TouchableOpacity>

        {/* Judul Halaman */}
        <Text
          className="flex-1 text-center font-semibold text-base mx-2 text-white"
          numberOfLines={1}
          ellipsizeMode="tail">
          {title}
        </Text>

        {/* Penyeimbang tombol back saat tidak ada aksi di kanan */}
        {rightSlot ?? <View className="w-10 h-10" />}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary[500],
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
});
