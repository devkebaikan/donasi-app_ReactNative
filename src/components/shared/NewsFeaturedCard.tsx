import React from 'react';
import {Image, Text, TouchableOpacity, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {Article} from '@/types/news';

interface NewsFeaturedCardProps {
  article: Article;
  onPress: (article: Article) => void;
}

const CARD_WIDTH = 260;
const CARD_HEIGHT = 150;

export function NewsFeaturedCard({
  article,
  onPress,
}: NewsFeaturedCardProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(article)}
      accessibilityRole="button"
      accessibilityLabel={article.title}>
      <Image
        source={{uri: article.coverImageUrl}}
        style={styles.image}
        resizeMode="cover"
        accessibilityRole="image"
        accessibilityLabel={article.title}
      />
      <LinearGradient
        colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.75)']}
        style={styles.gradient}
      />
      <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
        {article.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.neutral[200],
    justifyContent: 'flex-end',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
  },
  title: {
    padding: spacing.md,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[0],
  },
});
