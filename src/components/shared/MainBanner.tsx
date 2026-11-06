import React, {useState, useEffect} from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import {sanitizeImageUrl} from '@/utils/imageUrl';

interface MainBannerProps {
  imageUrl?: string;
  link?: string;
  programId?: number;
  onPress?: (target: string | number) => void;
  className?: string;
}

const DEFAULT_ASPECT_RATIO = 3;

export function MainBanner({
  imageUrl,
  link,
  programId,
  onPress,
  className = '',
}: MainBannerProps): React.JSX.Element {
  const [imageError, setImageError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number>(DEFAULT_ASPECT_RATIO);
  const safeImageUrl = sanitizeImageUrl(imageUrl);

  useEffect(() => {
    if (!safeImageUrl) {
      return;
    }
    setImageError(false);
    Image.getSize(
      safeImageUrl,
      (width, height) => {
        if (width > 0 && height > 0) {
          setAspectRatio(width / height);
        }
      },
      () => {
        setImageError(true);
      },
    );
  }, [safeImageUrl]);

  const showImage = Boolean(safeImageUrl) && !imageError;
  const target = link || programId;

  if (!safeImageUrl) {
    return <View />;
  }

  return (
    <TouchableOpacity
      className={`w-full overflow-hidden ${className}`}
      style={{aspectRatio}}
      onPress={() => {
        if (onPress && target !== undefined) {
          onPress(target);
        }
      }}
      activeOpacity={onPress && target ? 0.85 : 1}
      accessibilityRole="button"
      accessibilityLabel="Banner Promosi">
      {showImage ? (
        <Image
          source={{uri: safeImageUrl}}
          className="w-full h-full"
          style={{aspectRatio}}
          resizeMode="contain"
          onError={() => setImageError(true)}
          accessibilityRole="image"
        />
      ) : (
        <View className="w-full h-full bg-neutral-100" />
      )}
    </TouchableOpacity>
  );
}
