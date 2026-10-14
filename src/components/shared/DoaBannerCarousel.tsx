import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {DotIndicator} from '@/components/ui/DotIndicator';
import {colors, radius, spacing} from '@/theme';
import {screenWidth} from '@/utils/screen';
import type {DoaBanner} from '@/types/doa';

// Carousel sendiri, bukan HomeBanner: HomeBanner mengikat aksi tap pada
// Banner.programId dan selalu menuju DetailProgram, sedangkan poster di sini
// menuju DoaCreate. Lihat docs/08-features/doa/README.md.
const HORIZONTAL_INSET = spacing.lg;
// Slide lebih sempit dari layar supaya slide berikutnya mengintip di tepi
// kanan seperti di design — ini juga alasan memakai snapToInterval, bukan
// pagingEnabled yang selalu mengunci satu layar penuh.
const SLIDE_WIDTH = screenWidth * 0.86;
const SLIDE_GAP = spacing.sm;
const SNAP_INTERVAL = SLIDE_WIDTH + SLIDE_GAP;
const BANNER_HEIGHT = SLIDE_WIDTH * (9 / 16);
const AUTO_SCROLL_INTERVAL_MS = 3000;

interface DoaBannerCarouselProps {
  banners: DoaBanner[];
  onPress: () => void;
}

export function DoaBannerCarousel({
  banners,
  onPress,
}: DoaBannerCarouselProps): React.JSX.Element | null {
  const flatListRef = useRef<FlatList<DoaBanner>>(null);
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

  // Band tidak dirender sama sekali saat banner kosong — jangan sisakan ruang
  // kosong di atas tab bar.
  if (banners.length === 0) {
    return null;
  }

  function handleMomentumScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void {
    const index = Math.round(event.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    activeIndexRef.current = index;
    setActiveIndex(index);
  }

  return (
    <View style={styles.band}>
      <FlatList
        ref={flatListRef}
        data={banners}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_data, index) => ({
          length: SNAP_INTERVAL,
          offset: SNAP_INTERVAL * index,
          index,
        })}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.slide}
            onPress={onPress}
            activeOpacity={0.85}
            accessibilityRole="button"
            // Seluruh teks poster ada di dalam gambar dan tidak terbaca screen
            // reader — judulnya yang jadi label.
            accessibilityLabel={item.title}>
            <Image
              source={{uri: item.imageUrl}}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />

      {banners.length > 1 ? (
        <View style={styles.dots}>
          <DotIndicator count={banners.length} activeIndex={activeIndex} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    backgroundColor: colors.primary[100],
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  listContent: {
    paddingHorizontal: HORIZONTAL_INSET,
    gap: SLIDE_GAP,
  },
  slide: {
    width: SLIDE_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    // Terlihat sebagai placeholder selagi gambar belum termuat; tingginya sudah
    // dikunci konstanta jadi tidak ada pergeseran layout saat gambar datang.
    backgroundColor: colors.primary[300],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dots: {
    alignItems: 'center',
  },
});
