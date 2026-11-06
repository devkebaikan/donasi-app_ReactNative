import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { sanitizeImageUrl } from '@/utils/imageUrl';
import type { Banner } from '@/types/banner';
import type { HomeBannerItem } from '@/types/home';

interface HomeBannerProps {
  banners?: Banner[];
  mainBanner?: HomeBannerItem | null;
  onPressBanner?: (target: number | string) => void;
  className?: string;
}

export function HomeBanner({
  banners = [],
  mainBanner,
  onPressBanner,
  className = '',
}: HomeBannerProps): React.JSX.Element {
  const { width: screenWidth } = useWindowDimensions();

  // Ambil gambar dan link dari mainBanner terlebih dahulu, fallback ke banner pertama jika ada
  const activeImageUrl =
    mainBanner?.image_url || banners[0]?.imageUrl || '';
  const activeLink =
    mainBanner?.link || banners[0]?.link || banners[0]?.programId;
  const activeName =
    mainBanner?.name || banners[0]?.title || 'Home Banner';

  const safeImageUrl = sanitizeImageUrl(activeImageUrl);
  const [aspectRatio, setAspectRatio] = useState<number>(1024 / 572); // default rasio asli gambar 1024x572 (1.79)
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!safeImageUrl) return;
    setHasError(false);

    Image.getSize(
      safeImageUrl,
      (width, height) => {
        if (width > 0 && height > 0) {
          setAspectRatio(width / height);
        }
      },
      () => {
        setHasError(true);
      },
    );
  }, [safeImageUrl]);

  if (!safeImageUrl || hasError) {
    return <View />;
  }

  const calculatedHeight = screenWidth / aspectRatio;

  return (
    <View style={styles.container} className={className}>
      <TouchableOpacity
        activeOpacity={activeLink && onPressBanner ? 0.9 : 1}
        onPress={() => {
          if (activeLink && onPressBanner) {
            onPressBanner(activeLink);
          }
        }}
        style={[
          styles.touchable,
          { width: screenWidth, height: calculatedHeight },
        ]}
        accessibilityRole="button"
        accessibilityLabel={activeName}>
        <Image
          source={{ uri: safeImageUrl }}
          style={{ width: screenWidth, height: calculatedHeight }}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={activeName}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  touchable: {
    padding: 0,
    margin: 0,
  },
});
