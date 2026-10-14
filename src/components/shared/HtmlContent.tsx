import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, lineHeight} from '@/theme';

// Renderer HTML minimal (paragraf, <br>, <img>) tanpa dependency baru —
// solusi interim sampai ada ADR untuk library HTML renderer penuh.
// Tag lain di-strip, entity umum di-decode.

interface HtmlContentProps {
  html: string;
}

type ContentBlock =
  | {type: 'text'; value: string}
  | {type: 'image'; value: string};

const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&rsquo;': '’',
  '&lsquo;': '‘',
};

function decodeEntities(value: string): string {
  return value.replace(
    /&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;|&rsquo;|&lsquo;/g,
    entity => HTML_ENTITIES[entity] ?? entity,
  );
}

function extractText(fragment: string): string {
  const withBreaks = fragment
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '');
  return decodeEntities(withBreaks)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseHtmlBlocks(html: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const fragments = html.split(/(<img[^>]*>)/gi);

  for (const fragment of fragments) {
    const imageMatch = fragment.match(/<img[^>]*src=["']([^"']+)["']/i);
    if (imageMatch?.[1]) {
      blocks.push({type: 'image', value: imageMatch[1]});
      continue;
    }
    const text = extractText(fragment);
    if (text) {
      blocks.push({type: 'text', value: text});
    }
  }

  return blocks;
}

export function HtmlContent({html}: HtmlContentProps): React.JSX.Element | null {
  const blocks = parseHtmlBlocks(html);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {blocks.map((block, index) =>
        block.type === 'image' ? (
          <Image
            key={`${block.type}-${index}`}
            source={{uri: block.value}}
            style={styles.image}
            resizeMode="cover"
            accessibilityRole="image"
            accessibilityLabel="Gambar konten program"
          />
        ) : (
          <Text key={`${block.type}-${index}`} style={styles.text}>
            {block.value}
          </Text>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  text: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.neutral[700],
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
  },
});
