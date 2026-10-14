import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { AltArrowLeft, AltArrowRight } from '@solar-icons/react-native/Linear';
import { colors, spacing, radius, glass } from '@/theme';
import { screenWidth } from '@/utils/screen';
import { CloseCircle } from '@solar-icons/react-native/Bold';

interface PromoItem {
  id: string;
  imageUrl: string;
}

interface PopupPromoProps {
  visible: boolean;
  promos: PromoItem[];
  onClose: () => void;
}

const IMAGE_WIDTH = screenWidth - spacing.xl * 5;

export function PopupPromo({
  visible,
  promos,
  onClose,
}: PopupPromoProps): React.JSX.Element | null {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageHeight, setImageHeight] = useState<number>(IMAGE_WIDTH * 1.2);

  const currentPromo = promos?.[currentIndex];
  const hasMultiple = promos && promos.length > 1;

  useEffect(() => {
    if (currentPromo?.imageUrl) {
      Image.getSize(
        currentPromo.imageUrl,
        (width, height) => {
          const aspectRatio = height / width;
          setImageHeight(IMAGE_WIDTH * aspectRatio);
        },
        () => {
          setImageHeight(IMAGE_WIDTH * 1.2);
        },
      );
    }
  }, [currentPromo?.imageUrl]);

  if (!promos || promos.length === 0) {
    return null;
  }

  if (!currentPromo) {
    return null;
  }

  function handlePrevSlide(): void {
    setCurrentIndex(prev => (prev === 0 ? promos.length - 1 : prev - 1));
  }

  function handleNextSlide(): void {
    setCurrentIndex(prev => (prev === promos.length - 1 ? 0 : prev + 1));
  }

  function handleClose(): void {
    setCurrentIndex(0);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Close Button - Top Right */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                accessibilityRole="button"
                accessibilityLabel="Tutup promo">
                <Icon icon={CloseCircle} size={40} color={glass.tintHeavy} />
              </TouchableOpacity>

              {/* Image with Prev/Next Buttons */}
              <View style={styles.imageWithNavContainer}>
                {/* Prev Button */}
                {hasMultiple && (
                  <TouchableOpacity
                    style={[styles.navButton, { left: spacing.xl * -2 }]}
                    onPress={handlePrevSlide}
                    accessibilityRole="button"
                    accessibilityLabel="Slide sebelumnya">
                    <Icon icon={AltArrowLeft} size={20} color={colors.neutral[900]} />
                  </TouchableOpacity>
                )}

                {/* Image */}
                <Image
                  source={{ uri: currentPromo.imageUrl }}
                  style={[styles.image, { height: imageHeight }]}
                  resizeMode="cover"
                  accessibilityRole="image"
                  accessibilityLabel="Promo"
                />

                {/* Next Button */}
                {hasMultiple && (
                  <TouchableOpacity
                    style={[styles.navButton, { right: spacing.xl * -2 }]}
                    onPress={handleNextSlide}
                    accessibilityRole="button"
                    accessibilityLabel="Slide berikutnya">
                    <Icon icon={AltArrowRight} size={20} color={colors.neutral[900]} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Indicators Below Image */}
              {hasMultiple && (
                <View style={styles.indicatorsContainer}>
                  {promos.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.indicator,
                        index === currentIndex && styles.indicatorActive,
                      ]}
                    />
                  ))}
                </View>
              )}

              {/* Single Slide Indicator */}
              {!hasMultiple && (
                <View style={styles.singleIndicatorContainer}>
                  <View style={[styles.indicator, styles.indicatorActive]} />
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: IMAGE_WIDTH,
  },
  closeButton: {
    position: 'absolute',
    top: -64,
    right: -48,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWithNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  image: {
    flex: 1,
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[200],
  },
  navButton: {
    position: 'absolute',
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: glass.tintHeavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[400],
  },
  indicatorActive: {
    backgroundColor: colors.primary[500],
  },
  singleIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
});
