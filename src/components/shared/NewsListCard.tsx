import React, {useEffect, useState} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {Heart} from '@solar-icons/react-native/Bold';
import {Heart as HeartLinear} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {formatRelativeTime} from '@/utils/formatRelativeTime';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {Article} from '@/types/news';

interface NewsListCardProps {
  article: Article;
  onPress: (article: Article) => void;
}

// Sama persis dengan pola thumbnail di ProgramCard — lebar tetap, tinggi
// menyesuaikan aspect ratio asli gambar (Image.getSize), fallback 16:9.
const THUMBNAIL_WIDTH = 160;
const DEFAULT_ASPECT_RATIO = 1080 / 1920;

export function NewsListCard({
  article,
  onPress,
}: NewsListCardProps): React.JSX.Element {
  const [imageHeight, setImageHeight] = useState<number>(
    THUMBNAIL_WIDTH * DEFAULT_ASPECT_RATIO,
  );

  useEffect(() => {
    Image.getSize(
      article.coverImageUrl,
      (width, height) => {
        const aspectRatio = height / width;
        setImageHeight(THUMBNAIL_WIDTH * aspectRatio);
      },
      () => {
        setImageHeight(THUMBNAIL_WIDTH * DEFAULT_ASPECT_RATIO);
      },
    );
  }, [article.coverImageUrl]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(article)}
      accessibilityRole="button"
      accessibilityLabel={article.title}>
      <Image
        source={{uri: article.coverImageUrl}}
        style={[styles.thumbnail, {height: imageHeight}]}
        resizeMode="cover"
        accessibilityRole="image"
        accessibilityLabel={article.title}
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {article.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {formatRelativeTime(article.publishedAt)}
          </Text>
          <View style={styles.likeRow}>
            <Icon
              icon={article.isLiked ? Heart : HeartLinear}
              size={14}
              color={article.isLiked ? colors.secondary[500] : colors.neutral[400]}
            />
            <Text style={[styles.metaText, article.isLiked && styles.likeTextActive]}>
              {article.likeCount}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
  },
  thumbnail: {
    width: THUMBNAIL_WIDTH,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[200],
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeTextActive: {
    color: colors.secondary[500],
    fontWeight: fontWeight.semiBold,
  },
});
