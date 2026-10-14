import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, radius, fontSize, fontWeight } from '@/theme';
import { formatCurrency } from '@/utils/formatCurrency';
import { getDonationProgress } from '@/utils/donationProgress';
import type { Program } from '@/types/program';

interface ProgramTheme {
  nama_tema: string;
  deskripsi_tema: string;
  background_url?: string;
  program: Program[];
}

interface ProgramThemeSectionProps {
  thema: ProgramTheme;
  onPressProgram: (program: Program) => void;
  cardWidth?: number;
}

const DEFAULT_CARD_WIDTH = 160;
const CARD_MARGIN = spacing.sm;
// Ukuran asli bg-theme.png, dipakai supaya teks yang menyatu di background
// tetap sejajar dengan kartu di semua lebar layar.
const BACKGROUND_ASPECT_RATIO = 720 / 528;
// Bagian kiri background berisi ilustrasi + judul, jadi kartu mulai setelahnya.
const CONTENT_LEFT_RATIO = 0.45;
// Bagian atas background berisi judul + deskripsi.
const CONTENT_TOP_RATIO = 0.18;
const FADE_SCROLL_DISTANCE = 160;

export function ProgramThemeSection({
  thema,
  onPressProgram,
  cardWidth = DEFAULT_CARD_WIDTH,
}: ProgramThemeSectionProps): React.JSX.Element {
  const { width } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;

  const backgroundOpacity = scrollX.interpolate({
    inputRange: [0, FADE_SCROLL_DISTANCE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true },
  );

  const backgroundHeight = width / BACKGROUND_ASPECT_RATIO;

  const renderItem = ({ item }: { item: Program }): React.JSX.Element => (
    <ProgramCarouselCard
      program={item}
      onPress={onPressProgram}
      cardWidth={cardWidth}
    />
  );

  return (
    <LinearGradient
      colors={[colors.primary[50], colors.primary[100]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { minHeight: backgroundHeight }]}>
      <Animated.Image
        source={
          thema.background_url
            ? { uri: thema.background_url }
            : require('@/assets/images/bg-theme.png')
        }
        style={[styles.backgroundImage, { opacity: backgroundOpacity }]}
        resizeMode="cover"
        accessible
        accessibilityRole="image"
        accessibilityLabel={`${thema.nama_tema}. ${thema.deskripsi_tema}`}
      />

      <View
        style={[
          styles.listWrapper,
          { paddingTop: backgroundHeight * CONTENT_TOP_RATIO },
        ]}>
        <Animated.FlatList<Program>
          data={thema.program}
          renderItem={renderItem}
          keyExtractor={item => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContainer,
            { paddingLeft: width * CONTENT_LEFT_RATIO },
          ]}
          scrollEventThrottle={16}
          onScroll={handleScroll}
        />
      </View>
    </LinearGradient>
  );
}

const DEFAULT_ASPECT_RATIO = 1080 / 1920; // 16:9

function ProgramCarouselCard({
  program,
  onPress,
  cardWidth,
}: {
  program: Program;
  onPress: (program: Program) => void;
  cardWidth: number;
}): React.JSX.Element {
  const [imageHeight, setImageHeight] = useState<number>(cardWidth * DEFAULT_ASPECT_RATIO);

  const collectedAmount = Number(program.nominal_achieved) || 0;
  const progress = getDonationProgress(
    collectedAmount,
    program.nominal_target,
  );

  useEffect(() => {
    Image.getSize(
      program.image,
      (width, height) => {
        const aspectRatio = height / width;
        setImageHeight(cardWidth * aspectRatio);
      },
      () => {
        setImageHeight(cardWidth * DEFAULT_ASPECT_RATIO);
      },
    );
  }, [program.image, cardWidth]);

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={() => onPress(program)}
      accessibilityRole="button"
      accessibilityLabel={program.title}>
      <Image
        source={{ uri: program.image }}
        style={[styles.cardImage, { width: cardWidth, height: imageHeight }]}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
          {program.title}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.cardAmount}>
          {formatCurrency(collectedAmount)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: undefined,
    height: undefined,
  },
  listWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  listContainer: {
    paddingRight: spacing.lg,
    gap: CARD_MARGIN,
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  cardImage: {
    backgroundColor: colors.neutral[100],
  },
  cardContent: {
    padding: spacing.sm,
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
    lineHeight: 16,
  },
  progressBar: {
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FD6542',
    borderRadius: radius.full,
  },
  cardAmount: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
});
