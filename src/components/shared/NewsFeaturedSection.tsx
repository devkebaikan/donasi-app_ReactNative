import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {NewsFeaturedCard} from '@/components/shared/NewsFeaturedCard';
import {colors, spacing, fontSize, fontWeight} from '@/theme';
import type {Article} from '@/types/news';

interface NewsFeaturedSectionProps {
  articles: Article[];
  onPressArticle: (article: Article) => void;
}

export function NewsFeaturedSection({
  articles,
  onPressArticle,
}: NewsFeaturedSectionProps): React.JSX.Element | null {
  if (articles.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Berita Utama</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        {articles.map(article => (
          <NewsFeaturedCard
            key={article.id}
            article={article}
            onPress={onPressArticle}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
    paddingHorizontal: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
});
