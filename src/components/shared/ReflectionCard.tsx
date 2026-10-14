import React, {useState} from 'react';
import {View, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {GalleryRemove} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, radius} from '@/theme';
import type {Reflection} from '@/types/reflection';

// Rasio dikunci di satu tempat supaya kartu di grid dan skeleton-nya tidak
// pernah berbeda tinggi — grid dua kolom yang tingginya ikut gambar akan jadi
// bergerigi. Lihat docs/08-features/renungan/renungan-list.md.
export const REFLECTION_CARD_ASPECT_RATIO = 4 / 5;

interface ReflectionCardProps {
  reflection: Reflection;
  onPress: (reflection: Reflection) => void;
}

export function ReflectionCard({
  reflection,
  onPress,
}: ReflectionCardProps): React.JSX.Element {
  const [hasImageError, setHasImageError] = useState(false);

  function handlePress(): void {
    onPress(reflection);
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      accessibilityRole="button"
      // Seluruh teks renungan ada di dalam gambar dan tidak terbaca screen
      // reader — judul dari API yang menggantikannya di sini.
      accessibilityLabel={reflection.title}>
      {hasImageError ? (
        <View style={styles.fallback}>
          <Icon icon={GalleryRemove} size={28} color={colors.neutral[400]} />
        </View>
      ) : (
        <Image
          source={{uri: reflection.imageUrl}}
          style={styles.image}
          resizeMode="cover"
          onError={() => setHasImageError(true)}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: REFLECTION_CARD_ASPECT_RATIO,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.neutral[100],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[100],
  },
});
