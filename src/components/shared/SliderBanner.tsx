import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import {screenWidth} from '@/utils/screen';
import {sanitizeImageUrl} from '@/utils/imageUrl';
import type {BannerSlide} from '@/types/home';

interface SliderBannerProps {
  bannerSlides: BannerSlide[];
  onPressBanner?: (link: string) => void;
  className?: string;
}

const CARD_WIDTH = screenWidth - 40;
const CARD_HEIGHT = Math.round(CARD_WIDTH * 0.45);
const AUTO_SCROLL_MS = 4200;

export function SliderBanner({
  bannerSlides = [],
  onPressBanner,
  className = '',
}: SliderBannerProps): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<BannerSlide>>(null);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    if (bannerSlides.length <= 1) return;

    const timer = setInterval(() => {
      const next = (activeIndexRef.current + 1) % bannerSlides.length;
      flatListRef.current?.scrollToIndex({index: next, animated: true});
      activeIndexRef.current = next;
      setActiveIndex(next);
    }, AUTO_SCROLL_MS);

    return () => clearInterval(timer);
  }, [bannerSlides]);

  if (bannerSlides.length === 0) {
    return <View />;
  }

  function handleMomentumScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / (CARD_WIDTH + 10));
    const safeIndex = Math.max(0, Math.min(index, bannerSlides.length - 1));
    activeIndexRef.current = safeIndex;
    setActiveIndex(safeIndex);
  }

  return (
    <View className={`bg-white py-3 mb-2 ${className}`}>
      <FlatList
        ref={flatListRef}
        data={bannerSlides}
        keyExtractor={(_item, idx) => `slider-slide-${idx}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 10}
        decelerationRate="fast"
        contentContainerClassName="px-4 gap-2.5"
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={true}
        getItemLayout={(_data, index) => ({
          length: CARD_WIDTH + 10,
          offset: (CARD_WIDTH + 10) * index,
          index,
        })}
        onScrollToIndexFailed={info => {
          flatListRef.current?.scrollToOffset({
            offset: info.highestMeasuredFrameIndex * (CARD_WIDTH + 10),
            animated: true,
          });
        }}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        renderItem={({item}) => (
          <TouchableOpacity
            style={{width: CARD_WIDTH, height: CARD_HEIGHT}}
            className="rounded-2xl overflow-hidden bg-neutral-100 shadow-sm"
            activeOpacity={item.link ? 0.85 : 1}
            onPress={() => item.link && onPressBanner && onPressBanner(item.link)}
            accessibilityRole="button"
            accessibilityLabel="Banner Slide">
            <Image
              source={{uri: sanitizeImageUrl(item.image_url)}}
              className="w-full h-full"
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />

      {/* Dots Indicator */}
      {bannerSlides.length > 1 && (
        <View className="flex-row items-center justify-center gap-1.5 mt-2.5">
          {bannerSlides.map((_, i) => (
            <View
              key={`dot-${i}`}
              className={`h-1.5 rounded-full ${
                i === activeIndex
                  ? 'w-5 bg-primary-500'
                  : 'w-1.5 bg-neutral-300'
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
