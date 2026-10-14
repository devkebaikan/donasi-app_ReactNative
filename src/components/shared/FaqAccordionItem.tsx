import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Icon} from '@/components/ui/Icon';
import {AltArrowUp, AltArrowDown} from '@solar-icons/react-native/Linear';
import {colors, spacing, fontSize, fontWeight, lineHeight} from '@/theme';

interface FaqAccordionItemProps {
  question: string;
  answer: string;
  expanded: boolean;
  onToggle: () => void;
}

export function FaqAccordionItem({
  question,
  answer,
  expanded,
  onToggle,
}: FaqAccordionItemProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={question}
        accessibilityState={{expanded}}>
        <Text style={styles.question}>{question}</Text>
        <Icon
          icon={expanded ? AltArrowUp : AltArrowDown}
          size={22}
          color={colors.neutral[400]}
        />
      </TouchableOpacity>
      {expanded ? <Text style={styles.answer}>{answer}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    gap: spacing.md,
  },
  question: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  answer: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.neutral[600],
  },
});
