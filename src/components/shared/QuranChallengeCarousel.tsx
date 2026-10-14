import React from 'react';
import {FlatList, View, Dimensions, StyleSheet} from 'react-native';
import {QuranChallengeCard} from '@/components/shared/QuranChallengeCard';
import {spacing} from '@/theme';
import type {ChallengeSummary} from '@/types/quran';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const CARD_GAP = spacing.md;

interface QuranChallengeCarouselProps {
  challenges: ChallengeSummary[];
  onPressChallenge: (challenge: ChallengeSummary) => void;
}

function keyExtractor(challenge: ChallengeSummary): string {
  return challenge.id;
}

export function QuranChallengeCarousel({
  challenges,
  onPressChallenge,
}: QuranChallengeCarouselProps): React.JSX.Element | null {
  if (challenges.length === 0) {
    return null;
  }

  return (
    <FlatList
      horizontal
      data={challenges}
      keyExtractor={keyExtractor}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      // snapToInterval, bukan pagingEnabled — lebar card lebih kecil dari
      // lebar layar karena ada padding horizontal, jadi paging bawaan
      // meleset setengah gap tiap geser.
      snapToInterval={CARD_WIDTH + CARD_GAP}
      decelerationRate="fast"
      snapToAlignment="start"
      ItemSeparatorComponent={renderSeparator}
      renderItem={({item}) => (
        <QuranChallengeCard
          challenge={item}
          width={CARD_WIDTH}
          onPress={onPressChallenge}
        />
      )}
    />
  );
}

function renderSeparator(): React.JSX.Element {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
  },
  separator: {
    width: CARD_GAP,
  },
});
