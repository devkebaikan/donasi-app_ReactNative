import React, {useState} from 'react';
import {View, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {colors} from '@/theme';
import {screenWidth} from '@/utils/screen';

interface SecondBannerProps {
  imageUrl?: string;
  programId?: number;
  onPress?: (programId: number) => void;
}

export function SecondBanner({
  imageUrl,
  programId,
  onPress,
}: SecondBannerProps): React.JSX.Element {
  const [imageError, setImageError] = useState(false);

  const hasValidData = imageUrl && programId && onPress;
  const showImage = hasValidData && !imageError;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        if (hasValidData) {
          onPress(programId);
        }
      }}
      activeOpacity={hasValidData ? 0.7 : 1}
      accessibilityRole="button"
      accessibilityLabel="Second banner">
      {showImage ? (
        <Image
          source={{uri: imageUrl}}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
          accessibilityRole="image"
        />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  image: {
    width: screenWidth,
    height: screenWidth * 0.5,
    backgroundColor: colors.neutral[100],
  },
  placeholder: {
    backgroundColor: colors.neutral[100],
  },
});
