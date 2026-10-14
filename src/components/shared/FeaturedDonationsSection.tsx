import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {ProgramCard} from '@/components/shared/ProgramCard';
import {colors, spacing, fontSize, fontWeight} from '@/theme';
import type {Program} from '@/types/program';

interface FeaturedDonationsSectionProps {
  programs: Program[];
  onPressProgram: (program: Program) => void;
}

export function FeaturedDonationsSection({
  programs,
  onPressProgram,
}: FeaturedDonationsSectionProps): React.JSX.Element | null {
  if (programs.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Program Pilihan</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        {programs.map(program => (
          <View
            key={program.id}
            testID={`featured-program-item-${program.id}`}
            style={styles.cardWrapper}>
            <ProgramCard program={program} onPress={onPressProgram} />
          </View>
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
  cardWrapper: {
    width: 340,
  },
});
