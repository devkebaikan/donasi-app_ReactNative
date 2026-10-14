import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {DotIndicator} from '@/components/ui/DotIndicator';
import {colors, radius, spacing} from '@/theme';
import {screenWidth} from '@/utils/screen';
import type {Banner} from '@/types/banner';

interface HomeBannerProps {
  banners: Banner[];
  onPressBanner?: (programId: number) => void;
}

const HORIZONTAL_INSET = spacing.lg;
const SLIDE_WIDTH = screenWidth - HORIZONTAL_INSET * 2;
const MIN_BANNER_HEIGHT = 200;
const BANNER_HEIGHT = Math.max(SLIDE_WIDTH * 0.45, MIN_BANNER_HEIGHT);
const AUTO_SCROLL_INTERVAL_MS = 3000;

export function HomeBanner({banners = [], onPressBanner}: HomeBannerProps): React.JSX.Element {
  const flatListRef = useRef<FlatList<Banner>>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    activeIndexRef.current = 0;
    setActiveIndex(0);

    if (banners.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % banners.length;
      flatListRef.current?.scrollToIndex({index: nextIndex, animated: true});
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }, AUTO_SCROLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [banners]);

  function handleMomentumScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void {
    const index = Math.round(event.nativeEvent.contentOffset.x / SLIDE_WIDTH);
    activeIndexRef.current = index;
    setActiveIndex(index);
  }

  return (
    <View style={styles.container}>
      <View style={styles.clipWrapper}>
        {banners.length === 0 ? (
          <View style={styles.emptyState} />
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              style={styles.list}
              data={banners}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <TouchableOpacity
                  onPress={() => {
                    if (item.programId && onPressBanner) {
                      onPressBanner(item.programId);
                    }
                  }}
                  activeOpacity={item.programId ? 0.7 : 1}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}>
                  <Image
                    source={{uri: item.imageUrl}}
                    style={styles.image}
                    resizeMode="cover"
                    accessibilityRole="image"
                  />
                </TouchableOpacity>
              )}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              getItemLayout={(_data, index) => ({
                length: SLIDE_WIDTH,
                offset: SLIDE_WIDTH * index,
                index,
              })}
            />
            {banners.length > 1 ? (
              <View style={styles.dotsContainer}>
                <DotIndicator count={banners.length} activeIndex={activeIndex} />
              </View>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  clipWrapper: {
    width: SLIDE_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  list: {
    width: SLIDE_WIDTH,
  },
  image: {
    width: SLIDE_WIDTH,
    height: BANNER_HEIGHT,
  },
  emptyState: {
    width: SLIDE_WIDTH,
    height: BANNER_HEIGHT,
    backgroundColor: colors.primary[100],
  },
  dotsContainer: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
});
