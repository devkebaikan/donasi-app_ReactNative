
import React from 'react';
import { useWindowDimensions } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { colors, fontSize, lineHeight } from '@/theme';

interface HtmlContentProps {
  html: string;
}

export function HtmlContent({
  html,
}: HtmlContentProps): React.JSX.Element | null {
  const { width } = useWindowDimensions();

  if (!html?.trim()) {
    return null;
  }

  return (
    <RenderHTML
      contentWidth={width - 32}
      source={{ html }}
      enableCSSInlineProcessing={true}
      tagsStyles={{
        body: {
          color: colors.neutral[700],
          fontSize: fontSize.sm,
          lineHeight: fontSize.sm * lineHeight.normal,
        },
        p: {
          color: colors.neutral[700],
          fontSize: fontSize.sm,
          lineHeight: fontSize.sm * lineHeight.normal,
          textAlign: 'justify',
          marginBottom: 12,
        },
        span: {
          color: colors.neutral[700],
        },
        em: {
          fontStyle: 'italic',
        },
        strong: {
          fontWeight: 'bold',
        },
        b: {
          fontWeight: 'bold',
        },
        img: {
          borderRadius: 8,
        },
      }}
      renderersProps={{
        img: {
          enableExperimentalPercentWidth: true,
        },
      }}
    />
  );
}
