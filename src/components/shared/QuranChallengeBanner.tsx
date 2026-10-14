import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {DotIndicator} from '@/components/ui/DotIndicator';
import {QuranChallengeCard} from '@/components/shared/QuranChallengeCard';
import {radius, spacing} from '@/theme';
import {screenWidth} from '@/utils/screen';
import type {ChallengeSummary} from '@/types/quran';

const HORIZONTAL_INSET = spacing.lg;
const SLIDE_WIDTH = screenWidth - HORIZONTAL_INSET * 2;
const SLIDE_HEIGHT = 168;
const AUTO_SCROLL_INTERVAL_MS = 3000;

interface QuranChallengeBannerProps {
  challenges: ChallengeSummary[];
  onPressChallenge: (challenge: ChallengeSummary) => void;
}

function keyExtractor(challenge: ChallengeSummary): string {
  return challenge.id;
}

// Mengikuti HomeBanner di menu utama: paging per slide, geser maju-mundur,
// auto-scroll berputar, dan DotIndicator melayang di dalam slide.
export function QuranChallengeBanner({
  challenges,
  onPressChallenge,
}: QuranChallengeBannerProps): React.JSX.Element {
  const listRef = useRef<FlatList<ChallengeSummary>>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    activeIndexRef.current = 0;
    setActiveIndex(0);

    if (challenges.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      // Berputar balik ke slide pertama setelah slide terakhir.
      const nextIndex = (activeIndexRef.current + 1) % challenges.length;
      listRef.current?.scrollToIndex({index: nextIndex, animated: true});
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }, AUTO_SCROLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [challenges]);

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
        {challenges.length === 0 ? (
          <View style={styles.emptyState} />
        ) : (
          <>
            <FlatList
              ref={listRef}
              style={styles.list}
              data={challenges}
              keyExtractor={keyExtractor}
              renderItem={({item}) => (
                <QuranChallengeCard
                  challenge={item}
                  width={SLIDE_WIDTH}
                  height={SLIDE_HEIGHT}
                  onPress={onPressChallenge}
                />
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
            {challenges.length > 1 ? (
              <View style={styles.dotsContainer}>
                <DotIndicator
                  count={challenges.length}
                  activeIndex={activeIndex}
                />
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
    height: SLIDE_HEIGHT,
    borderRadius: radius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  list: {
    width: SLIDE_WIDTH,
  },
  emptyState: {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
});
