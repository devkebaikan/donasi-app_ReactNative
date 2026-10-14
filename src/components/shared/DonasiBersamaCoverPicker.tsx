import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {Camera} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

const CIRCLE_SIZE = 96;

interface DonasiBersamaCoverPickerProps {
  uri: string | null;
  isUploading: boolean;
  onPress: () => void;
}

// Foto grup bersifat opsional — lingkaran kosong tetap sah dan grup bisa
// dibuat tanpa foto.
export function DonasiBersamaCoverPicker({
  uri,
  isUploading,
  onPress,
}: DonasiBersamaCoverPickerProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.circle}
        onPress={onPress}
        disabled={isUploading}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={uri ? 'Ganti foto grup' : 'Tambah foto grup'}
        accessibilityState={{busy: isUploading}}>
        {uri ? (
          <Image source={{uri}} style={styles.image} resizeMode="cover" />
        ) : null}
        {isUploading ? (
          <View style={styles.overlay}>
            <ActivityIndicator color={colors.primary[500]} />
          </View>
        ) : uri ? null : (
          <Icon icon={Camera} size={28} color={colors.neutral[400]} />
        )}
      </TouchableOpacity>
      <Text style={styles.label}>Ganti Foto</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: radius.full,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[100],
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
});
